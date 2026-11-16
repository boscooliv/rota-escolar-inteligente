import { Link } from "@tanstack/react-router";
import { Bell, CalendarCheck, Home, MapPinned } from "lucide-react";
import { useTransporte } from "@/lib/transporte-store";

const itens = [
  { to: "/", label: "Início", icon: Home },
  { to: "/confirmar", label: "Viagem", icon: CalendarCheck },
  { to: "/mapa", label: "Mapa", icon: MapPinned },
  { to: "/avisos", label: "Avisos", icon: Bell },
] as const;

export function BottomNav() {
  const { avisos } = useTransporte();
  const naoLidos = avisos.filter((a) => !a.lido).length;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
      <ul className="mx-auto grid max-w-md grid-cols-4 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
        {itens.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: true }}
              className="group relative flex flex-col items-center gap-1 rounded-xl py-1.5 text-xs font-medium text-muted-foreground transition-colors data-[status=active]:text-foreground"
            >
              <span className="relative flex h-8 w-14 items-center justify-center rounded-full transition-colors group-data-[status=active]:bg-primary">
                <Icon className="size-5" />
                {to === "/avisos" && naoLidos > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {naoLidos}
                  </span>
                )}
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
