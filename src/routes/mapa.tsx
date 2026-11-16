import { createFileRoute } from "@tanstack/react-router";
import { Navigation, Satellite } from "lucide-react";
import { MapaRota } from "@/components/app/MapaRota";
import { PageHeader } from "@/components/app/PageHeader";
import { PONTOS, ROTA } from "@/lib/transporte-dados";
import { minutosAtePonto } from "@/lib/transporte-logica";
import { useTransporte } from "@/lib/transporte-store";
import { useOnibusPosicao } from "@/lib/use-onibus";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mapa")({
  head: () => ({
    meta: [
      { title: "Onde está o ônibus · Transporte Escolar NFC" },
      { name: "description", content: "Acompanhe a posição do ônibus escolar no mapa e o tempo até o seu ponto." },
      { property: "og:title", content: "Onde está o ônibus · Transporte Escolar NFC" },
      { property: "og:description", content: "Acompanhe a posição do ônibus escolar no mapa e o tempo até o seu ponto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Mapa,
});

function Mapa() {
  const s = useTransporte();
  const { pos, atualizadoEm } = useOnibusPosicao();
  const meuPonto = PONTOS.find((p) => p.id === s.embarqueId) ?? PONTOS[0]!;
  const eta = minutosAtePonto(pos, meuPonto.posicao, ROTA.duracaoMin);
  const proximo = PONTOS.find((p) => p.posicao > pos) ?? PONTOS[PONTOS.length - 1]!;

  return (
    <div>
      <PageHeader subtitulo={`${ROTA.nome} · trajeto de ida`} titulo="Onde está o ônibus" />

      <div className="card-surface relative mx-5 h-[26rem] overflow-hidden">
        <MapaRota posOnibus={pos} pontoDestacado={meuPonto.id} />
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1.5 text-[11px] font-semibold shadow-card">
          <Satellite className="size-3.5 text-success" />
          GPS simulado ·{" "}
          {atualizadoEm ? atualizadoEm.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--"}
        </div>
      </div>

      <div className="mx-5 mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
          <p className="text-xs font-semibold opacity-75">Até {meuPonto.nome}</p>
          <p className="font-display text-2xl font-extrabold">{eta === 0 ? "Passou" : `${eta} min`}</p>
        </div>
        <div className="rounded-2xl bg-secondary p-4 text-secondary-foreground">
          <p className="flex items-center gap-1 text-xs font-semibold opacity-75">
            <Navigation className="size-3" /> Próxima parada
          </p>
          <p className="font-display text-lg font-extrabold leading-tight">{proximo.nome}</p>
        </div>
      </div>

      <section className="card-surface mx-5 mt-4 p-4">
        <h2 className="text-base font-extrabold">Paradas</h2>
        <ol className="mt-3">
          {PONTOS.map((p, i) => {
            const passou = p.posicao <= pos;
            return (
              <li key={p.id} className="relative flex gap-3 pb-4 last:pb-0">
                {i < PONTOS.length - 1 && (
                  <span className={cn("absolute left-[7px] top-4 h-full w-0.5", passou ? "bg-primary" : "bg-border")} />
                )}
                <span
                  className={cn(
                    "relative mt-1 size-4 shrink-0 rounded-full border-2",
                    passou ? "border-secondary bg-primary" : "border-border bg-card",
                  )}
                />
                <div className="flex flex-1 items-baseline justify-between gap-2">
                  <div>
                    <p className={cn("font-semibold", passou && "text-muted-foreground")}>
                      {p.nome}
                      {p.id === meuPonto.id && (
                        <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase">seu ponto</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.referencia}</p>
                  </div>
                  <span className="font-mono text-sm">{p.horarioIda}</span>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
