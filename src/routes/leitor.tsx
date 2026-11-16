import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle, ArrowLeft, CheckCircle2, ExternalLink, Hand, Nfc, RotateCcw, Square, UserX,
} from "lucide-react";
import { ALUNOS, type Aluno, type Trecho } from "@/lib/transporte-dados";
import { encontrarAlunoPorTag, jaEmbarcou, normalizarTag } from "@/lib/transporte-logica";
import { acoes, alunosComTags, lerEstado, todasConfirmacoes, useTransporte } from "@/lib/transporte-store";
import { iniciarLeituraNfc, verificarSuporteNfc, type SuporteNfc } from "@/lib/web-nfc";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leitor")({
  head: () => ({
    meta: [
      { title: "Leitor NFC do motorista · Transporte Escolar NFC" },
      { name: "description", content: "Registre o embarque dos estudantes aproximando a tag NFC do celular do motorista." },
      { property: "og:title", content: "Leitor NFC do motorista · Transporte Escolar NFC" },
      { property: "og:description", content: "Registre o embarque dos estudantes aproximando a tag NFC do celular." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Leitor,
});

type Resultado =
  | { tipo: "ok"; aluno: Aluno; confirmado: boolean }
  | { tipo: "duplicado"; aluno: Aluno }
  | { tipo: "desconhecida"; serial: string };

function Leitor() {
  const s = useTransporte();
  const [trecho, setTrecho] = useState<Trecho>("ida");
  const [suporte, setSuporte] = useState<SuporteNfc>("verificando");
  const [lendo, setLendo] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [ausentes, setAusentes] = useState<Aluno[] | null>(null);
  const controle = useRef<AbortController | null>(null);

  const alunos = alunosComTags(s);
  const confirmacoes = todasConfirmacoes(s);
  const confirmados = alunos.filter((a) => confirmacoes[a.id]?.[trecho]);
  const outros = alunos.filter((a) => !confirmacoes[a.id]?.[trecho]);
  const embarcados = confirmados.filter((a) => jaEmbarcou(s.embarques, a.id, trecho)).length;

  // Referências atualizadas para o callback de leitura, que vive fora do ciclo do React.
  const trechoRef = useRef(trecho);
  trechoRef.current = trecho;

  useEffect(() => {
    setSuporte(verificarSuporteNfc());
    return () => controle.current?.abort();
  }, []);

  function processarSerial(serial: string) {
    const t = trechoRef.current;
    const lista = alunosComTags(lerEstado());
    const aluno = encontrarAlunoPorTag(lista, serial);
    if (!aluno) {
      setResultado({ tipo: "desconhecida", serial: normalizarTag(serial) });
      navigator.vibrate?.([80, 60, 80]);
      return;
    }
    const r = acoes.registrarEmbarque(aluno.id, t, "nfc");
    navigator.vibrate?.(120);
    setResultado(
      r === "duplicado"
        ? { tipo: "duplicado", aluno }
        : { tipo: "ok", aluno, confirmado: !!todasConfirmacoes(lerEstado())[aluno.id]?.[t] },
    );
  }

  async function alternarLeitura() {
    if (lendo) {
      controle.current?.abort();
      setLendo(false);
      return;
    }
    const c = new AbortController();
    controle.current = c;
    try {
      await iniciarLeituraNfc(processarSerial, () => toast.error("Não foi possível ler a tag. Tente aproximar de novo."), c.signal);
      setLendo(true);
    } catch (e) {
      const nome = e instanceof Error ? e.name : "";
      toast.error(
        nome === "NotAllowedError"
          ? "Permissão de NFC negada. Libere o NFC nas configurações do site no Chrome."
          : "Não foi possível iniciar o NFC. Verifique se o NFC do celular está ligado.",
      );
    }
  }

  function encerrar() {
    const lista = acoes.encerrarEmbarque(trecho);
    setAusentes(lista);
    if (lista.length === 0) toast.success("Todos os confirmados embarcaram!");
  }

  return (
    <div className="pb-4">
      <header className="flex items-center gap-3 px-5 pb-4 pt-6">
        <Link to="/" aria-label="Voltar" className="flex size-10 items-center justify-center rounded-full border border-border bg-card">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Modo motorista</p>
          <h1 className="text-2xl font-extrabold">Leitor NFC</h1>
        </div>
      </header>

      <div className="mx-5 grid grid-cols-2 rounded-2xl bg-muted p-1">
        {(["ida", "volta"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTrecho(t); setResultado(null); setAusentes(null); }}
            className={cn("rounded-xl py-2 text-sm font-bold capitalize transition-colors", trecho === t ? "bg-secondary text-secondary-foreground" : "text-muted-foreground")}
          >
            {t}
          </button>
        ))}
      </div>

      <section className="mx-5 mt-4 flex flex-col items-center rounded-3xl bg-secondary px-5 py-7 text-center text-secondary-foreground">
        <div className="relative flex size-28 items-center justify-center">
          {lendo && <span className="animate-nfc-pulse absolute inset-0 rounded-full bg-primary/60" />}
          {lendo && <span className="animate-nfc-pulse absolute inset-0 rounded-full bg-primary/40 [animation-delay:0.9s]" />}
          <span className={cn("relative flex size-28 items-center justify-center rounded-full", lendo ? "bg-primary" : "bg-secondary-foreground/10")}>
            <Nfc className={cn("size-12", lendo ? "text-primary-foreground" : "text-primary")} />
          </span>
        </div>
        <p className="mt-4 font-display text-xl font-extrabold">
          {lendo ? "Aproxime a tag do celular" : "Leitura pausada"}
        </p>
        <p className="mt-1 text-sm text-secondary-foreground/70">
          {embarcados} de {confirmados.length} confirmados embarcaram na {trecho}
        </p>

        {suporte === "suportado" && (
          <button
            type="button"
            onClick={alternarLeitura}
            className={cn(
              "mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-bold",
              lendo ? "bg-secondary-foreground/15 text-secondary-foreground" : "bg-primary text-primary-foreground shadow-pop",
            )}
          >
            {lendo ? <><Square className="size-4" /> Pausar leitura</> : <><Nfc className="size-5" /> Iniciar leitura NFC</>}
          </button>
        )}
        {suporte === "abrir-em-aba" && (
          <div className="mt-5 w-full rounded-2xl bg-secondary-foreground/10 p-4 text-sm">
            <p>O NFC só funciona com o app aberto em uma aba própria do Chrome.</p>
            <a
              href={typeof window !== "undefined" ? window.location.href : "/leitor"}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground"
            >
              Abrir em nova aba <ExternalLink className="size-4" />
            </a>
          </div>
        )}
        {suporte === "sem-suporte" && (
          <p className="mt-5 w-full rounded-2xl bg-secondary-foreground/10 p-4 text-sm">
            Este navegador não lê NFC. Use o Chrome em um celular Android com NFC ligado. Enquanto isso, registre os embarques manualmente abaixo.
          </p>
        )}
      </section>

      {resultado && <CartaoResultado resultado={resultado} trecho={trecho} onFechar={() => setResultado(null)} />}

      {ausentes && ausentes.length > 0 && (
        <section className="mx-5 mt-4 rounded-2xl border-2 border-destructive bg-card p-4">
          <p className="flex items-center gap-2 font-bold text-destructive">
            <AlertTriangle className="size-5" /> {ausentes.length} confirmado(s) sem embarque
          </p>
          <ul className="mt-2 text-sm">
            {ausentes.map((a) => <li key={a.id}>• {a.nome}</li>)}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">Os estudantes foram notificados no app.</p>
        </section>
      )}

      <section className="card-surface mx-5 mt-4 p-4">
        <h2 className="text-base font-extrabold">Confirmados para a {trecho}</h2>
        <ListaPassageiros alunos={confirmados} trecho={trecho} vazio="Ninguém confirmou este trecho." />
        {outros.length > 0 && (
          <>
            <h3 className="mt-5 text-sm font-bold text-muted-foreground">Sem confirmação</h3>
            <ListaPassageiros alunos={outros} trecho={trecho} vazio="" naoConfirmado />
          </>
        )}
      </section>

      <div className="mx-5 mt-4 flex gap-3">
        <button type="button" onClick={encerrar} className="flex-1 rounded-2xl bg-secondary py-3.5 font-bold text-secondary-foreground">
          Encerrar embarque
        </button>
        <button
          type="button"
          onClick={() => { acoes.reiniciarDemo(); setResultado(null); setAusentes(null); toast("Demonstração reiniciada"); }}
          aria-label="Reiniciar demonstração"
          className="flex size-[52px] items-center justify-center rounded-2xl border border-border bg-card"
        >
          <RotateCcw className="size-5" />
        </button>
      </div>
    </div>
  );
}

