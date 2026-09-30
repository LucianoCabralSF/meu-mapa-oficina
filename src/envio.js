// Envio das respostas para a planilha da equipe (Apps Script).
// So acontece quando a pessoa marca que aceita enviar.
import { calcularResultado, NOMES_ESTILO } from './motor.js';
import { EMOCOES, SINAIS, REDE, FRASES_AJUDA } from './dados.js';
import { linkDoRelatorio } from './link.js';

export const URL_ENVIO = 'https://script.google.com/macros/s/AKfycbzFu0CKF_j9nSO2wBepIQVU6piEI6ETp8-AkCokk9FU3zSd13qURMGTYg3T444SY7pU/exec';

const nomeDe = (lista, codigo) => lista.find((x) => x.codigo === codigo)?.nome ?? '';

export function montarEnvio(respostas, data) {
  const r = calcularResultado(respostas);
  return {
    nome: respostas.nome,
    turma: respostas.turma,
    estilo: `${NOMES_ESTILO[r.estilos.principal]} (apoio: ${NOMES_ESTILO[r.estilos.apoio]})`,
    emocao: nomeDe(EMOCOES, respostas.emocao),
    termometro: respostas.termometro,
    sinais: respostas.sinais.map((s) => nomeDe(SINAIS, s)),
    ferramentas: respostas.ferramentas,
    relacoes: respostas.relacoes,
    rede: respostas.rede.map((s) => nomeDe(REDE, s)),
    frase: FRASES_AJUDA[respostas.frase] ?? '',
    atencao: r.atencao.atencao,
    motivoAtencao: r.atencao.motivo,
    link: linkDoRelatorio(respostas, data),
  };
}

// POST com texto simples (sem Content-Type) para o Apps Script nao exigir
// a consulta previa de CORS, que ele nao responde.
export async function enviar(corpo, { url = URL_ENVIO, fetch: buscar = globalThis.fetch } = {}) {
  try {
    const resposta = await buscar(url, { method: 'POST', body: JSON.stringify(corpo) });
    const dados = await resposta.json();
    return dados?.ok === true;
  } catch {
    return false;
  }
}
