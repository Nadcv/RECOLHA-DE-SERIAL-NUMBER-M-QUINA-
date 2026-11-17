/**
 * RELATÓRIO DE SERIAIS (fotos de etiquetas) -> PDF -> EMAIL
 * ---------------------------------------------------------
 * Como organizar as fotos no Google Drive:
 *
 *   📁 Seriais (pasta principal  ->  PASTA_ID)
 *      📁 162744 - 30 VE          <- nome = "SERIAL - GRUPO"
 *          🖼 foto1.jpg            <- etiqueta Danfoss, folha, etc.
 *          🖼 foto2.jpg
 *      📁 162745 - 25 VE
 *          🖼 ...
 *
 * Cada subpasta vira UMA página no PDF, igual à folha em papel (2 fotos):
 *   ┌──────────────────┐            [QR]
 *   │ SERIAL NO: 162744│
 *   └──────────────────┘
 *              ┌────────────────────────────┐
 *              │ INFORMAÇÃO DO GRUPO: 30 VE │
 *              └────────────────────────────┘
 *                            ⇩
 *        ┌─────────────────────────────────┐
 *        │  FOTO 1 – etiqueta grande       │
 *        └─────────────────────────────────┘
 *   ┌───────────────────────────────────────────┐
 *   │  FOTO 2 – etiqueta pequena                │
 *   └───────────────────────────────────────────┘
 *
 * Fotos na pasta: "foto1..." = moldura de cima, "foto2..." = moldura de baixo.
 * (Sem esses nomes, usa a 1.ª e a 2.ª foto por ordem alfabética.)
 *
 * Depois de enviado, as subpastas são movidas para "Enviados" (para não repetir).
 *
 * APLICAÇÃO NO TELEMÓVEL (pasta "app"): usa a função doPost deste ficheiro como servidor.
 *   A Aplicação Web tem de estar com acesso "Qualquer pessoa" (o PIN protege o acesso).
 *
 * INSTALAÇÃO (2 ficheiros no projeto)
 *  1. script.google.com -> Novo projeto:
 *       - Código.gs  -> colar este código
 *       - Ficheiros (+) -> HTML -> nome "index" -> colar o index.html
 *  2. Preencher o CONFIG abaixo.
 *  3. (Opcional, para OCR) Serviços (+) -> "Drive API" -> Adicionar.
 *  4. Executar "enviarRelatorio" e autorizar.
 *  5. (Opcional) Executar "criarAgendamentoDiario" para correr todos os dias.
 *
 * PÁGINA NO TELEMÓVEL (o QR abre esta página)
 *  6. Implementar -> Nova implementação -> Tipo: "Aplicação Web"
 *       Executar como: "Eu"
 *       Quem tem acesso: "Qualquer pessoa"  (ou "Qualquer pessoa com Conta Google"
 *                        / só a tua organização, se quiseres restringir)
 *  7. Copiar o URL que termina em /exec para WEB_APP_URL no CONFIG.
 *  8. Executar "testarPagina" para ver o link de um serial no registo de execução.
 *
 * FORMULÁRIO NO TELEMÓVEL (tirar fotos e registar o serial)
 *  9. Definir CODIGO_ACESSO no CONFIG e voltar a implementar
 *     (Implementar -> Gerir implementações -> editar -> Versão: Nova versão).
 * 10. Executar "linkFormulario", abrir o link no telemóvel e
 *     "Adicionar ao ecrã principal" para ficar como uma app.
 */

// Publicado automaticamente pelo GitHub Actions: os valores privados (pasta, email, PIN)
// vêm dos Secrets do GitHub e são aplicados pelo ficheiro Segredos.gs (gerado na publicação).
const CONFIG = {
  PASTA_ID: 'COLE_AQUI_O_ID_DA_PASTA',     // parte final do URL da pasta no Drive
  EMAIL_DESTINO: 'destino@exemplo.com',     // vários: 'a@x.com,b@y.com'
  ASSUNTO: 'Relatório de Seriais',
  USAR_OCR: true,                           // precisa do serviço "Drive API"
  MOVER_PARA_ENVIADOS: true,
  GERAR_QR: true,                           // QR code em cada página
  QR_DESTINO: 'pagina',                     // 'pagina' = página no telemóvel | 'pasta' = pasta do Drive
  WEB_APP_URL: '',                          // URL /exec da Aplicação Web (passo 7)
  TITULO_PAGINA: 'Ficha do equipamento',
  CODIGO_ACESSO: '1234',                    // PIN pedido no formulário (MUDA ISTO!)
  OCR_AO_REGISTAR: true,                    // lê a etiqueta logo após o registo
  QR_LINK_PUBLICO: false,                   // só para QR_DESTINO 'pasta': true = qualquer pessoa vê a pasta
  GUARDAR_FICHA_NA_PASTA: true,             // guarda "Ficha_<serial>.pdf" dentro da pasta do serial
  // Molduras da folha (pontos; A4 útil ≈ 515 x 770)
  FOLHA_DADOS: true,
  GEMINI_API_KEY: '',                       // chave grátis em aistudio.google.com: lê TUDO das etiquetas com IA
  GEMINI_MODELO: '',                        // vazio = escolhe automaticamente o modelo "flash" mais recente                        // 2.ª folha com os dados lidos nas fotos
  MOLDURA1: { largura: 400, altura: 265 },  // Foto 1 – etiqueta grande (placa de características)
  MOLDURA2: { largura: 515, altura: 185 },  // Foto 2 – etiqueta pequena (código de barras)
};

/* ===================== FUNÇÃO PRINCIPAL ===================== */

function enviarRelatorio() {
  // Evita dois envios ao mesmo tempo (app + agendamento)
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Já está a ser enviado um relatório. Tente daqui a pouco.');
  try { return enviarRelatorio__(); } finally { lock.releaseLock(); }
}

