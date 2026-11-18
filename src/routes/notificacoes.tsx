import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { AlertTriangle, Bell, CalendarCheck, Info, Nfc, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { AppHeader, Carregando } from "@/components/app/comum";
import { useSessao } from "@/hooks/use-sessao";
import { rotuloDia, dataISO, hora, type Notificacao } from "@/lib/transporte-dados";
import { acoes } from "@/lib/transporte-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notificacoes")({
  head: () => ({
    meta: [
      { title: "Notificações · Transporte Escolar NFC" },
      { name: "description", content: "Central de avisos: confirmações, embarques registrados e alertas de quem confirmou e não embarcou." },
      { property: "og:title", content: "Notificações · Transporte Escolar NFC" },
      { property: "og:description", content: "Avisos de confirmação, embarque por NFC e divergências do transporte escolar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Notificacoes,
});

const ICONE: Record<Notificacao["tipo"], typeof Bell> = { alerta: AlertTriangle, embarque: Nfc, confirmacao: CalendarCheck, info: Info };

function Notificacoes() {
  const { s, usuario } = useSessao();
  const minhas = usuario ? s.notificacoes.filter((n) => n.usuarioId === usuario.id).sort((a, b) => b.criadaEm.localeCompare(a.criadaEm)) : [];
  const temNaoLidas = minhas.some((n) => !n.lida);

  // Marca como lidas ao sair da tela, para o destaque aparecer enquanto o usuário lê.
  useEffect(() => {
    if (!usuario || !temNaoLidas) return;
    return () => acoes.marcarLidas(usuario.id);
  }, [usuario, temNaoLidas]);

  if (!usuario) return <Carregando />;

  return (
    <div>
      <AppHeader
        titulo="Notificações"
        usuario={usuario}
        acao={
          <button
            type="button"
            aria-label="Reiniciar demonstração"
            title="Reiniciar demonstração"
            onClick={() => {
              acoes.reiniciarDemo();
              toast.success("Demonstração reiniciada com os dados fictícios.");
            }}
            className="flex size-10 items-center justify-center rounded-full border border-border bg-card shadow-card"
          >
            <RotateCcw className="size-4" />
          </button>
        }
      />
      <ul className="space-y-3 px-5">
        {minhas.length === 0 && <li className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Nenhum aviso por enquanto.</li>}
        {minhas.map((n) => {
          const Icone = ICONE[n.tipo];
          const dia = rotuloDia(dataISO(0, new Date(n.criadaEm)));
          const corpo = (
            <div className={cn("card-surface flex gap-3 p-4", n.tipo === "alerta" && "border-destructive/40 bg-destructive/5")}>
              <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", n.tipo === "alerta" ? "bg-destructive text-destructive-foreground" : "bg-accent text-accent-foreground")}>
                <Icone className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold">{n.titulo}</p>
                  {!n.lida && <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-destructive" aria-label="Não lida" />}
                </div>
                <p className="text-sm text-muted-foreground">{n.mensagem}</p>
                <p className="mt-1 text-xs text-muted-foreground">{dia} · {hora(n.criadaEm)}</p>
              </div>
            </div>
          );
          return (
            <li key={n.id}>
              {n.viagemId ? <Link to="/viagens/$id" params={{ id: n.viagemId }}>{corpo}</Link> : corpo}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
