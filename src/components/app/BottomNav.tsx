import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Bell, CalendarPlus, List, LogOut, Nfc } from "lucide-react";
import { useSessao } from "@/hooks/use-sessao";
import { acoes } from "@/lib/transporte-store";

const classe =
  "group relative flex w-full flex-col items-center gap-1 rounded-xl py-1.5 text-xs font-medium text-muted-foreground transition-colors data-[status=active]:text-foreground";
const pilula = "relative flex h-8 w-14 items-center justify-center rounded-full transition-colors group-data-[status=active]:bg-primary";

export function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { s, usuario } = useSessao({ exigir: false });
  if (pathname === "/" || !usuario) return null;
  const naoLidas = s.notificacoes.filter((n) => n.usuarioId === usuario.id && !n.lida).length;
  const aluno = usuario.perfil === "aluno";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
      <ul className={`mx-auto grid max-w-md px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 ${aluno ? "grid-cols-4" : "grid-cols-4"}`}>
        <li>
          <Link to="/viagens" className={classe}>
            <span className={pilula}><List className="size-5" /></span>
            Viagens
          </Link>
        </li>
        {aluno && (
          <li>
            <Link to="/confirmar" className={classe}>
              <span className={pilula}><CalendarPlus className="size-5" /></span>
              Confirmar
            </Link>
          </li>
        )}
        {!aluno && (
          <li>
            <Link to="/embarque" className={classe}>
              <span className={pilula}><Nfc className="size-5" /></span>
              Embarque
            </Link>
          </li>
        )}
        <li>
          <Link to="/notificacoes" className={classe}>
            <span className={pilula}>
              <Bell className="size-5" />
              {naoLidas > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {naoLidas}
                </span>
              )}
            </span>
            Avisos
          </Link>
        </li>
        <li>
          <button
            type="button"
            className={classe}
            onClick={() => {
              acoes.sair();
              navigate({ to: "/" });
            }}
          >
            <span className={pilula}><LogOut className="size-5" /></span>
            Sair
          </button>
        </li>
      </ul>
    </nav>
  );
}
