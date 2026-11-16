import type { Aluno, Confirmacao, Trecho } from "./transporte-dados";

export type Embarque = {
  id: string;
  alunoId: string;
  trecho: Trecho;
  horario: string; // ISO
  metodo: "nfc" | "manual";
};

/** Normaliza o número de série lido de uma tag NFC (ex.: "04:A2:3F" → "04:a2:3f"). */
export function normalizarTag(serial: string): string {
  const limpo = serial.trim().toLowerCase().replace(/[^0-9a-f]/g, "");
  return (limpo.match(/.{1,2}/g) ?? []).join(":");
}

export function encontrarAlunoPorTag(alunos: Aluno[], serial: string): Aluno | undefined {
  const alvo = normalizarTag(serial);
  if (!alvo) return undefined;
  return alunos.find((a) => normalizarTag(a.tag) === alvo);
}

export function jaEmbarcou(embarques: Embarque[], alunoId: string, trecho: Trecho): boolean {
  return embarques.some((e) => e.alunoId === alunoId && e.trecho === trecho);
}

/** Estudantes que confirmaram o trecho, mas não tiveram o embarque registrado. */
export function confirmadosSemEmbarque(
  alunos: Aluno[],
  confirmacoes: Record<string, Confirmacao>,
  embarques: Embarque[],
  trecho: Trecho,
): Aluno[] {
  return alunos.filter((a) => confirmacoes[a.id]?.[trecho] && !jaEmbarcou(embarques, a.id, trecho));
}

/** Estudantes que embarcaram no trecho sem ter confirmado previamente. */
export function embarcadosSemConfirmacao(
  alunos: Aluno[],
  confirmacoes: Record<string, Confirmacao>,
  embarques: Embarque[],
  trecho: Trecho,
): Aluno[] {
  return alunos.filter((a) => !confirmacoes[a.id]?.[trecho] && jaEmbarcou(embarques, a.id, trecho));
}

/** Minutos até o ônibus chegar ao ponto; 0 se já passou ou está no ponto. */
export function minutosAtePonto(posOnibus: number, posPonto: number, duracaoMin: number): number {
  const diff = posPonto - posOnibus;
  if (diff <= 0) return 0;
  return Math.max(1, Math.round(diff * duracaoMin));
}
