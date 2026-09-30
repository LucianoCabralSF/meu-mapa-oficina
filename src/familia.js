// Relatorio para a familia: o adolescente escolhe compartilhar.
// Regra inegociavel: NAO mostra o semaforo das relacoes nem a rede de apoio
// (uma relacao "vermelha em casa" nunca pode chegar a familia por aqui).
import { pontuarEstilos, NOMES_ESTILO } from './motor.js';
import { EMOCOES, FRASES_AJUDA } from './dados.js';
import { escaparHtml } from './relatorio.js';
import { familiaDaEmocao, faixaTermometro } from './leitura.js';

const p = (t) => `<p>${escaparHtml(t)}</p>`;
const cartao = (id, titulo, corpo) => `<section class="cartao" id="${id}"><h2>${escaparHtml(titulo)}</h2>${corpo}</section>`;

const ESTILO_FAMILIA = {
  EXP: {
    retrato: 'costuma colocar para fora o que sente, na hora. Quando algo acontece, fala logo, às vezes com mais força do que gostaria.',
    funciona: 'Ouvir até o fim antes de responder, mesmo quando a fala vier forte. Depois que a emoção baixar, retomar com calma: "o que você quis dizer com aquilo?".',
    fecha: 'Responder no mesmo tom, ou corrigir só a forma de falar e deixar de lado o que foi dito.',
    perguntas: ['O que mais te irritou esta semana?', 'Quando você fala e eu não escuto direito, como você se sente?', 'Tem alguma coisa que eu faço que te ajuda a se acalmar?'],
  },
  REF: {
    retrato: 'costuma pensar antes de agir. Prefere entender o que aconteceu antes de responder, e pode demonstrar pouco do que sente.',
    funciona: 'Dar tempo e fazer perguntas abertas. Muitas vezes a conversa sai melhor lado a lado, fazendo outra coisa juntos, do que frente a frente.',
    fecha: 'Exigir resposta na hora ou entender o silêncio como falta de interesse.',
    perguntas: ['O que tem ocupado sua cabeça esses dias?', 'Tem algo que você está tentando resolver e quer uma segunda opinião?', 'Você prefere conversar agora ou mais tarde?'],
  },
  DIS: {
    retrato: 'costuma dar um tempo quando algo incomoda: se afasta um pouco até a emoção baixar. Isso ajuda a evitar brigas, mas o assunto às vezes fica guardado.',
    funciona: 'Respeitar o tempo, mas combinar a volta: "tudo bem, a gente conversa depois do jantar". Ficar por perto sem cobrar.',
    fecha: 'Insistir no calor do momento, ou deixar o assunto morrer para sempre.',
    perguntas: ['Quando você precisar de um tempo, como eu posso saber que está tudo bem?', 'Qual é o melhor momento do dia para a gente conversar?', 'Tem algo que você deixou para lá e que ainda incomoda?'],
  },
  APO: {
    retrato: 'costuma buscar alguém quando algo acontece. Dividir o que sente ajuda a pensar e a se acalmar.',
    funciona: 'Estar disponível e ouvir sem pressa. Quando a procura for pela família, é um sinal de confiança: vale parar o que estiver fazendo.',
    fecha: 'Dar sermão justo quando a ajuda é pedida, ou dizer que "isso é bobagem".',
    perguntas: ['O que eu posso fazer quando você vier conversar comigo?', 'Tem alguma coisa que você queria me contar e ainda não contou?', 'O que te ajuda quando o dia é difícil?'],
  },
};

const EMOCAO_FAMILIA = {
  intensa: 'Emoções fortes assim costumam aparecer em casa como irritação, silêncio ou respostas curtas. Nem sempre são sobre a família: muitas vezes vêm da escola, das amizades ou das redes sociais.',
  baixa: 'A tristeza pode aparecer como cansaço, mais tempo no quarto ou falta de vontade. Mais do que conselhos, a tristeza costuma pedir presença: estar junto, sem pressa.',
  leve: 'É uma fase boa para aproximar: fazer algo juntos, conversar sobre planos e reconhecer o que tem dado certo.',
};

const TERMOMETRO_FAMILIA = {
  leve: 'fase leve. Um bom momento para fortalecer a conversa em casa antes que apareçam dificuldades.',
  media: 'há algo pesando, mas dá para lidar. Vale oferecer conversa sem pressionar e observar como os próximos dias vão.',
  alta: 'um momento difícil. Procure conversar ainda hoje, com calma e sem cobrança. Se não souber como começar, fale com a equipe da oficina.',
};

