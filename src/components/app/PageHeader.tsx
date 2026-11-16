import type { ReactNode } from "react";

export function PageHeader({ titulo, subtitulo, acao }: { titulo: string; subtitulo?: string; acao?: ReactNode }) {
  return (
    <header className="flex items-start justify-between gap-4 px-5 pb-4 pt-6">
      <div>
        {subtitulo && <p className="text-sm font-medium text-muted-foreground">{subtitulo}</p>}
        <h1 className="text-2xl font-extrabold text-foreground">{titulo}</h1>
      </div>
      {acao}
    </header>
  );
}
