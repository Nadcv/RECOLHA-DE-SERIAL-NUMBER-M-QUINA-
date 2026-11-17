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
  ASSUNTO: 'Relatório de Registo de Equipamentos',
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
  LOGOTIPOS: true,                          // logótipo Cablotec (emissor) e do cliente no PDF, email e ficha
  CLIENTE_NOME: 'Aralab',
  GARANTIA_MESES: 24,                       // garantia estimada, contada a partir do fim do ano de fabrico
  RELATORIO_MENSAL: true,                   // dia 1 de cada mês: resumo do mês anterior + folha em Excel                   // cliente principal (aparece como "Cliente" com o logótipo)
  GEMINI_API_KEY: '',                       // chave grátis em aistudio.google.com: lê TUDO das etiquetas com IA
  GEMINI_MODELO: '',                        // vazio = escolhe automaticamente (flash-lite e, se falhar, flash)
  GEMINI_MAX_DIA: 200,                      // máximo de leituras por IA por dia (o resto usa OCR)                        // 2.ª folha com os dados lidos nas fotos
  MOLDURA1: { largura: 400, altura: 228 },  // Foto 1 – etiqueta grande (placa de características)
  MOLDURA2: { largura: 515, altura: 155 },  // Foto 2 – etiqueta pequena (código de barras)
};

/* ===================== FUNÇÃO PRINCIPAL ===================== */

let ultimoEnvio_ = {};

function enviarRelatorio() {
  return enviarRelatorioPara_();
}

function enviarRelatorioPara_(ids, emails, idioma) {
  // Evita dois envios ao mesmo tempo (app + agendamento)
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Já está a ser enviado um relatório. Tente daqui a pouco.');
  IDIOMA_ = idioma === 'en' ? 'en' : 'pt';
  try { return enviarRelatorio__(ids, emails); } finally { lock.releaseLock(); IDIOMA_ = 'pt'; }
}

