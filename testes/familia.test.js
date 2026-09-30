import test from 'node:test';
import assert from 'node:assert/strict';
import { montarRelatorioFamilia } from '../src/familia.js';
import { linkDaFamilia, decodificar } from '../src/link.js';
import { ESTILOS } from '../src/motor.js';
import { REDE } from '../src/dados.js';

const RESPOSTAS = {
  nome: 'Bia', turma: 'T',
  estilos: Array.from({ length: 6 }, () => ({ mais: 'DIS', menos: 'EXP' })),
  emocao: 'TRI', termometro: 4, sinais: ['CHORO'], ferramentas: ['Ouvir música'], frase: 3,
  relacoes: { casa: 'vermelho', amigos: 'amarelo', escola: 'verde' }, rede: ['AMI', 'PRO', 'SAU', 'COM', 'FAM'],
};

test('o relatorio da familia traz o que ajuda a conversar', () => {
  const html = montarRelatorioFamilia(RESPOSTAS, '30/09/2026');
  for (const t of ['O momento de agora', 'Como puxar conversa', 'O que costuma funcionar', 'O que costuma fechar a porta',
    'Perguntas para fazer em casa', 'Quando se preocupar', 'A frase de Bia']) {
    assert.ok(html.includes(t), `falta: ${t}`);
  }
  assert.ok(html.includes('Eu não quero contar tudo agora'));
  assert.equal((html.match(/class="pergunta"/g) ?? []).length, 3);
  assert.ok(html.includes('188'));
});

test('o relatorio da familia NUNCA mostra relacoes nem rede de apoio', () => {
  const html = montarRelatorioFamilia(RESPOSTAS, '30/09/2026');
  assert.doesNotMatch(html, /sem[aá]foro|vermelho|amarelo|verde|Minhas relações|Com quem eu conto|relação em casa/i);
  for (const r of REDE.filter((x) => x.codigo !== 'OFI' && x.codigo !== 'NSEI')) assert.ok(!html.includes(r.nome), r.nome);
  assert.doesNotMatch(html, /atenção|motivo/i);
});

test('o link da familia nao carrega relacoes nem rede', () => {
  const link = linkDaFamilia(RESPOSTAS, '30/09/2026');
  assert.match(link, /#f=[A-Za-z0-9_-]+$/);
  const volta = decodificar(link.split('#f=')[1]);
  assert.deepEqual(volta.respostas.rede, []);
  assert.deepEqual(volta.respostas.relacoes, { casa: null, amigos: null, escola: null });
  assert.equal(volta.respostas.emocao, 'TRI');
});

test('nome escapado e texto neutro para qualquer estilo', () => {
  const html = montarRelatorioFamilia({ ...RESPOSTAS, nome: '<i>x</i>' }, '30/09/2026');
  assert.ok(!html.includes('<i>x</i>'));
  for (const e of ESTILOS) {
    for (const emocao of ['RAI', 'TRI', 'ALE']) {
      for (const termometro of [0, 3, 5]) {
        const h = montarRelatorioFamilia({ ...RESPOSTAS, emocao, termometro, estilos: Array.from({ length: 6 }, () => ({ mais: e, menos: e === 'EXP' ? 'REF' : 'EXP' })) }, 'x');
        assert.doesNotMatch(h, /\b(ele|ela|dele|dela|filho|filha|sozinho|calmo|nervoso|preocupado|fechado|isolado)\b/i, `${e}/${emocao}/${termometro}`);
      }
    }
  }
});

test('termometro alto orienta a familia a agir hoje', () => {
  assert.match(montarRelatorioFamilia(RESPOSTAS, 'x'), /ainda hoje/i);
  assert.doesNotMatch(montarRelatorioFamilia({ ...RESPOSTAS, termometro: 0 }, 'x'), /ainda hoje/i);
});
