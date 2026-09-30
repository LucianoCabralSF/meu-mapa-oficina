import test from 'node:test';
import assert from 'node:assert/strict';
import { codificar, decodificar, linkDoRelatorio, URL_PUBLICA } from '../src/link.js';
import { montarEnvio, enviar } from '../src/envio.js';

const RESPOSTAS = {
  nome: 'Bia D\'Ávila', turma: 'Turma A',
  estilos: [
    { mais: 'EXP', menos: 'DIS' }, { mais: 'REF', menos: 'APO' }, { mais: null, menos: null },
    { mais: 'APO', menos: 'EXP' }, { mais: 'DIS', menos: 'REF' }, { mais: 'EXP', menos: 'APO' },
  ],
  emocao: 'ANS', termometro: 3, sinais: ['CORACAO', 'OMBROS'], ferramentas: ['Respirar fundo', 'Conversar'],
  frase: 1, relacoes: { casa: 'verde', amigos: 'amarelo', escola: 'vermelho' }, rede: ['FAM', 'OFI'],
};

test('ida e volta do link preserva as respostas e a data', () => {
  const volta = decodificar(codificar(RESPOSTAS, '30/09/2026'));
  assert.deepEqual(volta.respostas, RESPOSTAS);
  assert.equal(volta.data, '30/09/2026');
});

test('o link usa so caracteres seguros e aponta para depois do #', () => {
  const link = linkDoRelatorio(RESPOSTAS, '30/09/2026');
  assert.ok(link.startsWith(`${URL_PUBLICA}#r=`));
  assert.match(link.split('#r=')[1], /^[A-Za-z0-9_-]+$/);
  assert.ok(link.length < 500);
});

test('link cortado, alterado ou vazio nao vira relatorio', () => {
  const token = codificar(RESPOSTAS, '30/09/2026');
  assert.equal(decodificar(token.slice(0, -6)), null);
  assert.equal(decodificar(''), null);
  assert.equal(decodificar('abc'), null);
  const json = JSON.parse(Buffer.from(token.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
  json.m = 9;
  const alterado = Buffer.from(JSON.stringify(json)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  assert.equal(decodificar(alterado), null);
});

test('o envio leva nomes legiveis, o alerta e o link', () => {
  const corpo = montarEnvio(RESPOSTAS, '30/09/2026');
  assert.equal(corpo.nome, 'Bia D\'Ávila');
  assert.equal(corpo.emocao, 'Ansiedade ou vergonha');
  assert.deepEqual(corpo.sinais, ['Coração acelerado', 'Ombros tensos']);
  assert.deepEqual(corpo.rede, ['Alguém da família', 'Equipe desta oficina']);
  assert.equal(corpo.atencao, true, 'escola no vermelho');
  assert.match(corpo.motivoAtencao, /escola/);
  assert.ok(corpo.link.includes('#r='));
  assert.ok(corpo.estilo.length > 0);
});

test('enviar usa POST com texto simples e informa sucesso', async () => {
  let chamada = null;
  const fetchFalso = async (url, opcoes) => { chamada = { url, opcoes }; return { ok: true, json: async () => ({ ok: true }) }; };
  const r = await enviar({ a: 1 }, { url: 'https://x/exec', fetch: fetchFalso });
  assert.equal(r, true);
  assert.equal(chamada.opcoes.method, 'POST');
  assert.equal(chamada.opcoes.body, '{"a":1}');
  assert.equal(chamada.opcoes.headers, undefined, 'sem content-type para nao disparar preflight');
});

test('enviar devolve falso quando a rede falha ou o servidor recusa', async () => {
  assert.equal(await enviar({}, { url: 'u', fetch: async () => { throw new Error('rede'); } }), false);
  assert.equal(await enviar({}, { url: 'u', fetch: async () => ({ ok: true, json: async () => ({ ok: false }) }) }), false);
  assert.equal(await enviar({}, { url: 'u', fetch: async () => ({ ok: true, json: async () => { throw new Error('html'); } }) }), false);
});