function enviarRelatorio__() {
  const pasta = DriveApp.getFolderById(CONFIG.PASTA_ID);
  const itens = lerSubpastas_(pasta);

  if (itens.length === 0) {
    Logger.log('Nenhuma subpasta com fotos para enviar.');
    return 0;
  }

  const data = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
  const nome = `${CONFIG.ASSUNTO} ${data}`;

  // 1) Criar o documento
  const doc = DocumentApp.create(nome);
  const body = doc.getBody();
  body.setMarginTop(30).setMarginBottom(24).setMarginLeft(40).setMarginRight(40);
  body.clear();

  itens.forEach((item, i) => {
    if (CONFIG.USAR_OCR) {
      // reaproveita a leitura feita no registo (evita ler duas vezes)
      let info = {};
      try { info = JSON.parse(item.pasta.getDescription() || '{}'); } catch (e) {}
      const r = (info.campos && info.campos.length && info.nFotos === item.fotos.length)
        ? { dados: info.dados || {}, campos: info.campos, texto: info.texto || '', fonte: info.fonte }
        : analisarEtiquetas_(item.fotos);
      Object.assign(item, { dados: r.dados, campos: r.campos, textoOCR: r.texto, fonte: r.fonte });
    }
    if (CONFIG.GERAR_QR) prepararQR_(item);
    montarPagina_(body, item);
    if (i < itens.length - 1) body.appendPageBreak();
  });

  // Remove o parágrafo vazio inicial
  const primeiro = body.getChild(0);
  if (primeiro.getType() === DocumentApp.ElementType.PARAGRAPH && primeiro.asParagraph().getText() === '' && body.getNumChildren() > 1) {
    primeiro.removeFromParent();
  }
  doc.saveAndClose();

  // 2) Converter para PDF
  const docFile = DriveApp.getFileById(doc.getId());
  const pdf = docFile.getAs(MimeType.PDF).setName(nome + '.pdf');

  // 3) Enviar email
  MailApp.sendEmail({
    to: CONFIG.EMAIL_DESTINO,
    subject: `${CONFIG.ASSUNTO} – ${itens.length} serial(is) – ${data}`,
    htmlBody: corpoEmail_(itens),
    attachments: [pdf],
  });

  // 4) Ficha individual dentro da pasta de cada serial (é o que o QR abre)
  if (CONFIG.GUARDAR_FICHA_NA_PASTA) itens.forEach(guardarFicha_);

  // 5) Arrumar
  pasta.createFile(pdf);          // guarda uma cópia do PDF na pasta principal
  docFile.setTrashed(true);       // apaga o Google Doc temporário
  if (CONFIG.MOVER_PARA_ENVIADOS) {
    const enviados = obterOuCriarPasta_(pasta, 'Enviados');
    itens.forEach(it => it.pasta.moveTo(enviados));
  }

  Logger.log(`Enviado: ${itens.length} serial(is) para ${CONFIG.EMAIL_DESTINO}`);
  return itens.length;
}

/* ===================== LEITURA DAS PASTAS ===================== */

function lerSubpastas_(pasta) {
  const lista = [];
  const subs = pasta.getFolders();
  while (subs.hasNext()) {
    const sub = subs.next();
    const nomePasta = sub.getName();
    if (nomePasta === 'Enviados') continue;

    // "162744 - 30 VE"  ->  serial = 162744 , grupo = 30 VE
    const partes = nomePasta.split(/\s*[-–_]\s*/);
    const serial = partes.shift().trim();
    const grupo = partes.join(' ').trim();

    const fotos = [];
    const files = sub.getFiles();
    while (files.hasNext()) {
      const f = files.next();
      if (f.getMimeType().indexOf('image/') === 0) fotos.push(f);
    }
    if (fotos.length === 0) continue;

    fotos.sort((a, b) => a.getName().localeCompare(b.getName()));
    const [foto1, foto2] = escolherFotos_(fotos);
    lista.push({ pasta: sub, serial, grupo, fotos, foto1, foto2, dados: null });
  }
  lista.sort((a, b) => a.serial.localeCompare(b.serial, undefined, { numeric: true }));
  return lista;
}

/** Foto 1 = nome começa por "foto1", Foto 2 = "foto2"; senão, por ordem. */
function escolherFotos_(fotos) {
  const f1 = fotos.find(f => /^foto1[_.\s-]/i.test(f.getName()));
  const f2 = fotos.find(f => /^foto2[_.\s-]/i.test(f.getName()));
  const resto = fotos.filter(f => f !== f1 && f !== f2);
  return [f1 || resto.shift() || null, f2 || resto.shift() || null];
}

/* ===================== LAYOUT DA PÁGINA ===================== */

function montarPagina_(body, item) {
  if (!item.foto1 && item.fotos) [item.foto1, item.foto2] = escolherFotos_(item.fotos);

  // 1) SERIAL NO (caixa à esquerda) + QR code à direita
  const l1 = tabelaInvisivel_(body, [300, 215]);
  caixaTexto_(l1[0], [['SERIAL NO: ', 15, '#000000'], [item.serial, 22, '#1a3d8f']]);
  if (item.qr) {
    const pq = l1[1].getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
    pq.appendInlineImage(item.qr.copyBlob()).setWidth(80).setHeight(80);
    const pl = l1[1].appendParagraph('Ver ficha').setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
    pl.editAsText().setFontSize(7).setForegroundColor('#666666').setLinkUrl(item.link);
  }
  espaco_(body, 14);

  // 2) INFORMAÇÃO DO GRUPO (caixa ao centro-direita)
  const l2 = tabelaInvisivel_(body, [170, 345]);
  caixaTexto_(l2[1], [['INFORMAÇÃO DO GRUPO: ', 11, '#000000'], [item.grupo || '—', 15, '#1a3d8f']]);

  // 3) Seta
  const seta = body.appendParagraph('⇩').setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  seta.editAsText().setFontSize(24).setForegroundColor('#333333');
  seta.setSpacingBefore(0).setSpacingAfter(0);

  // 4) Moldura 1 – etiqueta grande (centrada)
  const m = CONFIG.MOLDURA1;
  const lado = Math.round((515 - m.largura) / 2);
  const l3 = tabelaInvisivel_(body, [lado, m.largura, lado]);
  moldura_(l3[1], item.foto1, m, 'Foto 1 – etiqueta grande');
  espaco_(body, 18);

  // 5) Moldura 2 – etiqueta pequena (largura toda)
  moldura_(body, item.foto2, CONFIG.MOLDURA2, 'Foto 2 – etiqueta pequena');

  // 6) Segunda folha: dados lidos das etiquetas
  if (CONFIG.FOLHA_DADOS) {
    const quebra = body.appendParagraph('').setSpacingBefore(0).setSpacingAfter(0);
    quebra.appendPageBreak();
    quebra.editAsText().setFontSize(1);
    montarFolhaDados_(body, item);
  }
}