/** ids: só estas pastas (vazio = todas por enviar); emails: destinatários (vazio = EMAIL_DESTINO). */
function enviarRelatorio__(ids, emails) {
  const pasta = DriveApp.getFolderById(CONFIG.PASTA_ID);
  let itens = lerSubpastas_(pasta);
  if (ids && ids.length) itens = itens.filter(it => ids.indexOf(it.pasta.getId()) >= 0);
  const para = (emails && String(emails).trim()) ? String(emails).trim() : CONFIG.EMAIL_DESTINO;

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
    const info = lerInfo_(item.pasta);
    Object.assign(item, { extras: info.extras || {}, codigos: info.codigos || [], registadoEm: info.registadoEm,
                          corrigido: !!info.corrigido, dados: info.dados || {}, campos: info.campos || [],
                          textoOCR: info.texto || '', fonte: info.fonte });
    // reaproveita a leitura feita no registo; se só deu OCR (ex.: limite da IA esgotado), tenta de novo com IA
    const reaproveitar = info.corrigido || (info.campos && info.campos.length && info.nFotos === item.fotos.length &&
                                            (info.fonte === 'IA' || !geminiDisponivel_()));
    if (CONFIG.USAR_OCR && !reaproveitar) {
      const r = aplicarCodigos_(analisarEtiquetas_(item.fotos), item.codigos);
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
  const paginas = (pdf.getDataAsString('ISO-8859-1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  if (paginas > itens.length * (CONFIG.FOLHA_DADOS ? 2 : 1)) Logger.log('Aviso: o PDF tem ' + paginas + ' páginas.');

  // 3) Enviar email
  const quandoTxt = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), T_("dd/MM/yyyy 'às' HH:mm", "dd/MM/yyyy 'at' HH:mm"));
  MailApp.sendEmail({
    to: para,
    subject: T_(`Relatório de Registo de Equipamentos – ${itens.length} equipamento${itens.length === 1 ? '' : 's'} – `,
                `Equipment Registration Report – ${itens.length} unit${itens.length === 1 ? '' : 's'} – `) +
             Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy'),
    name: T_('Cablotec – Geração de Etiquetas', 'Cablotec – Label Generation'),
    htmlBody: corpoEmail_(itens, quandoTxt),
    body: textoEmail_(itens, quandoTxt),
    attachments: [pdf],
    inlineImages: CONFIG.LOGOTIPOS ? { logoCablotec: logoBlob_('cablotec'), logoCliente: logoBlob_('aralab') } : {},
  });

  // 4) Ficha individual dentro da pasta de cada serial (sempre em português)
  const idiomaEnvio = IDIOMA_;
  IDIOMA_ = 'pt';
  if (CONFIG.GUARDAR_FICHA_NA_PASTA) itens.forEach(guardarFicha_);
  IDIOMA_ = idiomaEnvio;

  // 5) Arrumar
  pasta.createFile(pdf);          // guarda uma cópia do PDF na pasta principal
  docFile.setTrashed(true);       // apaga o Google Doc temporário
  if (CONFIG.MOVER_PARA_ENVIADOS) {
    const enviados = obterOuCriarPasta_(pasta, 'Enviados');
    itens.forEach(it => it.pasta.moveTo(enviados));
  }
  const quando = agora_();
  itens.forEach(it => {
    try { it.enviadoEm = quando; guardarDadosNaPasta_(it); } catch (e) { Logger.log('Dados: ' + e.message); }
  });
  try { registarVarios_(itens.map(it => [it.pasta, 'Enviado'])); } catch (e) { Logger.log('Folha: ' + e.message); }

  Logger.log(`Enviado: ${itens.length} serial(is) para ${para} (${paginas} páginas)`);
  ultimoEnvio_ = { paginas };
  return itens.length;
}

/* ===================== LEITURA DAS PASTAS ===================== */

function lerSubpastas_(pasta) {
  const lista = [];
  const subs = pasta.getFolders();
  while (subs.hasNext()) {
    const sub = subs.next();
    const nomePasta = sub.getName();
    if (pastaDeSistema_(nomePasta)) continue;

    // "162744 - 30 VE"  ->  serial = 162744 , grupo = 30 VE
    const partes = nomePasta.split(/\s*[-–_]\s*/);
    const serial = partes.shift().trim();
    const grupo = partes.join(' ').trim();

    const fotos = [];
    let foto3 = null, assinatura = null;
    const files = sub.getFiles();
    while (files.hasNext()) {
      const f = files.next();
      if (f.getMimeType().indexOf('image/') !== 0) continue;
      if (/^assinatura/i.test(f.getName())) assinatura = f;
      else if (/^foto3[_.\s-]/i.test(f.getName())) foto3 = f;
      else fotos.push(f);
    }
    if (fotos.length === 0) continue;

    fotos.sort((a, b) => a.getName().localeCompare(b.getName()));
    const [foto1, foto2] = escolherFotos_(fotos);
    lista.push({ pasta: sub, serial, grupo, fotos, foto1, foto2, foto3, assinatura, dados: null });
  }
  lista.sort((a, b) => a.serial.localeCompare(b.serial, undefined, { numeric: true }));
  return lista;
}

/** Foto 1 = nome começa por "foto1", Foto 2 = "foto2"; senão, por ordem. */
function escolherFotos_(fotos) {
  const f1 = fotos.find(f => /^foto1[_.\s-]/i.test(f.getName()));
  const f2 = fotos.find(f => /^foto2[_.\s-]/i.test(f.getName()));
  const resto = fotos.filter(f => f !== f1 && f !== f2 && !fotoExtra_(f));
  return [f1 || resto.shift() || null, f2 || resto.shift() || null];
}

/* ===================== LAYOUT DA PÁGINA ===================== */

function montarPagina_(body, item) {
  if (!item.foto1 && item.fotos) [item.foto1, item.foto2] = escolherFotos_(item.fotos);

  // 0) Logótipos: Cablotec (emissor) à esquerda, cliente à direita
  cabecalhoLogos_(body);

  // 1) SERIAL NO (caixa à esquerda) + QR code à direita
  const l1 = tabelaInvisivel_(body, [300, 215]);
  caixaTexto_(l1[0], [['SERIAL NO: ', 15, '#000000'], [item.serial, 22, '#c9272e']]);
  if (item.qr) {
    const pq = l1[1].getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
    pq.appendInlineImage(item.qr.copyBlob()).setWidth(80).setHeight(80);
    const pl = l1[1].appendParagraph(T_('Ver ficha', 'View record')).setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
    pl.editAsText().setFontSize(7).setForegroundColor('#666666').setLinkUrl(item.link);
  }
  espaco_(body, 8);

  // 2) INFORMAÇÃO DO GRUPO (caixa ao centro-direita)
  const l2 = tabelaInvisivel_(body, [170, 345]);
  caixaTexto_(l2[1], [[T_('INFORMAÇÃO DO GRUPO: ', 'GROUP INFORMATION: '), 11, '#000000'], [item.grupo || '—', 15, '#c9272e']]);

  // 3) Seta
  const seta = body.appendParagraph('⇩').setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  seta.editAsText().setFontSize(24).setForegroundColor('#333333');
  seta.setSpacingBefore(0).setSpacingAfter(0);

  // 4) Moldura 1 – etiqueta grande (centrada)
  const m = CONFIG.MOLDURA1;
  const lado = Math.round((515 - m.largura) / 2);
  const l3 = tabelaInvisivel_(body, [lado, m.largura, lado]);
  moldura_(l3[1], item.foto1, m, T_('Foto 1 – etiqueta grande', 'Photo 1 – rating plate'));
  espaco_(body, 12);

  // 5) Moldura 2 – etiqueta pequena (largura toda)
  moldura_(body, item.foto2, CONFIG.MOLDURA2, T_('Foto 2 – etiqueta pequena', 'Photo 2 – barcode label'));

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
  cabecalhoLogos_(body);
  const titulo = body.appendParagraph(T_('DADOS LIDOS DAS ETIQUETAS', 'LABEL DATA'));
  titulo.editAsText().setBold(true).setFontSize(15).setForegroundColor('#000000');
  titulo.setSpacingBefore(0).setSpacingAfter(4);
  const sub = body.appendParagraph(`Serial ${item.serial}  ·  ${T_('Grupo', 'Group')} ${item.grupo || '—'}` +
                                   (item.registadoEm ? `  ·  ${T_('Registado em', 'Registered on')} ${item.registadoEm}` : ''));
  sub.editAsText().setBold(false).setFontSize(10).setForegroundColor('#555555');
  sub.setSpacingAfter(10);

  const lidos = (item.campos && item.campos.length) ? item.campos
    : CAMPOS_ETIQUETA_.map(([k, nome]) => [nome, d[k] || '—']);
  const x = item.extras || {};
  const gar = garantia_(item.dados, item.campos);
  const linhas = [['SERIAL NO', item.serial || '—'], [T_('INFORMAÇÃO DO GRUPO', 'GROUP INFORMATION'), item.grupo || '—']]
    .concat([[T_('Cliente / Obra', 'Customer / Site'), x.cliente], [T_('Local', 'Location'), x.local],
             [T_('Técnico', 'Technician'), x.tecnico],
             [T_('Coordenadas GPS', 'GPS coordinates'), x.gps ? x.gps.lat.toFixed(5) + ', ' + x.gps.lon.toFixed(5) : ''],
             [T_('Garantia (estimada)', 'Warranty (estimated)'), gar ? gar.texto : '']].filter(l => l[1]))
    .concat(lidos.map(([n, v]) => [String(n), String(v || '—')]));
  const blocoExtra = !!(item.foto3 || item.assinatura);
  const t = body.appendTable(linhas);
  t.setBorderWidth(1).setBorderColor('#999999');
  // Com muitos campos a tabela fica mais compacta, para caber sempre numa folha
  const n = t.getNumRows();
  const lim = blocoExtra ? [12, 22] : [18, 28];   // com foto 3 / assinatura sobra menos espaço
  const [pad, fN, fV] = n <= lim[0] ? [5, 10, 11] : n <= lim[1] ? [2, 9, 10] : [1, 8, 9];
  for (let r = 0; r < n; r++) {
    const c0 = t.getCell(r, 0).setWidth(190).setBackgroundColor('#f0f2f6');
    const c1 = t.getCell(r, 1);
    [c0, c1].forEach(c => {
      c.setPaddingTop(pad).setPaddingBottom(pad).setPaddingLeft(8);
      for (let i = 0; i < c.getNumChildren(); i++) {
        const el = c.getChild(i);
        if (el.getType() === DocumentApp.ElementType.PARAGRAPH) el.asParagraph().setSpacingBefore(0).setSpacingAfter(0).setLineSpacing(1);
      }
    });
    c0.editAsText().setBold(true).setFontSize(fN).setForegroundColor('#333333');
    const vazio = linhas[r][1] === '—';
    c1.editAsText().setBold(!vazio).setFontSize(fV).setForegroundColor(vazio ? '#aaaaaa' : '#c9272e');
  }

  if (x.obs) {
    const h = body.appendParagraph(T_('Observações', 'Notes'));
    h.editAsText().setBold(true).setFontSize(10).setForegroundColor('#333333');
    h.setSpacingBefore(14).setSpacingAfter(2);
    body.appendParagraph(x.obs).editAsText().setBold(false).setFontSize(10).setForegroundColor('#222222');
  }

  if (item.fonte !== 'IA' && !blocoExtra && item.textoOCR && item.textoOCR.trim()) {
    const h = body.appendParagraph(T_('Texto completo lido nas fotos', 'Full text read from the photos'));
    h.editAsText().setBold(true).setFontSize(10).setForegroundColor('#333333');
    h.setSpacingBefore(16).setSpacingAfter(4);
    const txt = item.textoOCR.replace(/\n{3,}/g, '\n\n').trim().slice(0, 4000);
    const p = body.appendParagraph(txt);
    p.editAsText().setBold(false).setFontSize(8).setForegroundColor('#555555').setFontFamily('Courier New');
  }

  // Foto 3 (equipamento / local) e assinatura, lado a lado
  if (blocoExtra) blocoFoto3Assinatura_(body, item);

  // Código de rastreio único deste registo
  if (item.pasta) {
    const cod = codigoRastreio_(item.pasta, item.registadoEm);
    const r = body.appendParagraph(T_('Código de rastreio: ', 'Tracking code: '));
    r.setSpacingBefore(18);
    r.editAsText().setBold(false).setFontSize(9).setForegroundColor('#555555').setFontFamily('Arial');
    r.appendText(cod).setBold(true).setFontSize(11).setForegroundColor('#c9272e').setFontFamily('Courier New');
  }
}

/** Linha de topo do PDF com os dois logótipos e um traço vermelho por baixo. */
function cabecalhoLogos_(body) {
  if (!CONFIG.LOGOTIPOS) return;
  try {
    const c = tabelaInvisivel_(body, [300, 215]);
    const pe = c[0].getChild(0).asParagraph();
    const le = pe.appendInlineImage(logoBlob_('cablotec'));
    le.setWidth(Math.round(24 * le.getWidth() / le.getHeight())).setHeight(24);
    const pd = c[1].getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
    pd.appendText(T_('Cliente  ', 'Customer  ')).setFontSize(7).setForegroundColor('#888888').setBold(false);
    const ld = pd.appendInlineImage(logoBlob_('aralab'));
    ld.setWidth(Math.round(20 * ld.getWidth() / ld.getHeight())).setHeight(20);
    const linha = body.appendParagraph('').setSpacingBefore(0).setSpacingAfter(2);
    linha.appendHorizontalRule();
    linha.editAsText().setFontSize(2);
  } catch (e) { Logger.log('Logótipos: ' + e.message); }
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
    p.appendText('(' + legenda + T_(' em falta)', ' missing)')).setFontSize(10).setForegroundColor('#999999');
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

function lerInfo_(pasta) {
  try { return JSON.parse(pasta.getDescription() || '{}'); } catch (e) { return {}; }
}
function agora_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
}

/** Guarda os dados do serial na descrição da pasta (junta com o que já lá estava). */
function guardarDadosNaPasta_(item) {
  const info = lerInfo_(item.pasta);
  if (!info.registadoEm) info.registadoEm = info.enviadoEm || agora_();
  item.registadoEm = info.registadoEm;
  Object.assign(info, { serial: item.serial, grupo: item.grupo });
  if (item.dados) info.dados = item.dados;
  if (item.campos) info.campos = item.campos.slice(0, 60);
  if (item.fonte !== undefined) info.fonte = item.fonte;
  if (item.textoOCR !== undefined) info.texto = (item.textoOCR || '').slice(0, 1500);
  if (item.fotos) info.nFotos = item.fotos.length;
  if (item.extras) info.extras = item.extras;
  if (item.codigos) info.codigos = item.codigos;
  if (item.corrigido) info.corrigido = true;
  if (item.enviadoEm) info.enviadoEm = item.enviadoEm;
  let json = JSON.stringify(info);
  if (json.length > 4000) { info.texto = ''; json = JSON.stringify(info); }
  while (json.length > 4000 && info.campos && info.campos.length) { info.campos.pop(); json = JSON.stringify(info); }
  item.pasta.setDescription(json);
  return info;
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
  if (geminiDisponivel_()) {
    try { return lerComGemini_(fotos); } catch (e) { Logger.log('Gemini falhou, uso OCR: ' + e.message); }
  }
  const texto = lerTextoOCR_(fotos);
  const dados = extrairDados_(texto);
  return { dados, campos: camposDoOCR_(texto, dados), texto, fonte: 'OCR' };
}

function lerEtiquetaOCR_(fotos) {
  return analisarEtiquetas_(fotos).dados;
}

/* ---------- IA (Gemini) ---------- */

/* Limites da versão gratuita: no máximo GEMINI_MAX_DIA leituras por dia; quando o Google
   responde 429 (limite atingido) esse modelo fica em pausa 1 hora e passa-se ao seguinte.
   Se nenhum estiver disponível, usa-se o OCR (grátis e sem limites). */
function hojeChave_() {
  return 'gemini_' + Utilities.formatDate(new Date(), 'America/Los_Angeles', 'yyyyMMdd');
}
function geminiDisponivel_() {
  if (!CONFIG.GEMINI_API_KEY) return false;
  const usadas = Number(PropertiesService.getScriptProperties().getProperty(hojeChave_()) || 0);
  return usadas < CONFIG.GEMINI_MAX_DIA;
}
function contarLeituraGemini_() {
  const props = PropertiesService.getScriptProperties();
  const k = hojeChave_();
  props.setProperty(k, String(Number(props.getProperty(k) || 0) + 1));
  Object.keys(props.getProperties()).forEach(x => { if (/^gemini_\d{8}$/.test(x) && x !== k) props.deleteProperty(x); });
}

/** Modelos a tentar, por ordem: o "flash-lite" mais recente e depois o "flash". */
function modelosGemini_() {
  if (CONFIG.GEMINI_MODELO) return [CONFIG.GEMINI_MODELO];
  const cache = CacheService.getScriptCache();
  const guardado = cache.get('gemini_modelos');
  if (guardado) return JSON.parse(guardado);
  const res = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=' +
                                encodeURIComponent(CONFIG.GEMINI_API_KEY), { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error('Chave Gemini inválida (' + res.getResponseCode() + ')');
  const nomes = (JSON.parse(res.getContentText()).models || [])
    .filter(m => (m.supportedGenerationMethods || []).indexOf('generateContent') >= 0)
    .map(m => m.name.replace('models/', ''))
    .filter(n => /^gemini-.*flash/.test(n) && !/image|tts|audio|live|thinking|exp|preview/.test(n));
  const versao = n => { const v = n.match(/(\d+(?:\.\d+)?)/); return v ? parseFloat(v[1]) : 0; };
  const melhor = lista => lista.sort((a, b) => versao(b) - versao(a) || a.length - b.length)[0];
  // o "lite" primeiro: responde em ~2 s, tem limites gratuitos maiores e lê bem as etiquetas
  const lista = [melhor(nomes.filter(n => /lite/.test(n))) || 'gemini-2.5-flash-lite',
                 melhor(nomes.filter(n => !/lite/.test(n))) || 'gemini-2.5-flash'];
  cache.put('gemini_modelos', JSON.stringify(lista), 21600);
  return lista;
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
  const payload = JSON.stringify({
    contents: [{ role: 'user', parts: partes }],
    generationConfig: { temperature: 0, responseMimeType: 'application/json' },
  });
  const cache = CacheService.getScriptCache();
  let res = null, erro = 'sem modelo disponível';
  for (const modelo of modelosGemini_()) {
    if (cache.get('gemini_pausa_' + modelo)) continue;
    for (let tentativa = 0; tentativa < 1; tentativa++) {
      res = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + modelo +
                              ':generateContent?key=' + encodeURIComponent(CONFIG.GEMINI_API_KEY),
                              { method: 'post', contentType: 'application/json', muteHttpExceptions: true, payload });
      const code = res.getResponseCode();
      if (code === 200) break;
      erro = modelo + ' HTTP ' + code + ': ' + res.getContentText().slice(0, 200);
      if (code === 503 || code === 500) cache.put('gemini_pausa_' + modelo, '1', 600); // sobrecarregado: pausa 10 min
      if (code === 429) cache.put('gemini_pausa_' + modelo, '1', 3600);              // limite: pausa 1 hora
      if (code === 404) cache.remove('gemini_modelos');                       // modelo deixou de existir
      break;
    }
    if (res && res.getResponseCode() === 200) break;
    res = null;
  }
  if (!res) throw new Error(erro);
  contarLeituraGemini_();
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

/** Email formal (HTML com estilos em linha, compatível com Outlook e Gmail). */
function corpoEmail_(itens, quando) {
  const n = itens.length;
  const azul = '#c9272e';
  const unicos = (f) => itens.map(f).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
  const clientes = unicos(it => (it.extras || {}).cliente);
  const tecnicos = unicos(it => (it.extras || {}).tecnico);
  let folha = '';
  try { folha = folhaUrl_(); } catch (e) {}

  const linhas = itens.map((it, i) => {
    const d = it.dados || {}, x = it.extras || {};
    let cod = '';
    try { cod = codigoRastreio_(it.pasta, it.registadoEm); } catch (e) {}
    const fundo = i % 2 ? '#f7f8fb' : '#ffffff';
    const td = 'padding:9px 10px;border-bottom:1px solid #e3e6ee;font-size:13px;color:#222;vertical-align:top;';
    return `<tr style="background:${fundo}">
      <td style="${td}font-family:Consolas,monospace;color:${azul};font-weight:bold;white-space:nowrap">${esc_(cod)}</td>
      <td style="${td}font-weight:bold">${esc_(it.serial)}</td>
      <td style="${td}white-space:nowrap">${esc_(it.grupo || '—')}</td>
      <td style="${td}">${esc_(x.cliente || '—')}</td>
      <td style="${td}">${esc_(d.modelo || '—')}<br><span style="color:#777;font-size:12px">${esc_(d.serial ? 'S/N ' + d.serial : '')}</span></td>
      <td style="${td}white-space:nowrap">${it.link ? `<a href="${it.link}" style="color:${azul};font-weight:bold;text-decoration:none">${T_('Ver ficha', 'View record')}&nbsp;›</a>` : ''}</td>
    </tr>`;
  }).join('');
  const th = `padding:9px 10px;font-size:12px;color:#ffffff;text-align:left;font-weight:bold;letter-spacing:.3px;background:#3a393a;`;

  const resumo = [
    [T_('Equipamentos registados', 'Units registered'), String(n)],
    [T_('Data de emissão', 'Issue date'), quando],
    clientes.length ? [T_('Cliente / Obra', 'Customer / Site'), clientes.join(', ')] : null,
    tecnicos.length ? [T_('Técnico responsável', 'Technician'), tecnicos.join(', ')] : null,
  ].filter(Boolean).map(([k, v]) => `<tr>
      <td style="padding:4px 14px 4px 0;font-size:13px;color:#666;white-space:nowrap">${esc_(k)}</td>
      <td style="padding:4px 0;font-size:13px;color:#222;font-weight:bold">${esc_(v)}</td></tr>`).join('');

  return `<!DOCTYPE html><html lang="pt"><body style="margin:0;padding:0;background:#eef1f6">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f6;padding:24px 0">
<tr><td align="center">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;font-family:Arial,Helvetica,sans-serif">
  ${CONFIG.LOGOTIPOS ? `<tr><td style="padding:18px 28px 14px;border-bottom:4px solid ${azul}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td align="left" style="vertical-align:middle"><img src="cid:logoCablotec" alt="Cablotec" height="44" style="display:block;height:44px;border:0"></td>
      <td align="right" style="vertical-align:middle;font-size:11px;color:#888">
        <table role="presentation" cellpadding="0" cellspacing="0" align="right"><tr>
          <td style="font-size:11px;color:#888;padding-right:8px;vertical-align:middle">${T_('Preparado para', 'Prepared for')}</td>
          <td style="vertical-align:middle"><img src="cid:logoCliente" alt="${esc_(CONFIG.CLIENTE_NOME || '')}" height="34" style="display:block;height:34px;border:0"></td>
        </tr></table></td>
    </tr></table></td></tr>` : ''}
  <tr><td style="background:#3a393a;padding:18px 28px">
    <div style="font-size:20px;font-weight:bold;color:#ffffff">${T_('Relatório de Registo de Equipamentos', 'Equipment Registration Report')}</div>
    <div style="font-size:13px;color:#d6d6d6;margin-top:4px">${T_('Placas de características e números de série', 'Rating plates and serial numbers')}</div>
  </td></tr>
  <tr><td style="padding:26px 28px 6px">
    <p style="margin:0 0 14px;font-size:14px;color:#222">${T_('Exmos. Senhores,', 'Dear Sir or Madam,')}</p>
    <p style="margin:0 0 14px;font-size:14px;color:#222;line-height:1.55">
      ${T_(`Vimos por este meio remeter o relatório de registo de ${n === 1 ? 'um equipamento' : n + ' equipamentos'},
      com a identificação do número de série, a informação do grupo e os dados constantes das respetivas placas de características.`,
      `Please find enclosed the registration report for ${n === 1 ? 'one unit' : n + ' units'},
      including the serial number, group information and the data shown on the respective rating plates.`)}</p>
    <p style="margin:0 0 18px;font-size:14px;color:#222;line-height:1.55">
      ${T_(`Segue em anexo o documento em formato PDF, que inclui, para cada equipamento, as fotografias das etiquetas,
      a transcrição dos dados técnicos e um código de rastreio único para consulta e arquivo.`,
      `The attached PDF document includes, for each unit, photographs of the labels,
      a transcription of the technical data and a unique tracking code for reference and filing.`)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-left:3px solid ${azul};padding-left:12px">${resumo}</table>
  </td></tr>
  <tr><td style="padding:0 28px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e3e6ee">
      <tr><th style="${th}">${T_('Código de rastreio', 'Tracking code')}</th><th style="${th}">Serial</th><th style="${th}">${T_('Grupo', 'Group')}</th>
          <th style="${th}">${T_('Cliente / Obra', 'Customer / Site')}</th><th style="${th}">${T_('Modelo', 'Model')}</th><th style="${th}"></th></tr>
      ${linhas}
    </table>
  </td></tr>
  <tr><td style="padding:20px 28px 4px">
    <p style="margin:0 0 12px;font-size:13px;color:#444;line-height:1.55">
      ${T_('A ficha de cada equipamento pode ser consultada através da ligação “Ver ficha” ou lendo o código QR impresso no relatório.',
           'Each unit’s record can be viewed via the “View record” link or by scanning the QR code printed on the report.')}
      ${folha ? T_(`O histórico completo de registos está disponível na <a href="${folha}" style="color:${azul}">folha de registo</a>.`,
                   `The full registration history is available in the <a href="${folha}" style="color:${azul}">register sheet</a>.`) : ''}</p>
    <p style="margin:0 0 22px;font-size:14px;color:#222;line-height:1.55">
      ${T_('Ficamos ao dispor para qualquer esclarecimento adicional.', 'Please do not hesitate to contact us should you require any further information.')}</p>
    <p style="margin:0 0 4px;font-size:14px;color:#222">${T_('Com os melhores cumprimentos,', 'Kind regards,')}</p>
  </td></tr>
  <tr><td style="padding:10px 28px 26px">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="border-left:4px solid ${azul};padding:4px 0 4px 12px">
        <div style="font-size:15px;font-weight:bold;color:${azul}">${T_('Aplicação Cablotec', 'Cablotec Application')}</div>
        <div style="font-size:13px;color:#555">${T_('Geração de Etiquetas e Registo de Equipamentos', 'Label Generation and Equipment Registration')}</div>
        <div style="font-size:12px;color:#888;margin-top:2px">Cablotec – Cablagens e Sistemas, Lda</div>
      </td></tr></table>
  </td></tr>
  <tr><td style="background:#f4f6fa;padding:14px 28px;border-top:1px solid #e3e6ee">
    <p style="margin:0;font-size:11px;color:#888;line-height:1.5">
      ${T_('Esta mensagem foi gerada automaticamente pela Aplicação Cablotec – Geração de Etiquetas. O documento anexo contém informação técnica destinada exclusivamente aos destinatários indicados.',
           'This message was generated automatically by the Cablotec Application – Label Generation. The attached document contains technical information intended solely for the named recipients.')}</p>
  </td></tr>
</table>
</td></tr></table></body></html>`;
}

/** Versão em texto simples do mesmo email (para programas de email sem HTML). */
function textoEmail_(itens, quando) {
  const linhas = itens.map(it => {
    const d = it.dados || {}, x = it.extras || {};
    let cod = '';
    try { cod = codigoRastreio_(it.pasta, it.registadoEm); } catch (e) {}
    return `• ${cod} | Serial ${it.serial} | ${T_('Grupo', 'Group')} ${it.grupo || '—'}` + (x.cliente ? ` | ${x.cliente}` : '') +
           (d.modelo ? ` | ${d.modelo}` : '') + (it.link ? `\n  ${T_('Ficha', 'Record')}: ${it.link}` : '');
  }).join('\n');
  if (IDIOMA_ === 'en') return `Dear Sir or Madam,

Please find enclosed the registration report for ${itens.length} unit(s), issued on ${quando}, including the serial number, group information and the data shown on the respective rating plates.

The attached PDF document includes photographs of the labels, a transcription of the technical data and a unique tracking code for each unit.

${linhas}

Please do not hesitate to contact us should you require any further information.

Kind regards,

Cablotec Application
Label Generation and Equipment Registration
Cablotec – Cablagens e Sistemas, Lda

—
This message was generated automatically by the Cablotec Application – Label Generation.`;
  return `Exmos. Senhores,

Vimos por este meio remeter o relatório de registo de ${itens.length} equipamento(s), emitido em ${quando}, com a identificação do número de série, a informação do grupo e os dados constantes das respetivas placas de características.

Segue em anexo o documento em formato PDF, que inclui as fotografias das etiquetas, a transcrição dos dados técnicos e um código de rastreio único para cada equipamento.

${linhas}

Ficamos ao dispor para qualquer esclarecimento adicional.

Com os melhores cumprimentos,

Aplicação Cablotec
Geração de Etiquetas e Registo de Equipamentos
Cablotec – Cablagens e Sistemas, Lda

—
Mensagem gerada automaticamente pela Aplicação Cablotec – Geração de Etiquetas.`;
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
  Logger.log('📊 Folha de cálculo: ' + folha_());   // cria a folha (com os registos que já existem)
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
  let fichaUrl = '', assinaturaF = null;
  const files = pasta.getFiles();
  while (files.hasNext()) {
    const f = files.next();
    if (/^assinatura/i.test(f.getName())) assinaturaF = f;
    else if (f.getMimeType().indexOf('image/') === 0) fotos.push(f);
    else if (/^Ficha_.*\.pdf$/.test(f.getName())) fichaUrl = f.getUrl();
  }
  fotos.sort((a, b) => a.getName().localeCompare(b.getName()));
  const imgs = fotos.slice(0, 10).map(f => {
    const b = miniatura_(f, 1000);
    return `<img src="data:${b.getContentType()};base64,${Utilities.base64Encode(b.getBytes())}"
                 alt="${esc_(f.getName())}" onclick="this.classList.toggle('zoom')">`;
  }).join('');

  const html = `
    ${CONFIG.LOGOTIPOS ? `<div class="marcas"><img src="${logoDataUri_('cablotec')}" alt="Cablotec">
      <span><small>Cliente</small><img src="${logoDataUri_('aralab')}" alt="${esc_(CONFIG.CLIENTE_NOME || '')}"></span></div>` : ''}
    <header>${esc_(CONFIG.TITULO_PAGINA)}</header>
    <div class="card destaque">
      <div class="rotulo">SERIAL NO</div>
      <div class="serial">${esc_(info.serial)}</div>
    </div>
    <div class="card">
      <div class="rotulo">INFORMAÇÃO DO GRUPO</div>
      <div class="grupo">${esc_(info.grupo || '—')}</div>
    </div>
    ${extrasHtml_(info.extras, info.dados, info.campos)}
    ${assinaturaF ? `<div class="card"><div class="rotulo">ASSINATURA</div>
       <img src="data:image/png;base64,${Utilities.base64Encode(assinaturaF.getBlob().getBytes())}" style="background:#fff;border:1px solid #eee">
       <p style="margin:6px 0 0;font-size:14px">${esc_(((info.extras || {}).assinadoPor) || '')}</p></div>` : ''}
    ${linhas ? `<div class="card"><div class="rotulo">DADOS DA ETIQUETA</div><table>${linhas}</table></div>` : ''}
    <div class="card">
      <div class="rotulo">FOTOS (${fotos.length}) <small>· toque para ampliar</small></div>
      ${imgs || '<p>Sem fotos.</p>'}
    </div>
    ${fichaUrl ? `<a class="botao" href="${fichaUrl}" target="_blank">📄 Ficha em PDF</a>` : ''}
    <a class="botao sec" href="${pasta.getUrl()}" target="_blank">📁 Abrir pasta no Drive</a>
    <div class="card"><div class="rotulo">CÓDIGO DE RASTREIO</div>
      <div style="font-family:monospace;font-size:20px;font-weight:700;color:#c9272e">${esc_(codigoRastreio_(pasta, info.registadoEm))}</div></div>
    <footer>${info.registadoEm || info.enviadoEm ? 'Registado em ' + esc_(info.registadoEm || info.enviadoEm) : ''}
            ${info.enviadoEm && info.registadoEm ? ' · Enviado em ' + esc_(info.enviadoEm) : ''}</footer>`;
  return paginaHtml_(html, 'Serial ' + info.serial);
}

function paginaHtml_(conteudo, titulo) {
  const css = `
    *{box-sizing:border-box} body{margin:0;font-family:-apple-system,Roboto,Arial,sans-serif;background:#f1f3f6;color:#222}
    header{background:#3a393a;color:#fff;padding:14px;font-size:17px;font-weight:600;text-align:center;border-top:4px solid #c9272e}
    .marcas{display:flex;align-items:center;justify-content:space-between;background:#fff;padding:12px 16px}
    .marcas img{height:34px;width:auto;display:block;margin:0;border-radius:0}
    .marcas span{display:flex;align-items:center;gap:8px} .marcas small{color:#888;font-size:11px}
    .marcas span img{height:26px}
    .card{background:#fff;margin:12px;padding:14px 16px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.12)}
    .destaque{border:2px solid #000}
    .rotulo{font-size:12px;font-weight:700;color:#666;letter-spacing:.5px;margin-bottom:6px}
    .serial{font-size:38px;font-weight:800;color:#c9272e}
    .grupo{font-size:26px;font-weight:700}
    table{width:100%;border-collapse:collapse;font-size:15px}
    th{text-align:left;color:#555;font-weight:600;padding:7px 8px 7px 0;width:42%;vertical-align:top}
    td{padding:7px 0;word-break:break-all;font-family:monospace;font-size:15px}
    tr+tr th,tr+tr td{border-top:1px solid #eee}
    img{width:100%;border-radius:8px;margin-top:8px;display:block}
    img.zoom{position:fixed;inset:0;margin:0;width:100vw;height:100vh;object-fit:contain;background:#000;z-index:9;border-radius:0}
    .botao{display:block;margin:12px;padding:14px;text-align:center;border-radius:10px;background:#c9272e;color:#fff;text-decoration:none;font-weight:600}
    .botao.sec{background:#fff;color:#c9272e;border:1px solid #c9272e}
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
  while (it.hasNext()) { const f = it.next(); if (!pastaDeSistema_(f.getName())) { sub = f; break; } }
  if (!sub) { const env = pasta.getFoldersByName('Enviados'); if (env.hasNext()) { it = env.next().getFolders(); if (it.hasNext()) sub = it.next(); } }
  Logger.log(sub ? `${webApp}?id=${sub.getId()}` : 'Sem subpastas.');
}

/* ===================== FORMULÁRIO NO TELEMÓVEL ===================== */

/** Confirma o PIN. Devolve { nome, admin }: o CODIGO_ACESSO é o administrador; os técnicos têm PIN próprio. */
function verificarPin_(pin) {
  pin = String(pin == null ? '' : pin).trim();
  if (CONFIG.CODIGO_ACESSO && pin === String(CONFIG.CODIGO_ACESSO)) return { nome: '', admin: true };
  const t = pin ? tecnicoPorPin_(pin) : null;
  if (t && t.ativo) return { nome: t.nome, admin: false };
  Utilities.sleep(1500); // trava tentativas repetidas
  throw new Error(t ? 'Este acesso foi desativado. Fale com o responsável.' : 'Código de acesso errado.');
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
  const assin = slot === 'assinatura';
  slot = assin ? 9 : Number(slot);
  if ([1, 2, 3, 9].indexOf(slot) < 0) throw new Error('Foto inválida.');
  const pasta = DriveApp.getFolderById(pastaId);
  if (!pastaPertenceAoRelatorio_(pasta)) throw new Error('Pasta inválida.');
  // Substitui a foto anterior desse lugar (se o serial for registado de novo)
  const files = pasta.getFiles();
  while (files.hasNext()) {
    const f = files.next();
    if ((assin ? /^assinatura/i : new RegExp('^foto' + slot + '[_.\\s-]', 'i')).test(f.getName())) f.setTrashed(true);
  }
  const ts = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  const nome = { 1: `foto1_etiqueta_grande_${ts}.jpg`, 2: `foto2_etiqueta_pequena_${ts}.jpg`,
                 3: `foto3_equipamento_${ts}.jpg`, 9: `assinatura_${ts}.png` }[slot];
  pasta.createFile(Utilities.newBlob(Utilities.base64Decode(base64), assin ? 'image/png' : 'image/jpeg', nome));
  return true;
}

/** Chamado no fim: OCR (opcional), guarda os dados e devolve o link da ficha. */
function formFinalizar(pin, pastaId, extras, codigos) {
  const user = verificarPin_(pin);
  const pasta = DriveApp.getFolderById(pastaId);
  if (!pastaPertenceAoRelatorio_(pasta)) throw new Error('Pasta inválida.');
  const partes = pasta.getName().split(/\s*[-–_]\s*/);
  const item = { pasta, serial: partes.shift(), grupo: partes.join(' '), dados: {}, campos: [],
                 extras: limparExtras_(extras), codigos: limparCodigos_(codigos) };
  if (user && !user.admin) item.extras.tecnico = user.nome;   // o nome vem do PIN do técnico

  const fotos = [];
  const files = pasta.getFiles();
  while (files.hasNext()) { const f = files.next(); if (f.getMimeType().indexOf('image/') === 0 && !fotoExtra_(f)) fotos.push(f); }
  if (CONFIG.USAR_OCR && CONFIG.OCR_AO_REGISTAR) {
    try {
      const r = analisarEtiquetas_(fotos);
      Object.assign(item, { dados: r.dados, campos: r.campos, textoOCR: r.texto, fonte: r.fonte, fotos });
    } catch (e) { Logger.log('Leitura falhou: ' + e.message); }
  }
  const rc = aplicarCodigos_({ dados: item.dados, campos: item.campos, texto: item.textoOCR, fonte: item.fonte }, item.codigos);
  Object.assign(item, { dados: rc.dados, campos: rc.campos });
  item.fotos = fotos;
  guardarDadosNaPasta_(item);
  try { registarNaFolha_(pasta, 'Por enviar'); } catch (e) { Logger.log('Folha: ' + e.message); }
  const webApp = CONFIG.WEB_APP_URL || ScriptApp.getService().getUrl();
  return { link: webApp + '?id=' + pastaId, serial: item.serial, grupo: item.grupo, dados: item.dados, campos: item.campos, fotos: fotos.length,
           pastaId, extras: item.extras, fonte: item.fonte || '', rastreio: codigoRastreio_(pasta, item.registadoEm) };
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
      case 'ping':            { const u = verificarPin_(pin); data = { titulo: CONFIG.TITULO_PAGINA, nome: u.nome, admin: u.admin }; } break;
      case 'criarPasta':      data = formCriarPasta(pin, req.serial, req.grupo); break;
      case 'enviarFoto':      data = formEnviarFoto(pin, req.pastaId, req.base64, req.slot); break;
      case 'finalizar':       data = formFinalizar(pin, req.pastaId, req.extras, req.codigos); break;
      case 'enviarRelatorio': verificarPin_(pin);
                              data = { enviados: enviarRelatorioPara_(req.ids, validarEmails_(req.emails), req.idioma),
                                       paginas: ultimoEnvio_.paginas }; break;
      case 'estatisticas':    verificarPin_(pin); data = apiEstatisticas_(); break;
      case 'relatorioMensal': soAdmin_(pin); data = relatorioMensal_(validarEmails_(req.emails), req.mes); break;
      case 'tecnicos':        soAdmin_(pin); data = apiTecnicos_(); break;
      case 'tecnicoGuardar':  soAdmin_(pin); data = apiTecnicoGuardar_(req.nome, req.novoPin, req.ativo, req.id); break;
      case 'tecnicoRemover':  soAdmin_(pin); data = apiTecnicoRemover_(req.id); break;
      case 'listar':          data = apiListar_(pin); break;
      case 'verificar':       verificarPin_(pin); data = apiVerificar_(req.serial); break;
      case 'pesquisar':       verificarPin_(pin); data = apiPesquisar_(req.q); break;
      case 'obter':           verificarPin_(pin); data = apiObter_(req.pastaId); break;
      case 'corrigir':        verificarPin_(pin); data = apiCorrigir_(req.pastaId, req.campos, req.extras); break;
      case 'etiquetasQR':     verificarPin_(pin); data = apiEtiquetasQR_(req.ids); break;
      case 'remover':         verificarPin_(pin); data = apiRemover_(req.pastaId); break;
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
      modelo: (info.dados || {}).modelo || '', fotos, id: pasta.getId(),
      cliente: (info.extras || {}).cliente || '', tecnico: (info.extras || {}).tecnico || '',
      fonte: info.fonte || '', corrigido: !!info.corrigido,
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
      todas.slice(0, 100).forEach(p => enviados.push(ler(p)));
    } else if (!pastaDeSistema_(f.getName())) {
      porEnviar.push(ler(f));
    }
  }
  porEnviar.sort((a, b) => b._t - a._t);
  let folha = '';
  try { folha = folha_(); } catch (e) { Logger.log('Folha: ' + e.message); }
  try { garantirAgendamentoMensal_(); } catch (e) { Logger.log('Agendamento mensal: ' + e.message); }
  return { porEnviar, enviados, folha, emailPadrao: CONFIG.EMAIL_DESTINO };
}
