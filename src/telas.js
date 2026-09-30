import {
  SITUACOES, EMOCOES, TERMOMETRO, SINAIS, FERRAMENTAS, FRASES_AJUDA, AREAS_RELACAO, CORES_SEMAFORO, REDE,
} from './dados.js';
import { montarRelatorio, escaparHtml } from './relatorio.js';
import { decodificar } from './link.js';
import { montarEnvio, enviar } from './envio.js';

export const CHAVE = 'meu-mapa-oficina-v1';
export const TURMA_PADRAO = 'Meu Futuro Começa em Mim';
const ATRASO = 250;

function salvar(estado) {
  try { sessionStorage.setItem(CHAVE, JSON.stringify(estado)); } catch { /* segue sem salvar */ }
}
function ler() {
  try { return JSON.parse(sessionStorage.getItem(CHAVE) ?? 'null'); } catch { return null; }
}

function hoje() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

const RESPIROS = [
  { texto: 'Etapa 1: como eu reajo.', detalhe: 'Seis situações do dia a dia. Em cada uma, escolha o que você mais faria e depois o que menos faria.' },
  { texto: 'Etapa 2: o que eu sinto.', detalhe: 'Três perguntas sobre as suas emoções nas últimas semanas.' },
  { texto: 'Etapa 3: como eu me cuido.', detalhe: 'O que já te ajuda quando as emoções ficam fortes.' },
  { texto: 'Etapa 4: com quem eu conto.', detalhe: 'As suas relações e a sua rede de apoio. Última etapa!' },
];

export function montarSequencia() {
  const t = [{ tipo: 'abertura' }, { tipo: 'identificacao' }];
  t.push({ tipo: 'respiro', ...RESPIROS[0], etapa: 1 });
  SITUACOES.forEach((s, i) => t.push({ tipo: 'forcada', indice: i, etapa: 1 }));
  t.push({ tipo: 'respiro', ...RESPIROS[1], etapa: 2 });
  t.push({ tipo: 'unica', campo: 'emocao', etapa: 2, titulo: 'Nas últimas semanas, qual emoção mais apareceu para você?', opcoes: EMOCOES.map((e) => ({ valor: e.codigo, texto: e.nome })) });
  t.push({ tipo: 'unica', campo: 'termometro', etapa: 2, titulo: 'Na maior parte do tempo, em que nível do termômetro você esteve?', opcoes: TERMOMETRO.map((n) => ({ valor: n.nivel, texto: `${n.nivel} · ${n.titulo}` })) });
  t.push({ tipo: 'multipla', campo: 'sinais', etapa: 2, max: 3, titulo: 'Quando você sente algo forte, onde o corpo costuma avisar primeiro?', opcoes: SINAIS.map((s) => ({ valor: s.codigo, texto: s.nome })) });
  t.push({ tipo: 'respiro', ...RESPIROS[2], etapa: 3 });
  t.push({ tipo: 'multipla', campo: 'ferramentas', etapa: 3, max: 6, titulo: 'O que já te ajuda quando as emoções ficam fortes?', opcoes: FERRAMENTAS.map((f) => ({ valor: f, texto: f })) });
  t.push({ tipo: 'unica', campo: 'frase', etapa: 3, titulo: 'Se você precisasse de ajuda, com qual frase começaria a conversa?', opcoes: FRASES_AJUDA.map((f, i) => ({ valor: i, texto: f })) });
  t.push({ tipo: 'respiro', ...RESPIROS[3], etapa: 4 });
  t.push({ tipo: 'semaforo', etapa: 4 });
  t.push({ tipo: 'multipla', campo: 'rede', etapa: 4, max: 8, titulo: 'Com quem você pode contar quando precisar?', opcoes: REDE.map((r) => ({ valor: r.codigo, texto: r.nome })) });
  t.push({ tipo: 'relatorio' });
  return t;
}

function respostasVazias(turma = TURMA_PADRAO) {
  return {
    nome: '', turma,
    estilos: SITUACOES.map(() => ({ mais: null, menos: null })),
    emocao: null, termometro: null, sinais: [], ferramentas: [], frase: null,
    relacoes: { casa: null, amigos: null, escola: null }, rede: [],
  };
}

