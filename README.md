# 📷 Recolha de Serial Number – Máquinas

É uma aplicação para registo de serial number das máquinas grupos condensadores.

Aplicação para o telemóvel: regista o **serial**, o **grupo** e as **2 fotos das etiquetas**
(etiqueta grande e etiqueta pequena). O Google Apps Script cria um **PDF igual à folha em papel**,
com **QR code**, e envia-o por **email**.

<img src="docs/1-registar.png" width="260"> <img src="docs/ecras.png" width="560">

## Funcionalidades
- Fotos com a câmara ou da galeria, reduzidas no telemóvel (envio rápido)
- **Funciona sem rede**: guarda no telemóvel e envia sozinho quando houver ligação
- Leitura automática da etiqueta (OCR): modelo, serial, EAN, voltagem…
- PDF com o layout da folha: SERIAL NO · INFORMAÇÃO DO GRUPO · Foto 1 · Foto 2 · QR code
- O QR abre uma ficha no telemóvel com os dados e as fotos
- Lista de registos (no telemóvel / por enviar / enviados) e botão "Enviar relatório agora"

## Estrutura
| Ficheiro | O que é |
|---|---|
| `index.html`, `sw.js`, `manifest.webmanifest`, `icons/` | A aplicação (publicada no GitHub Pages) |
| `apps-script/Codigo.gs` | Servidor no Google Apps Script |
| `apps-script/index.html` | Formulário alternativo dentro do Apps Script (ficheiro HTML `index`) |

## Instalação

### 1. Servidor (Google Apps Script)
1. [script.google.com](https://script.google.com) → **Novo projeto** → colar `apps-script/Codigo.gs`.
   Ficheiros (+) → HTML → nome `index` → colar `apps-script/index.html`.
2. No `CONFIG`: `PASTA_ID` (pasta do Drive), `EMAIL_DESTINO`, `CODIGO_ACESSO` (PIN).
   > ⚠️ Este repositório é público: **não faças commit** do teu PIN nem do ID da pasta.
3. Serviços (+) → **Drive API** (para a leitura automática das etiquetas).
4. Implementar → Nova implementação → **Aplicação Web** → Executar como **Eu** → Acesso **Qualquer pessoa**.
5. Copiar o URL `/exec` para `WEB_APP_URL` → Gerir implementações → **Nova versão**.
6. (Opcional) Executar `criarAgendamentoDiario` para enviar o relatório todos os dias às 18h.

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
