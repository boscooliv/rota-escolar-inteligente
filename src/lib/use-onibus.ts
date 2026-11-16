import { useEffect, useState } from "react";

const CICLO_SEG = 240; // a simulação percorre a rota inteira em 4 minutos

function posicaoAgora() {
  return ((Date.now() / 1000) % CICLO_SEG) / CICLO_SEG;
}

/** Posição simulada do ônibus (0 a 1 ao longo da rota), como se viesse do GPS. */
export function useOnibusPosicao() {
  const [pos, setPos] = useState(0.3);
  const [atualizadoEm, setAtualizadoEm] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => {
      setPos(posicaoAgora());
      setAtualizadoEm(new Date());
    };
    tick();
    const t = window.setInterval(tick, 2000);
    return () => window.clearInterval(t);
  }, []);

  return { pos, atualizadoEm };
}