const CAMPOS_ETIQUETA_ = [
  ['modelo', 'Modelo'], ['codigo', 'Código'], ['serial', 'Serial (etiqueta)'], ['ean', 'Código de barras (EAN)'],
  ['voltagem', 'Tensão'], ['refrigerante', 'Refrigerante'], ['ano', 'Ano de fabrico'],
];

/** Folha 2: tabela com o que foi lido nas fotos (OCR) + o texto completo. */
function montarFolhaDados_(body, item) {
  const d = item.dados || {};
  const titulo = body.appendParagraph('DADOS LIDOS DAS ETIQUETAS');
  titulo.editAsText().setBold(true).setFontSize(15).setForegroundColor('#000000');
  titulo.setSpacingBefore(0).setSpacingAfter(4);
  const sub = body.appendParagraph(`Serial ${item.serial}  ·  Grupo ${item.grupo || '—'}` +
                                   (item.enviadoEm ? `  ·  ${item.enviadoEm}` : ''));
  sub.editAsText().setBold(false).setFontSize(10).setForegroundColor('#555555');
  sub.setSpacingAfter(10);

  const lidos = (item.campos && item.campos.length) ? item.campos
    : CAMPOS_ETIQUETA_.map(([k, nome]) => [nome, d[k] || '—']);
  const linhas = [['SERIAL NO', item.serial || '—'], ['INFORMAÇÃO DO GRUPO', item.grupo || '—']]
    .concat(lidos.map(([n, v]) => [String(n), String(v || '—')]));
  const t = body.appendTable(linhas);
  t.setBorderWidth(1).setBorderColor('#999999');
  for (let r = 0; r < t.getNumRows(); r++) {
    const c0 = t.getCell(r, 0).setWidth(190).setBackgroundColor('#f0f2f6');
    const c1 = t.getCell(r, 1);
    [c0, c1].forEach(c => c.setPaddingTop(5).setPaddingBottom(5).setPaddingLeft(8));
    c0.editAsText().setBold(true).setFontSize(10).setForegroundColor('#333333');
    const vazio = linhas[r][1] === '—';
    c1.editAsText().setBold(!vazio).setFontSize(11).setForegroundColor(vazio ? '#aaaaaa' : '#1a3d8f');
  }

  const nLidos = lidos.filter(l => l[1] && l[1] !== '—').length;
  const nota = body.appendParagraph(nLidos
    ? `${nLidos} campos lidos automaticamente ${item.fonte === 'IA' ? 'por IA' : 'por OCR'}. Confirme com as fotos da folha anterior.`
    : 'Não foi possível ler dados nas fotos. Tire as fotos de perto, direitas e com boa luz.');
  nota.editAsText().setBold(false).setFontSize(9).setForegroundColor('#777777');
  nota.setSpacingBefore(8);

  if (item.fonte !== 'IA' && item.textoOCR && item.textoOCR.trim()) {
    const h = body.appendParagraph('Texto completo lido nas fotos');
    h.editAsText().setBold(true).setFontSize(10).setForegroundColor('#333333');
    h.setSpacingBefore(16).setSpacingAfter(4);
    const txt = item.textoOCR.replace(/\n{3,}/g, '\n\n').trim().slice(0, 4000);
    const p = body.appendParagraph(txt);
    p.editAsText().setBold(false).setFontSize(8).setForegroundColor('#555555').setFontFamily('Courier New');
  }
}

/** Tabela sem bordas, só para posicionar as caixas. Devolve as células. */
function tabelaInvisivel_(container, larguras) {
  const t = container.appendTable([larguras.map(() => '')]);
  t.setBorderWidth(0).setBorderColor('#ffffff');
  return larguras.map((w, i) => {
    const c = t.getCell(0, i).setWidth(w).setPaddingTop(0).setPaddingBottom(0).setPaddingLeft(0).setPaddingRight(0);
    c.getChild(0).asParagraph().setSpacingBefore(0).setSpacingAfter(0);
    return c;
  });
}

/** Caixa com borda e texto (rótulo + valor), dentro de uma célula ou do corpo. */
function caixaTexto_(container, partes) {
  const t = container.appendTable([['']]);
  t.setBorderWidth(1).setBorderColor('#000000');
  const cell = t.getCell(0, 0).setPaddingTop(8).setPaddingBottom(8).setPaddingLeft(10).setPaddingRight(6);
  const p = cell.getChild(0).asParagraph().setSpacingBefore(0).setSpacingAfter(0);
  partes.forEach(([texto, tam, cor]) => p.appendText(texto).setBold(true).setFontSize(tam).setForegroundColor(cor));
  limparParagrafoInicial_(container);
}

/** Moldura com borda e a foto ajustada lá dentro. */
function moldura_(container, foto, tam, legenda) {
  const t = container.appendTable([['']]);
  t.setBorderWidth(1).setBorderColor('#000000');
  t.getRow(0).setMinimumHeight(tam.altura);
  const cell = t.getCell(0, 0).setWidth(tam.largura).setPaddingTop(4).setPaddingBottom(4)
                .setVerticalAlignment(DocumentApp.VerticalAlignment.CENTER);
  const p = cell.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  if (!foto) {
    p.appendText('(' + legenda + ' em falta)').setFontSize(10).setForegroundColor('#999999');
  } else {
    try {
      const img = p.appendInlineImage(blobImagem_(foto));
      const k = Math.min((tam.largura - 12) / img.getWidth(), (tam.altura - 10) / img.getHeight());
      img.setWidth(Math.round(img.getWidth() * k)).setHeight(Math.round(img.getHeight() * k));
    } catch (e) {
      p.appendText(`[Não foi possível inserir ${foto.getName()}: ${e.message}]`).setFontSize(9);
    }
  }
  limparParagrafoInicial_(container);
}

