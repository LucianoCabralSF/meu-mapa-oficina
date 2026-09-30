import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ESTILOS, NOMES_ESTILO, pontuarEstilos, sugerirFerramentas, avaliarAtencao, calcularResultado,
} from '../src/motor.js';
import { SITUACOES, FERRAMENTAS, EMOCOES, SINAIS, REDE } from '../src/dados.js';

test('estilos na ordem canonica e com nome', () => {
  assert.deepEqual(ESTILOS, ['EXP', 'REF', 'DIS', 'APO']);
  assert.deepEqual(Object.keys(NOMES_ESTILO).sort(), [...ESTILOS].sort());
});

test('estilo mais escolhido e o principal, o segundo e o de apoio', () => {
  const r = pontuarEstilos([
    { mais: 'REF', menos: 'EXP' }, { mais: 'REF', menos: 'DIS' }, { mais: 'APO', menos: 'EXP' },
    { mais: 'REF', menos: 'DIS' }, { mais: 'APO', menos: 'EXP' }, { mais: 'REF', menos: 'DIS' },
  ]);
  assert.equal(r.principal, 'REF');
  assert.equal(r.apoio, 'APO');
  assert.equal(r.pct.REF, 83);
});

test('sem respostas o desempate segue a ordem canonica', () => {
  const r = pontuarEstilos([]);
  assert.equal(r.principal, 'EXP');
  assert.equal(r.apoio, 'REF');
});

test('sugestoes nunca repetem o que a pessoa ja usa e sao sempre duas', () => {
  for (const emocao of EMOCOES.map((e) => e.codigo)) {
    const usa = FERRAMENTAS.slice(0, 3);
    const s = sugerirFerramentas(emocao, usa);
    assert.equal(s.length, 2, emocao);
    assert.ok(s.every((f) => !usa.includes(f)), emocao);
  }
  const todas = sugerirFerramentas('TRI', FERRAMENTAS);
  assert.equal(todas.length, 0, 'quem ja usa todas nao recebe sugestao inventada');
});

test('atencao: termometro alto, relacao no vermelho ou sem rede com termometro medio', () => {
  const base = { termometro: 1, relacoes: { casa: 'verde', amigos: 'verde', escola: 'verde' }, rede: ['FAM'] };
  assert.equal(avaliarAtencao(base).atencao, false);
  assert.equal(avaliarAtencao({ ...base, termometro: 4 }).atencao, true);
  assert.equal(avaliarAtencao({ ...base, relacoes: { ...base.relacoes, casa: 'vermelho' } }).atencao, true);
  assert.match(avaliarAtencao({ ...base, relacoes: { ...base.relacoes, casa: 'vermelho' } }).motivo, /casa/);
  assert.equal(avaliarAtencao({ ...base, termometro: 3, rede: [] }).atencao, true);
  assert.equal(avaliarAtencao({ ...base, termometro: 3, rede: ['NSEI'] }).atencao, true);
  assert.equal(avaliarAtencao({ ...base, termometro: 3 }).atencao, false);
});

test('resultado completo junta tudo', () => {
  const r = calcularResultado({
    nome: 'Bia', turma: 'A',
    estilos: Array.from({ length: 6 }, () => ({ mais: 'APO', menos: 'DIS' })),
    emocao: 'ANS', termometro: 2, sinais: ['CORACAO'], ferramentas: ['Respirar'], frase: 0,
    relacoes: { casa: 'verde', amigos: 'amarelo', escola: 'verde' }, rede: ['FAM', 'AMI'],
  });
  assert.equal(r.estilos.principal, 'APO');
  assert.equal(r.sugestoes.length, 2);
  assert.equal(r.atencao.atencao, false);
});

test('dados basicos existem', () => {
  assert.equal(SITUACOES.length, 6);
  for (const s of SITUACOES) assert.deepEqual(s.opcoes.map((o) => o.estilo), ESTILOS);
  assert.ok(SINAIS.length >= 6 && REDE.length >= 6 && FERRAMENTAS.length >= 10 && EMOCOES.length === 6);
});
