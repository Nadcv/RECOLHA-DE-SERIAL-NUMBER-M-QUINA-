# 📷 Recolha de Serial Number – Máquinas

É uma aplicação para registo de serial number das máquinas grupos condensadores.

Aplicação para o telemóvel: regista o **serial**, o **grupo** e as **2 fotos das etiquetas**
(etiqueta grande e etiqueta pequena). O Google Apps Script cria um **PDF igual à folha em papel**,
com **QR code**, e envia-o por **email**.

<img src="docs/1-registar.png" width="260"> <img src="docs/ecras.png" width="560">

## Funcionalidades
- Fotos com a câmara ou da galeria, reduzidas no telemóvel (envio rápido)
- **Funciona sem rede**: guarda no telemóvel e envia sozinho quando houver ligação
- Leitura de **todos os campos** das etiquetas: por IA (Gemini, opcional) ou por OCR
- **Leitor de códigos de barras** com a câmara (serial e EAN exatos)
- **Rever / corrigir** os dados lidos antes de enviar
- Técnico, **cliente/obra**, local e observações em cada registo
- **Aviso de duplicados** quando o serial já foi registado
- PDF com o layout da folha (folha 1) + **folha 2 com os dados lidos**; QR code para a ficha
- **Folha de cálculo "Registo de Seriais"** no Drive com o histórico (uma linha por máquina)
- **Pesquisa** de registos (serial, modelo, cliente…)
- Relatório com **registos escolhidos** e **emails à escolha**
- **Etiquetas QR para imprimir** (PDF A4, 3 por linha)

## Estrutura
| Ficheiro | O que é |
|---|---|
| `index.html`, `sw.js`, `manifest.webmanifest`, `icons/` | A aplicação (publicada no GitHub Pages) |
| `apps-script/Codigo.gs`, `apps-script/Funcionalidades.gs`, `appsscript.json` | Servidor no Google Apps Script |
| `vendor/zxing.min.js` | Leitor de códigos de barras (ZXing, licença Apache 2.0) |
| `.github/workflows/servidor.yml` | Publica o servidor automaticamente |
| `apps-script/index.html` | Formulário alternativo dentro do Apps Script (ficheiro HTML `index`) |

## Instalação

### 1. Servidor – publicado automaticamente pelo GitHub
O código está em `apps-script/`. Sempre que muda, o GitHub Actions publica-o no Google Apps Script
(workflow **Publicar servidor**). Os dados privados ficam nos **Secrets** do GitHub, nunca no código.

**Configuração (uma vez):**
1. Ativar a **Google Apps Script API**: https://script.google.com/home/usersettings → *Ativado*.
2. Obter o login do `clasp` (ficheiro `.clasprc.json`) — num computador com Node.js:
   ```
   npx @google/clasp@2.4.2 login
   ```
   Autorizar no browser e abrir o ficheiro `~/.clasprc.json` (Windows: `C:\Users\<nome>\.clasprc.json`).
3. No GitHub: **Settings → Secrets and variables → Actions → New repository secret**:
   | Nome | Valor |
   |---|---|
   | `CLASPRC_JSON` | conteúdo completo do `.clasprc.json` |
   | `PASTA_ID` | ID da pasta do Drive (fim do URL da pasta) |
   | `EMAIL_DESTINO` | email(s) que recebem o relatório (`a@x.com,b@y.com`) |
   | `CODIGO_ACESSO` | PIN da aplicação |
4. **Actions → Publicar servidor → Run workflow.** No fim, o resumo mostra o `SCRIPT_ID`, o
   `DEPLOYMENT_ID` e o **URL do servidor**. Guardar `SCRIPT_ID` e `DEPLOYMENT_ID` também como Secrets
   (assim as próximas publicações atualizam o mesmo projeto e o URL não muda).
5. Abrir https://script.google.com → projeto **Recolha de Serial Number** → executar a função
   **`autorizar`** uma vez (autoriza Drive/Docs/Gmail e cria o envio diário às 18h).

<details><summary>Alternativa manual (sem GitHub Actions)</summary>

script.google.com → Novo projeto → colar `apps-script/Codigo.gs`, ficheiro HTML `index` e preencher o
`CONFIG`; Serviços (+) → Drive API; Implementar → Aplicação Web → Executar como **Eu** → Acesso
**Qualquer pessoa**.
</details>

### 2. Aplicação (GitHub Pages)
Settings → Pages → *Deploy from a branch* → escolher o ramo deste código e a pasta `/ (root)` → Save.
Em 1–2 minutos fica disponível em `https://<utilizador>.github.io/<repositório>/`.

### 3. Instalar no telemóvel
- **iPhone (Safari):** abrir o link → Partilhar ⬆️ → *Adicionar ao ecrã principal*
- **Android (Chrome):** abrir o link → menu ⋮ → *Instalar aplicação*
- Na 1.ª vez abre em **Definições**: colar o URL `/exec` e o PIN → *Guardar e testar ligação*

O URL e o PIN ficam guardados apenas no telemóvel — não estão no código.

## Atualizar a aplicação
Alterar os ficheiros e aumentar a versão em `sw.js` (`CACHE`) e em `index.html` (`VERSAO`).