/** Dentro de uma célula, o parágrafo vazio antes da tabela encolhe para não ocupar espaço. */
function limparParagrafoInicial_(container) {
  if (container.getType && container.getType() === DocumentApp.ElementType.TABLE_CELL) {
    for (let i = 0; i < container.getNumChildren(); i++) {
      const c = container.getChild(i);
      if (c.getType() === DocumentApp.ElementType.PARAGRAPH && c.asParagraph().getText() === '') {
        c.asParagraph().setSpacingBefore(0).setSpacingAfter(0).editAsText().setFontSize(1);
      }
    }
  }
}

function espaco_(body, pts) {
  const p = body.appendParagraph(' ').setSpacingBefore(0).setSpacingAfter(0);
  p.editAsText().setFontSize(Math.max(1, Math.round(pts * 0.75)));
}

/* ===================== QR CODE ===================== */

/**
 * Guarda os dados do serial na descrição da pasta (a página lê daí) e cria o QR.
 * O link usa o ID da pasta (impossível de adivinhar) e não muda ao mover para "Enviados".
 */
function prepararQR_(item) {
  try {
    guardarDadosNaPasta_(item);
    const webApp = CONFIG.WEB_APP_URL || ScriptApp.getService().getUrl();
    if (CONFIG.QR_DESTINO === 'pagina' && webApp) {
      item.link = webApp + '?id=' + item.pasta.getId();
    } else {
      if (CONFIG.QR_LINK_PUBLICO) {
        item.pasta.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      }
      item.link = item.pasta.getUrl();
    }
    const url = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&data=' +
                encodeURIComponent(item.link);
    item.qr = UrlFetchApp.fetch(url).getBlob().setName('qr_' + item.serial + '.png');
  } catch (e) {
    Logger.log('QR falhou para ' + item.serial + ': ' + e.message);
  }
}

function guardarDadosNaPasta_(item) {
  item.enviadoEm = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
  item.pasta.setDescription(JSON.stringify({
    serial: item.serial, grupo: item.grupo, dados: item.dados || {}, enviadoEm: item.enviadoEm,
    campos: (item.campos || []).slice(0, 60), fonte: item.fonte || '',
    texto: (item.textoOCR || '').slice(0, 3000), nFotos: item.fotos ? item.fotos.length : undefined,
  }));
}

/** Cria Ficha_<serial>.pdf dentro da pasta do serial (substitui a anterior). */
function guardarFicha_(item) {
  try {
    const nome = 'Ficha_' + item.serial;
    const doc = DocumentApp.create(nome);
    const body = doc.getBody();
    body.setMarginTop(30).setMarginBottom(24).setMarginLeft(40).setMarginRight(40);
    montarPagina_(body, item);
    doc.saveAndClose();
    const f = DriveApp.getFileById(doc.getId());
    const antigos = item.pasta.getFilesByName(nome + '.pdf');
    while (antigos.hasNext()) antigos.next().setTrashed(true);
    item.pasta.createFile(f.getAs(MimeType.PDF).setName(nome + '.pdf'));
    f.setTrashed(true);
  } catch (e) {
    Logger.log('Ficha falhou para ' + item.serial + ': ' + e.message);
  }
}

/**
 * Usa a miniatura do Drive em 1600px: o PDF fica leve e funciona com
 * fotos HEIC do iPhone (que o Google Docs não aceita diretamente).
 */
function blobImagem_(file) {
  try {
    const url = `https://drive.google.com/thumbnail?id=${file.getId()}&sz=w1600`;
    const res = UrlFetchApp.fetch(url, {
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true,
    });
    if (res.getResponseCode() === 200 && res.getBlob().getBytes().length > 1000) {
      return res.getBlob().setName(file.getName());
    }
  } catch (e) { /* usa o original */ }
  return file.getBlob();
}

/* ===================== OCR DA ETIQUETA ===================== */

/**
 * Lê as etiquetas. Com GEMINI_API_KEY usa IA (lê todos os campos, mesmo desalinhados);
 * sem chave (ou se falhar) usa o OCR do Google Drive + reconhecimento dos campos conhecidos.
 * Devolve { dados: {modelo, codigo, ...}, campos: [[nome, valor], ...], texto, fonte }.
 */
function analisarEtiquetas_(fotos) {
  fotos = escolherFotos_(fotos).filter(Boolean);
  if (!fotos.length) return { dados: {}, campos: [], texto: '', fonte: '' };
  if (CONFIG.GEMINI_API_KEY) {
    try { return lerComGemini_(fotos); } catch (e) { Logger.log('Gemini falhou: ' + e.message); }
  }
  const texto = lerTextoOCR_(fotos);
  const dados = extrairDados_(texto);
  return { dados, campos: camposDoOCR_(texto, dados), texto, fonte: 'OCR' };
}

function lerEtiquetaOCR_(fotos) {
  return analisarEtiquetas_(fotos).dados;
}

/* ---------- IA (Gemini) ---------- */

