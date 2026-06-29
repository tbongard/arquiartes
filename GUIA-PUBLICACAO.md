# 🚀 Guia de publicação — ARQUIARTES (grátis, com edição ao vivo)

Objetivo: deixar o site no ar de graça e permitir que a **Laísa publique sozinha** as
alterações feitas no painel (`gerenciar.html`), ao vivo.

Como funciona o conjunto:
- **GitHub** guarda os arquivos do site.
- **Netlify** hospeda de graça e **republica sozinha** sempre que o conteúdo muda no GitHub.
- O **painel** (botão "Publicar no site") envia o conteúdo para o GitHub → site atualiza em ~1 min.

Faça os passos 1 a 4 **uma vez**. Depois, publicar é só um clique.

---

## Passo 1 — Subir o site no GitHub
1. Crie conta em [github.com](https://github.com) (grátis).
2. Crie um repositório: botão **New** → nome, por exemplo, `arquiartes` → pode deixar **Public** → **Create repository**.
3. Envie os arquivos da pasta `arquiartes` para o repositório. Duas formas:
   - **Fácil (sem comandos):** na página do repositório, clique em **Add file → Upload files**, arraste **todo o conteúdo da pasta `arquiartes`** (index.html, gerenciar.html, as pastas css/js/assets) e confirme (**Commit changes**).
   - **Com Git (dev):**
     ```bash
     cd "arquiartes"
     git init && git add . && git commit -m "Site ARQUIARTES"
     git branch -M main
     git remote add origin https://github.com/SEU-USUARIO/arquiartes.git
     git push -u origin main
     ```

## Passo 2 — Hospedar na Netlify
1. Crie conta em [netlify.com](https://netlify.com) (pode entrar com o GitHub).
2. **Add new site → Import an existing project → GitHub** → autorize e escolha o repositório `arquiartes`.
3. Não precisa configurar build (é site estático). Clique em **Deploy**.
4. Em segundos o site fica no ar num endereço tipo `https://arquiartes.netlify.app`.
   - Para trocar o nome: **Site configuration → Change site name**.
   - Para usar domínio próprio (`arquiartes.com.br`): **Domain management** (o domínio custa ~R$40/ano no registro.br; a hospedagem continua grátis).

> A partir daqui, **toda mudança no GitHub republica o site automaticamente.**

## Passo 3 — Criar o token de publicação (GitHub)
Isso permite o painel enviar o conteúdo ao GitHub com segurança.
1. No GitHub: **Foto do perfil → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Configure:
   - **Token name:** `painel-arquiartes`
   - **Expiration:** 1 ano (renove quando vencer)
   - **Repository access:** *Only select repositories* → escolha **`arquiartes`**
   - **Permissions → Repository permissions → Contents:** **Read and write**
3. **Generate token** e **copie** o código (começa com `github_pat_...`). Guarde — ele só aparece uma vez.

## Passo 4 — Conectar o painel
1. Abra o painel: `gerenciar.html` (ou `https://SEU-SITE.netlify.app/gerenciar.html`).
2. Entre como **admin** (usuário `admin`, senha `bomjardim` — troque depois).
3. Vá na aba **Avançado → Publicação online (GitHub)** e preencha:
   - **Repositório:** `SEU-USUARIO/arquiartes`
   - **Branch:** `main`
   - **Caminho do arquivo:** `assets/conteudo.js`
   - **Token de acesso:** cole o `github_pat_...`
4. Clique em **Testar conexão** (deve dizer "Conexão OK") e depois **Salvar configuração**.

✅ Pronto! O token fica salvo **só nesse navegador** (não vai para o site público).

---

## Como a Laísa publica (dia a dia)
1. Abrir `gerenciar.html` e entrar (usuário `laisa`).
2. Editar textos e fotos nas seções.
3. (Opcional) **Pré-visualizar** para conferir.
4. Clicar em **Publicar no site** → o site atualiza sozinho em ~1 minuto. 🎉

> Para a Laísa publicar do computador dela, faça o **Passo 4** no navegador dela uma vez
> (configurar repositório + token). Depois é só "Publicar no site".

---

## Segurança — leia
- O **token** dá permissão de escrita **apenas neste repositório** (graças ao "fine-grained").
  No pior caso (token vazado), alguém só conseguiria mexer no conteúdo deste site — nada da sua conta.
- O token **não fica no código** do site: vive apenas no navegador de quem configurou.
  Em computador compartilhado, use **"Esquecer token"** ao terminar.
- As **senhas do painel** (`laisa` / `admin`) ficam no arquivo `js/gerenciar.js`. **Troque-as.**
  Por serem client-side, são uma proteção leve (ofusca, não blinda). Para login forte de verdade,
  seria preciso um backend — dá para evoluir depois.

## Limite de fotos
A publicação envia tudo num único arquivo (`conteudo.js`), com as fotos embutidas e já
comprimidas. Para um site institucional com poucas fotos, funciona muito bem. Se um dia houver
**muitas fotos pesadas**, o ideal é salvá-las como arquivos separados — me chame para ajustar.