function estadoValido(e, telas) {
  return Boolean(e && Number.isInteger(e.posicao) && e.posicao >= 0 && e.posicao < telas.length
    && e.respostas && typeof e.respostas === 'object' && typeof e.respostas.nome === 'string'
    && Array.isArray(e.respostas.estilos) && e.respostas.estilos.length === SITUACOES.length
    && Array.isArray(e.respostas.sinais) && Array.isArray(e.respostas.ferramentas) && Array.isArray(e.respostas.rede)
    && e.respostas.relacoes && typeof e.respostas.relacoes === 'object');
}

function turmaDoEndereco() {
  try {
    return (new URLSearchParams(globalThis.location?.search ?? '').get('turma') || TURMA_PADRAO).slice(0, 40);
  } catch {
    return TURMA_PADRAO;
  }
}

export function criarApp(raiz) {
  const telas = montarSequencia();
  let posicao = 0;
  let passo = 'mais';
  let respostas = respostasVazias(turmaDoEndereco());
  let enviado = false;
  let envio = '';
  let pendente = null;

  const guardar = () => salvar({ posicao, respostas, enviado });

  function agendar(fn) {
    clearTimeout(pendente);
    pendente = setTimeout(() => { pendente = null; fn(); }, ATRASO);
  }

  function ir(nova) {
    clearTimeout(pendente);
    pendente = null;
    posicao = Math.max(0, Math.min(nova, telas.length - 1));
    passo = 'mais';
    guardar();
    desenhar();
  }

  function progresso(tela) {
    const daEtapa = telas.filter((t) => t.etapa === tela.etapa && t.tipo !== 'respiro');
    const pct = Math.round(((daEtapa.indexOf(tela) + 1) / daEtapa.length) * 100);
    return `<div class="progresso"><p class="etapa">Etapa ${tela.etapa} de 4</p>`
      + `<div class="progresso-trilho"><div class="progresso-preenchido" style="width:${pct}%"></div></div></div>`;
  }

  const voltar = '<button type="button" class="voltar" data-acao="voltar">‹ voltar</button>';

  function telaAbertura() {
    return '<div class="tela">'
      + '<p class="kicker">OFICINA MEU FUTURO COMEÇA EM MIM</p>'
      + '<h1>Meu Mapa.</h1>'
      + '<p>Um jeito de se conhecer melhor: como você reage, o que sente, como se cuida e com quem pode contar.</p>'
      + '<p>São cerca de 8 minutos. Não existe resposta certa ou errada: responda o que é verdade para você.</p>'
      + '<p class="aviso-abertura">No final você vê o seu resultado aqui no celular. As respostas também vão para a equipe da oficina, para ajudar a preparar o próximo encontro. Elas não vão para mais ninguém.</p>'
      + '<button type="button" class="botao-principal" data-acao="comecar">Começar</button>'
      + '</div>';
  }

  function telaIdentificacao() {
    return '<div class="tela">'
      + '<p class="kicker">ANTES DE COMEÇAR</p>'
      + '<h1>Como podemos te chamar?</h1>'
      + '<label class="campo"><span>Primeiro nome ou apelido</span>'
      + `<input type="text" id="campo-nome" maxlength="30" value="${escaparHtml(respostas.nome)}" autocomplete="given-name"></label>`
      + '<label class="campo"><span>Turma</span>'
      + `<input type="text" id="campo-turma" maxlength="30" value="${escaparHtml(respostas.turma)}"></label>`
      + '<button type="button" class="botao-principal" data-acao="identificar">Continuar</button>'
      + voltar + '</div>';
  }

  function telaRespiro(t) {
    return '<div class="tela">'
      + `<p class="respiro-texto">${escaparHtml(t.texto)}</p><p>${escaparHtml(t.detalhe)}</p>`
      + '<button type="button" class="botao-principal" data-acao="seguir">Seguir</button>' + voltar + '</div>';
  }

  function telaForcada(t) {
    const s = SITUACOES[t.indice];
    const r = respostas.estilos[t.indice];
    const segundo = passo === 'menos';
    const rotulo = segundo
      ? '<p class="passo-destaque passo-menos"><span class="passo-num">Passo 2 de 2</span><span>Agora escolha o que você <strong>MENOS</strong> faria</span></p>'
      : '<p class="passo-destaque passo-mais"><span class="passo-num">Passo 1 de 2</span><span>Escolha o que você <strong>MAIS</strong> faria</span></p>';
    const opcoes = s.opcoes.map((o) => {
      const marcada = segundo && r.mais === o.estilo;
      return `<button type="button" class="${marcada ? 'opcao marcada bloqueada' : 'opcao'}" data-acao="forcada" data-codigo="${o.estilo}">${escaparHtml(o.texto)}</button>`;
    }).join('');
    return `<div class="tela">${progresso(t)}<p class="enunciado">${escaparHtml(s.enunciado)}</p>${rotulo}<div class="opcoes">${opcoes}</div>${voltar}</div>`;
  }

  function telaUnica(t) {
    const atual = respostas[t.campo];
    const opcoes = t.opcoes.map((o, i) => `<button type="button" class="opcao${atual === o.valor ? ' marcada' : ''}" data-acao="unica" data-indice="${i}">${escaparHtml(o.texto)}</button>`).join('');
    return `<div class="tela">${progresso(t)}<p class="enunciado">${escaparHtml(t.titulo)}</p><p class="rotulo-passo">TOQUE EM UMA OPÇÃO</p><div class="opcoes">${opcoes}</div>${voltar}</div>`;
  }

  function telaMultipla(t) {
    const atuais = respostas[t.campo];
    const opcoes = t.opcoes.map((o, i) => `<button type="button" class="opcao escolha${atuais.includes(o.valor) ? ' marcada' : ''}" data-acao="alternar" data-indice="${i}" aria-pressed="${atuais.includes(o.valor)}">${escaparHtml(o.texto)}</button>`).join('');
    return `<div class="tela">${progresso(t)}<p class="enunciado">${escaparHtml(t.titulo)}</p>`
      + `<p class="rotulo-passo">MARQUE ATÉ ${t.max} · ${atuais.length} MARCADA${atuais.length === 1 ? '' : 'S'}</p>`
      + `<div class="opcoes opcoes-grade">${opcoes}</div>`
      + `<button type="button" class="botao-principal" data-acao="seguir"${atuais.length ? '' : ' disabled'}>Continuar</button>${voltar}</div>`;
  }

  function telaSemaforo(t) {
    const linhas = AREAS_RELACAO.map((a) => `<div class="semaforo-linha"><p class="semaforo-area">${escaparHtml(a.nome)}</p><div class="semaforo-botoes">`
      + CORES_SEMAFORO.map((c) => `<button type="button" class="cor cor-${c.codigo}${respostas.relacoes[a.codigo] === c.codigo ? ' marcada' : ''}" data-acao="cor" data-area="${a.codigo}" data-cor="${c.codigo}" aria-pressed="${respostas.relacoes[a.codigo] === c.codigo}"><strong>${c.nome}</strong><span>${escaparHtml(c.dica)}</span></button>`).join('')
      + '</div></div>').join('');
    const completo = AREAS_RELACAO.every((a) => respostas.relacoes[a.codigo]);
    return `<div class="tela">${progresso(t)}<p class="enunciado">Como você sente as suas relações hoje?</p><p class="rotulo-passo">ESCOLHA UMA COR EM CADA LINHA</p>${linhas}`
      + `<button type="button" class="botao-principal" data-acao="seguir"${completo ? '' : ' disabled'}>Continuar</button>${voltar}</div>`;
  }

  function telaRelatorio() {
    return montarRelatorio(respostas, hoje(), { envio });
  }

  async function enviarRespostas() {
    envio = 'enviando';
    desenhar();
    const ok = await enviar(montarEnvio(respostas, hoje()));
    enviado = ok;
    envio = ok ? 'enviado' : 'falhou';
    guardar();
    if (telas[posicao].tipo === 'relatorio') desenhar();
  }

  function desenhar() {
    const t = telas[posicao];
    const html = {
      abertura: telaAbertura, identificacao: telaIdentificacao, respiro: () => telaRespiro(t), forcada: () => telaForcada(t),
      unica: () => telaUnica(t), multipla: () => telaMultipla(t), semaforo: () => telaSemaforo(t), relatorio: telaRelatorio,
    }[t.tipo]();
    raiz.innerHTML = html;
    window.scrollTo(0, 0);
  }

  function chegarAoRelatorio() {
    // A participacao ja foi autorizada no contrato da oficina: sempre envia.
    if (enviado) envio = 'enviado';
    else { enviarRespostas(); return; }
    desenhar();
  }

  function avancar() {
    ir(posicao + 1);
    if (telas[posicao].tipo === 'relatorio') chegarAoRelatorio();
  }

  function aoClicar(evento) {
    const alvo = evento.target.closest('[data-acao]');
    if (!alvo) return;
    const { acao } = alvo.dataset;
    const t = telas[posicao];
    if (acao === 'comecar' || acao === 'seguir') avancar();
    else if (acao === 'identificar') {
      const nome = raiz.querySelector('#campo-nome');
      if (!nome?.value.trim()) { nome?.focus(); return; }
      respostas.nome = nome.value.trim().slice(0, 30);
      respostas.turma = ((raiz.querySelector('#campo-turma')?.value ?? '').trim() || TURMA_PADRAO).slice(0, 40);
      avancar();
    } else if (acao === 'forcada') {
      if (pendente) return;
      const r = respostas.estilos[t.indice];
      if (passo === 'mais') { r.mais = alvo.dataset.codigo; r.menos = null; passo = 'menos'; guardar(); desenhar(); return; }
      r.menos = alvo.dataset.codigo;
      guardar();
      alvo.classList?.add('marcada');
      agendar(avancar);
    } else if (acao === 'unica') {
      if (pendente) return;
      respostas[t.campo] = t.opcoes[Number(alvo.dataset.indice)].valor;
      guardar();
      alvo.classList?.add('marcada');
      agendar(avancar);
    } else if (acao === 'alternar') {
      const valor = t.opcoes[Number(alvo.dataset.indice)].valor;
      const lista = respostas[t.campo];
      const i = lista.indexOf(valor);
      // "Nao percebo" e "Ainda nao sei" nao combinam com as outras opcoes
      // e podem ser marcadas mesmo quando o limite ja foi atingido.
      const unico = { sinais: 'NADA', rede: 'NSEI' }[t.campo];
      if (unico && valor === unico && i < 0) respostas[t.campo] = [unico];
      else if (i >= 0) lista.splice(i, 1);
      else {
        const semUnico = lista.filter((v) => v !== unico);
        if (semUnico.length < t.max) respostas[t.campo] = [...semUnico, valor];
      }
      guardar();
      desenhar();
    } else if (acao === 'cor') {
      respostas.relacoes[alvo.dataset.area] = alvo.dataset.cor;
      guardar();
      desenhar();
    } else if (acao === 'reenviar') enviarRespostas();
    else if (acao === 'imprimir') window.print();
    else if (acao === 'apagar') {
      // Celular compartilhado: o proximo adolescente comeca do zero.
      try { sessionStorage.removeItem(CHAVE); } catch { /* nada a apagar */ }
      location.replace(location.pathname + (location.search ?? ''));
    }
    else if (acao === 'voltar') {
      if (t.tipo === 'forcada' && passo === 'menos') {
        respostas.estilos[t.indice] = { mais: null, menos: null };
        passo = 'mais';
        guardar();
        desenhar();
      } else ir(posicao - 1);
    }
  }

  function telaDaEquipe(token) {
    const recebido = decodificar(token);
    if (!recebido) {
      return '<div class="tela"><h1>Este link de resultado não abriu.</h1><p>O endereço chegou incompleto ou foi alterado. Copie o link inteiro da planilha e tente de novo.</p></div>';
    }
    return montarRelatorio(recebido.respostas, recebido.data, { visaoEquipe: true });
  }

  return {
    iniciar() {
      raiz.addEventListener('click', aoClicar);
      const hash = globalThis.location?.hash ?? '';
      if (hash.startsWith('#r=')) {
        raiz.innerHTML = telaDaEquipe(hash.slice(3));
        return;
      }
      const salvo = ler();
      if (estadoValido(salvo, telas)) {
        posicao = salvo.posicao;
        respostas = salvo.respostas;
        enviado = Boolean(salvo.enviado);
      }
      if (telas[posicao].tipo === 'relatorio') chegarAoRelatorio();
      else desenhar();
    },
  };
}