function modeloGemini_() {
  if (CONFIG.GEMINI_MODELO) return CONFIG.GEMINI_MODELO;
  const cache = CacheService.getScriptCache();
  const guardado = cache.get('gemini_modelo');
  if (guardado) return guardado;
  const res = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=' +
                                encodeURIComponent(CONFIG.GEMINI_API_KEY), { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error('Chave Gemini inválida (' + res.getResponseCode() + ')');
  const nomes = (JSON.parse(res.getContentText()).models || [])
    .filter(m => (m.supportedGenerationMethods || []).indexOf('generateContent') >= 0)
    .map(m => m.name.replace('models/', ''))
    .filter(n => /flash/.test(n) && !/lite|image|tts|audio|live|thinking|exp|preview/.test(n));
  const versao = n => { const v = n.match(/(\d+(?:\.\d+)?)/); return v ? parseFloat(v[1]) : 0; };
  nomes.sort((a, b) => versao(b) - versao(a) || a.length - b.length);
  const escolhido = nomes[0] || 'gemini-2.5-flash';
  cache.put('gemini_modelo', escolhido, 21600);
  return escolhido;
}

function lerComGemini_(fotos) {
  const pedido = `Estas fotos são etiquetas (placa de características e etiqueta de código de barras) de um compressor / grupo condensador.
Transcreve TODOS os campos e valores visíveis, exatamente como aparecem, sem inventar nada.
- Usa o nome do campo como está na etiqueta (ex.: "Serial No.", "EAN No.", "PS HP", "LRA", "Year of Mfg.", "Group 1").
- Na placa os valores podem estar desalinhados em relação aos nomes: associa cada valor ao campo certo pelo sentido (bar = pressão, A = corrente, °C = temperatura, V/Hz = tensão).
- Inclui também a linha do modelo, o código, fabricante, país de origem, classe do refrigerante (ex.: A2L) e marcações (CE, UKCA, IP...).
- Não repitas campos iguais das duas etiquetas; se os valores forem diferentes, indica os dois.
Responde só com JSON neste formato:
{"campos":[{"campo":"...","valor":"..."}],"modelo":"","codigo":"","serial":"","ean":"","voltagem":"","refrigerante":"","ano":""}`;
  const partes = [{ text: pedido }];
  fotos.forEach(f => {
    const b = blobImagem_(f);
    partes.push({ inline_data: { mime_type: b.getContentType() || 'image/jpeg', data: Utilities.base64Encode(b.getBytes()) } });
  });
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + modeloGemini_() +
              ':generateContent?key=' + encodeURIComponent(CONFIG.GEMINI_API_KEY);
  const res = UrlFetchApp.fetch(url, {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    payload: JSON.stringify({
      contents: [{ role: 'user', parts: partes }],
      generationConfig: { temperature: 0, responseMimeType: 'application/json' },
    }),
  });
  if (res.getResponseCode() !== 200) {
    CacheService.getScriptCache().remove('gemini_modelo');
    throw new Error('HTTP ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 300));
  }
  const cand = (JSON.parse(res.getContentText()).candidates || [])[0];
  const txt = cand && cand.content && cand.content.parts ? cand.content.parts.map(p => p.text || '').join('') : '';
  const j = JSON.parse(txt.replace(/^```(?:json)?|```$/g, '').trim());
  const campos = (j.campos || [])
    .map(c => [String(c.campo || '').trim(), String(c.valor || '').trim()])
    .filter(c => c[0] && c[1]);
  const dados = {};
  ['modelo', 'codigo', 'serial', 'ean', 'voltagem', 'refrigerante', 'ano'].forEach(k => {
    if (j[k]) dados[k] = String(j[k]).trim();
  });
  const texto = campos.map(c => c[0] + ': ' + c[1]).join('\n');
  return { dados, campos, texto, fonte: 'IA' };
}

/* ---------- OCR (sem chave) ---------- */

function lerTextoOCR_(fotos) {
  let texto = '';
  fotos.forEach(f => {
    try {
      const tmp = Drive.Files.create(
        { name: 'ocr_tmp_' + f.getName(), mimeType: MimeType.GOOGLE_DOCS },
        blobImagem_(f),
        { ocrLanguage: 'en' }
      );
      texto += '\n' + DocumentApp.openById(tmp.id).getBody().getText();
      DriveApp.getFileById(tmp.id).setTrashed(true);
    } catch (e) {
      Logger.log('OCR falhou em ' + f.getName() + ': ' + e.message);
    }
  });
  return texto;
}

function extrairDados_(t) {
  t = t || '';
  const m = (re, g = 1) => { const r = t.match(re); return r ? r[g].trim() : ''; };
  const d = {
    modelo: m(/\b(OP-[A-Z0-9]{6,})/),
    codigo: m(/\b(\d{3}[A-Z]\d{4})\b/),
    serial: m(/Serial\s*No\.?\s*[:\-.]*\s*([A-Z0-9]{8,})/i),
    ean: m(/\b(\d{13})\b/),
    voltagem: m(/(\d{3}\s*V\s*\d?N?\s*~\s*\d{2}\s*Hz)/i),
    ano: m(/Year\s*of\s*Mfg\.?\s*[:\s]*(\d{4})/i) || m(/\b(20[2-3]\d)\b/),
    refrigerante: (t.match(/\bR\d{3,4}[A-Za-z]{0,2}(?:\/R\d{3,4}[A-Za-z]{0,2})?\b/g) || [])
                    .filter((v, i, a) => a.indexOf(v) === i).join(' · '),
  };
  Object.keys(d).forEach(k => { if (!d[k]) delete d[k]; });
  return d;
}

/** Todos os campos que se conseguem reconhecer no texto do OCR (etiquetas Danfoss e semelhantes). */
function camposDoOCR_(t, dados) {
  t = t || '';
  const c = [];
  const add = (nome, v) => { v = (v || '').replace(/\s+/g, ' ').trim(); if (v && !c.some(x => x[0] === nome)) c.push([nome, v]); };
  const m = (re, g = 1) => { const r = t.match(re); return r ? r[g] : ''; };
  const todos = re => (t.match(re) || []).map(s => s.replace(/\s+/g, ' ').trim()).filter((v, i, a) => a.indexOf(v) === i);

  add('Modelo', dados.modelo);
  add('Código', dados.codigo);
  add('Serial No.', dados.serial || m(/Serial\s*No\.?\s*[:\-.]*\s*([A-Z0-9]{8,})/i));
  add('EAN No.', dados.ean);
  add('Voltage', dados.voltagem || m(/(\d{3}(?:-\d{3})?\s*V\s*\d?\s*N?\s*~\s*\d{2}\s*Hz)/i));
  add('Fluid Group', m(/Fluid\s*Group[ \t]*[:\-]?[ \t]*(\d[ \t]*(?:&|e|,)[ \t]*\d|\d)\b/i) ||
                     (/Fluid\s*Group/i.test(t) ? m(/^\s*(\d\s*&\s*\d)\s*$/m) : ''));
  add('PED Category', m(/PED\s*Category[ \t]*[:\-]?[ \t]*([IV]{1,3})\b/i) ||
                      (/PED\s*Category/i.test(t) ? m(/^\s*(I{1,3}|IV)\s*$/m) : ''));
  add('Application', m(/\b(LBP|MBP|HBP|L\/MBP|M\/HBP)\b/));
  add('IP', m(/\b(IP\s?\d{2})\b/));
  add('LRA', m(/LRA[ \t]*[:\-]?[ \t]*(\d+(?:[.,]\d+)?\s*A)\b/i));
  add('MCC', m(/MCC[ \t]*[:\-]?[ \t]*(\d+(?:[.,]\d+)?\s*A)\b/i));
  add('RLA', m(/RLA[ \t]*[:\-]?[ \t]*(\d+(?:[.,]\d+)?\s*A)\b/i));
  const pressoes = todos(/-?\d+(?:[.,]\d+)?(?:\s*\/\s*-?\d+(?:[.,]\d+)?)?\s*bar\b/gi);
  if (pressoes.length) add('Pressões (PS HP / PS LP / TS / HP Setting)', pressoes.join(' · '));
  add('PT (temperatura)', m(/(-?\d+\s*\/\s*-?\d+\s*°\s*C)/));
  add('Year of Mfg.', dados.ano);
  add('PRV Setting', m(/PRV\s*Setting[ \t]*[:\-]?[ \t]*(\d+(?:[.,]\d+)?)/i));
  add('HP Setting', m(/HP\s*Setting[ \t]*[:\-]?[ \t]*(\d+(?:[.,]\d+)?)/i));
  add('Group 1', m(/Group\s*1[ \t]*[:\-]?[ \t]*(R\d{3,4}[A-Za-z]{0,2}(?:\/R\d{3,4}[A-Za-z]{0,2})?)/i));
  add('Group 2', m(/Group\s*2[ \t]*[:\-]?[ \t]*(R\d{3,4}[A-Za-z]{0,2}(?:\/R\d{3,4}[A-Za-z]{0,2})?)/i));
  add('Refrigerante', dados.refrigerante);
  add('Classe refrigerante', m(/\b(A[123]L?)\s*Refrigerant/i) || m(/\b(A2L|A3|A1)\b/));
  add('Fabricante', /danfoss/i.test(t) ? 'Danfoss' : m(/\b(Bitzer|Copeland|Embraco|Tecumseh|Secop|Emerson|Frascold|Dorin)\b/i));
  add('Origem', m(/MADE\s*IN\s*([A-Z][A-Za-z]+)/i));
  add('Marcações', todos(/\b(CE|UKCA|UK\s?CA|EAC|UL|CSA|RoHS)\b/g).join(' · '));
  // Linhas "Nome: valor" que não foram apanhadas acima
  t.split(/\n/).forEach(l => {
    const r = l.match(/^\s*([A-Za-zÀ-ú][A-Za-zÀ-ú .\/()#-]{1,30}?)\s*[:=]\s*(\S.{0,60})$/);
    if (r && !c.some(x => x[0].toLowerCase().indexOf(r[1].trim().toLowerCase()) === 0)) add(r[1].trim(), r[2]);
  });
  return c;
}

/* ===================== EMAIL ===================== */

function corpoEmail_(itens) {
  const linhas = itens.map(it => {
    const d = it.dados || {};
    const serial = it.link ? `<a href="${it.link}">${it.serial}</a>` : it.serial;
    return `<tr><td>${serial}</td><td>${it.grupo || ''}</td><td>${d.modelo || ''}</td>` +
           `<td>${d.serial || ''}</td><td>${it.fotos.length}</td></tr>`;
  }).join('');
  return `<p>Olá,</p><p>Segue em anexo o relatório em PDF com ${itens.length} serial(is).</p>
    <table border="1" cellpadding="6" style="border-collapse:collapse;font-family:Arial;font-size:13px">
      <tr style="background:#eee"><th>Serial</th><th>Grupo</th><th>Modelo</th><th>Serial etiqueta</th><th>Fotos</th></tr>
      ${linhas}
    </table><p>Enviado automaticamente.</p>`;
}

/* ===================== UTILITÁRIOS ===================== */

function obterOuCriarPasta_(pai, nome) {
  const it = pai.getFoldersByName(nome);
  return it.hasNext() ? it.next() : pai.createFolder(nome);
}

/** Corre o envio todos os dias às 18h. */
/**
 * EXECUTAR UMA VEZ no editor do Apps Script depois da 1.ª publicação:
 * autoriza o acesso ao Drive, Docs, Gmail e Internet, e cria o envio diário às 18h.
 */
function autorizar() {
  DriveApp.getFolderById(CONFIG.PASTA_ID).getName();
  MailApp.getRemainingDailyQuota();
  UrlFetchApp.fetch('https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=teste');
  criarAgendamentoDiario();
  Logger.log('✅ Autorizado. Pasta: ' + DriveApp.getFolderById(CONFIG.PASTA_ID).getName() +
             ' | Email: ' + CONFIG.EMAIL_DESTINO + ' | URL: ' + ScriptApp.getService().getUrl());
}

function criarAgendamentoDiario() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'enviarRelatorio')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('enviarRelatorio').timeBased().everyDays(1).atHour(18).create();
}

/* ===================== PÁGINA NO TELEMÓVEL (Aplicação Web) ===================== */

function doGet(e) {
  if (e && e.parameter && e.parameter.form !== undefined) return formularioHtml_();
  const id = e && e.parameter && e.parameter.id;
  if (!id) return paginaHtml_('<div class="card"><h2>Ficha não encontrada</h2><p>Leia o QR code da etiqueta.</p></div>');

  let pasta;
  try {
    pasta = DriveApp.getFolderById(id);
    if (!pastaPertenceAoRelatorio_(pasta)) throw new Error('fora da pasta');
  } catch (err) {
    return paginaHtml_('<div class="card"><h2>Ficha não encontrada</h2><p>Este QR code não é válido.</p></div>');
  }

  let info = {};
  try { info = JSON.parse(pasta.getDescription() || '{}'); } catch (err) {}
  if (!info.serial) {
    const partes = pasta.getName().split(/\s*[-–_]\s*/);
    info.serial = partes.shift();
    info.grupo = partes.join(' ');
  }
  const d = info.dados || {};

  const linhas = ((info.campos && info.campos.length) ? info.campos : [
    ['Modelo', d.modelo], ['Código', d.codigo], ['Serial etiqueta', d.serial],
    ['EAN', d.ean], ['Voltagem', d.voltagem], ['Ano fabrico', d.ano], ['Refrigerante', d.refrigerante],
  ]).filter(l => l[1])
   .map(l => `<tr><th>${esc_(l[0])}</th><td>${esc_(l[1])}</td></tr>`).join('');

  // Fotos: lidas pelo script (corre como o dono), por isso a pasta não precisa de ser pública
  const fotos = [];
  let fichaUrl = '';
  const files = pasta.getFiles();
  while (files.hasNext()) {
    const f = files.next();
    if (f.getMimeType().indexOf('image/') === 0) fotos.push(f);
    else if (/^Ficha_.*\.pdf$/.test(f.getName())) fichaUrl = f.getUrl();
  }
  fotos.sort((a, b) => a.getName().localeCompare(b.getName()));
  const imgs = fotos.slice(0, 10).map(f => {
    const b = miniatura_(f, 1000);
    return `<img src="data:${b.getContentType()};base64,${Utilities.base64Encode(b.getBytes())}"
                 alt="${esc_(f.getName())}" onclick="this.classList.toggle('zoom')">`;
  }).join('');

  const html = `
    <header>${esc_(CONFIG.TITULO_PAGINA)}</header>
    <div class="card destaque">
      <div class="rotulo">SERIAL NO</div>
      <div class="serial">${esc_(info.serial)}</div>
    </div>
    <div class="card">
      <div class="rotulo">INFORMAÇÃO DO GRUPO</div>
      <div class="grupo">${esc_(info.grupo || '—')}</div>
    </div>
    ${linhas ? `<div class="card"><div class="rotulo">DADOS DA ETIQUETA</div><table>${linhas}</table></div>` : ''}
    <div class="card">
      <div class="rotulo">FOTOS (${fotos.length}) <small>· toque para ampliar</small></div>
      ${imgs || '<p>Sem fotos.</p>'}
    </div>
    ${fichaUrl ? `<a class="botao" href="${fichaUrl}" target="_blank">📄 Ficha em PDF</a>` : ''}
    <a class="botao sec" href="${pasta.getUrl()}" target="_blank">📁 Abrir pasta no Drive</a>
    <footer>${info.enviadoEm ? 'Registado em ' + esc_(info.enviadoEm) : ''}</footer>`;
  return paginaHtml_(html, 'Serial ' + info.serial);
}

function paginaHtml_(conteudo, titulo) {
  const css = `
    *{box-sizing:border-box} body{margin:0;font-family:-apple-system,Roboto,Arial,sans-serif;background:#f1f3f6;color:#222}
    header{background:#1a3d8f;color:#fff;padding:16px;font-size:18px;font-weight:600;text-align:center}
    .card{background:#fff;margin:12px;padding:14px 16px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.12)}
    .destaque{border:2px solid #000}
    .rotulo{font-size:12px;font-weight:700;color:#666;letter-spacing:.5px;margin-bottom:6px}
    .serial{font-size:38px;font-weight:800;color:#1a3d8f}
    .grupo{font-size:26px;font-weight:700}
    table{width:100%;border-collapse:collapse;font-size:15px}
    th{text-align:left;color:#555;font-weight:600;padding:7px 8px 7px 0;width:42%;vertical-align:top}
    td{padding:7px 0;word-break:break-all;font-family:monospace;font-size:15px}
    tr+tr th,tr+tr td{border-top:1px solid #eee}
    img{width:100%;border-radius:8px;margin-top:8px;display:block}
    img.zoom{position:fixed;inset:0;margin:0;width:100vw;height:100vh;object-fit:contain;background:#000;z-index:9;border-radius:0}
    .botao{display:block;margin:12px;padding:14px;text-align:center;border-radius:10px;background:#1a3d8f;color:#fff;text-decoration:none;font-weight:600}
    .botao.sec{background:#fff;color:#1a3d8f;border:1px solid #1a3d8f}
    footer{text-align:center;color:#888;font-size:12px;padding:8px 0 24px}`;
  return HtmlService.createHtmlOutput(`<style>${css}</style>${conteudo}`)
    .setTitle(titulo || CONFIG.TITULO_PAGINA)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Só mostra pastas que estão dentro da pasta principal (ou de "Enviados"). */
function pastaPertenceAoRelatorio_(pasta) {
  const pais = pasta.getParents();
  while (pais.hasNext()) {
    const p = pais.next();
    if (p.getId() === CONFIG.PASTA_ID) return true;
    const avos = p.getParents();
    while (avos.hasNext()) if (avos.next().getId() === CONFIG.PASTA_ID) return true;
  }
  return false;
}

function miniatura_(file, tamanho) {
  try {
    const res = UrlFetchApp.fetch(`https://drive.google.com/thumbnail?id=${file.getId()}&sz=w${tamanho}`, {
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true,
    });
    if (res.getResponseCode() === 200 && res.getBlob().getBytes().length > 1000) return res.getBlob();
  } catch (e) {}
  return file.getBlob();
}

function esc_(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Mostra no registo o link da página para a primeira subpasta (para testar sem gerar PDF). */
function testarPagina() {
  const pasta = DriveApp.getFolderById(CONFIG.PASTA_ID);
  const webApp = CONFIG.WEB_APP_URL || ScriptApp.getService().getUrl();
  let it = pasta.getFolders();
  let sub = null;
  while (it.hasNext()) { const f = it.next(); if (f.getName() !== 'Enviados') { sub = f; break; } }
  if (!sub) { const env = pasta.getFoldersByName('Enviados'); if (env.hasNext()) { it = env.next().getFolders(); if (it.hasNext()) sub = it.next(); } }
  Logger.log(sub ? `${webApp}?id=${sub.getId()}` : 'Sem subpastas.');
}

/* ===================== FORMULÁRIO NO TELEMÓVEL ===================== */

function verificarPin_(pin) {
  if (!CONFIG.CODIGO_ACESSO || String(pin) !== String(CONFIG.CODIGO_ACESSO)) {
    Utilities.sleep(1500); // trava tentativas repetidas
    throw new Error('Código de acesso errado.');
  }
}

/** Chamado pelo formulário: cria (ou reutiliza) a pasta "SERIAL - GRUPO". */
function formCriarPasta(pin, serial, grupo) {
  verificarPin_(pin);
  serial = String(serial || '').trim().toUpperCase();
  grupo = String(grupo || '').trim().toUpperCase();
  if (!/^[A-Z0-9./]{2,30}$/.test(serial)) throw new Error('Serial inválido.');
  if (grupo && !/^[A-Z0-9 ./]{1,30}$/.test(grupo)) throw new Error('Grupo inválido.');

  const raiz = DriveApp.getFolderById(CONFIG.PASTA_ID);
  const nome = grupo ? `${serial} - ${grupo}` : serial;
  const prefixo = new RegExp('^' + serial.replace(/[.\/]/g, '\\$&') + '(\\s*[-–_]|$)');

  // Já existe uma pasta para este serial (ainda não enviada)? Junta as fotos lá.
  const subs = raiz.getFolders();
  while (subs.hasNext()) {
    const f = subs.next();
    if (prefixo.test(f.getName())) {
      if (grupo && f.getName() !== nome) f.setName(nome);
      return f.getId();
    }
  }
  return raiz.createFolder(nome).getId();
}

/** Chamado pelo formulário: guarda uma foto (base64 JPEG, já reduzida no telemóvel). */
function formEnviarFoto(pin, pastaId, base64, slot) {
  verificarPin_(pin);
  slot = Number(slot);
  if (slot !== 1 && slot !== 2) throw new Error('Foto inválida.');
  const pasta = DriveApp.getFolderById(pastaId);
  if (!pastaPertenceAoRelatorio_(pasta)) throw new Error('Pasta inválida.');
  // Substitui a foto anterior desse lugar (se o serial for registado de novo)
  const files = pasta.getFiles();
  while (files.hasNext()) {
    const f = files.next();
    if (new RegExp('^foto' + slot + '[_.\\s-]', 'i').test(f.getName())) f.setTrashed(true);
  }
  const ts = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  const nome = slot === 1 ? `foto1_etiqueta_grande_${ts}.jpg` : `foto2_etiqueta_pequena_${ts}.jpg`;
  pasta.createFile(Utilities.newBlob(Utilities.base64Decode(base64), 'image/jpeg', nome));
  return true;
}

/** Chamado no fim: OCR (opcional), guarda os dados e devolve o link da ficha. */
function formFinalizar(pin, pastaId) {
  verificarPin_(pin);
  const pasta = DriveApp.getFolderById(pastaId);
  if (!pastaPertenceAoRelatorio_(pasta)) throw new Error('Pasta inválida.');
  const partes = pasta.getName().split(/\s*[-–_]\s*/);
  const item = { pasta, serial: partes.shift(), grupo: partes.join(' '), dados: {}, campos: [] };

  const fotos = [];
  const files = pasta.getFiles();
  while (files.hasNext()) { const f = files.next(); if (f.getMimeType().indexOf('image/') === 0) fotos.push(f); }
  if (CONFIG.USAR_OCR && CONFIG.OCR_AO_REGISTAR) {
    try {
      const r = analisarEtiquetas_(fotos);
      Object.assign(item, { dados: r.dados, campos: r.campos, textoOCR: r.texto, fonte: r.fonte, fotos });
    } catch (e) { Logger.log('Leitura falhou: ' + e.message); }
  }
  guardarDadosNaPasta_(item);
  const webApp = CONFIG.WEB_APP_URL || ScriptApp.getService().getUrl();
  return { link: webApp + '?id=' + pastaId, serial: item.serial, grupo: item.grupo, dados: item.dados, campos: item.campos, fotos: fotos.length };
}

/** Botão "Enviar relatório agora" do formulário. */
function formEnviarRelatorio(pin) {
  verificarPin_(pin);
  return enviarRelatorio();
}

/** Mostra no registo o link do formulário. */
function linkFormulario() {
  Logger.log((CONFIG.WEB_APP_URL || ScriptApp.getService().getUrl()) + '?form');
}

function formularioHtml_() {
  // O formulário está no ficheiro HTML "index" do projeto
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Registar serial')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/* ===================== API PARA A APLICAÇÃO (doPost) ===================== */

/**
 * A app envia JSON: { acao, pin, ...dados } e recebe { ok, data } ou { ok:false, erro }.
 */
function doPost(e) {
  let resposta;
  try {
    const req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const pin = req.pin;
    let data;
    switch (req.acao) {
      case 'ping':            verificarPin_(pin); data = { titulo: CONFIG.TITULO_PAGINA }; break;
      case 'criarPasta':      data = formCriarPasta(pin, req.serial, req.grupo); break;
      case 'enviarFoto':      data = formEnviarFoto(pin, req.pastaId, req.base64, req.slot); break;
      case 'finalizar':       data = formFinalizar(pin, req.pastaId); break;
      case 'enviarRelatorio': data = { enviados: formEnviarRelatorio(pin) }; break;
      case 'listar':          data = apiListar_(pin); break;
      default: throw new Error('Ação desconhecida.');
    }
    resposta = { ok: true, data };
  } catch (err) {
    resposta = { ok: false, erro: err.message || String(err) };
  }
  return ContentService.createTextOutput(JSON.stringify(resposta)).setMimeType(ContentService.MimeType.JSON);
}

/** Lista os seriais por enviar e os últimos 30 enviados. */
function apiListar_(pin) {
  verificarPin_(pin);
  const raiz = DriveApp.getFolderById(CONFIG.PASTA_ID);
  const webApp = CONFIG.WEB_APP_URL || ScriptApp.getService().getUrl();

  const ler = (pasta) => {
    let info = {};
    try { info = JSON.parse(pasta.getDescription() || '{}'); } catch (e) {}
    const partes = pasta.getName().split(/\s*[-–_]\s*/);
    let fotos = 0;
    const files = pasta.getFiles();
    while (files.hasNext()) if (files.next().getMimeType().indexOf('image/') === 0) fotos++;
    return {
      serial: info.serial || partes[0], grupo: info.grupo || partes.slice(1).join(' '),
      modelo: (info.dados || {}).modelo || '', fotos,
      data: Utilities.formatDate(pasta.getLastUpdated(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'),
      link: webApp + '?id=' + pasta.getId(), _t: pasta.getLastUpdated().getTime(),
    };
  };

  const porEnviar = [], enviados = [];
  const subs = raiz.getFolders();
  while (subs.hasNext()) {
    const f = subs.next();
    if (f.getName() === 'Enviados') {
      const env = f.getFolders();
      const todas = [];
      while (env.hasNext()) todas.push(env.next());
      todas.sort((a, b) => b.getLastUpdated() - a.getLastUpdated());
      todas.slice(0, 30).forEach(p => enviados.push(ler(p)));
    } else {
      porEnviar.push(ler(f));
    }
  }
  porEnviar.sort((a, b) => b._t - a._t);
  return { porEnviar, enviados };
}
