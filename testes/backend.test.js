import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function carregarBackend() {
  const linhas = [];
  const contexto = {
    linhas,
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({ getSheetByName: () => ({ appendRow: (l) => linhas.push(l) }) }),
    },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (t) => ({ texto: t, setMimeType() { return this; } }),
    },
    Utilities: { formatDate: () => '30/09/2026 19:00' },
    Session: { getScriptTimeZone: () => 'America/Manaus' },
  };
  vm.createContext(contexto);
  vm.runInContext(readFileSync(new URL('../apps-script/backend.js', import.meta.url), 'utf8'), contexto);
  return contexto;
}

const RESPOSTA = {
  nome: 'Bia', turma: 'Turma A', estilo: 'Busco apoio', emocao: 'Ansiedade', termometro: 2,
  sinais: ['Coração acelerado'], ferramentas: ['Respirar'], relacoes: { casa: 'verde', amigos: 'amarelo', escola: 'verde' },
  rede: ['Família'], frase: 'Você pode me ouvir sem me julgar por alguns minutos?', atencao: false,
  link: 'https://lucianocabralsf.github.io/meu-mapa-oficina/#r=abc',
};

const enviar = (b, corpo) => JSON.parse(b.doPost({ postData: { contents: JSON.stringify(corpo) } }).texto);

test('uma resposta valida vira uma linha na planilha', () => {
  const b = carregarBackend();
  assert.deepEqual(enviar(b, RESPOSTA), { ok: true });
  assert.equal(b.linhas.length, 1);
  const l = b.linhas[0];
  assert.equal(l.length, 15);
  assert.equal(l[1], 'Bia');
  assert.equal(l[5], 2);
  assert.equal(l[9], 'AMARELO');
  assert.equal(l[13], 'não');
});

test('atencao vira SIM com o motivo', () => {
  const b = carregarBackend();
  enviar(b, { ...RESPOSTA, atencao: true, termometro: 5, relacoes: { casa: 'vermelho', amigos: 'verde', escola: 'verde' } });
  assert.match(b.linhas[0][13], /^SIM/);
});

test('texto que comeca com sinal de formula nao vira formula', () => {
  const b = carregarBackend();
  enviar(b, { ...RESPOSTA, nome: '=IMPORTXML("http://x")', turma: '+1', frase: '@a' });
  assert.equal(b.linhas[0][1].startsWith("'"), true);
  assert.equal(b.linhas[0][2].startsWith("'"), true);
});

test('corpo invalido nao grava nada', () => {
  const b = carregarBackend();
  const r = JSON.parse(b.doPost({ postData: { contents: 'isso nao e json' } }).texto);
  assert.equal(r.ok, false);
  assert.equal(enviar(b, { ...RESPOSTA, nome: '' }).ok, false);
  assert.equal(enviar(b, { ...RESPOSTA, termometro: 9 }).ok, false);
  assert.equal(b.linhas.length, 0);
});

test('textos longos sao cortados', () => {
  const b = carregarBackend();
  enviar(b, { ...RESPOSTA, frase: 'x'.repeat(5000) });
  assert.ok(b.linhas[0][12].length <= 300);
});

test('a leitura publica nao devolve respostas', () => {
  const b = carregarBackend();
  enviar(b, RESPOSTA);
  const r = JSON.parse(b.doGet({ parameter: {} }).texto);
  assert.deepEqual(Object.keys(r).sort(), ['ok', 'servico']);
});

test('link real longo chega inteiro na planilha', () => {
  const b = carregarBackend();
  const link = `https://lucianocabralsf.github.io/meu-mapa-oficina/#r=${'A'.repeat(420)}`;
  enviar(b, { ...RESPOSTA, link });
  assert.equal(b.linhas[0][14], link);
});

test('link que nao e do Meu Mapa nao entra na planilha', () => {
  const b = carregarBackend();
  enviar(b, { ...RESPOSTA, link: 'https://golpe.example/#r=abc' });
  assert.equal(b.linhas[0][14], '');
});

test('turma com barra ou traco nao vira data', () => {
  const b = carregarBackend();
  enviar(b, { ...RESPOSTA, turma: '8/1' });
  assert.equal(b.linhas[0][2], "'8/1");
});

test('o backend marca atencao mesmo se o celular disser que nao', () => {
  const b = carregarBackend();
  enviar(b, { ...RESPOSTA, atencao: false, relacoes: { casa: 'vermelho', amigos: 'verde', escola: 'verde' } });
  assert.match(b.linhas[0][13], /^SIM/);
  const c = carregarBackend();
  enviar(c, { ...RESPOSTA, atencao: false, termometro: 4 });
  assert.match(c.linhas[0][13], /^SIM/);
});
