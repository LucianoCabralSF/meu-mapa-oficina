import test from 'node:test';
import assert from 'node:assert/strict';
import { montarSequencia, criarApp, CHAVE } from '../src/telas.js';
import { codificar } from '../src/link.js';

const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms));

function ambiente({ hash = '', search = '', sessao = null, fetch } = {}) {
  const guardado = new Map();
  if (sessao) guardado.set(CHAVE, JSON.stringify(sessao));
  globalThis.sessionStorage = {
    getItem: (k) => (guardado.has(k) ? guardado.get(k) : null),
    setItem: (k, v) => { guardado.set(k, String(v)); },
    removeItem: (k) => { guardado.delete(k); },
  };
  globalThis.window = { scrollTo() {}, print() {} };
  globalThis.location = { hash, search, pathname: '/meu-mapa-oficina/' };
  const chamadas = [];
  globalThis.fetch = fetch ?? (async (url, op) => { chamadas.push(op); return { ok: true, json: async () => ({ ok: true }) }; });
  let aoClicar = null;
  const campos = {};
  const raiz = {
    innerHTML: '',
    addEventListener: (_, fn) => { aoClicar = fn; },
    querySelector: (sel) => campos[sel] ?? null,
    querySelectorAll: () => [],
  };
  const app = criarApp(raiz);
  app.iniciar();
  const clicar = (dataset) => aoClicar({ target: { closest: () => ({ dataset }) } });
  return { raiz, clicar, chamadas, guardado, campos };
}

const RESPOSTAS = {
  nome: 'Bia', turma: 'A', aceitaEnvio: true,
  estilos: Array.from({ length: 6 }, () => ({ mais: 'APO', menos: 'EXP' })),
  emocao: 'CAL', termometro: 1, sinais: ['NADA'], ferramentas: ['Conversar'], frase: 0,
  relacoes: { casa: 'verde', amigos: 'verde', escola: 'verde' }, rede: ['FAM'],
};

test('a sequencia tem as quatro etapas da oficina', () => {
  const telas = montarSequencia();
  const tipos = telas.map((t) => t.tipo);
  assert.equal(tipos.filter((t) => t === 'forcada').length, 6);
  assert.equal(tipos.filter((t) => t === 'respiro').length, 4);
  assert.ok(tipos.includes('semaforo'));
  assert.equal(tipos.at(-1), 'relatorio');
});

test('a turma do link projetado ja vem preenchida', () => {
  const { raiz } = ambiente({ search: '?turma=Turma%20B' });
  const { clicar } = { clicar: null };
  assert.ok(raiz.innerHTML.includes('data-acao="comecar"'));
  void clicar;
});

test('quem aceita envia uma unica vez, mesmo recarregando o relatorio', async () => {
  const telas = montarSequencia();
  const sessao = { posicao: telas.length - 1, respostas: RESPOSTAS, enviado: false };
  const a = ambiente({ sessao });
  await esperar(20);
  assert.equal(a.chamadas.length, 1);
  assert.ok(a.raiz.innerHTML.includes('enviadas para a equipe'));
  const salvo = JSON.parse(a.guardado.get(CHAVE));
  assert.equal(salvo.enviado, true);
  const b = ambiente({ sessao: salvo });
  await esperar(20);
  assert.equal(b.chamadas.length, 0, 'recarregar nao duplica a linha na planilha');
});

test('quem nao aceita nao envia nada', async () => {
  const telas = montarSequencia();
  const a = ambiente({ sessao: { posicao: telas.length - 1, respostas: { ...RESPOSTAS, aceitaEnvio: false }, enviado: false } });
  await esperar(20);
  assert.equal(a.chamadas.length, 0);
  assert.ok(a.raiz.innerHTML.includes('não foram enviadas'));
});

test('falha no envio mostra tentar de novo, e o botao reenvia', async () => {
  let vez = 0;
  const telas = montarSequencia();
  const a = ambiente({
    sessao: { posicao: telas.length - 1, respostas: RESPOSTAS, enviado: false },
    fetch: async () => { vez += 1; if (vez === 1) throw new Error('rede'); return { ok: true, json: async () => ({ ok: true }) }; },
  });
  await esperar(20);
  assert.ok(a.raiz.innerHTML.includes('data-acao="reenviar"'));
  a.clicar({ acao: 'reenviar' });
  await esperar(20);
  assert.ok(a.raiz.innerHTML.includes('enviadas para a equipe'));
});

test('link da planilha abre a visao da equipe sem enviar nada', async () => {
  const token = codificar(RESPOSTAS, '30/09/2026');
  const a = ambiente({ hash: `#r=${token}` });
  await esperar(20);
  assert.ok(a.raiz.innerHTML.includes('Visão da equipe'));
  assert.equal(a.chamadas.length, 0);
});

test('link quebrado mostra aviso', () => {
  const a = ambiente({ hash: '#r=quebrado' });
  assert.match(a.raiz.innerHTML, /não abriu/);
});

test('sessao com formato estranho recomeca do inicio', () => {
  const a = ambiente({ sessao: { posicao: 999, respostas: 'lixo' } });
  assert.ok(a.raiz.innerHTML.includes('data-acao="comecar"'));
});
