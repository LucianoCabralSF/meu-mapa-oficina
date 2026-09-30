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

test('todos enviam: nao existe mais caixinha de aceite', async () => {
  const telas = montarSequencia();
  const a = ambiente({ sessao: { posicao: telas.length - 1, respostas: { ...RESPOSTAS, aceitaEnvio: false }, enviado: false } });
  await esperar(20);
  assert.equal(a.chamadas.length, 1, 'sessao antiga sem aceite tambem envia');
  assert.ok(a.raiz.innerHTML.includes('enviadas para a equipe'));
});

test('a turma vem preenchida com o nome da oficina e nao ha caixinha de aceite', () => {
  const a = ambiente({ sessao: { posicao: 1, respostas: { ...RESPOSTAS, nome: '', turma: 'Meu Futuro Começa em Mim' }, enviado: false } });
  assert.ok(a.raiz.innerHTML.includes('value="Meu Futuro Começa em Mim"'));
  assert.ok(!a.raiz.innerHTML.includes('campo-aceite'));
});

test('sem turma no endereco, a turma padrao e a da oficina', () => {
  const a = ambiente();
  a.clicar({ acao: 'comecar' });
  assert.ok(a.raiz.innerHTML.includes('value="Meu Futuro Começa em Mim"'));
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

test('terminar e apagar tira o resultado deste celular', async () => {
  const telas = montarSequencia();
  const a = ambiente({ sessao: { posicao: telas.length - 1, respostas: { ...RESPOSTAS, aceitaEnvio: false }, enviado: false } });
  let recarregou = null;
  globalThis.location.replace = (u) => { recarregou = u; };
  await esperar(10);
  assert.ok(a.raiz.innerHTML.includes('data-acao="apagar"'));
  a.clicar({ acao: 'apagar' });
  assert.equal(a.guardado.has(CHAVE), false);
  assert.ok(recarregou !== null);
});

test('nao percebo sinais pode ser marcado mesmo com tres sinais ja marcados', () => {
  const telas = montarSequencia();
  const pos = telas.findIndex((t) => t.campo === 'sinais');
  const sinaisTela = telas[pos];
  const a = ambiente({ sessao: { posicao: pos, respostas: { ...RESPOSTAS, sinais: ['CORACAO', 'BARRIGA', 'ROSTO'] }, enviado: false } });
  const iNada = sinaisTela.opcoes.findIndex((o) => o.valor === 'NADA');
  a.clicar({ acao: 'alternar', indice: String(iNada) });
  assert.deepEqual(JSON.parse(a.guardado.get(CHAVE)).respostas.sinais, ['NADA']);
});

test('o link da familia abre so o relatorio da familia', () => {
  const a = ambiente({ hash: `#f=${codificar({ ...RESPOSTAS, relacoes: {}, rede: [] }, '30/09/2026')}` });
  assert.ok(a.raiz.innerHTML.includes('Para a família de Bia'));
  assert.ok(!a.raiz.innerHTML.includes('Minhas relações'));
  const quebrado = ambiente({ hash: '#f=xx!' });
  assert.ok(quebrado.raiz.innerHTML.includes('não abriu'));
});

test('compartilhar com a familia manda so o link da familia', async () => {
  const telas = montarSequencia();
  const a = ambiente({ sessao: { posicao: telas.length - 1, respostas: RESPOSTAS, enviado: true } });
  const abertos = [];
  globalThis.window.open = (url) => { abertos.push(url); };
  a.clicar({ acao: 'familia' });
  await esperar(10);
  assert.equal(abertos.length, 1);
  const texto = decodeURIComponent(abertos[0]);
  assert.match(texto, /^https:\/\/wa\.me\/\?text=/);
  assert.match(texto, /#f=/);
  assert.doesNotMatch(texto, /#r=/);
});