export function montarRelatorioFamilia(respostas, data) {
  const nome = escaparHtml(respostas.nome);
  const estilo = pontuarEstilos(respostas.estilos ?? []).principal;
  const t = ESTILO_FAMILIA[estilo];
  const emocao = (EMOCOES.find((e) => e.codigo === respostas.emocao)?.nome ?? '').toLowerCase();
  const faixa = faixaTermometro(respostas.termometro);
  const frase = FRASES_AJUDA[respostas.frase] ?? FRASES_AJUDA[0];
  const ferramentas = respostas.ferramentas ?? [];

  return [
    '<div class="faixa-familia">Relatório para a família · compartilhado por quem respondeu</div>',
    '<header class="cabecalho-relatorio">',
    '<img class="marca-lotus" src="assets/lotus.png" alt="Instituto Lótus" width="56" height="56">',
    '<p class="kicker">INSTITUTO LÓTUS · OFICINA MEU FUTURO COMEÇA EM MIM</p>',
    `<h1>Para a família de ${nome}</h1>`,
    `<p class="data">${escaparHtml(data)}</p>`,
    '</header>',
    `<section class="cartao destaque-familia"><p>${nome} participou da oficina <strong>Meu Futuro Começa em Mim</strong> e escolheu compartilhar este mapa com você. O mapa mostra como ${nome} costuma reagir e o momento que vive agora. Não é diagnóstico: é um ponto de partida para uma boa conversa.</p></section>`,
    cartao('momento', 'O momento de agora',
      `<p>A emoção que mais apareceu nos últimos dias foi <strong>${escaparHtml(emocao)}</strong>.</p>`
      + p(EMOCAO_FAMILIA[familiaDaEmocao(respostas.emocao)])
      + `<p>No termômetro da oficina, que vai de 0 a 5, a marcação foi <strong>${escaparHtml(respostas.termometro)}</strong>: ${escaparHtml(TERMOMETRO_FAMILIA[faixa])}</p>`),
    cartao('conversa', 'Como puxar conversa',
      `<p class="titulo-perfil">${escaparHtml(NOMES_ESTILO[estilo])}</p>`
      + `<p>${nome} ${escaparHtml(t.retrato)}</p>`
      + `<h3>O que costuma funcionar</h3>${p(t.funciona)}`
      + `<h3>O que costuma fechar a porta</h3>${p(t.fecha)}`),
    cartao('perguntas', 'Perguntas para fazer em casa',
      '<p class="legenda">Escolha uma por vez, num momento tranquilo. Ouvir vale mais do que responder.</p>'
      + t.perguntas.map((q) => `<p class="pergunta">“${escaparHtml(q)}”</p>`).join('')),
    ferramentas.length
      ? cartao('ajuda-casa', `O que tem ajudado ${respostas.nome}`,
        '<ul class="chips">' + ferramentas.map((f) => `<li>${escaparHtml(f)}</li>`).join('') + '</ul>'
        + p('Quando o dia estiver difícil, apoiar essas estratégias costuma ajudar mais do que dar conselhos.'))
      : '',
    cartao('frase', `A frase de ${respostas.nome}`,
      p('Na oficina, cada participante escolheu uma frase para pedir ajuda. Se você ouvir esta frase, pare o que estiver fazendo e escute:')
      + `<p class="frase-ajuda">“${escaparHtml(frase)}”</p>`),
    cartao('preocupar', 'Quando se preocupar',
      p('Observe mudanças que duram mais de duas semanas: no sono, na alimentação, nas notas, no afastamento de todo mundo, ou falas de que nada vai melhorar.')
      + p('Nesses casos, converse com calma e procure ajuda: a equipe da oficina, a escola ou uma unidade de saúde. Em crise emocional, o CVV atende de graça, 24 horas, pelo 188. Em perigo imediato, ligue 190 ou 192.')),
    '<p class="fechamento">Adolescentes não precisam de uma família perfeita. Precisam de alguém que escute sem julgar e que continue por perto.</p>',
    '<button type="button" class="botao-principal sem-impressao" data-acao="imprimir">Salvar em PDF</button>',
    '<p class="aviso-legal">Instituto Lótus · Instituto de Desenvolvimento Humano e Social. Ferramenta de autoconhecimento da oficina; não é teste psicológico nem diagnóstico.</p>',
  ].join('');
}
