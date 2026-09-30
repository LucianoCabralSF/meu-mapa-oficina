// Leitura cruzada: conclusoes que so aparecem quando as respostas sao
// combinadas (jeito de reagir x emocao, corpo x jeito, termometro x rede,
// relacao x jeito). Sem masculino sobre quem responde.
import { pontuarEstilos, sugerirFerramentas } from './motor.js';
import { EMOCOES, SINAIS, REDE } from './dados.js';

const FAMILIA = { RAI: 'intensa', MED: 'intensa', ANS: 'intensa', TRI: 'baixa', ALE: 'leve', CAL: 'leve' };

export function familiaDaEmocao(codigo) {
  return FAMILIA[codigo] ?? 'leve';
}

export function faixaTermometro(n) {
  if (n >= 4) return 'alta';
  if (n >= 2) return 'media';
  return 'leve';
}

const nomeEmocao = (codigo) => (EMOCOES.find((e) => e.codigo === codigo)?.nome ?? '').toLowerCase();
const maiuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const listar = (itens) => (itens.length < 2 ? itens.join('') : `${itens.slice(0, -1).join(', ')} e ${itens.at(-1)}`);

const ESTILO_X_EMOCAO = {
  EXP: {
    intensa: (e) => `Com ${e}, seu jeito é falar na hora. Com uma emoção forte assim, a fala costuma sair antes do pensamento, e depois dá vontade de voltar atrás. Sua força é não guardar nada; o ponto a treinar é uma respiração entre sentir e responder.`,
    baixa: (e) => `Com ${e}, quem fala na hora nem sempre mostra o que sente de verdade: às vezes sai irritação no lugar da tristeza, e as pessoas só veem a parte de fora. Vale dizer o nome da emoção, "estou triste", e não só "me deixa em paz".`,
    leve: (e) => `Numa fase de ${e}, sua facilidade de falar vira ponte: você aproxima as pessoas e anima o grupo. Aproveite para ter as conversas que ficaram pendentes, porque agora as palavras saem com mais cuidado.`,
  },
  REF: {
    intensa: (e) => `Com ${e}, quem pensa antes corre um risco pouco visível: a cabeça fica repetindo o problema e a preocupação cresce por dentro. Por fora parece que está tudo bem; por dentro, não. Colocar para fora, escrevendo ou falando, costuma quebrar esse ciclo.`,
    baixa: (e) => `Com ${e}, o jeito de pensar antes pode virar um ciclo de repassar o que deu errado sem dividir com ninguém. Quem está perto pode nem perceber, porque você demonstra pouco. Pensar é uma força; dividir o pensamento é o que impede que ele pese mais.`,
    leve: (e) => `Numa fase de ${e}, seu jeito de pensar antes está no melhor momento: é hora boa para planejar, organizar ideias e decidir com calma. Aproveite para montar hoje o plano do que fazer quando a emoção apertar.`,
  },
  DIS: {
    intensa: (e) => `Com ${e}, dar um tempo ajuda a baixar a temperatura, e isso é uma força. O ponto cego é que o assunto costuma ficar guardado e a emoção volta, às vezes maior, na próxima situação parecida. O tempo funciona melhor quando tem hora para acabar e alguém com quem retomar a conversa.`,
    baixa: (e) => `${maiuscula(e)} com o jeito de dar um tempo é uma combinação que pede atenção: a tristeza puxa para o próprio canto, e seu jeito também. Juntas, podem te afastar justo das pessoas que ajudariam. Tristeza pede companhia, mesmo que seja alguém do lado, sem precisar falar muito.`,
    leve: (e) => `Numa fase de ${e}, dar um tempo pode ser só descanso, e está tudo certo. Aproveite esta fase boa para retomar algum assunto que ficou de lado quando estava difícil: agora ele pesa menos.`,
  },
  APO: {
    intensa: (e) => `Com ${e}, você procura alguém, e isso te protege. O ponto a treinar é o intervalo entre sentir e encontrar essa pessoa: ter uma ferramenta própria para esses minutos impede que a emoção tome conta enquanto a conversa não chega.`,
    baixa: (e) => `Com ${e}, buscar apoio é exatamente o que ela pede, e você já faz isso. Só observe se está contando o que sente ou apenas os fatos: quem te escuta ajuda mais quando sabe como você está por dentro.`,
    leve: (e) => `Numa fase de ${e}, sua facilidade de buscar pessoas fortalece os laços. É um bom momento para também ser apoio para alguém: quem sabe pedir ajuda costuma saber oferecer.`,
  },
};

const CORPO_X_ESTILO = {
  EXP: 'Para quem fala na hora, esse é o segundo exato de respirar antes de responder.',
  REF: 'Para quem pensa antes, é o sinal de que a preocupação já passou do ponto e merece ser dividida.',
  DIS: 'Para quem dá um tempo, é a hora de se afastar avisando: "volto a falar disso daqui a pouco".',
  APO: 'Para quem busca apoio, é a hora de chamar sua pessoa de confiança.',
};

