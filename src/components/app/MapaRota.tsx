import { Bus, School } from "lucide-react";
import { PONTOS } from "@/lib/transporte-dados";

const CAMINHO: [number, number][] = [
  [40, 395], [72, 345], [58, 300], [108, 268], [165, 262], [196, 222],
  [176, 182], [214, 150], [272, 142], [292, 102], [322, 52],
];

const segmentos = CAMINHO.slice(1).map((p, i) => {
  const a = CAMINHO[i];
  return Math.hypot(p[0] - a[0], p[1] - a[1]);
});
const TOTAL = segmentos.reduce((s, l) => s + l, 0);

export function pontoNoCaminho(t: number): [number, number] {
  let alvo = Math.min(Math.max(t, 0), 1) * TOTAL;
  for (let i = 0; i < segmentos.length; i++) {
    if (alvo <= segmentos[i] || i === segmentos.length - 1) {
      const f = segmentos[i] === 0 ? 0 : Math.min(alvo / segmentos[i], 1);
      const [x1, y1] = CAMINHO[i];
      const [x2, y2] = CAMINHO[i + 1];
      return [x1 + (x2 - x1) * f, y1 + (y2 - y1) * f];
    }
    alvo -= segmentos[i];
  }
  return CAMINHO[CAMINHO.length - 1];
}

const linha = CAMINHO.map(([x, y]) => `${x},${y}`).join(" ");

export function MapaRota({ posOnibus, pontoDestacado, compacto = false }: { posOnibus: number; pontoDestacado?: string; compacto?: boolean }) {
  const [bx, by] = pontoNoCaminho(posOnibus);
  const percorrido = [...CAMINHO.filter((_, i) => {
    const acumulado = segmentos.slice(0, i).reduce((s, l) => s + l, 0);
    return acumulado / TOTAL <= posOnibus;
  }), [bx, by] as [number, number]]
    .map(([x, y]) => `${x},${y}`)
    .join(" ");

  return (
    <svg
      viewBox={compacto ? "0 120 360 230" : "0 20 360 400"}
      className="block h-full w-full"
      role="img"
      aria-label="Mapa com o trajeto e a posição do ônibus"
    >
      <rect x="0" y="0" width="360" height="440" className="fill-map-land" />
      <rect x="200" y="250" width="130" height="90" rx="18" className="fill-map-field" />
      <rect x="20" y="150" width="110" height="80" rx="18" className="fill-map-field" />
      <rect x="230" y="30" width="110" height="60" rx="14" className="fill-map-field" />
      <path d="M -10 120 C 80 140, 120 90, 200 110 S 300 200, 380 180" className="fill-none stroke-map-water" strokeWidth="14" strokeLinecap="round" />

      <polyline points={linha} className="fill-none stroke-map-road" strokeWidth="12" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={linha} className="fill-none stroke-map-line" strokeWidth="2" strokeDasharray="6 7" strokeLinejoin="round" />
      <polyline points={percorrido} className="fill-none stroke-map-line" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" opacity="0.9" />

      {PONTOS.map((p) => {
        const [x, y] = pontoNoCaminho(p.posicao);
        const destaque = p.id === pontoDestacado;
        const final = p.posicao === 1;
        return (
          <g key={p.id} transform={`translate(${x} ${y})`}>
            {destaque && <circle r="15" className="fill-primary/40" />}
            <circle r={final ? 11 : 7} className={destaque ? "fill-primary stroke-secondary" : "fill-card stroke-secondary"} strokeWidth="3" />
            {final && <School x={-6} y={-6} width={12} height={12} className="text-secondary" />}
            {!compacto && (
              <text
                x={final ? -16 : p.id === "p4" ? 0 : 14}
                y={p.id === "p4" ? -14 : 4}
                textAnchor={final ? "end" : p.id === "p4" ? "middle" : "start"} className="fill-foreground text-[11px] font-semibold">
                {p.nome}
              </text>
            )}
          </g>
        );
      })}

      <g style={{ transform: `translate(${bx}px, ${by}px)`, transition: "transform 1.9s linear" }}>
        <circle r="22" className="fill-primary/30 animate-pulse" />
        <circle r="15" className="fill-primary stroke-secondary" strokeWidth="3" />
        <Bus x={-8} y={-8} width={16} height={16} className="text-secondary" />
      </g>
    </svg>
  );
}
