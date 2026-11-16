import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeftRight, ArrowRight, ArrowLeft, Check, X } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { PONTOS, type Confirmacao } from "@/lib/transporte-dados";
import { acoes, useTransporte } from "@/lib/transporte-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/confirmar")({
  head: () => ({
    meta: [
      { title: "Confirmar viagem · Transporte Escolar NFC" },
      { name: "description", content: "Informe se vai usar o transporte na ida, na volta ou nos dois trajetos e escolha seus pontos." },
      { property: "og:title", content: "Confirmar viagem · Transporte Escolar NFC" },
      { property: "og:description", content: "Informe se vai usar o transporte e escolha os pontos de embarque e desembarque." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConfirmarViagem,
});

const OPCOES: { id: string; label: string; desc: string; conf: Confirmacao; icon: typeof ArrowRight }[] = [
  { id: "ambos", label: "Ida e volta", desc: "Vou e volto de ônibus", conf: { ida: true, volta: true }, icon: ArrowLeftRight },
  { id: "ida", label: "Só ida", desc: "Para o IFRN", conf: { ida: true, volta: false }, icon: ArrowRight },
  { id: "volta", label: "Só volta", desc: "Para minha cidade", conf: { ida: false, volta: true }, icon: ArrowLeft },
  { id: "nao", label: "Não vou hoje", desc: "Libero minha vaga", conf: { ida: false, volta: false }, icon: X },
];

const idDe = (c: Confirmacao) => OPCOES.find((o) => o.conf.ida === c.ida && o.conf.volta === c.volta)?.id ?? "ambos";

function ConfirmarViagem() {
  const s = useTransporte();
  const navigate = useNavigate();
  const [opcao, setOpcao] = useState("ambos");
  const [embarque, setEmbarque] = useState("p3");
  const [desembarque, setDesembarque] = useState("p3");

  useEffect(() => {
    if (s.confirmadoEm) setOpcao(idDe(s.confirmacao));
    setEmbarque(s.embarqueId);
    setDesembarque(s.desembarqueId);
  }, [s.confirmadoEm, s.confirmacao, s.embarqueId, s.desembarqueId]);

  const conf = OPCOES.find((o) => o.id === opcao)!.conf;
  const pontosSemCampus = PONTOS.filter((p) => p.posicao < 1);

  function salvar() {
    acoes.confirmar(conf, embarque, desembarque);
    toast.success(conf.ida || conf.volta ? "Viagem confirmada!" : "Tudo certo, sua vaga foi liberada.");
    navigate({ to: "/" });
  }

  return (
    <div>
      <PageHeader subtitulo="Viagem de hoje" titulo="Vai usar o transporte?" />

      <div className="grid grid-cols-2 gap-3 px-5">
        {OPCOES.map(({ id, label, desc, icon: Icon }) => {
          const ativo = opcao === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setOpcao(id)}
              aria-pressed={ativo}
              className={cn(
                "relative flex flex-col items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all",
                ativo ? "border-secondary bg-primary text-primary-foreground shadow-pop" : "border-border bg-card",
              )}
            >
              <Icon className="size-6" />
              <div>
                <p className="font-display font-extrabold">{label}</p>
                <p className={cn("text-xs", ativo ? "text-primary-foreground/75" : "text-muted-foreground")}>{desc}</p>
              </div>
              {ativo && <Check className="absolute right-3 top-3 size-5" />}
            </button>
          );
        })}
      </div>

      {conf.ida && (
        <EscolhaPonto titulo="Onde você embarca na ida?" valor={embarque} onChange={setEmbarque} pontos={pontosSemCampus} campo="horarioIda" />
      )}
      {conf.volta && (
        <EscolhaPonto titulo="Onde você desce na volta?" valor={desembarque} onChange={setDesembarque} pontos={pontosSemCampus} campo="horarioVolta" />
      )}

      <div className="px-5 pt-6">
        <button
          type="button"
          onClick={salvar}
          className="w-full rounded-2xl bg-secondary py-4 font-display text-lg font-extrabold text-secondary-foreground"
        >
          {conf.ida || conf.volta ? "Confirmar viagem" : "Informar ausência"}
        </button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          O motorista vê sua confirmação e compara com o embarque registrado pela tag NFC.
        </p>
      </div>
    </div>
  );
}

function EscolhaPonto({
  titulo, valor, onChange, pontos, campo,
}: {
  titulo: string;
  valor: string;
  onChange: (id: string) => void;
  pontos: typeof PONTOS;
  campo: "horarioIda" | "horarioVolta";
}) {
  return (
    <section className="px-5 pt-6">
      <h2 className="mb-3 text-lg font-extrabold">{titulo}</h2>
      <div className="card-surface overflow-hidden">
        {pontos.map((p, i) => {
          const ativo = valor === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p.id)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                i > 0 && "border-t border-border",
                ativo && "bg-accent",
              )}
            >
              <span className={cn("flex size-5 items-center justify-center rounded-full border-2", ativo ? "border-secondary bg-secondary" : "border-border")}>
                {ativo && <span className="size-2 rounded-full bg-primary" />}
              </span>
              <span className="flex-1">
                <span className="block font-semibold">{p.nome}</span>
                <span className="block text-xs text-muted-foreground">{p.referencia}</span>
              </span>
              <span className="font-mono text-sm font-semibold">{p[campo]}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
