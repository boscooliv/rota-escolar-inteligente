import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, Bus, CheckCircle2, Clock, Flag, Hand, MapPin, Nfc, Play, ScanLine, UserRound } from "lucide-react";
import { MapaRota } from "@/components/app/MapaRota";
import { Carregando, StatusBadge } from "@/components/app/comum";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSessao } from "@/hooks/use-sessao";
import {
  ALUNOS,
  DURACAO_MIN,
  RESPONSAVEIS,
  formatarData,
  hora,
  nomeAluno,
  nomePonto,
  nomeUsuario,
  onibusDe,
  ponto,
  pontosDoSentido,
  ROTULO_SENTIDO,
  rotuloDia,
} from "@/lib/transporte-dados";
import { minutosAtePonto, progressoDoPonto, situacaoPassageiro, type Situacao } from "@/lib/transporte-logica";
import { acoes, confirmacaoDe, confirmacoesDa, embarqueDe, embarquesDa, viagemPorId } from "@/lib/transporte-store";
import { localizacaoSimulada, useProgressoViagem } from "@/lib/use-onibus";
import { iniciarLeituraNfc, verificarSuporteNfc, type SuporteNfc } from "@/lib/web-nfc";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/viagens/$id")({
  head: () => ({
    meta: [
      { title: "Detalhe da viagem · Transporte Escolar NFC" },
      { name: "description", content: "Mapa do ônibus, previsão de chegada e lista de passageiros com a situação de embarque por NFC." },
      { property: "og:title", content: "Detalhe da viagem · Transporte Escolar NFC" },
      { property: "og:description", content: "Acompanhe o ônibus e os embarques registrados por NFC em cada viagem." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DetalheViagem,
});

const ROTULO_SITUACAO: Record<Situacao, string> = { confirmado: "Confirmado", embarcou: "Embarcou", nao_embarcou: "Confirmou e não embarcou" };

function DetalheViagem() {
  const { id } = Route.useParams();
  const { s, usuario, aluno } = useSessao();
  const v = viagemPorId(s, id);
  const { progresso, atualizadoEm } = useProgressoViagem(v?.status ?? "agendada");
  const [manualAberto, setManualAberto] = useState(false);
  const [suporte, setSuporte] = useState<SuporteNfc>("verificando");
  const [lendo, setLendo] = useState(false);
  const leitura = useRef<AbortController | null>(null);

  useEffect(() => {
    setSuporte(verificarSuporteNfc());
    return () => leitura.current?.abort();
  }, []);

  if (!usuario) return <Carregando />;
  if (!v)
    return (
      <div className="px-5 pt-10 text-center">
        <p className="font-bold">Viagem não encontrada.</p>
        <Link to="/viagens" className="mt-3 inline-block font-semibold underline">Voltar para as viagens</Link>
      </div>
    );

  const bus = onibusDe(v.onibusId);
  const resp = RESPONSAVEIS.find((r) => r.id === v.responsavelId);
  const posMapa = v.sentido === "ida" ? progresso : 1 - progresso;
  const gps = localizacaoSimulada(v.id, posMapa);
  const ehResp = usuario.perfil === "responsavel";

  const minha = aluno ? confirmacaoDe(s, v.id, aluno.id) : undefined;
  const meuEmbarque = aluno ? embarqueDe(s, v.id, aluno.id) : undefined;
  const meuPontoId = minha?.pontoEmbarqueId ?? (aluno ? pontosDoSentido(v.sentido, aluno.pontoPadraoId).pontoEmbarqueId : undefined);
  const meuPonto = meuPontoId ? ponto(meuPontoId) : undefined;
  const eta = meuPonto ? minutosAtePonto(progresso, progressoDoPonto(meuPonto, v.sentido), DURACAO_MIN) : 0;

  const confirmacoes = confirmacoesDa(s, v.id);
  const embarques = embarquesDa(s, v.id);
  const semConfirmar = embarques.filter((e) => !confirmacoes.some((c) => c.alunoId === e.alunoId));
  const passageiros = confirmacoes
    .map((c) => {
      const e = embarques.find((x) => x.alunoId === c.alunoId);
      const p = ponto(c.pontoEmbarqueId)!;
      return { c, e, ordem: progressoDoPonto(p, v.sentido), situacao: situacaoPassageiro(!!e, v.status, progresso, progressoDoPonto(p, v.sentido)) };
    })
    .sort((a, b) => a.ordem - b.ordem);
  const pendentesManual = ALUNOS.filter((a) => !embarques.some((e) => e.alunoId === a.id)).sort(
    (a, b) => Number(!confirmacoes.some((c) => c.alunoId === a.id)) - Number(!confirmacoes.some((c) => c.alunoId === b.id)),
  );
  const alertas = passageiros.filter((p) => p.situacao === "nao_embarcou").length;

  function simularNfc() {
    const r = acoes.simularLeituraNfc(v!.id);
    if (!r) {
      toast.info("Todos os confirmados já embarcaram.");
      return;
    }
    toast.success(`Tag ${r.codigo} lida`, { description: `${nomeAluno(r.alunoId)} embarcou às ${hora(new Date().toISOString())}.` });
  }

  async function lerTagReal() {
    if (lendo) {
      leitura.current?.abort();
      setLendo(false);
      return;
    }
    const ctrl = new AbortController();
    leitura.current = ctrl;
    try {
      await iniciarLeituraNfc(
        (serial) => {
          const r = acoes.lerTagReal(v!.id, serial);
          if (r.resultado === "ok") toast.success(`${nomeAluno(r.alunoId!)} embarcou`, { description: `Tag ${serial}` });
          else if (r.resultado === "duplicado") toast.info(`${nomeAluno(r.alunoId!)} já tinha embarcado.`);
          else toast.error("Tag não cadastrada", { description: serial });
        },
        () => toast.error("Não foi possível ler a tag. Tente aproximar de novo."),
        ctrl.signal,
      );
      setLendo(true);
      toast.info("Aproxime a tag NFC do celular.");
    } catch {
      toast.error("Leitura NFC não permitida. Use a simulação ou o registro manual.");
    }
  }

  function concluir() {
    leitura.current?.abort();
    setLendo(false);
    const ausentes = acoes.concluirViagem(v!.id);
    toast.success("Viagem concluída", {
      description: ausentes.length ? `${ausentes.length} aluno(s) confirmaram e não embarcaram. Eles foram avisados.` : "Todos os confirmados embarcaram.",
    });
  }

  return (
    <div className="pb-4">
      <div className="px-5 pt-5">
        <Link to="/viagens" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
          <ArrowLeft className="size-4" /> Viagens
        </Link>
      </div>

      <header className="relative mx-5 mt-3 overflow-hidden rounded-3xl bg-secondary p-5 text-secondary-foreground">
        <div className="stripe-bus absolute inset-x-0 top-0 h-2" />
        <div className="mt-2 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              {rotuloDia(v.data)} · {formatarData(v.data, { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold">{v.horarioSaida} · {ROTULO_SENTIDO[v.sentido]}</h1>
          </div>
          <StatusBadge status={v.status} />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-secondary-foreground/60">Ônibus</dt>
            <dd className="flex items-center gap-1.5 font-semibold"><Bus className="size-4" /> {bus.placa}</dd>
            <dd className="text-xs text-secondary-foreground/70">{bus.modelo} · {bus.capacidade} lugares</dd>
          </div>
          <div>
            <dt className="text-secondary-foreground/60">Motorista / responsável</dt>
            <dd className="font-semibold">{bus.motorista}</dd>
            <dd className="text-xs text-secondary-foreground/70">{resp ? nomeUsuario(resp.usuarioId) : "—"}</dd>
          </div>
        </dl>
      </header>

      <section className="card-surface mx-5 mt-4 overflow-hidden">
        <div className="relative h-64">
          <MapaRota posOnibus={posMapa} sentido={v.sentido} pontoDestacado={meuPontoId} />
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-bold shadow-card">
            <span className={cn("size-1.5 rounded-full", v.status === "em_andamento" ? "animate-pulse bg-success" : "bg-muted-foreground")} />
            GPS simulado
          </span>
        </div>
        <div className="flex items-center gap-3 border-t border-border p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent">
            <MapPin className="size-5 text-accent-foreground" />
          </span>
          <div className="min-w-0 flex-1">
            {meuPonto ? (
              <>
                <p className="text-sm text-muted-foreground">Previsão no seu ponto · {meuPonto.nome} – {meuPonto.cidade}</p>
                <p className="font-display text-lg font-extrabold">
                  {v.status === "concluida" ? "Viagem concluída" : v.status === "agendada" ? `Sai às ${v.horarioSaida} · ~${eta} min até você` : eta === 0 ? "Ônibus já passou pelo seu ponto" : `Chega em ~${eta} min`}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Posição do ônibus</p>
                <p className="font-display text-lg font-extrabold">
                  {v.status === "concluida" ? "Viagem concluída" : v.status === "agendada" ? "Aguardando saída" : `${Math.round(progresso * 100)}% do trajeto`}
                </p>
              </>
            )}
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              {gps.latitude}, {gps.longitude}
              {atualizadoEm && ` · atualizado ${atualizadoEm.toLocaleTimeString("pt-BR")}`}
            </p>
          </div>
        </div>
      </section>

      {aluno && (
        <section className="mx-5 mt-4 space-y-2">
          {meuEmbarque ? (
            <p className="flex items-center gap-2 rounded-2xl bg-success/15 p-4 font-bold text-success">
              <CheckCircle2 className="size-5" /> Você embarcou às {hora(meuEmbarque.horario)} ({meuEmbarque.metodo === "nfc" ? "tag NFC" : "manual"})
            </p>
          ) : v.status === "concluida" ? (
            <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">Esta viagem já foi concluída.</p>
          ) : minha ? (
            <button
              type="button"
              onClick={() => {
                acoes.cancelarConfirmacao(aluno.id, v.id);
                toast("Confirmação cancelada. Sua vaga foi liberada.");
              }}
              className="w-full rounded-2xl border-2 border-destructive py-3 font-bold text-destructive"
            >
              Cancelar confirmação
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  acoes.confirmarPresenca(aluno.id, v.id);
                  toast.success("Presença confirmada!", { description: `Embarque em ${nomePonto(pontosDoSentido(v.sentido, aluno.pontoPadraoId).pontoEmbarqueId)}.` });
                }}
                className="w-full rounded-2xl bg-primary py-3 font-bold text-primary-foreground shadow-pop"
              >
                Confirmar presença
              </button>
              <Link
                to="/confirmar"
                search={{ data: v.data, trajeto: v.sentido }}
                className="block text-center text-sm font-semibold text-muted-foreground underline"
              >
                Escolher outros pontos
              </Link>
            </>
          )}
        </section>
      )}

      {ehResp && v.status !== "concluida" && (
        <section className="mx-5 mt-4 grid grid-cols-2 gap-2">
          {v.status === "agendada" ? (
            <button
              type="button"
              onClick={() => {
                acoes.iniciarViagem(v.id);
                toast.success("Viagem iniciada. O ônibus está a caminho.");
              }}
              className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 font-bold text-primary-foreground shadow-pop"
            >
              <Play className="size-5" /> Iniciar viagem
            </button>
          ) : (
            <>
              <button type="button" onClick={simularNfc} className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-bold text-primary-foreground shadow-pop">
                <Nfc className="size-5" /> Simular leitura NFC
              </button>
              <button type="button" onClick={() => setManualAberto(true)} className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-bold">
                <Hand className="size-4" /> Registrar embarque manual
              </button>
              <button type="button" onClick={concluir} className="flex items-center justify-center gap-2 rounded-2xl bg-secondary py-3 text-sm font-bold text-secondary-foreground">
                <Flag className="size-4" /> Concluir viagem
              </button>
              {suporte === "suportado" && (
                <button type="button" onClick={lerTagReal} className="col-span-2 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-3 text-sm font-bold">
                  <ScanLine className="size-4" /> {lendo ? "Parar leitura NFC real" : "Ler tag NFC real (Android)"}
                </button>
              )}
            </>
          )}
        </section>
      )}

      <section className="card-surface mx-5 mt-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Passageiros</h2>
          <span className="text-sm text-muted-foreground">
            {embarques.length} de {confirmacoes.length} embarcados
          </span>
        </div>
        {alertas > 0 && (
          <p className="mt-2 flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
            <AlertTriangle className="size-4" /> {alertas} confirmou(aram) e não embarcou(aram)
          </p>
        )}
        <ul className="mt-2 divide-y divide-border">
          {passageiros.length === 0 && <li className="py-4 text-sm text-muted-foreground">Ninguém confirmou esta viagem ainda.</li>}
          {passageiros.map(({ c, e, situacao }) => (
            <li
              key={c.id}
              className={cn("py-3", situacao === "nao_embarcou" && "-mx-2 my-1 rounded-xl border-l-4 border-destructive bg-destructive/10 px-2")}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="flex items-center gap-1.5 font-semibold">
                  <UserRound className="size-4 text-muted-foreground" />
                  {nomeAluno(c.alunoId)}
                  {c.alunoId === aluno?.id && <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">você</span>}
                </p>
                <SituacaoTag situacao={situacao} horario={e?.horario} metodo={e?.metodo} />
              </div>
              <p className="mt-1 pl-5.5 text-xs text-muted-foreground">
                {nomePonto(c.pontoEmbarqueId)} → {nomePonto(c.pontoDesembarqueId)}
              </p>
            </li>
          ))}
          {semConfirmar.map((e) => (
            <li key={e.id} className="py-3">
              <div className="flex items-start justify-between gap-2">
                <p className="flex items-center gap-1.5 font-semibold"><UserRound className="size-4 text-muted-foreground" /> {nomeAluno(e.alunoId)}</p>
                <SituacaoTag situacao="embarcou" horario={e.horario} metodo={e.metodo} />
              </div>
              <p className="mt-1 pl-5.5 text-xs text-warning">Embarcou sem confirmar antes</p>
            </li>
          ))}
        </ul>
      </section>

      <Dialog open={manualAberto} onOpenChange={setManualAberto}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar embarque manual</DialogTitle>
            <DialogDescription>Para quem esqueceu a tag ou quando a leitura falhar.</DialogDescription>
          </DialogHeader>
          <ul className="divide-y divide-border">
            {pendentesManual.map((a) => {
              const conf = confirmacoes.some((c) => c.alunoId === a.id);
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 py-3 text-left"
                    onClick={() => {
                      acoes.registrarEmbarque(v.id, a.id, "manual");
                      toast.success(`${nomeAluno(a.id)} embarcou (manual)`);
                      setManualAberto(false);
                    }}
                  >
                    <span>
                      <span className="block font-semibold">{nomeAluno(a.id)}</span>
                      <span className="block text-xs text-muted-foreground">Matrícula {a.matricula} · {a.cidade}</span>
                    </span>
                    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold", conf ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground")}>
                      {conf ? "Confirmado" : "Sem confirmação"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SituacaoTag({ situacao, horario, metodo }: { situacao: Situacao; horario?: string | undefined; metodo?: "nfc" | "manual" | undefined }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
        situacao === "embarcou" && "bg-success/15 text-success",
        situacao === "confirmado" && "bg-accent text-accent-foreground",
        situacao === "nao_embarcou" && "bg-destructive text-destructive-foreground",
      )}
    >
      {situacao === "embarcou" ? <CheckCircle2 className="size-3" /> : situacao === "nao_embarcou" ? <AlertTriangle className="size-3" /> : <Clock className="size-3" />}
      {ROTULO_SITUACAO[situacao]}
      {situacao === "embarcou" && horario && ` · ${hora(horario)}${metodo === "manual" ? " (manual)" : ""}`}
    </span>
  );
}
