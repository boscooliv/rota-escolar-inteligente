import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, MapPin, Nfc, ScanLine } from "lucide-react";
import onibus from "@/assets/onibus.png";
import { ALUNOS, ALUNO_ATUAL_ID, PONTOS, ROTA, type Trecho } from "@/lib/transporte-dados";
import { minutosAtePonto } from "@/lib/transporte-logica";
import { alunosComTags, nomePonto, useTransporte } from "@/lib/transporte-store";
import { useOnibusPosicao } from "@/lib/use-onibus";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Início · Transporte Escolar NFC" },
      { name: "description", content: "Confirme sua viagem, acompanhe o ônibus e veja seus embarques registrados por NFC." },
      { property: "og:title", content: "Início · Transporte Escolar NFC" },
      { property: "og:description", content: "Confirme sua viagem, acompanhe o ônibus e veja seus embarques registrados por NFC." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Inicio,
});

const hora = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

function Inicio() {
  const s = useTransporte();
  const { pos } = useOnibusPosicao();
  const aluno = alunosComTags(s).find((a) => a.id === ALUNO_ATUAL_ID) ?? ALUNOS[0];
  const ponto = PONTOS.find((p) => p.id === s.embarqueId) ?? PONTOS[0];
  const eta = minutosAtePonto(pos, ponto.posicao, ROTA.duracaoMin);
  const divergencia = s.avisos.find((a) => a.tipo === "divergencia" && !a.lido);
  const confirmou = s.confirmacao.ida || s.confirmacao.volta;
  const embarqueDe = (t: Trecho) => s.embarques.find((e) => e.alunoId === ALUNO_ATUAL_ID && e.trecho === t);

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between px-5 pt-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="text-2xl font-extrabold">Olá, {aluno.nome.split(" ")[0]}!</h1>
        </div>
        <Link
          to="/leitor"
          className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-card"
        >
          <ScanLine className="size-4" /> Modo motorista
        </Link>
      </header>

      {divergencia && (
        <Link to="/avisos" className="mx-5 flex items-start gap-3 rounded-2xl bg-destructive p-4 text-destructive-foreground">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold">{divergencia.titulo}</p>
            <p className="opacity-90">{divergencia.texto}</p>
          </div>
        </Link>
      )}

      <section className="relative mx-5 overflow-hidden rounded-3xl bg-secondary p-5 pb-6 text-secondary-foreground">
        <div className="stripe-bus absolute inset-x-0 top-0 h-2" />
        <img
          src={onibus}
          alt="Ônibus escolar"
          width={1024}
          height={768}
          className="animate-bus-bob absolute -right-10 top-6 w-48 drop-shadow-xl"
        />
        <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-primary">{ROTA.nome}</p>
        <h2 className="mt-1 max-w-[11rem] text-xl font-extrabold leading-tight">{ROTA.descricao}</h2>
        <div className="mt-5 flex gap-2">
          {(["ida", "volta"] as const).map((t) => (
            <span
              key={t}
              className={
                s.confirmacao[t]
                  ? "flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground"
                  : "rounded-full border border-secondary-foreground/25 px-3 py-1 text-xs font-medium text-secondary-foreground/70"
              }
            >
              {s.confirmacao[t] && <CheckCircle2 className="size-3.5" />}
              {t === "ida" ? "Ida" : "Volta"}
            </span>
          ))}
        </div>
        <p className="mt-3 text-sm text-secondary-foreground/75">
          {confirmou ? `Embarque em ${nomePonto(s.embarqueId)}` : "Você ainda não confirmou a viagem de hoje."}
        </p>
        <Link
          to="/confirmar"
          className="mt-4 flex items-center justify-between rounded-2xl bg-primary px-4 py-3 font-bold text-primary-foreground shadow-pop"
        >
          {confirmou ? "Alterar confirmação" : "Confirmar viagem de hoje"}
          <ArrowRight className="size-5" />
        </Link>
      </section>

      <Link to="/mapa" className="card-surface mx-5 flex items-center gap-4 p-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent">
          <MapPin className="size-6 text-accent-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Ônibus até {ponto.nome}</p>
          <p className="font-display text-lg font-extrabold">{eta === 0 ? "Já passou pelo seu ponto" : `~${eta} min`}</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-success/15 px-2 py-1 text-[11px] font-bold text-success">
          <span className="size-1.5 animate-pulse rounded-full bg-success" /> GPS
        </span>
      </Link>

      <section className="card-surface mx-5 p-4">
        <h3 className="text-base font-extrabold">Embarques de hoje</h3>
        <ul className="mt-3 divide-y divide-border">
          {(["ida", "volta"] as const).map((t) => {
            const e = embarqueDe(t);
            return (
              <li key={t} className="flex items-center justify-between py-3">
                <span className="font-semibold capitalize">{t}</span>
                {e ? (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-success">
                    <CheckCircle2 className="size-4" /> {hora(e.horario)} · {e.metodo === "nfc" ? "NFC" : "manual"}
                  </span>
                ) : s.confirmacao[t] ? (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="size-4" /> Aguardando embarque
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">Não confirmado</span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mx-5 flex items-center gap-4 rounded-2xl border border-dashed border-border p-4">
        <div className="relative flex size-12 shrink-0 items-center justify-center">
          <span className="animate-nfc-pulse absolute inset-0 rounded-full bg-primary/50" />
          <span className="relative flex size-12 items-center justify-center rounded-full bg-primary">
            <Nfc className="size-6 text-primary-foreground" />
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold">Sua tag NFC</p>
          <p className="truncate font-mono text-xs text-muted-foreground">{aluno.tag}</p>
          <p className="text-xs text-muted-foreground">Aproxime do leitor ao entrar no ônibus.</p>
        </div>
      </section>
    </div>
  );
}
