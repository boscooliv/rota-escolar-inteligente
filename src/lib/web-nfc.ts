// Leitura de tags NFC pelo navegador (Web NFC — Chrome no Android).

type LeituraNfc = { serialNumber: string };
type LeitorNdef = {
  scan(opcoes?: { signal?: AbortSignal }): Promise<void>;
  onreading: ((e: LeituraNfc) => void) | null;
  onreadingerror: (() => void) | null;
};

export type SuporteNfc = "verificando" | "suportado" | "sem-suporte" | "abrir-em-aba";

export function verificarSuporteNfc(): SuporteNfc {
  if (typeof window === "undefined") return "verificando";
  if (!("NDEFReader" in window)) return "sem-suporte";
  if (window.top !== window.self) return "abrir-em-aba";
  return "suportado";
}

/** Inicia a leitura contínua. Chame a partir de um toque do usuário. */
export async function iniciarLeituraNfc(
  aoLer: (serial: string) => void,
  aoFalhar: () => void,
  signal: AbortSignal,
): Promise<void> {
  const Construtor = (window as unknown as { NDEFReader?: new () => LeitorNdef }).NDEFReader;
  if (!Construtor) throw new Error("sem-suporte");
  const leitor = new Construtor();
  await leitor.scan({ signal });
  leitor.onreading = (e) => aoLer(e.serialNumber);
  leitor.onreadingerror = aoFalhar;
}
