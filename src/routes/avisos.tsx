import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AlertTriangle, BellOff, CalendarCheck, Nfc, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { ALUNO_ATUAL_ID } from "@/lib/transporte-dados";
import { acoes, useTransporte, type Aviso } from "@/lib/transporte-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/avisos")({
  head: () => ({
    meta: [
      { title: "Avisos e embarques · Transporte Escolar NFC" },
      { name: "description", content: "Notificações de embarque e divergências, e o histórico de embarques registrados por NFC." },
      { property: "og:title", content: "Avisos e embarques · Transporte Escolar NFC" },
      { property: "og:description", content: "Notificações de embarque e divergências registradas pelo sistema." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Avisos,
});

const estilo: Record<Aviso["tipo"], { icon: typeof Nfc; cls: string }> = {
  divergencia: { icon: AlertTriangle, cls: "bg-destructive text-destructive-foreground" },
  embarque: { icon: Nfc, cls: "bg-success text-success-foreground" },
  confirmacao: { icon: CalendarCheck, cls: "bg-primary text-primary-foreground" },
};

const quando = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });

function Avisos() {
  const s = useTransporte();
  const meus = s.embarques.filter((e) => e.alunoId === ALUNO_ATUAL_ID);
  const temNaoLidos = s.avisos.some((a) => !a.lido);

  useEffect(() => {
    if (!temNaoLidos) return;
    const t = window.setTimeout(() => acoes.marcarAvisosLidos(), 2500);
    return () => window.clearTimeout(t);
  }, [temNaoLidos]);

  return (
    <div>
      <PageHeader subtitulo="Central do estudante" titulo="Avisos" />

      <section className="space-y-3 px-5">
        {s.avisos.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-10 text-center text-muted-foreground">
            <BellOff className="size-8" />
            <p className="text-sm">Nenhum aviso por enquanto. Confirme sua viagem e eles aparecerão aqui.</p>
          </div>
        )}
        {s.avisos.map((a) => {
          const { icon: Icon, cls } = estilo[a.tipo];
          return (
            <article key={a.id} className={cn("card-surface flex gap-3 p-4", !a.lido && "ring-2 ring-primary")}>
              <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", cls)}>
                <Icon className="size-5" />
              </span>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-bold">{a.titulo}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{quando(a.horario)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{a.texto}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="card-surface mx-5 mt-6 p-4">
        <h2 className="flex items-center gap-2 text-base font-extrabold">
          <UserCheck className="size-5" /> Histórico de embarques
        </h2>
        {meus.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nenhum embarque registrado hoje.</p>
        ) : (
          <ul className="mt-2 divide-y divide-border">
            {meus.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="font-semibold capitalize">{e.trecho}</span>
                <span className="text-muted-foreground">
                  {quando(e.horario)} · {e.metodo === "nfc" ? "tag NFC" : "manual"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
