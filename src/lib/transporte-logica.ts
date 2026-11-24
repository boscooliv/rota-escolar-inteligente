// Regras puras do sistema (sem interface), cobertas por testes em src/test/.
import type { Confirmacao, Embarque, PontoParada, Sentido, StatusViagem, TagNFC, Trajeto } from "./transporte-dados";

export type Situacao = "confirmado" | "embarcou" | "nao_embarcou";

/** Normaliza o número de série lido de uma tag NFC (ex.: "04:A2:3F" → "04:a2:3f"). */
export function normalizarTag(serial: string): string {
  const limpo = serial.trim().toLowerCase().replace(/[^0-9a-f]/g, "");
  return (limpo.match(/.{1,2}/g) ?? []).join(":");
}

export function encontrarTag(tags: TagNFC[], serial: string): TagNFC | undefined {
  const alvo = normalizarTag(serial);
  if (!alvo) return undefined;
  return tags.find((t) => t.ativa && normalizarTag(t.codigo) === alvo);
}

/** Quanto do trajeto (0 a 1) o ônibus percorre até chegar ao ponto, conforme o sentido. */
export function progressoDoPonto(ponto: Pick<PontoParada, "posicao">, sentido: Sentido): number {
  return sentido === "ida" ? ponto.posicao : 1 - ponto.posicao;
}

/** Minutos até o ônibus chegar ao ponto; 0 se já passou ou está no ponto. */
export function minutosAtePonto(progressoOnibus: number, progressoPonto: number, duracaoMin: number): number {
  const diff = progressoPonto - progressoOnibus;
  if (diff <= 0) return 0;
  return Math.max(1, Math.round(diff * duracaoMin));
}

/**
 * Situação de um aluno confirmado:
 * - "embarcou" quando há embarque registrado;
 * - "nao_embarcou" quando a viagem terminou, ou o ônibus já passou do ponto dele, sem embarque;
 * - "confirmado" nos demais casos.
 */
export function situacaoPassageiro(
  embarcou: boolean,
  status: StatusViagem,
  progressoOnibus: number,
  progressoPontoEmbarque: number,
): Situacao {
  if (embarcou) return "embarcou";
  if (status === "concluida") return "nao_embarcou";
  if (status === "em_andamento" && progressoOnibus > progressoPontoEmbarque + 0.02) return "nao_embarcou";
  return "confirmado";
}

export function confirmadosSemEmbarque(confirmacoes: Confirmacao[], embarques: Embarque[], viagemId: string): Confirmacao[] {
  return confirmacoes.filter(
    (c) => c.viagemId === viagemId && !embarques.some((e) => e.viagemId === viagemId && e.alunoId === c.alunoId),
  );
}

export function sentidosDoTrajeto(trajeto: Trajeto): Sentido[] {
  return trajeto === "ambos" ? ["ida", "volta"] : [trajeto];
}

export type FormConfirmacao = { data: string; trajeto: Trajeto | ""; embarqueId: string; desembarqueId: string };
export type ErrosConfirmacao = Partial<Record<keyof FormConfirmacao, string>>;

export function validarConfirmacao(f: FormConfirmacao, datasDisponiveis: string[]): ErrosConfirmacao {
  const erros: ErrosConfirmacao = {};
  if (!f.data) erros.data = "Escolha a data da viagem.";
  else if (!datasDisponiveis.includes(f.data)) erros.data = "Não há viagem aberta para essa data.";
  if (!f.trajeto) erros.trajeto = "Escolha o trajeto.";
  if (!f.embarqueId) erros.embarqueId = "Escolha o ponto de embarque.";
  if (!f.desembarqueId) erros.desembarqueId = "Escolha o ponto de desembarque.";
  if (f.embarqueId && f.desembarqueId && f.embarqueId === f.desembarqueId)
    erros.desembarqueId = "O desembarque precisa ser diferente do embarque.";
  return erros;
}

export function validarLogin(email: string, senha: string): { email?: string; senha?: string } {
  const erros: { email?: string; senha?: string } = {};
  if (!email.trim()) erros.email = "Informe seu e-mail.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) erros.email = "E-mail inválido.";
  if (!senha) erros.senha = "Informe sua senha.";
  else if (senha.length < 4) erros.senha = "A senha precisa ter pelo menos 4 caracteres.";
  return erros;
}

export type ResultadoLeitura =
  | { tipo: "nao_encontrada" }
  | { tipo: "bloqueada"; alunoId: string }
  | { tipo: "ja_embarcou"; alunoId: string }
  | { tipo: "sem_confirmacao"; alunoId: string; tagId: string }
  | { tipo: "ok"; alunoId: string; tagId: string };

/** Avalia o código lido/digitado na tela de Embarque, antes de registrar. */
export function avaliarLeitura(
  tags: TagNFC[],
  confirmacoes: Confirmacao[],
  embarques: Embarque[],
  viagemId: string,
  codigo: string,
): ResultadoLeitura {
  const alvo = normalizarTag(codigo);
  const tag = alvo ? tags.find((t) => normalizarTag(t.codigo) === alvo) : undefined;
  if (!tag) return { tipo: "nao_encontrada" };
  if (!tag.ativa) return { tipo: "bloqueada", alunoId: tag.alunoId };
  if (embarques.some((e) => e.viagemId === viagemId && e.alunoId === tag.alunoId)) return { tipo: "ja_embarcou", alunoId: tag.alunoId };
  if (!confirmacoes.some((c) => c.viagemId === viagemId && c.alunoId === tag.alunoId))
    return { tipo: "sem_confirmacao", alunoId: tag.alunoId, tagId: tag.id };
  return { tipo: "ok", alunoId: tag.alunoId, tagId: tag.id };
}

/** Viagem do dia mais próxima do horário atual. */
export function viagemMaisProxima<T extends { horarioSaida: string }>(viagens: T[], agora: Date): T | undefined {
  const min = agora.getHours() * 60 + agora.getMinutes();
  const dist = (v: T) => {
    const [h, m] = v.horarioSaida.split(":").map(Number);
    return Math.abs(h! * 60 + m! - min);
  };
  return [...viagens].sort((a, b) => dist(a) - dist(b))[0];
}
