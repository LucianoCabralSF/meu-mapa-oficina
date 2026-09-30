import { FERRAMENTAS_POR_EMOCAO, FERRAMENTAS, AREAS_RELACAO } from './dados.js';

export const ESTILOS = ['EXP', 'REF', 'DIS', 'APO'];

export const NOMES_ESTILO = {
  EXP: 'Falar na hora',
  REF: 'Pensar antes',
  DIS: 'Dar um tempo',
  APO: 'Buscar apoio',
};

// Escolha forcada: "mais" soma 1, "menos" tira 1. Empate: ordem canonica.
export function pontuarEstilos(respostas) {
  const brutos = Object.fromEntries(ESTILOS.map((e) => [e, 0]));
  for (const r of respostas) {
    if (ESTILOS.includes(r?.mais)) brutos[r.mais] += 1;
    if (ESTILOS.includes(r?.menos)) brutos[r.menos] -= 1;
  }
  const n = respostas.length;
  const pct = Object.fromEntries(ESTILOS.map((e) => [e, n ? Math.round(((brutos[e] + n) / (2 * n)) * 100) : 50]));
  const ordem = [...ESTILOS].sort((a, b) => (brutos[b] - brutos[a]) || (ESTILOS.indexOf(a) - ESTILOS.indexOf(b)));
  return { brutos, pct, principal: ordem[0], apoio: ordem[1] };
}

// Duas ferramentas indicadas para a emocao, que a pessoa ainda nao usa.
// Completa com a lista geral; nunca inventa quando ja usa todas.
export function sugerirFerramentas(emocao, usa) {
  const ja = new Set(usa);
  const candidatas = [...(FERRAMENTAS_POR_EMOCAO[emocao] ?? []), ...FERRAMENTAS];
  const sugestoes = [];
  for (const f of candidatas) {
    if (!ja.has(f) && !sugestoes.includes(f)) sugestoes.push(f);
    if (sugestoes.length === 2) break;
  }
  return sugestoes;
}

// Sinais que pedem cuidado da equipe: termometro 4 ou 5, alguma relacao no
// vermelho, ou termometro 3 sem ninguem na rede de apoio.
export function avaliarAtencao({ termometro, relacoes, rede }) {
  const motivos = [];
  if (termometro >= 4) motivos.push(`termômetro ${termometro}`);
  for (const area of AREAS_RELACAO) {
    if (relacoes?.[area.codigo] === 'vermelho') motivos.push(`vermelho ${area.nome.toLowerCase()}`);
  }
  const semRede = !rede?.length || (rede.length === 1 && rede[0] === 'NSEI');
  if (termometro === 3 && semRede) motivos.push('termômetro 3 sem rede de apoio');
  return { atencao: motivos.length > 0, motivo: motivos.join('; ') };
}

export function calcularResultado(r) {
  return {
    nome: r.nome,
    turma: r.turma ?? '',
    estilos: pontuarEstilos(r.estilos ?? []),
    emocao: r.emocao,
    termometro: r.termometro,
    sinais: r.sinais ?? [],
    ferramentas: r.ferramentas ?? [],
    sugestoes: sugerirFerramentas(r.emocao, r.ferramentas ?? []),
    frase: r.frase,
    relacoes: r.relacoes ?? {},
    rede: r.rede ?? [],
    atencao: avaliarAtencao(r),
  };
}
