# Meu Mapa — Especificação (2026-09-30)

Projeto derivado do Mapa de Perfil (DEL/Lótus), feito em regime de urgência para a
oficina "Meu Futuro Começa em Mim — Encontro 2: Como eu me cuido e me conecto".
Luciano delegou ideia, especificação, plano e testes.

## Objetivo
Adolescentes respondem no celular (~8 min), veem o próprio relatório, e a equipe
recebe as respostas numa planilha para preparar o próximo encontro.

## Instrumento (conteúdo dos slides da oficina)
- 6 situações × 4 jeitos de reagir (escolha forçada mais/menos): Falar na hora,
  Pensar antes, Dar um tempo, Buscar apoio. Empate: essa ordem.
- Emoção que mais apareceu (6), termômetro 0–5 (slide 7), sinais do corpo (até 3; slide 6).
- Ferramentas que já usa (até 6; slide 9) → 2 sugestões ligadas à emoção, nunca repetidas.
- Frase para pedir ajuda (slide 13).
- Semáforo das relações em casa, amizades e escola (slide 11). Rede de apoio (até 8).

## Regra de ATENÇÃO
Termômetro ≥ 4, ou qualquer relação no vermelho, ou termômetro 3 sem rede de apoio.
Mostra quadro de apoio em destaque (adulto de confiança, equipe, CVV 188, Disque 100)
e marca "SIM" na planilha. O quadro de apoio aparece sempre, discreto, sem alerta.

## Dados e privacidade
- Envio sempre: a participação e o uso das ferramentas já estão autorizados no contrato
  da oficina (decisão de Luciano, 30/09). A abertura informa que as respostas vão para a equipe.
- Turma padrão: "Meu Futuro Começa em Mim" (outra turma via ?turma=).
- Backend Apps Script só grava (sem rota de leitura). Textos cortados em 300 caracteres
  e protegidos contra fórmula (prefixo ').
- A planilha guarda o link do relatório (respostas compactadas depois do `#`).
- Um envio por sessão: recarregar o relatório não duplica a linha.
- Autorização dos responsáveis: modelo em AUTORIZACAO_RESPONSAVEIS.md.

## Fora de escopo (hoje)
Painel da turma, gráficos agregados, login da equipe, apagar respostas pelo sistema.
