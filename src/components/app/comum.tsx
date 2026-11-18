import type { ReactNode } from "react";
import { Bus } from "lucide-react";
import { ROTULO_STATUS, type StatusViagem, type Usuario } from "@/lib/transporte-dados";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: StatusViagem }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold",
        status === "em_andamento" && "bg-success/15 text-success",
        status === "agendada" && "bg-accent text-accent-foreground",
        status === "concluida" && "bg-muted text-muted-foreground",
      )}
    >
      {status === "em_andamento" && <span className="size-1.5 animate-pulse rounded-full bg-success" />}
      {ROTULO_STATUS[status]}
    </span>
  );
}

export function AppHeader({ titulo, usuario, acao }: { titulo: string; usuario?: Usuario; acao?: ReactNode }) {
  return (
    <header className="flex items-start justify-between gap-4 px-5 pb-4 pt-6">
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <Bus className="size-4" />
          {usuario ? (
            <span className="truncate">
              {usuario.nome.split(" ")[0]} · {usuario.perfil === "aluno" ? "Aluno" : "Responsável"}
            </span>
          ) : (
            "Transporte Escolar NFC"
          )}
        </p>
        <h1 className="text-2xl font-extrabold text-foreground">{titulo}</h1>
      </div>
      {acao}
    </header>
  );
}

export function Carregando() {
  return (
    <div className="space-y-3 px-5 pt-8">
      <div className="h-8 w-40 animate-pulse rounded-xl bg-muted" />
      <div className="h-28 animate-pulse rounded-2xl bg-muted" />
      <div className="h-28 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}
