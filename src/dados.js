// Conteudo do Meu Mapa, alinhado ao Encontro 2 da oficina
// "Meu Futuro Comeca em Mim: como eu me cuido e me conecto".

// Etapa 1: como eu reajo. Opcoes na ordem canonica EXP, REF, DIS, APO.
export const SITUACOES = [
  {
    enunciado: 'Um amigo visualizou sua mensagem e não respondeu.',
    opcoes: [
      { estilo: 'EXP', texto: 'Mando outra mensagem perguntando o que houve.' },
      { estilo: 'REF', texto: 'Penso no que pode ter acontecido antes de agir.' },
      { estilo: 'DIS', texto: 'Deixo para lá e vou fazer outra coisa.' },
      { estilo: 'APO', texto: 'Comento com alguém de confiança como me senti.' },
    ],
  },
  {
    enunciado: 'Você estudou, mas tirou uma nota abaixo do que esperava.',
    opcoes: [
      { estilo: 'EXP', texto: 'Falo na hora que a nota me chateou.' },
      { estilo: 'REF', texto: 'Vejo onde errei e penso em como melhorar.' },
      { estilo: 'DIS', texto: 'Tento esquecer e mudo de assunto.' },
      { estilo: 'APO', texto: 'Peço ajuda para quem entende da matéria.' },
    ],
  },
  {
    enunciado: 'Um grupo começa a rir de você durante uma atividade.',
    opcoes: [
      { estilo: 'EXP', texto: 'Digo que aquilo me incomodou.' },
      { estilo: 'REF', texto: 'Respiro e penso se vale a pena responder.' },
      { estilo: 'DIS', texto: 'Saio de perto do grupo.' },
      { estilo: 'APO', texto: 'Procuro um adulto ou uma amizade para contar.' },
    ],
  },
  {
    enunciado: 'Você discute com alguém da sua família.',
    opcoes: [
      { estilo: 'EXP', texto: 'Falo tudo o que estou sentindo na hora.' },
      { estilo: 'REF', texto: 'Espero a raiva passar para conversar depois.' },
      { estilo: 'DIS', texto: 'Vou para o meu canto e fico na minha.' },
      { estilo: 'APO', texto: 'Converso com outra pessoa para desabafar.' },
    ],
  },
  {
    enunciado: 'Chega um convite para algo novo, e você sente empolgação e nervosismo ao mesmo tempo.',
    opcoes: [
      { estilo: 'EXP', texto: 'Conto para todo mundo o que estou sentindo.' },
      { estilo: 'REF', texto: 'Penso nos prós e contras antes de decidir.' },
      { estilo: 'DIS', texto: 'Evito pensar muito para o nervosismo não crescer.' },
      { estilo: 'APO', texto: 'Peço a opinião de alguém em quem confio.' },
    ],
  },
  {
    enunciado: 'Alguém passa dos limites com você, mesmo depois de você pedir para parar.',
    opcoes: [
      { estilo: 'EXP', texto: 'Digo com firmeza que não aceito aquilo.' },
      { estilo: 'REF', texto: 'Penso em como me proteger antes de reagir.' },
      { estilo: 'DIS', texto: 'Me afasto dessa pessoa.' },
      { estilo: 'APO', texto: 'Conto para um adulto de confiança.' },
    ],
  },
];

// Etapa 2: o que eu sinto.
export const EMOCOES = [
  { codigo: 'ALE', nome: 'Alegria', leitura: 'Pode sinalizar conexão, prazer, conquista e algo que você quer repetir.' },
  { codigo: 'CAL', nome: 'Calma', leitura: 'Sinaliza uma fase mais tranquila, boa para se organizar e cuidar das relações.' },
  { codigo: 'MED', nome: 'Medo', leitura: 'Pode sinalizar risco, insegurança ou necessidade de proteção.' },
  { codigo: 'RAI', nome: 'Raiva', leitura: 'Pode sinalizar frustração, injustiça ou um limite que foi ultrapassado.' },
  { codigo: 'TRI', nome: 'Tristeza', leitura: 'Pode aparecer diante de perdas e decepções, e pede acolhimento.' },
  { codigo: 'ANS', nome: 'Ansiedade ou vergonha', leitura: 'Pode sinalizar preocupação com avaliação, exposição ou incerteza.' },
];