function ListaPassageiros({
  alunos, trecho, vazio, naoConfirmado = false,
}: { alunos: Aluno[]; trecho: Trecho; vazio: string; naoConfirmado?: boolean }) {
  const s = useTransporte();
  if (alunos.length === 0) return vazio ? <p className="mt-2 text-sm text-muted-foreground">{vazio}</p> : null;
  return (
    <ul className="mt-2 divide-y divide-border">
      {alunos.map((a) => {
        const embarque = s.embarques.find((e) => e.alunoId === a.id && e.trecho === trecho);
        return (
          <li key={a.id} className="flex items-center gap-3 py-2.5">
            <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold", embarque ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground")}>
              {embarque ? <CheckCircle2 className="size-5" /> : a.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn("truncate text-sm font-semibold", naoConfirmado && !embarque && "text-muted-foreground")}>{a.nome}</p>
              <p className="truncate text-xs text-muted-foreground">
                {embarque
                  ? `${new Date(embarque.horario).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} · ${embarque.metodo === "nfc" ? "NFC" : "manual"}`
                  : a.curso}
              </p>
            </div>
            {embarque ? (
              <button type="button" onClick={() => acoes.removerEmbarque(embarque.id)} className="text-xs font-semibold text-muted-foreground underline">
                desfazer
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { acoes.registrarEmbarque(a.id, trecho, "manual"); toast.success(`${a.nome.split(" ")[0]} registrado(a) manualmente`); }}
                className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-bold"
              >
                <Hand className="size-3.5" /> Manual
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function CartaoResultado({ resultado, trecho, onFechar }: { resultado: Resultado; trecho: Trecho; onFechar: () => void }) {
  const [vincularA, setVincularA] = useState(ALUNOS[0].id);

  if (resultado.tipo === "desconhecida") {
    return (
      <section className="mx-5 mt-4 rounded-2xl border-2 border-warning bg-card p-4">
        <p className="flex items-center gap-2 font-bold"><UserX className="size-5 text-warning" /> Tag não cadastrada</p>
        <p className="mt-1 font-mono text-xs text-muted-foreground">{resultado.serial}</p>
        <p className="mt-3 text-sm">Vincular esta tag a um estudante:</p>
        <div className="mt-2 flex gap-2">
          <select
            value={vincularA}
            onChange={(e) => setVincularA(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm"
          >
            {ALUNOS.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>
          <button
            type="button"
            onClick={() => {
              acoes.vincularTag(resultado.serial, vincularA);
              acoes.registrarEmbarque(vincularA, trecho, "nfc");
              toast.success("Tag vinculada e embarque registrado");
              onFechar();
            }}
            className="rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"
          >
            Vincular
          </button>
        </div>
      </section>
    );
  }

  const ok = resultado.tipo === "ok";
  return (
    <section className={cn("mx-5 mt-4 flex items-center gap-3 rounded-2xl p-4", ok ? "bg-success text-success-foreground" : "bg-accent text-accent-foreground")}>
      <CheckCircle2 className="size-8 shrink-0" />
      <div className="flex-1">
        <p className="font-display text-lg font-extrabold leading-tight">{resultado.aluno.nome}</p>
        <p className="text-sm opacity-90">
          {ok
            ? resultado.confirmado ? `Embarque na ${trecho} registrado` : `Registrado, mas não tinha confirmado a ${trecho}`
            : "Já tinha embarcado neste trecho"}
        </p>
      </div>
      <button type="button" onClick={onFechar} className="text-sm font-semibold underline">ok</button>
    </section>
  );
}
