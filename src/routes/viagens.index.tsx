import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Bus, CheckCircle2, Circle, Clock, Users } from "lucide-react";
import { AppHeader, Carregando, StatusBadge } from "@/components/app/comum";
import { useSessao } from "@/hooks/use-sessao";
import { dataISO, formatarData, onibusDe, ROTULO_SENTIDO, rotuloDia, type Sentido } from "@/lib/transporte-dados";
import { confirmacaoDe, confirmacoesDa, embarqueDe, embarquesDa } from "@/lib/transporte-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/viagens/")({
  head: () => ({
    meta: [
      { title: "Viagens · Transporte Escolar NFC" },
      { name: "description", content: "Lista das viagens do transporte escolar com horário, sentido, ônibus, status e alunos confirmados." },
      { property: "og:title", content: "Viagens · Transporte Escolar NFC" },
      { property: "og:description", content: "Veja as viagens de ida e volta do transporte escolar do IFRN Pau dos Ferros." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ListaViagens,
});

const selectCls = "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring";

function ListaViagens() {
  const { s, usuario, aluno } = useSessao();
  const [data, setData] = useState<string>(() => dataISO(0));
  const [sentido, setSentido] = useState<Sentido | "todos">("todos");
  if (!usuario) return <Carregando />;

  const datas = [...new Set(s.viagens.map((v) => v.data))];
  const lista = s.viagens.filter((v) => (data === "todas" || v.data === data) && (sentido === "todos" || v.sentido === sentido));

  return (
    <div>
      <AppHeader titulo="Viagens" usuario={usuario} />

      <div className="grid grid-cols-2 gap-3 px-5">
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Data</span>
          <select aria-label="Filtrar por data" value={data} onChange={(e) => setData(e.target.value)} className={selectCls}>
            <option value="todas">Todas</option>
            {datas.map((d) => (
              <option key={d} value={d}>
                {rotuloDia(d)} · {formatarData(d, { day: "2-digit", month: "2-digit" })}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Sentido</span>
          <select aria-label="Filtrar por sentido" value={sentido} onChange={(e) => setSentido(e.target.value as Sentido | "todos")} className={selectCls}>
            <option value="todos">Todos</option>
            <option value="ida">{ROTULO_SENTIDO.ida}</option>
            <option value="volta">{ROTULO_SENTIDO.volta}</option>
          </select>
        </label>
      </div>

      <ul className="mt-4 space-y-3 px-5">
        {lista.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nenhuma viagem para esse filtro.
          </li>
        )}
        {lista.map((v) => {
          const confirmados = confirmacoesDa(s, v.id).length;
          const embarcados = embarquesDa(s, v.id).length;
          const minha = aluno ? confirmacaoDe(s, v.id, aluno.id) : undefined;
          const embarquei = aluno ? embarqueDe(s, v.id, aluno.id) : undefined;
          return (
            <li key={v.id}>
              <Link to="/viagens/$id" params={{ id: v.id }} className="card-surface block p-4 transition-transform active:scale-[0.99]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {rotuloDia(v.data)} · {formatarData(v.data)}
                    </p>
                    <p className="mt-0.5 flex items-center gap-2 font-display text-2xl font-extrabold">
                      <Clock className="size-5 text-muted-foreground" /> {v.horarioSaida}
                    </p>
                  </div>
                  <StatusBadge status={v.status} />
                </div>
                <p className="mt-2 flex items-center gap-2 font-bold">
                  {ROTULO_SENTIDO[v.sentido]}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Bus className="size-4" /> {onibusDe(v.onibusId).placa}</span>
                  <span className="flex items-center gap-1.5"><Users className="size-4" /> {confirmados} confirmados</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  {usuario.perfil === "aluno" ? (
                    embarquei ? (
                      <span className="flex items-center gap-1.5 text-sm font-bold text-success"><CheckCircle2 className="size-4" /> Você embarcou</span>
                    ) : minha ? (
                      <span className="flex items-center gap-1.5 text-sm font-bold text-foreground"><CheckCircle2 className="size-4 text-success" /> Você confirmou</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Circle className="size-4" /> Não confirmado</span>
                    )
                  ) : (
                    <span className="text-sm">
                      <b className="font-display text-base">{confirmados}</b> confirmados ×{" "}
                      <b className={cn("font-display text-base", embarcados < confirmados && v.status !== "agendada" && "text-destructive")}>{embarcados}</b> embarcados
                    </span>
                  )}
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
