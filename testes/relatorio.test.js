import test from 'node:test';
import assert from 'node:assert/strict';
import { montarRelatorio, escaparHtml } from '../src/relatorio.js';
import * as TEXTOS from '../src/textos.js';
import { ESTILOS } from '../src/motor.js';

const RESPOSTAS = {
  nome: 'Bia', turma: 'Turma A',
  estilos: Array.from({ length: 6 }, () => ({ mais: 'REF', menos: 'DIS' })),
  emocao: 'TRI', termometro: 2, sinais: ['CHORO'], ferramentas: ['Ouvir música'], frase: 1,
  relacoes: { casa: 'verde', amigos: 'amarelo', escola: 'verde' }, rede: ['FAM'],
};

test('o relatorio traz todas as partes da oficina', () => {
  const html = montarRelatorio(RESPOSTAS, '30/09/2026');
  for (const titulo of ['Meu jeito de reagir', 'O que eu sinto', 'Meu termômetro', 'Onde meu corpo avisa',
    'Minha caixa de ferramentas', 'Como pedir ajuda', 'Minhas relações', 'Com quem eu conto']) {
    assert.ok(html.includes(titulo), `falta: ${titulo}`);
  }
  assert.ok(html.includes('Pensar antes'));
  assert.ok(html.includes('30/09/2026'));
});

test('o nome aparece escapado', () => {
  const html = montarRelatorio({ ...RESPOSTAS, nome: '<b>Ana</b>' }, '30/09/2026');
  assert.ok(!html.includes('<b>Ana</b>'));
  assert.ok(html.includes('&lt;b&gt;Ana&lt;/b&gt;'));
  assert.equal(escaparHtml('"\'&'), '&quot;&#39;&amp;');
});

test('o quadro de apoio sempre existe e fica em destaque quando ha sinal de atencao', () => {
  const calmo = montarRelatorio(RESPOSTAS, '30/09/2026');
  assert.ok(calmo.includes('188'));
  assert.ok(!calmo.includes('apoio-urgente'));
  const alerta = montarRelatorio({ ...RESPOSTAS, relacoes: { ...RESPOSTAS.relacoes, casa: 'vermelho' } }, '30/09/2026');
  assert.ok(alerta.includes('apoio-urgente'));
  assert.ok(alerta.includes('Disque 100'));
});

test('a visao da equipe mostra a faixa e esconde o envio', () => {
  const html = montarRelatorio(RESPOSTAS, '30/09/2026', { visaoEquipe: true });
  assert.ok(html.includes('Visão da equipe'));
  assert.ok(!html.includes('data-acao="reenviar"'));
});

test('o estado do envio aparece para quem respondeu', () => {
  assert.match(montarRelatorio(RESPOSTAS, 'x', { envio: 'enviado' }), /enviadas para a equipe/);
  assert.match(montarRelatorio(RESPOSTAS, 'x', { envio: 'falhou' }), /data-acao="reenviar"/);
  assert.match(montarRelatorio(RESPOSTAS, 'x', { envio: 'nao-autorizado' }), /não foram enviadas/);
});

test('cada estilo tem os quatro textos', () => {
  for (const e of ESTILOS) {
    const t = TEXTOS.ESTILO_TEXTO[e];
    assert.ok(t.retrato && t.forca && t.cuidado && t.dica, e);
  }
});

test('textos sem masculino sobre quem responde', () => {
  const proibidos = /\b(sozinho|calmo|tranquilo|nervoso|preocupado|cansado|chateado|animado|obrigado|convidado)\b/i;
  const todos = JSON.stringify(TEXTOS);
  assert.doesNotMatch(todos, proibidos);
});

test('quadro de apoio com emergencia e sem falar em estar sem saida', () => {
  const html = montarRelatorio(RESPOSTAS, 'x');
  assert.ok(html.includes('190') && html.includes('192'));
  assert.ok(!/sem saída/.test(html));
});
