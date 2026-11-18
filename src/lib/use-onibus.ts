import { useEffect, useState } from "react";
import { type Localizacao, type StatusViagem } from "./transporte-dados";

const CICLO_SEG = 240; // a simulação percorre o trajeto em 4 minutos

/**
 * Progresso simulado do ônibus (0 = saída, 1 = chegada), como se viesse do GPS.
 * Agendada fica na saída, concluída fica na chegada e em andamento se move.
 */
export function useProgressoViagem(status: StatusViagem) {
  const [ciclo, setCiclo] = useState(0.35);
  const [atualizadoEm, setAtualizadoEm] = useState<Date | null>(null);

  useEffect(() => {
    if (status !== "em_andamento") return;
    const tick = () => {
      setCiclo(((Date.now() / 1000) % CICLO_SEG) / CICLO_SEG);
      setAtualizadoEm(new Date());
    };
    tick();
    const t = window.setInterval(tick, 2000);
    return () => window.clearInterval(t);
  }, [status]);

  const progresso = status === "concluida" ? 1 : status === "agendada" ? 0 : 0.1 + ciclo * 0.85;
  return { progresso, atualizadoEm };
}

// Coordenadas aproximadas (fictícias) do início e do fim do trajeto.
const INICIO = { lat: -6.1089, lng: -38.3047 }; // Encanto
const FIM = { lat: -6.1155, lng: -38.2052 }; // IFRN Pau dos Ferros

/** Localização (registro do GPS) simulada a partir da posição no trajeto. */
export function localizacaoSimulada(viagemId: string, posicaoNoMapa: number): Localizacao {
  const t = Math.min(Math.max(posicaoNoMapa, 0), 1);
  return {
    id: `${viagemId}-${Math.round(t * 1000)}`,
    viagemId,
    latitude: +(INICIO.lat + (FIM.lat - INICIO.lat) * t).toFixed(5),
    longitude: +(INICIO.lng + (FIM.lng - INICIO.lng) * t).toFixed(5),
    registradaEm: new Date().toISOString(),
  };
}

