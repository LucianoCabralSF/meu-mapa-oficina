import { calcularResultado, NOMES_ESTILO } from './motor.js';
import {
  EMOCOES, TERMOMETRO, SINAIS, FRASES_AJUDA, AREAS_RELACAO, CORES_SEMAFORO, REDE,
} from './dados.js';
import {
  ESTILO_TEXTO, SINAIS_TEXTO, RELACAO_TEXTO, REDE_TEXTO, FERRAMENTAS_TEXTO, APOIO, FECHAMENTO,
} from './textos.js';
import { leituraCruzada, desafioDaSemana } from './leitura.js';

export function escaparHtml(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const p = (t) => `<p>${escaparHtml(t)}</p>`;
const cartao = (id, titulo, corpo, extra = '') => `<section class="cartao${extra ? ` ${extra}` : ''}" id="${id}"><h2>${titulo}</h2>${corpo}</section>`;
const chips = (itens) => `<ul class="chips">${itens.map((i) => `<li>${escaparHtml(i)}</li>`).join('')}</ul>`;
const nomeDe = (lista, codigo) => lista.find((x) => x.codigo === codigo)?.nome ?? '';

function blocoEnvio(envio) {
  if (envio === 'enviado') return '<p class="envio envio-ok">Suas respostas foram enviadas para a equipe da oficina.</p>';
  if (envio === 'enviando') return '<p class="envio">Enviando suas respostas para a equipe…</p>';
  if (envio === 'falhou') {
    return '<div class="envio envio-erro"><p>Não conseguimos enviar suas respostas para a equipe agora.</p>'
      + '<button type="button" class="botao-secundario" data-acao="reenviar">Tentar enviar de novo</button></div>';
  }
  if (envio === 'nao-autorizado') return '<p class="envio">Você escolheu não enviar: suas respostas não foram enviadas para ninguém.</p>';
  return '';
}

function quadroApoio(urgente) {
  return `<section class="cartao apoio${urgente ? ' apoio-urgente' : ''}" id="apoio">`
    + `<h2>${escaparHtml(APOIO.titulo)}</h2>${p(APOIO.texto)}${p(APOIO.cvv)}${p(APOIO.disque100)}${p(APOIO.emergencia)}</section>`;
}

export function montarRelatorio(respostas, data, { envio = '', visaoEquipe = false } = {}) {
  const r = calcularResultado(respostas);
  const estilo = ESTILO_TEXTO[r.estilos.principal];
  const emocao = EMOCOES.find((e) => e.codigo === r.emocao);
  const nivel = TERMOMETRO.find((t) => t.nivel === r.termometro);
  const sinais = r.sinais.filter((s) => s !== 'NADA').map((s) => nomeDe(SINAIS, s));
  const rede = r.rede.filter((s) => s !== 'NSEI').map((s) => nomeDe(REDE, s));

  const faixa = visaoEquipe
    ? `<div class="faixa-equipe">Visão da equipe · respostas de <strong>${escaparHtml(r.nome)}</strong>${r.turma ? ` · ${escaparHtml(r.turma)}` : ''}</div>`
    : '';

  const partes = [
    faixa,
    '<header class="cabecalho-relatorio">',
    '<img class="marca-lotus" src="assets/lotus.png" alt="Instituto Lótus" width="56" height="56">',
    '<p class="kicker">INSTITUTO LÓTUS · OFICINA MEU FUTURO COMEÇA EM MIM</p>',
    `<h1>Meu Mapa, ${escaparHtml(r.nome)}</h1>`,
    `<p class="data">${escaparHtml(data)}</p>`,
    '</header>',
    r.atencao.atencao ? quadroApoio(true) : '',
    cartao('juntas', 'O que suas respostas mostram juntas',
      '<p class="legenda">Cada resposta sozinha você já conhecia. Juntas, elas contam mais:</p>'
      + leituraCruzada(respostas).map((i) => `<div class="leitura"><h3>${escaparHtml(i.titulo)}</h3>${p(i.texto)}</div>`).join(''), 'destaque'),
    cartao('desafio', 'Meu desafio da semana', p(desafioDaSemana(respostas)), 'desafio'),
    cartao('reagir', 'Meu jeito de reagir',
      `<p class="titulo-perfil">${escaparHtml(NOMES_ESTILO[r.estilos.principal])}</p>`
      + p(estilo.retrato)
      + `<h3>O que isso tem de bom</h3>${p(estilo.forca)}`
      + `<h3>Um cuidado</h3>${p(estilo.cuidado)}`
      + `<h3>Uma dica</h3>${p(estilo.dica)}`
      + `<p class="legenda">Seu segundo jeito mais comum: ${escaparHtml(NOMES_ESTILO[r.estilos.apoio])}.</p>`),
    cartao('sinto', 'O que eu sinto',
      `<p class="titulo-perfil">${escaparHtml(emocao?.nome)}</p>${p(emocao?.leitura)}`
      + '<p class="legenda">Emoções não são inimigas: elas trazem informações sobre o que está acontecendo dentro de você.</p>'),
    cartao('termometro', 'Meu termômetro',
      `<div class="termometro">${TERMOMETRO.map((t) => `<span class="nivel${t.nivel === r.termometro ? ' atual' : ''}" aria-label="nível ${t.nivel}">${t.nivel}</span>`).join('')}</div>`
      + `<p class="titulo-perfil">${escaparHtml(nivel?.titulo)}</p>${p(nivel?.acao)}`),
    cartao('corpo', 'Onde meu corpo avisa',
      sinais.length ? chips(sinais) + p(SINAIS_TEXTO.com) : p(SINAIS_TEXTO.sem)),
    cartao('ferramentas', 'Minha caixa de ferramentas',
      (r.ferramentas.length ? `<h3>O que já me ajuda</h3>${chips(r.ferramentas)}` : p(FERRAMENTAS_TEXTO.nenhuma))
      + (r.sugestoes.length ? `<h3>Para experimentar</h3>${p(FERRAMENTAS_TEXTO.sugestao)}${chips(r.sugestoes)}` : '')),
    cartao('ajuda', 'Como pedir ajuda',
      `<p class="frase-ajuda">“${escaparHtml(FRASES_AJUDA[r.frase] ?? FRASES_AJUDA[0])}”</p>`
      + '<p class="legenda">Guarde essa frase. Ela ajuda a começar a conversa quando for difícil.</p>'),
    cartao('relacoes', 'Minhas relações',
      AREAS_RELACAO.map((a) => {
        const corAtual = r.relacoes[a.codigo];
        const cor = CORES_SEMAFORO.find((c) => c.codigo === corAtual);
        return `<div class="relacao relacao-${corAtual ?? 'vazia'}"><p class="relacao-area">${escaparHtml(a.nome)}: <strong>${escaparHtml(cor?.nome ?? 'sem resposta')}</strong></p>`
          + (corAtual ? p(RELACAO_TEXTO[corAtual]) : '') + '</div>';
      }).join('')),
    cartao('rede', 'Com quem eu conto', rede.length ? chips(rede) + p(REDE_TEXTO.com) : p(REDE_TEXTO.sem)),
    r.atencao.atencao ? '' : quadroApoio(false),
    visaoEquipe ? '' : cartao('familia', 'Compartilhar com a minha família',
      p('Sua família recebe um relatório próprio, com o seu jeito de reagir e dicas de como conversar melhor com você.')
      + p('As suas relações e a sua rede de apoio não vão junto: elas ficam só com você e a equipe.')
      + '<button type="button" class="botao-principal sem-impressao" data-acao="familia">Enviar para minha família</button>', 'sem-impressao'),
    `<p class="fechamento">${escaparHtml(FECHAMENTO)}</p>`,
    visaoEquipe ? '' : blocoEnvio(envio),
    visaoEquipe ? '' : '<button type="button" class="botao-principal sem-impressao" data-acao="imprimir">Salvar em PDF</button>',
    visaoEquipe ? '' : '<button type="button" class="botao-secundario sem-impressao" data-acao="apagar">Terminar e apagar deste celular</button>',
    '<p class="aviso-legal">Instituto Lótus · Instituto de Desenvolvimento Humano e Social. Ferramenta de autoconhecimento da oficina; não é teste psicológico nem diagnóstico.</p>',
  ];
  return partes.join('');
}
