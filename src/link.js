// Link do relatorio: as respostas vao compactadas depois do "#".
// A equipe abre esse link (guardado na planilha) e ve o relatorio completo.
import { EMOCOES, SINAIS, FERRAMENTAS, FRASES_AJUDA, REDE } from './dados.js';

export const URL_PUBLICA = 'https://lucianocabralsf.github.io/meu-mapa-oficina/';

const COR = { verde: 'v', amarelo: 'a', vermelho: 'r' };
const DE_COR = { v: 'verde', a: 'amarelo', r: 'vermelho' };
const LETRA_ESTILO = { EXP: 'X', REF: 'R', DIS: 'D', APO: 'A' };
const DE_ESTILO = { X: 'EXP', R: 'REF', D: 'DIS', A: 'APO' };

function paraBase64Url(texto) {
  let binario = '';
  for (const b of new TextEncoder().encode(texto)) binario += String.fromCharCode(b);
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function deBase64Url(token) {
  const binario = atob(token.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(binario, (c) => c.charCodeAt(0)));
}

const letra = (codigo) => (codigo === null ? '-' : LETRA_ESTILO[codigo]);

export function codificar(r, data) {
  return paraBase64Url(JSON.stringify({
    v: 1,
    d: data,
    n: r.nome,
    t: r.turma,
    s: r.estilos.map((e) => letra(e.mais) + letra(e.menos)).join(''),
    e: r.emocao,
    m: r.termometro,
    g: r.sinais,
    f: r.ferramentas.map((f) => FERRAMENTAS.indexOf(f)),
    q: r.frase,
    c: ['casa', 'amigos', 'escola'].map((k) => COR[r.relacoes[k]] ?? '-').join(''),
    w: r.rede,
  }));
}

const dentro = (lista, validos) => Array.isArray(lista) && lista.every((x) => validos.includes(x));

export function decodificar(token) {
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]+$/.test(token)) return null;
  let c;
  try {
    c = JSON.parse(deBase64Url(token));
  } catch {
    return null;
  }
  if (!c || c.v !== 1 || typeof c.d !== 'string' || !/^\d{2}\/\d{2}\/\d{4}$/.test(c.d)) return null;
  if (typeof c.n !== 'string' || !c.n.trim() || c.n.length > 40 || typeof c.t !== 'string' || c.t.length > 40) return null;
  if (typeof c.s !== 'string' || c.s.length !== 12 || /[^XRDA-]/.test(c.s)) return null;
  if (!EMOCOES.some((e) => e.codigo === c.e)) return null;
  if (!Number.isInteger(c.m) || c.m < 0 || c.m > 5) return null;
  if (!dentro(c.g, SINAIS.map((s) => s.codigo)) || !dentro(c.w, REDE.map((s) => s.codigo))) return null;
  if (!dentro(c.f, FERRAMENTAS.map((_, i) => i))) return null;
  if (!Number.isInteger(c.q) || c.q < 0 || c.q >= FRASES_AJUDA.length) return null;
  if (typeof c.c !== 'string' || !/^[var-]{3}$/.test(c.c)) return null;

  const estilos = [];
  for (let i = 0; i < 12; i += 2) {
    const de = (x) => (x === '-' ? null : DE_ESTILO[x]);
    estilos.push({ mais: de(c.s[i]), menos: de(c.s[i + 1]) });
  }
  const [casa, amigos, escola] = [...c.c].map((x) => DE_COR[x] ?? null);
  return {
    data: c.d,
    respostas: {
      nome: c.n,
      turma: c.t,
      estilos,
      emocao: c.e,
      termometro: c.m,
      sinais: c.g,
      ferramentas: c.f.map((i) => FERRAMENTAS[i]),
      frase: c.q,
      relacoes: { casa, amigos, escola },
      rede: c.w,
    },
  };
}

export function linkDoRelatorio(r, data) {
  return `${URL_PUBLICA}#r=${codificar(r, data)}`;
}

// Link que o adolescente manda para a familia: relacoes e rede ficam de fora
// do proprio link, entao nem viajam no endereco.
export function linkDaFamilia(r, data) {
  return `${URL_PUBLICA}#f=${codificar({ ...r, relacoes: {}, rede: [] }, data)}`;
}
