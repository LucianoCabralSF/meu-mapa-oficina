// Meu Mapa - recebedor de respostas da oficina.
// So GRAVA. Nao existe nenhuma rota que devolva respostas: quem quiser ler
// precisa abrir a planilha, que pertence a equipe da oficina.

var ABA = 'Respostas';
var LIMITE_TEXTO = 300;
var CORES = { verde: 'VERDE', amarelo: 'AMARELO', vermelho: 'VERMELHO' };

function responder(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON);
}

// Texto seguro para a planilha: cortado e sem virar formula.
function texto(valor) {
  var t = String(valor == null ? '' : valor).replace(/\s+/g, ' ').trim().slice(0, LIMITE_TEXTO);
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

function lista(valor) {
  if (!Array.isArray(valor)) return '';
  return texto(valor.slice(0, 12).map(function (v) { return String(v); }).join(', '));
}

function cor(valor) {
  return CORES[valor] || '';
}

function doPost(e) {
  var dados;
  try {
    dados = JSON.parse(e && e.postData ? e.postData.contents : '');
  } catch (erro) {
    return responder({ ok: false, erro: 'formato' });
  }
  if (!dados || typeof dados !== 'object') return responder({ ok: false, erro: 'formato' });
  var nome = texto(dados.nome);
  var termometro = Number(dados.termometro);
  if (!nome) return responder({ ok: false, erro: 'nome' });
  if (!(termometro >= 0 && termometro <= 5 && Math.floor(termometro) === termometro)) {
    return responder({ ok: false, erro: 'termometro' });
  }
  var relacoes = dados.relacoes || {};
  var linha = [
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'),
    nome,
    texto(dados.turma),
    texto(dados.estilo),
    texto(dados.emocao),
    termometro,
    lista(dados.sinais),
    lista(dados.ferramentas),
    cor(relacoes.casa),
    cor(relacoes.amigos),
    cor(relacoes.escola),
    lista(dados.rede),
    texto(dados.frase),
    dados.atencao ? texto('SIM - ' + (dados.motivoAtencao || 'conversar com cuidado')) : 'não',
    texto(dados.link).slice(0, LIMITE_TEXTO),
  ];
  var trava = LockService.getScriptLock();
  trava.waitLock(10000);
  try {
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA).appendRow(linha);
  } finally {
    trava.releaseLock();
  }
  return responder({ ok: true });
}

function doGet() {
  return responder({ ok: true, servico: 'meu-mapa-oficina' });
}

// Rodar uma vez pelo editor para autorizar o acesso a planilha.
function autorizar() {
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA).getName();
}