export const TERMOMETRO = [
  { nivel: 0, titulo: 'Tranquilidade', acao: 'Posso seguir normalmente.' },
  { nivel: 1, titulo: 'Algo me incomodou', acao: 'Vale perceber o que aconteceu.' },
  { nivel: 2, titulo: 'Desconforto', acao: 'Posso respirar, pausar e me organizar.' },
  { nivel: 3, titulo: 'Está ficando difícil', acao: 'Preciso usar uma estratégia que me ajuda.' },
  { nivel: 4, titulo: 'Preciso conversar', acao: 'É hora de procurar alguém de confiança.' },
  { nivel: 5, titulo: 'Não consigo lidar sem ajuda', acao: 'Preciso de ajuda de um adulto agora.' },
];

export const SINAIS = [
  { codigo: 'CORACAO', nome: 'Coração acelerado' },
  { codigo: 'BARRIGA', nome: 'Barriga apertada' },
  { codigo: 'ROSTO', nome: 'Rosto quente' },
  { codigo: 'OMBROS', nome: 'Ombros tensos' },
  { codigo: 'CHORO', nome: 'Vontade de chorar' },
  { codigo: 'ENERGIA', nome: 'Muita energia' },
  { codigo: 'NADA', nome: 'Não percebo sinais no corpo' },
];

// Etapa 3: como eu me cuido.
export const FERRAMENTAS = [
  'Conversar', 'Descansar', 'Escrever', 'Ouvir música', 'Pedir companhia',
  'Pausar', 'Respirar fundo', 'Sair da situação por alguns minutos', 'Falar sem atacar',
  'Organizar o que depende de mim', 'Pedir orientação', 'Fazer um passo de cada vez',
  'Tentar de outro jeito', 'Lembrar que o erro não define quem eu sou',
];

// Ferramentas mais indicadas para cada emocao, em ordem de prioridade.
export const FERRAMENTAS_POR_EMOCAO = {
  ALE: ['Conversar', 'Escrever', 'Pedir companhia', 'Descansar'],
  CAL: ['Organizar o que depende de mim', 'Conversar', 'Escrever', 'Descansar'],
  MED: ['Pedir orientação', 'Respirar fundo', 'Pedir companhia', 'Fazer um passo de cada vez'],
  RAI: ['Pausar', 'Respirar fundo', 'Sair da situação por alguns minutos', 'Falar sem atacar'],
  TRI: ['Conversar', 'Descansar', 'Escrever', 'Ouvir música', 'Pedir companhia'],
  ANS: ['Organizar o que depende de mim', 'Fazer um passo de cada vez', 'Respirar fundo', 'Pedir orientação'],
};

export const FRASES_AJUDA = [
  'Eu não estou conseguindo lidar com uma coisa sem ajuda.',
  'Você pode me ouvir sem me julgar por alguns minutos?',
  'Aconteceu algo e eu preciso de ajuda para pensar no que fazer.',
  'Eu não quero contar tudo agora, mas preciso que você fique comigo.',
];

// Etapa 4: com quem eu conto.
export const AREAS_RELACAO = [
  { codigo: 'casa', nome: 'Em casa' },
  { codigo: 'amigos', nome: 'Com as amizades' },
  { codigo: 'escola', nome: 'Na escola' },
];

export const CORES_SEMAFORO = [
  { codigo: 'verde', nome: 'Verde', dica: 'respeito, apoio e segurança' },
  { codigo: 'amarelo', nome: 'Amarelo', dica: 'algo me deixa desconfortável' },
  { codigo: 'vermelho', nome: 'Vermelho', dica: 'ameaça, humilhação ou medo' },
];

export const REDE = [
  { codigo: 'FAM', nome: 'Alguém da família' },
  { codigo: 'AMI', nome: 'Uma amizade' },
  { codigo: 'PRO', nome: 'Professora ou professor' },
  { codigo: 'ESC', nome: 'Equipe da escola' },
  { codigo: 'OFI', nome: 'Equipe desta oficina' },
  { codigo: 'SAU', nome: 'Profissional de saúde' },
  { codigo: 'COM', nome: 'Igreja ou grupo da comunidade' },
  { codigo: 'NSEI', nome: 'Ainda não sei' },
];
