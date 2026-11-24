import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Hand, Search, XCircle } from "lucide-react";
import { AppHeader, Carregando } from "@/components/app/comum";
import { useSessao } from "@/hooks/use-sessao";
import {
  DURACAO_MIN, PONTOS, TAGS, TAGS_DE_TESTE, dataHora, dataISO, hora, nomeAluno, nomePonto, onibusDe, type Viagem,
} from "@/lib/transporte-dados";
import { avaliarLeitura, confirmadosSemEmbarque, progressoDoPonto, viagemMaisProxima } from "@/lib/transporte-logica";
import { acoes, confirmacoesDa, embarquesDa } from "@/lib/transporte-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/embarque")({
  head: () => ({
    meta: [
      { title: "Embarque · Transporte Escolar NFC" },
      { name: "description", content: "Registre a presença dos alunos no ônibus pela tag NFC ou manualmente." },
      { property: "og:title", content: "Embarque · Transporte Escolar NFC" },
      { property: "og:description", content: "Tela do motorista para registrar embarques por tag NFC." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaginaEmbarque,
});

type Feedback =
  | { tipo: "ok"; nome: string; horario: string }
  | { tipo: "erro"; texto: string }
  | { tipo: "aviso"; texto: string }
  | { tipo: "sem_confirmacao"; alunoId: string; nome: string };

const iniciais = (nome: string) => nome.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("");

function PaginaEmbarque() {
  const { s, usuario } = useSessao();
  const hoje = dataISO(0);
  const viagensHoje = s.viagens.filter((v) => v.data === hoje);
  const [viagemId, setViagemId] = useState<string | null>(null);
  const [codigo, setCodigo] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [busca, setBusca] = useState("");
  const [saindo, setSaindo] = useState<string | null>(null);
  const [verEmbarcados, setVerEmbarcados] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!viagemId && viagensHoje.length) setViagemId(viagemMaisProxima(viagensHoje, new Date())?.id ?? null);
  }, [viagemId, viagensHoje]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const viagem = viagensHoje.find((v) => v.id === viagemId);
  const confirmacoes = viagem ? confirmacoesDa(s, viagem.id) : [];
  const embarques = viagem ? embarquesDa(s, viagem.id) : [];
  const faltando = useMemo(() => {
    if (!viagem) return [];
    const prog = (pid: string) => progressoDoPonto(PONTOS.find((p) => p.id === pid)!, viagem.sentido);
    return confirmadosSemEmbarque(s.confirmacoes, s.embarques, viagem.id).sort(
      (a, b) => prog(a.pontoEmbarqueId) - prog(b.pontoEmbarqueId),
    );
  }, [s, viagem]);

  if (!usuario || !viagem) return <Carregando />;

  const focar = () => setTimeout(() => input.current?.focus(), 0);
  const mostrar = (f: Feedback, auto = true) => {
    clearTimeout(timer.current);
    setFeedback(f);
    setCodigo("");
    focar();
    if (auto) timer.current = setTimeout(() => setFeedback(null), 3500);
  };
  const registrar = (alunoId: string, metodo: "nfc" | "manual", divergencia = false) => {
    setSaindo(alunoId);
    setTimeout(() => {
      acoes.registrarEmbarque(viagem.id, alunoId, metodo, divergencia);
      setSaindo(null);
    }, 250);
    mostrar({ tipo: "ok", nome: nomeAluno(alunoId), horario: hora(new Date().toISOString()) });
  };

  const confirmar = () => {
    if (!codigo.trim()) return focar();
    const r = avaliarLeitura(TAGS, s.confirmacoes, s.embarques, viagem.id, codigo);
    if (r.tipo === "nao_encontrada") return mostrar({ tipo: "erro", texto: "Tag não cadastrada" });
    if (r.tipo === "bloqueada") return mostrar({ tipo: "erro", texto: "Tag bloqueada ou perdida" });
    if (r.tipo === "ja_embarcou") return mostrar({ tipo: "aviso", texto: "Este aluno já embarcou nesta viagem" });
    if (r.tipo === "sem_confirmacao") return mostrar({ tipo: "sem_confirmacao", alunoId: r.alunoId, nome: nomeAluno(r.alunoId) }, false);
    registrar(r.alunoId, "nfc");
  };

  const previsao = (pontoId: string, v: Viagem) =>
    hora(dataHora(v.data, v.horarioSaida, Math.round(progressoDoPonto(PONTOS.find((p) => p.id === pontoId)!, v.sentido) * DURACAO_MIN)));
  const lista = faltando.filter((c) => nomeAluno(c.alunoId).toLowerCase().includes(busca.trim().toLowerCase()));

  return (
    <div className="pb-6">
      <AppHeader titulo="Embarque" usuario={usuario} />

      {/* 1. Seletor de viagem */}
      <div className="flex gap-3 overflow-x-auto px-5 pb-1">
        {viagensHoje.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => { setViagemId(v.id); setFeedback(null); focar(); }}
            className={cn(
              "min-w-[9.5rem] flex-1 rounded-2xl border-2 p-3 text-left transition-colors",
              v.id === viagem.id ? "border-secondary bg-secondary text-secondary-foreground" : "border-border bg-card",
            )}
          >
            <p className="text-lg font-extrabold">{v.sentido === "ida" ? "Ida" : "Volta"} · {v.horarioSaida}</p>
            <p className={cn("text-sm font-semibold", v.id === viagem.id ? "opacity-80" : "text-muted-foreground")}>{onibusDe(v.onibusId).placa}</p>
          </button>
        ))}
      </div>

      {/* 2. Contadores */}
      <div className="mt-4 grid grid-cols-3 gap-2 px-5">
        {[
          ["Confirmados", confirmacoes.length, "text-foreground"],
          ["Embarcados", embarques.length, "text-success"],
          ["Faltando", faltando.length, "text-destructive"],
        ].map(([rotulo, n, cor]) => (
          <div key={rotulo as string} className="rounded-2xl border border-border bg-card p-3 text-center">
            <p className={cn("text-3xl font-black tabular-nums", cor as string)}>{n as number}</p>
            <p className="text-xs font-bold text-muted-foreground">{rotulo as string}</p>
          </div>
        ))}
      </div>

      {/* 3. Campo principal */}
      <form
        className="mt-5 px-5"
        onSubmit={(e) => { e.preventDefault(); confirmar(); }}
      >
        <label htmlFor="codigo-tag" className="block text-center text-sm font-bold text-muted-foreground">Código da tag NFC</label>
        <input
          id="codigo-tag"
          ref={input}
          autoFocus
          autoComplete="off"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Aproxime ou digite o código"
          className="mt-2 w-full rounded-2xl border-2 border-secondary bg-card px-4 py-4 text-center font-mono text-xl font-bold outline-none focus:ring-4 focus:ring-ring/40"
        />
        <button type="submit" className="mt-3 w-full rounded-2xl bg-primary py-4 text-lg font-extrabold text-primary-foreground active:scale-[0.99]">
          Confirmar presença
        </button>
        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
          {TAGS_DE_TESTE.map((t) => (
            <button key={t.codigo} type="button" onClick={() => { setCodigo(t.codigo); focar(); }}
              className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
              {t.rotulo}
            </button>
          ))}
        </div>
      </form>

      {/* 4. Feedback */}
      {feedback && (
        <div className="mt-4 px-5" role="status">
          {feedback.tipo === "ok" && (
            <div className="flex items-center gap-3 rounded-2xl bg-success p-4 text-success-foreground">
              <CheckCircle2 className="size-7 shrink-0" />
              <p className="text-lg font-extrabold">✔ {feedback.nome} embarcou <span className="font-semibold opacity-90">às {feedback.horario}</span></p>
            </div>
          )}
          {feedback.tipo === "erro" && (
            <div className="flex items-center gap-3 rounded-2xl bg-destructive p-4 text-destructive-foreground">
              <XCircle className="size-7 shrink-0" /><p className="text-lg font-extrabold">{feedback.texto}</p>
            </div>
          )}
          {feedback.tipo === "aviso" && (
            <div className="flex items-center gap-3 rounded-2xl bg-primary p-4 text-primary-foreground">
              <AlertTriangle className="size-7 shrink-0" /><p className="text-lg font-extrabold">{feedback.texto}</p>
            </div>
          )}
          {feedback.tipo === "sem_confirmacao" && (
            <div className="rounded-2xl bg-warning p-4 text-warning-foreground">
              <p className="flex items-center gap-2 text-lg font-extrabold"><AlertTriangle className="size-6" />Este aluno não confirmou a viagem</p>
              <p className="mt-1 font-semibold">{feedback.nome}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => registrar(feedback.alunoId, "nfc", true)} className="rounded-xl bg-secondary py-3 font-bold text-secondary-foreground">Registrar mesmo assim</button>
                <button type="button" onClick={() => { setFeedback(null); focar(); }} className="rounded-xl bg-card py-3 font-bold text-foreground">Cancelar</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Faltando embarcar */}
      <section className="mt-6 px-5">
        <h2 className="text-lg font-extrabold">Faltando embarcar</h2>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome"
            className="w-full rounded-xl border border-input bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <ul className="mt-3 space-y-2">
          {lista.length === 0 && <li className="rounded-2xl bg-muted p-4 text-center text-sm font-semibold text-muted-foreground">Ninguém faltando 🎉</li>}
          {lista.map((c) => {
            const nome = nomeAluno(c.alunoId);
            return (
              <li key={c.id} className={cn("flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-all duration-300",
                saindo === c.alunoId && "translate-x-8 opacity-0")}>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary font-bold text-secondary-foreground">{iniciais(nome)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{nome}</p>
                  <p className="truncate text-xs text-muted-foreground">{nomePonto(c.pontoEmbarqueId)} · {previsao(c.pontoEmbarqueId, viagem)}</p>
                </div>
                <button type="button" aria-label={`Marcar ${nome} manualmente`}
                  onClick={() => { if (window.confirm(`Registrar embarque manual de ${nome}?`)) registrar(c.alunoId, "manual"); }}
                  className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted">
                  <Hand className="size-3.5" />Manual
                </button>
              </li>
            );
          })}
        </ul>

        <button type="button" onClick={() => setVerEmbarcados((x) => !x)}
          className="mt-5 flex w-full items-center justify-between rounded-2xl bg-muted px-4 py-3 font-bold">
          Embarcados ({embarques.length})
          <ChevronDown className={cn("size-5 transition-transform", verEmbarcados && "rotate-180")} />
        </button>
        {verEmbarcados && (
          <ul className="mt-2 space-y-1.5">
            {[...embarques].sort((a, b) => b.horario.localeCompare(a.horario)).map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm">
                <span className="flex min-w-0 items-center gap-1.5 font-semibold">
                  {e.divergencia && <AlertTriangle className="size-4 shrink-0 text-warning" aria-label="Divergência: não confirmou" />}
                  <span className="truncate">{nomeAluno(e.alunoId)}</span>
                  {e.metodo === "manual" && <span className="text-xs text-muted-foreground">(manual)</span>}
                </span>
                <span className="font-mono text-muted-foreground">{hora(e.horario)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
