# Meu Mapa — Oficina Meu Futuro Começa em Mim

Versão do Mapa de Perfil (DEL / Lótus) para adolescentes, alinhada ao Encontro 2
da oficina: **como eu me cuido e me conecto**. Leva cerca de 8 minutos no celular.

- **Link para a turma:** https://lucianocabralsf.github.io/meu-mapa-oficina/
- **Link já com a turma preenchida:** https://lucianocabralsf.github.io/meu-mapa-oficina/?turma=Turma%20A
  (troque "Turma%20A" pelo nome da turma; `%20` é o espaço)
- **Planilha das respostas (só da equipe):** https://docs.google.com/spreadsheets/d/11QhpQAOz1LBQC9Fdnn6syeJqiE0jwctRseb075m-gl8/edit

## O que o adolescente faz

1. Nome ou apelido, turma (opcional) e **se aceita** enviar as respostas para a equipe.
2. **Como eu reajo:** 6 situações do dia a dia, escolhendo o que mais e o que menos faria.
3. **O que eu sinto:** emoção que mais apareceu, termômetro emocional (0 a 5) e onde o corpo avisa.
4. **Como eu me cuido:** ferramentas que já usa e a frase para pedir ajuda.
5. **Com quem eu conto:** semáforo das relações (casa, amizades, escola) e rede de apoio.
6. Vê o relatório **Meu Mapa** no celular, pode salvar em PDF.

## O que a equipe recebe

Uma linha por adolescente que **aceitou** enviar, na planilha acima. A coluna
**ATENÇÃO** fica vermelha quando aparecer: termômetro 4 ou 5, alguma relação no
**vermelho**, ou termômetro 3 sem ninguém na rede de apoio. A última coluna tem
o **link do relatório**: clique para ver o relatório completo daquele adolescente.

**Quem não aceitar enviar vê o próprio resultado e nada vai para a planilha.**

## ⚠️ Autorização única (só o dono da conta pode fazer)

Na primeira vez, o Google exige autorização para o sistema gravar na planilha:

1. Abra https://script.google.com/d/1IUvuytBRrqqjACYo9PMThsdLBn7vDAmG9MxuheMR-x7w9L3K8XtzG0Oi/edit
2. No alto, escolha a função **autorizar** e clique em **Executar**.
3. Clique em **Revisar permissões**, escolha a conta diretoriaadmlotus@gmail.com.
4. Aparece "O Google não verificou este app": clique em **Avançado** → **Acessar Meu Mapa Oficina (não seguro)** → **Permitir**.
   Esse aviso é normal: o app é seu e foi criado por você.

Pronto. A partir daí, cada envio vira uma linha na planilha.

## Cuidados (dados de adolescentes)

- Colete a **autorização dos responsáveis** antes (modelo em `AUTORIZACAO_RESPONSAVEIS.md`).
- A planilha deve ficar compartilhada só com a equipe. O endereço que recebe as respostas **só grava**: ninguém consegue ler as respostas por ele.
- Linhas com **ATENÇÃO** pedem uma conversa cuidadosa com o adolescente e, se houver sinal de violência ou risco, o encaminhamento previsto pela instituição (Conselho Tutelar, rede de proteção).
- Não é teste psicológico nem diagnóstico: é uma ferramenta de autoconhecimento da oficina.

## Na hora da oficina

- **Celular emprestado ou compartilhado:** ao terminar, peça para tocar em **"Terminar e apagar deste celular"**. Assim o próximo adolescente começa do zero e não vê o resultado de quem respondeu antes.
- **Para voltar uma pergunta,** use o **"‹ voltar"** da própria página. O botão de voltar do celular sai do site.
- **Se alguém não usa nenhuma ferramenta,** oriente a marcar a que mais se aproxima.
- **Linhas repetidas** (mesmo nome, mesma hora e mesmo link) são o mesmo adolescente: acontece se o celular recarregar durante o envio.
- **Quem não aceitou enviar** não aparece na planilha. Mesmo assim, o celular dessa pessoa mostra o quadro de apoio (CVV 188, Disque 100, 190 e 192). Vale uma checagem verbal com o grupo todo no fechamento.

## Para quem mexe no código

- `npm test` roda os testes automáticos (motor, link, envio, relatório, telas e backend).
- `apps-script/backend.js` é o recebedor (Google Apps Script, vinculado à planilha). Publicar mudança: `clasp push -f && clasp create-version "vN" && clasp update-deployment AKfycbzFu0CKF_j9nSO2wBepIQVU6piEI6ETp8-AkCokk9FU3zSd13qURMGTYg3T444SY7pU -V N`.
