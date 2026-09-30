import test from 'node:test';
import assert from 'node:assert/strict';
import { familiaDaEmocao, leituraCruzada, desafioDaSemana, faixaTermometro } from '../src/leitura.js';
import { ESTILOS } from '../src/motor.js';
import { EMOCOES } from '../src/dados.js';

const BASE = {
  nome: 'Bia', turma: 'T', estilos: Array.from({ length: 6 }, () => ({ mais: 'DIS', menos: 'EXP' })),
  emocao: 'TRI', termometro: 3, sinais: ['CHORO'], ferramentas: ['Ouvir música'], frase: 1,
  relacoes: { casa: 'verde', amigos: 'amarelo', escola: 'verde' }, rede: ['AMI'],
};

test('toda emocao pertence a uma familia', () => {
  for (const e of EMOCOES) assert.ok(['intensa', 'baixa', 'leve'].includes(familiaDaEmocao(e.codigo)), e.codigo);
});

test('faixas do termometro', () => {
  assert.equal(faixaTermometro(0), 'leve');
  assert.equal(faixaTermometro(2), 'media');
  assert.equal(faixaTermometro(3), 'media');
  assert.equal(faixaTermometro(5), 'alta');
});

test('a leitura cruza as respostas e nao so repete o que foi marcado', () => {
  const l = leituraCruzada(BASE);
  assert.ok(l.length >= 3 && l.length <= 4);
  const texto = l.map((i) => i.texto).join(' ');
  assert.match(texto, /tristeza/i, 'fala da emocao junto com o jeito de reagir');
  assert.match(texto, /vontade de chorar/i, 'usa o sinal do corpo como alarme');
  assert.match(texto, /amizades/i, 'fala da relacao no amarelo');
  for (const i of l) assert.ok(i.titulo && i.texto.length > 60);
});

test('toda combinacao de estilo e familia tem leitura propria', () => {
  const vistos = new Set();
  for (const estilo of ESTILOS) {
    for (const emocao of ['RAI', 'TRI', 'CAL']) {
      const r = { ...BASE, estilos: Array.from({ length: 6 }, () => ({ mais: estilo, menos: estilo === 'EXP' ? 'REF' : 'EXP' })), emocao };
      const primeira = leituraCruzada(r)[0].texto;
      assert.ok(!vistos.has(primeira), `repetida: ${estilo}/${emocao}`);
      vistos.add(primeira);
    }
  }
});

test('sem sinais no corpo a leitura orienta a observar', () => {
  const l = leituraCruzada({ ...BASE, sinais: ['NADA'] });
  assert.match(l.map((i) => i.texto).join(' '), /observ/i);
});

test('rede e termometro: fase pesada com pouca rede aponta a equipe', () => {
  const l = leituraCruzada({ ...BASE, termometro: 4, rede: ['NSEI'] });
  assert.match(l.map((i) => i.texto).join(' '), /equipe/i);
});

test('desafio da semana usa o alarme do corpo e uma ferramenta', () => {
  const d = desafioDaSemana(BASE);
  assert.match(d, /vontade de chorar/i);
  assert.ok(d.length > 60);
});

test('textos da leitura sem masculino sobre quem responde', () => {
  const proibidos = /\b(sozinho|calmo|tranquilo|nervoso|preocupado|cansado|chateado|animado|obrigado|isolado|fechado)\b/i;
  for (const estilo of ESTILOS) {
    for (const emocao of ['RAI', 'TRI', 'CAL', 'ANS', 'MED', 'ALE']) {
      const r = { ...BASE, estilos: Array.from({ length: 6 }, () => ({ mais: estilo, menos: estilo === 'EXP' ? 'REF' : 'EXP' })), emocao };
      const t = leituraCruzada(r).map((i) => i.texto).join(' ') + desafioDaSemana(r);
      assert.doesNotMatch(t, proibidos, `${estilo}/${emocao}`);
    }
  }
});