const RELACAO_X_ESTILO = {
  EXP: 'Seu jeito de falar na hora pode ajudar, desde que a conversa seja sobre o que você sente, e não um ataque.',
  REF: 'Você provavelmente já pensou muito nisso; talvez falte dizer em voz alta, para alguém de confiança, o que incomoda.',
  DIS: 'Se afastar alivia, mas o desconforto costuma continuar lá. Vale escolher uma pessoa e uma hora para falar disso.',
  APO: 'Ouvir alguém de fora dessa relação pode te ajudar a enxergar o que fazer.',
};

const NOME_AREA = { casa: 'A relação em casa', amigos: 'A relação com as amizades', escola: 'A relação na escola' };

function sinaisReais(r) {
  return (r.sinais ?? []).filter((s) => s !== 'NADA').map((s) => (SINAIS.find((x) => x.codigo === s)?.nome ?? '').toLowerCase());
}

function leituraCorpo(r, estilo) {
  const sinais = sinaisReais(r);
  if (!sinais.length) {
    return 'Você ainda não percebe sinais no corpo. Isso é comum, e dá para treinar: nesta semana, observe o que acontece com coração, barriga, ombros e rosto quando algo incomodar. Quem percebe o corpo consegue agir antes de a emoção explodir.';
  }
  return `Seu corpo avisa primeiro: ${listar(sinais)}. Esse aviso chega antes de a emoção tomar conta, e é nele que dá para agir. ${CORPO_X_ESTILO[estilo]}`;
}

function leituraRede(r) {
  const rede = (r.rede ?? []).filter((c) => c !== 'NSEI').map((c) => (REDE.find((x) => x.codigo === c)?.nome ?? '').toLowerCase());
  const faixa = faixaTermometro(r.termometro);
  if (faixa === 'alta') {
    return rede.length
      ? `Seu termômetro está alto, e você já tem com quem contar: ${listar(rede)}. A hora de usar essa rede é hoje, não depois que piorar. A frase que você escolheu pode abrir a conversa.`
      : 'Seu termômetro está alto e você ainda não sabe com quem contar. Essa é a combinação mais importante de todo o mapa: não espere passar. Procure hoje alguém da equipe da oficina; é para isso que a gente está aqui.';
  }
  if (faixa === 'media') {
    return rede.length
      ? `Seu termômetro está no meio e você tem com quem contar: ${listar(rede)}. Não precisa esperar chegar no 4 para conversar: falar agora evita que a temperatura suba.`
      : 'Seu termômetro está no meio: dá para lidar, mas cansa. Não ter ainda alguém de confiança deixa tudo mais pesado. Pense em uma pessoa só, que te escute sem julgar; a equipe da oficina pode ajudar a encontrar.';
  }
  return rede.length
    ? 'Seu termômetro está baixo e você tem com quem contar. Fase boa para fortalecer esses laços e treinar suas ferramentas: elas funcionam melhor quando já estão prontas antes de precisar.'
    : 'Seu termômetro está baixo: fase boa. É o momento ideal para construir sua rede de apoio com calma, antes de precisar dela. Pense em quem te escuta sem julgar.';
}

function leituraRelacao(r, estilo) {
  const areas = ['casa', 'amigos', 'escola'];
  const vermelha = areas.find((a) => r.relacoes?.[a] === 'vermelho');
  if (vermelha) {
    return `${NOME_AREA[vermelha]} está no vermelho. Isso não é para resolver do seu jeito de sempre nem sem ajuda: ninguém deve passar por ameaça, humilhação ou medo. Conte hoje para alguém da equipe da oficina ou para um adulto de confiança.`;
  }
  const amarela = areas.find((a) => r.relacoes?.[a] === 'amarelo');
  return amarela ? `${NOME_AREA[amarela]} está no amarelo. ${RELACAO_X_ESTILO[estilo]}` : '';
}

export function leituraCruzada(r) {
  const estilo = pontuarEstilos(r.estilos ?? []).principal;
  const itens = [
    { titulo: 'Seu jeito de reagir junto com o que você sente', texto: ESTILO_X_EMOCAO[estilo][familiaDaEmocao(r.emocao)](nomeEmocao(r.emocao)) },
    { titulo: 'O alarme do seu corpo', texto: leituraCorpo(r, estilo) },
    { titulo: 'Seu termômetro e sua rede', texto: leituraRede(r) },
  ];
  const relacao = leituraRelacao(r, estilo);
  if (relacao) itens.push({ titulo: 'Onde vale olhar com carinho', texto: relacao });
  return itens;
}

export function desafioDaSemana(r) {
  const ferramenta = sugerirFerramentas(r.emocao, r.ferramentas ?? [])[0] ?? (r.ferramentas ?? [])[0] ?? 'Respirar fundo';
  const sinal = sinaisReais(r)[0];
  return sinal
    ? `Toda vez que perceber ${sinal} nesta semana, pare por um instante e experimente "${ferramenta}". No fim da semana, repare se a emoção passou mais rápido do que antes.`
    : `Três vezes por dia nesta semana, pare e pergunte: "o que meu corpo está sentindo agora?". Quando algo apertar, experimente "${ferramenta}" e repare o que muda.`;
}
