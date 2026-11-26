/**
 * Funcionalidades extra da aplicação:
 *  - folha de cálculo com o histórico (uma linha por máquina)
 *  - códigos de barras lidos no telemóvel
 *  - rever / corrigir os dados lidos
 *  - pesquisa, aviso de duplicados
 *  - técnico, cliente/obra, local e observações
 *  - etiquetas QR para imprimir
 */

/** Pastas da aplicação que não são registos de máquinas. */
function pastaDeSistema_(nome) {
  return nome === 'Enviados' || nome === 'Etiquetas QR';
}

/* ===================== CÓDIGO DE RASTREIO ===================== */

/**
 * Código único e fixo de cada registo, ex.: RS-261117-K7Q4XZ
 * (data do registo + 6 caracteres tirados do ID da pasta no Drive).
 * É sempre o mesmo no PDF, na ficha do QR e na folha de cálculo, e pode ser pesquisado.
 */
function codigoRastreio_(pasta, registadoEm) {
  const id = typeof pasta === 'string' ? pasta : pasta.getId();
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, id);
  const ALF = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // sem 0/O e 1/I para não confundir
  let sufixo = '';
  for (let i = 0; i < 6; i++) sufixo += ALF[(bytes[i] + 256) % 32];
  const m = String(registadoEm || '').match(/(\d{2})\/(\d{2})\/(\d{4})/);
  const data = m ? m[3].slice(2) + m[2] + m[1]
    : Utilities.formatDate(typeof pasta === 'string' ? new Date() : pasta.getDateCreated(), Session.getScriptTimeZone(), 'yyMMdd');
  return 'RS-' + data + '-' + sufixo;
}

/* ===================== CAMPOS EXTRA ===================== */

function limparExtras_(x) {
  x = x || {};
  const t = (v, n) => String(v || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
  const r = { tecnico: t(x.tecnico, 60), cliente: t(x.cliente, 80), local: t(x.local, 80),
              obs: String(x.obs || '').trim().slice(0, 1000), assinadoPor: t(x.assinadoPor, 80) };
  Object.keys(r).forEach(k => { if (!r[k]) delete r[k]; });
  const g = x.gps || {};
  const lat = Number(g.lat), lon = Number(g.lon);
  if (isFinite(lat) && isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && (lat || lon)) {
    r.gps = { lat: Math.round(lat * 1e6) / 1e6, lon: Math.round(lon * 1e6) / 1e6, prec: Math.round(Number(g.prec) || 0) };
  }
  return r;
}

function extrasHtml_(x, dados, campos) {
  x = x || {};
  const gar = garantia_(dados, campos);
  const l = [['Cliente / Obra', x.cliente], ['Local', x.local], ['Técnico', x.tecnico], ['Observações', x.obs],
             ['Garantia (estimada)', gar ? gar.texto : '']]
    .filter(c => c[1]).map(c => `<tr><th>${esc_(c[0])}</th><td>${esc_(c[1])}</td></tr>`).join('');
  const mapa = x.gps ? `<a class="botao sec" target="_blank" href="https://www.google.com/maps?q=${x.gps.lat},${x.gps.lon}">📍 Ver local no mapa</a>` : '';
  return (l ? `<div class="card"><div class="rotulo">REGISTO</div><table>${l}</table></div>` : '') + mapa;
}

function validarEmails_(emails) {
  const l = String(emails || '').split(/[,;\s]+/).map(e => e.trim()).filter(Boolean);
  if (!l.length) return '';
  const mau = l.filter(e => !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(e));
  if (mau.length) throw new Error('Email inválido: ' + mau.join(', ') + ' (sem acentos nem espaços).');
  if (l.length > 20) throw new Error('No máximo 20 emails.');
  return l.join(',');
}

/* ===================== CÓDIGOS DE BARRAS ===================== */

function limparCodigos_(c) {
  return (Array.isArray(c) ? c : []).slice(0, 12).map(x => ({
    texto: String((x && x.texto) || '').trim().slice(0, 80),
    formato: String((x && x.formato) || '').trim().slice(0, 20),
  })).filter(x => x.texto);
}

/**
 * Os códigos de barras são exatos: substituem o serial e o EAN lidos por IA/OCR.
 * r = { dados, campos, texto, fonte }
 */
function aplicarCodigos_(r, codigos) {
  r = r || {};
  const dados = Object.assign({}, r.dados || {});
  const campos = (r.campos || []).map(c => c.slice());
  codigos = limparCodigos_(codigos);
  if (!codigos.length) return Object.assign({}, r, { dados, campos });

  const ean = codigos.find(c => /^\d{13}$/.test(c.texto));
  const serial = codigos.find(c => !/^\d{13}$/.test(c.texto) && /\d/.test(c.texto) && /[A-Z]/i.test(c.texto) &&
                                   !/^OP-/i.test(c.texto) && !/^\d{3}[A-Z]\d{4}$/.test(c.texto)) ||
                 codigos.find(c => dados.serial && c.texto === dados.serial);
  const define = (rx, nome, valor) => {
    const i = campos.findIndex(c => rx.test(c[0]));
    if (i >= 0) campos[i][1] = valor; else campos.unshift([nome, valor]);
  };
  if (ean) { dados.ean = ean.texto; define(/^EAN/i, 'EAN No.', ean.texto); }
  if (serial) { dados.serial = serial.texto; define(/^Serial\s*No/i, 'Serial No.', serial.texto); }
  const lista = codigos.map(c => c.texto).filter((v, i, a) => a.indexOf(v) === i).join(' · ');
  const i = campos.findIndex(c => c[0] === 'Códigos de barras');
  if (i >= 0) campos[i][1] = lista; else campos.push(['Códigos de barras', lista]);
  return Object.assign({}, r, { dados, campos });
}

/* ===================== FOLHA DE CÁLCULO ===================== */

const COLUNAS_FOLHA_ = ['Código de rastreio', 'Serial', 'Grupo', 'Cliente / Obra', 'Local', 'Técnico', 'Registado em', 'Estado',
  'Enviado em', 'Leitura', 'Modelo', 'Código', 'Serial etiqueta', 'EAN', 'Tensão', 'Refrigerante', 'Ano',
  'Garantia até', 'Localização', 'Assinado por', 'Todos os campos', 'Observações', 'Ficha', 'Pasta', 'ID'];

/*
 * A folha "Registo de Seriais" é uma Google Sheet gerada a partir de um ficheiro de dados
 * (registo-seriais.json) na pasta principal. Usa só o acesso ao Drive que já está autorizado,
 * por isso não é preciso dar permissões novas.
 */

function registoFicheiro_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('REGISTO_JSON_ID');
  if (id) {
    try { const f = DriveApp.getFileById(id); if (!f.isTrashed()) return f; } catch (e) {}
  }
  const raiz = DriveApp.getFolderById(CONFIG.PASTA_ID);
  const f = raiz.createFile('registo-seriais.json', JSON.stringify(construirRegisto_()), 'application/json');
  f.setDescription('Dados da folha "Registo de Seriais" (gerido pela aplicação). Não apagar.');
  props.setProperty('REGISTO_JSON_ID', f.getId());
  return f;
}

function lerRegisto_() {
  try { return JSON.parse(registoFicheiro_().getBlob().getDataAsString('UTF-8') || '{}'); } catch (e) { return {}; }
}

/** Constrói o registo a partir de todas as pastas (por enviar e enviadas). */
function construirRegisto_() {
  const raiz = DriveApp.getFolderById(CONFIG.PASTA_ID);
  const reg = {};
  const subs = raiz.getFolders();
  while (subs.hasNext()) {
    const f = subs.next();
    if (f.getName() === 'Enviados') {
      const env = f.getFolders();
      while (env.hasNext()) { const e = env.next(); reg[e.getId()] = linhaFolha_(e, 'Enviado'); }
    } else if (!pastaDeSistema_(f.getName())) {
      reg[f.getId()] = linhaFolha_(f, 'Por enviar');
    }
  }
  return reg;
}

/** Escreve o registo e atualiza a Google Sheet (cria-a se não existir). */
function gravarRegisto_(reg) {
  registoFicheiro_().setContent(JSON.stringify(reg));
  const linhas = Object.keys(reg).map(k => reg[k]);
  const ordem = v => { const m = String(v || '').match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/); return m ? m[3] + m[2] + m[1] + m[4] + m[5] : ''; };
  const iData = COLUNAS_FOLHA_.indexOf('Registado em');
  linhas.sort((a, b) => ordem(b[iData]).localeCompare(ordem(a[iData])));   // mais recentes primeiro
  const csvCel = v => {
    v = String(v == null ? '' : v);
    if (/^[=+@]/.test(v)) v = ' ' + v;   // evita fórmulas
    return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  };
  const csv = [COLUNAS_FOLHA_].concat(linhas).map(l => l.map(csvCel).join(',')).join('\r\n');
  const blob = Utilities.newBlob(csv, 'text/csv', 'Registo de Seriais.csv');
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('FOLHA_ID');
  if (id) {
    try { if (DriveApp.getFileById(id).isTrashed()) id = null; } catch (e) { id = null; }
  }
  if (id) {
    Drive.Files.update({}, id, blob);
  } else {
    const f = Drive.Files.create({ name: 'Registo de Seriais', mimeType: MimeType.GOOGLE_SHEETS, parents: [CONFIG.PASTA_ID] }, blob);
    props.setProperty('FOLHA_ID', f.id);
  }
}

/** Cria a folha (com os registos que já existem), se ainda não existir. Devolve o URL. */
function folha_() {
  const props = PropertiesService.getScriptProperties();
  const cache = CacheService.getScriptCache();
  if (!props.getProperty('FOLHA_ID') || !props.getProperty('REGISTO_JSON_ID')) {
    props.deleteProperty('REGISTO_JSON_ID');
    gravarRegisto_(lerRegisto_());
    cache.put('registo_sync', '1', 21600);
  } else if (!cache.get('registo_sync') || !cache.get('registo_cols_' + COLUNAS_FOLHA_.length)) {
    cache.put('registo_cols_' + COLUNAS_FOLHA_.length, '1', 21600);
    // de 6 em 6 horas volta a ler todas as pastas (apanha pastas apagadas ou mudadas à mão)
    cache.put('registo_sync', '1', 21600);
    gravarRegisto_(construirRegisto_());
  }
  return folhaUrl_();
}

function folhaUrl_() {
  const id = PropertiesService.getScriptProperties().getProperty('FOLHA_ID');
  return id ? 'https://docs.google.com/spreadsheets/d/' + id + '/edit' : '';
}

function linhaFolha_(pasta, estado) {
  const info = lerInfo_(pasta);
  const partes = pasta.getName().split(/\s*[-–_]\s*/);
  const d = info.dados || {}, x = info.extras || {};
  const webApp = CONFIG.WEB_APP_URL || ScriptApp.getService().getUrl();
  return [
    codigoRastreio_(pasta, info.registadoEm), info.serial || partes[0], info.grupo || partes.slice(1).join(' '), x.cliente || '', x.local || '', x.tecnico || '',
    info.registadoEm || '', estado, info.enviadoEm && estado === 'Enviado' ? info.enviadoEm : '',
    (info.fonte || '') + (info.corrigido ? ' (revisto)' : ''),
    d.modelo || '', d.codigo || '', d.serial || '', d.ean || '', d.voltagem || '', d.refrigerante || '', d.ano || '',
    (garantia_(d, info.campos) || {}).fim || '',
    x.gps ? 'https://www.google.com/maps?q=' + x.gps.lat + ',' + x.gps.lon : '', x.assinadoPor || '',
    (info.campos || []).map(c => c[0] + ': ' + c[1]).join('\n'), x.obs || '',
    linkFicha_(pasta.getId()), pasta.getUrl(), pasta.getId(),
  ];
}

/** Acrescenta ou atualiza a linha desta pasta. */
function registarNaFolha_(pasta, estado) {
  registarVarios_([[pasta, estado]]);
}
function registarVarios_(lista) {
  // vários técnicos ao mesmo tempo: só um de cada vez escreve na folha (para não se perderem linhas)
  const lock = LockService.getScriptLock();
  const jaTinha = lock.hasLock();
  if (!jaTinha && !lock.tryLock(20000)) { Logger.log('Folha ocupada: atualiza na próxima sincronização.'); return; }
  try { registarVarios__(lista); } finally { if (!jaTinha) lock.releaseLock(); }
}
function registarVarios__(lista) {
  let reg = lerRegisto_();
  if (Object.keys(reg).some(k => reg[k].length !== COLUNAS_FOLHA_.length)) reg = construirRegisto_();   // colunas mudaram
  lista.forEach(([pasta, estado]) => { reg[pasta.getId()] = linhaFolha_(pasta, estado); });
  gravarRegisto_(reg);
}

/* ===================== PESQUISA E DUPLICADOS ===================== */

function pastasComSerial_(serial) {
  const raiz = DriveApp.getFolderById(CONFIG.PASTA_ID);
  const q = String(serial).replace(/['\\]/g, '');
  const rx = new RegExp('^' + q.replace(/[.\/]/g, '\\$&') + '(\\s*[-–_]|$)', 'i');
  const achadas = [];
  const procurar = (pai, estado) => {
    const it = pai.searchFolders(`title contains '${q}'`);
    while (it.hasNext()) { const f = it.next(); if (rx.test(f.getName())) achadas.push({ pasta: f, estado }); }
  };
  procurar(raiz, 'Por enviar');
  const env = raiz.getFoldersByName('Enviados');
  if (env.hasNext()) procurar(env.next(), 'Enviado');
  return achadas;
}

function apiVerificar_(serial) {
  serial = String(serial || '').trim().toUpperCase();
  if (!serial) return { existe: false };
  const webApp = CONFIG.WEB_APP_URL || ScriptApp.getService().getUrl();
  const l = pastasComSerial_(serial).map(a => {
    const info = lerInfo_(a.pasta);
    return { estado: a.estado, grupo: info.grupo || '', data: info.enviadoEm || info.registadoEm || '',
             link: linkFicha_(a.pasta.getId()) };
  });
  return { existe: l.length > 0, registos: l };
}

function apiPesquisar_(q) {
  q = String(q || '').trim().toLowerCase();
  if (q.length < 2) throw new Error('Escreva pelo menos 2 letras ou números.');
  const webApp = CONFIG.WEB_APP_URL || ScriptApp.getService().getUrl();
  // 1) Pelo registo da folha de cálculo (rápido)
  try {
    folha_();
    const reg = lerRegisto_();
    const ids = Object.keys(reg);
    if (ids.length) {
      const col = nome => COLUNAS_FOLHA_.indexOf(nome);
      const ordem = v => { const m = String(v || '').match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/); return m ? m[3] + m[2] + m[1] + m[4] + m[5] : ''; };
      const res = ids.map(k => reg[k]).filter(r => r.join(' ').toLowerCase().indexOf(q) >= 0)
        .sort((a, b) => ordem(b[col('Registado em')]).localeCompare(ordem(a[col('Registado em')])))
        .slice(0, 50).map(r => ({
          serial: r[col('Serial')], grupo: r[col('Grupo')], cliente: r[col('Cliente / Obra')],
          modelo: r[col('Modelo')], estado: r[col('Estado')], data: r[col('Enviado em')] || r[col('Registado em')],
          link: r[col('Ficha')], id: r[col('ID')],
        }));
      return { resultados: res };
    }
  } catch (e) { Logger.log('Pesquisa pelo registo falhou: ' + e.message); }
  // 2) Sem folha: procura no nome das pastas
  const raiz = DriveApp.getFolderById(CONFIG.PASTA_ID);
  const qq = q.replace(/['\\]/g, '');
  const res = [];
  const procurar = (pai, estado) => {
    const it = pai.searchFolders(`title contains '${qq}'`);
    while (it.hasNext() && res.length < 50) {
      const f = it.next(), info = lerInfo_(f);
      if (pastaDeSistema_(f.getName())) continue;
      res.push({ serial: info.serial || f.getName(), grupo: info.grupo || '', cliente: (info.extras || {}).cliente || '',
                 modelo: (info.dados || {}).modelo || '', estado, data: info.enviadoEm || info.registadoEm || '',
                 link: linkFicha_(f.getId()), id: f.getId() });
    }
  };
  procurar(raiz, 'Por enviar');
  const env = raiz.getFoldersByName('Enviados');
  if (env.hasNext()) procurar(env.next(), 'Enviado');
  return { resultados: res };
}

/* ===================== REVER / CORRIGIR ===================== */

function pastaValida_(pastaId) {
  const pasta = DriveApp.getFolderById(String(pastaId || ''));
  if (!pastaPertenceAoRelatorio_(pasta)) throw new Error('Registo inválido.');
  return pasta;
}

function apiObter_(pastaId) {
  const pasta = pastaValida_(pastaId);
  const info = lerInfo_(pasta);
  const partes = pasta.getName().split(/\s*[-–_]\s*/);
  const webApp = CONFIG.WEB_APP_URL || ScriptApp.getService().getUrl();
  return {
    pastaId, serial: info.serial || partes[0], grupo: info.grupo || partes.slice(1).join(' '),
    campos: info.campos || [], dados: info.dados || {}, extras: info.extras || {}, fonte: info.fonte || '',
    corrigido: !!info.corrigido, link: linkFicha_(pastaId), rastreio: codigoRastreio_(pasta, info.registadoEm),
    enviado: pasta.getParents().hasNext() && pasta.getParents().next().getName() === 'Enviados',
  };
}

/** Guarda os campos revistos pelo técnico (e os campos extra). */
function apiCorrigir_(pastaId, campos, extras) {
  const pasta = pastaValida_(pastaId);
  const info = lerInfo_(pasta);
  const limpos = (Array.isArray(campos) ? campos : []).slice(0, 60)
    .map(c => [String(c[0] || '').trim().slice(0, 60), String(c[1] || '').trim().slice(0, 200)])
    .filter(c => c[0] && c[1]);
  // atualiza os dados principais a partir dos campos revistos
  const dados = Object.assign({}, info.dados || {});
  const mapa = [[/^modelo$|^model/i, 'modelo'], [/^c[oó]digo$|^code/i, 'codigo'], [/^serial\s*(no|etiqueta)/i, 'serial'],
                [/^ean/i, 'ean'], [/^volta|^tens[aã]o/i, 'voltagem'], [/^refrigerante$/i, 'refrigerante'],
                [/^year|^ano/i, 'ano']];
  mapa.forEach(([rx, k]) => { const c = limpos.find(x => rx.test(x[0])); if (c) dados[k] = c[1]; });
  const enviado = pasta.getParents().next().getName() === 'Enviados';
  const item = { pasta, serial: info.serial, grupo: info.grupo, campos: limpos, dados, corrigido: true,
                 extras: extras ? limparExtras_(extras) : info.extras };
  guardarDadosNaPasta_(item);
  try { registarNaFolha_(pasta, enviado ? 'Enviado' : 'Por enviar'); } catch (e) { Logger.log('Folha: ' + e.message); }
  return apiObter_(pastaId);
}

/** Remove um registo: a pasta (fotos, ficha) vai para o lixo do Drive e sai da folha de cálculo. */
function apiRemover_(pastaId) {
  const pasta = pastaValida_(pastaId);
  const nome = pasta.getName();
  pasta.setTrashed(true);
  try {
    const reg = lerRegisto_();
    if (reg[pastaId]) { delete reg[pastaId]; gravarRegisto_(reg); }
  } catch (e) { Logger.log('Folha: ' + e.message); }
  Logger.log('Removido: ' + nome);
  return { removido: nome };
}

/* ===================== ETIQUETAS QR PARA IMPRIMIR ===================== */

/** Cria um PDF A4 com etiquetas (QR + serial + grupo) para colar nos equipamentos. */
function apiEtiquetasQR_(ids) {
  ids = (Array.isArray(ids) ? ids : []).slice(0, 60);
  if (!ids.length) throw new Error('Escolha pelo menos um registo.');
  const webApp = CONFIG.WEB_APP_URL || ScriptApp.getService().getUrl();
  const itens = ids.map(id => {
    const pasta = pastaValida_(id), info = lerInfo_(pasta);
    const partes = pasta.getName().split(/\s*[-–_]\s*/);
    return { serial: info.serial || partes[0], grupo: info.grupo || partes.slice(1).join(' '),
             modelo: (info.dados || {}).modelo || '', link: linkFicha_(id) };
  });
  const data = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
  const doc = DocumentApp.create('Etiquetas QR ' + data);
  const body = doc.getBody();
  body.setMarginTop(28).setMarginBottom(28).setMarginLeft(28).setMarginRight(28);
  const COLS = 3;
  const linhas = [];
  for (let i = 0; i < itens.length; i += COLS) linhas.push(itens.slice(i, i + COLS));
  const t = body.appendTable(linhas.map(l => { const r = l.map(() => ''); while (r.length < COLS) r.push(''); return r; }));
  t.setBorderWidth(0.5).setBorderColor('#bbbbbb');
  linhas.forEach((l, r) => l.forEach((it, c) => {
    const cell = t.getCell(r, c).setWidth(179).setPaddingTop(8).setPaddingBottom(8)
                  .setVerticalAlignment(DocumentApp.VerticalAlignment.CENTER);
    const p = cell.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    if (CONFIG.LOGOTIPOS) {
      try {
        const lg = p.appendInlineImage(logoBlob_('cablotec'));
        lg.setWidth(Math.round(18 * lg.getWidth() / lg.getHeight())).setHeight(18);
        p.appendText('\n');
      } catch (e) {}
    }
    try {
      const qr = UrlFetchApp.fetch('https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=4&data=' +
                                   encodeURIComponent(it.link)).getBlob();
      p.appendInlineImage(qr).setWidth(110).setHeight(110);
    } catch (e) { p.appendText('(QR indisponível)'); }
    const s = cell.appendParagraph('SERIAL NO: ' + it.serial).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    s.editAsText().setBold(true).setFontSize(12).setForegroundColor('#000000');
    const g = cell.appendParagraph((it.grupo ? 'Grupo ' + it.grupo : '') + (it.modelo ? '\n' + it.modelo : ''))
                  .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    g.editAsText().setBold(false).setFontSize(9).setForegroundColor('#444444');
  }));
  doc.saveAndClose();
  const docFile = DriveApp.getFileById(doc.getId());
  const raiz = DriveApp.getFolderById(CONFIG.PASTA_ID);
  const destino = obterOuCriarPasta_(raiz, 'Etiquetas QR');
  const pdf = destino.createFile(docFile.getAs(MimeType.PDF).setName('Etiquetas QR ' + data + '.pdf'));
  docFile.setTrashed(true);
  return { url: pdf.getUrl(), nome: pdf.getName(), n: itens.length };
}


/* ===================== IDIOMA DO RELATÓRIO ===================== */

let IDIOMA_ = 'pt';
/** Texto em português ou inglês, conforme o idioma escolhido no envio. */
function T_(pt, en) { return IDIOMA_ === 'en' ? en : pt; }

/* ===================== FOTO 3 E ASSINATURA ===================== */

function fotoExtra_(f) {
  return /^(foto3[_.\s-]|assinatura|comp_)/i.test(f.getName());
}

/** Na 2.ª folha: foto 3 (equipamento/local) à esquerda e assinatura à direita. */
function blocoFoto3Assinatura_(body, item) {
  try {
    const c = tabelaInvisivel_(body, [270, 245]);
    if (item.foto3) {
      const h = c[0].getChild(0).asParagraph();
      h.appendText(T_('Equipamento / local', 'Unit / site')).setFontSize(8).setBold(true).setForegroundColor('#555555');
      const p = c[0].appendParagraph('');
      const img = p.appendInlineImage(blobImagem_(item.foto3));
      const k = Math.min(260 / img.getWidth(), 140 / img.getHeight());
      img.setWidth(Math.round(img.getWidth() * k)).setHeight(Math.round(img.getHeight() * k));
    }
    if (item.assinatura) {
      const x = item.extras || {};
      const h = c[1].getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      h.appendText(T_('Assinatura', 'Signature')).setFontSize(8).setBold(true).setForegroundColor('#555555');
      const p = c[1].appendParagraph('').setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      const img = p.appendInlineImage(item.assinatura.getBlob());
      const k = Math.min(220 / img.getWidth(), 80 / img.getHeight());
      img.setWidth(Math.round(img.getWidth() * k)).setHeight(Math.round(img.getHeight() * k));
      const n = c[1].appendParagraph('______________________________\n' + (x.assinadoPor || '') +
                                     (item.registadoEm ? '  ·  ' + item.registadoEm : ''))
        .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      n.editAsText().setFontSize(8).setBold(false).setForegroundColor('#333333');
    }
  } catch (e) { Logger.log('Foto 3 / assinatura: ' + e.message); }
}

/* ===================== GARANTIA ===================== */

/** Fim de garantia estimado: fim do ano de fabrico + GARANTIA_MESES. */
function garantia_(dados, campos) {
  const meses = Number(CONFIG.GARANTIA_MESES) || 0;
  if (!meses) return null;
  let ano = String((dados || {}).ano || '');
  if (!/^(19|20)\d{2}$/.test(ano)) {
    const c = (campos || []).find(x => /year|ano\b|fabrico|mfg/i.test(x[0]) && /\b(19|20)\d{2}\b/.test(x[1]));
    ano = c ? c[1].match(/\b(19|20)\d{2}\b/)[0] : '';
  }
  if (!ano) return null;
  const fim = new Date(Number(ano), 11, 31);
  fim.setMonth(fim.getMonth() + meses);
  const fimTxt = Utilities.formatDate(fim, Session.getScriptTimeZone(), 'MM/yyyy');
  const valida = fim >= new Date();
  return { fim: fimTxt, valida,
           texto: T_('até ', 'until ') + fimTxt + (valida ? T_(' (válida)', ' (valid)') : T_(' (expirada)', ' (expired)')) };
}

/* ===================== TÉCNICOS (PIN POR PESSOA) ===================== */

function hashPin_(pin) {
  const b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'seriais:' + String(pin));
  return b.map(x => ('0' + ((x + 256) % 256).toString(16)).slice(-2)).join('');
}
function lerTecnicos_() {
  try { return JSON.parse(PropertiesService.getScriptProperties().getProperty('TECNICOS') || '[]'); } catch (e) { return []; }
}
function gravarTecnicos_(l) {
  PropertiesService.getScriptProperties().setProperty('TECNICOS', JSON.stringify(l));
}
function tecnicoPorPin_(pin) {
  const h = hashPin_(pin);
  return lerTecnicos_().find(t => t.hash === h) || null;
}
function soAdmin_(pin) {
  const u = verificarPin_(pin);
  if (!u.admin) throw new Error('Só o responsável (código principal) pode fazer isto.');
  return u;
}
function apiTecnicos_() {
  return { tecnicos: lerTecnicos_().map(t => ({ id: t.id, nome: t.nome, ativo: t.ativo, criado: t.criado })) };
}
/** Cria ou altera um técnico. novoPin vazio = mantém o PIN (só ao alterar). */
function apiTecnicoGuardar_(nome, novoPin, ativo, id) {
  nome = String(nome || '').trim().slice(0, 60);
  novoPin = String(novoPin || '').trim();
  if (!nome) throw new Error('Escreva o nome do técnico.');
  if (novoPin && !/^\d{4,8}$/.test(novoPin)) throw new Error('O PIN tem de ter 4 a 8 números.');
  if (novoPin && novoPin === String(CONFIG.CODIGO_ACESSO)) throw new Error('Esse PIN é o código principal. Escolha outro.');
  const l = lerTecnicos_();
  if (novoPin && l.some(t => t.hash === hashPin_(novoPin) && t.id !== id)) throw new Error('Esse PIN já está a ser usado.');
  let t = id ? l.find(x => x.id === id) : null;
  if (id && !t) throw new Error('Técnico não encontrado.');
  if (!t) {
    if (!novoPin) throw new Error('Escolha um PIN para o técnico.');
    t = { id: Utilities.getUuid().slice(0, 8), criado: agora_() };
    l.push(t);
  }
  t.nome = nome;
  t.ativo = ativo !== false;
  if (novoPin) t.hash = hashPin_(novoPin);
  gravarTecnicos_(l);
  return apiTecnicos_();
}
function apiTecnicoRemover_(id) {
  gravarTecnicos_(lerTecnicos_().filter(t => t.id !== id));
  return apiTecnicos_();
}

/* ===================== PAINEL DE ESTATÍSTICAS ===================== */

function apiEstatisticas_() {
  folha_();
  const reg = lerRegisto_();
  const col = n => COLUNAS_FOLHA_.indexOf(n);
  const linhas = Object.keys(reg).map(k => reg[k]);
  const data = v => { const m = String(v || '').match(/(\d{2})\/(\d{2})\/(\d{4})/); return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null; };
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const seg = new Date(hoje); seg.setDate(hoje.getDate() - ((hoje.getDay() + 6) % 7));
  const iniMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const conta = (f) => { const o = {}; linhas.forEach(r => { const k = f(r) || '—'; o[k] = (o[k] || 0) + 1; });
    return Object.keys(o).map(k => [k, o[k]]).sort((a, b) => b[1] - a[1]).slice(0, 8); };
  const meses = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const k = Utilities.formatDate(d, Session.getScriptTimeZone(), 'MM/yyyy');
    meses.push([k, linhas.filter(r => { const x = data(r[col('Registado em')] || r[col('Enviado em')]);
      return x && x.getMonth() === d.getMonth() && x.getFullYear() === d.getFullYear(); }).length]);
  }
  const dias = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(hoje); d.setDate(hoje.getDate() - i);
    dias.push([Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd/MM'),
      linhas.filter(r => { const x = data(r[col('Registado em')] || r[col('Enviado em')]); return x && x.getTime() === d.getTime(); }).length]);
  }
  const desde = (ini) => linhas.filter(r => { const x = data(r[col('Registado em')] || r[col('Enviado em')]); return x && x >= ini; }).length;
  return {
    total: linhas.length,
    porEnviar: linhas.filter(r => r[col('Estado')] === 'Por enviar').length,
    hoje: desde(hoje), semana: desde(seg), mes: desde(iniMes),
    garantiaExpirada: linhas.filter(r => { const g = String(r[col('Garantia até')] || '').match(/(\d{2})\/(\d{4})/);
      return g && new Date(+g[2], +g[1], 0) < hoje; }).length,
    porMes: meses, porDia: dias,
    porCliente: conta(r => r[col('Cliente / Obra')]), porModelo: conta(r => r[col('Modelo')]),
    porTecnico: conta(r => r[col('Técnico')]), porGrupo: conta(r => r[col('Grupo')]),
    folha: folhaUrl_(),
  };
}

/* ===================== RELATÓRIO MENSAL ===================== */

/** Cria (uma vez) o envio automático no dia 1 de cada mês às 8h. */
function garantirAgendamentoMensal_() {
  if (!CONFIG.RELATORIO_MENSAL) return;
  const cache = CacheService.getScriptCache();
  if (cache.get('mensal_ok')) return;
  const existe = ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'relatorioMensal');
  if (!existe) ScriptApp.newTrigger('relatorioMensal').timeBased().onMonthDay(1).atHour(8).create();
  cache.put('mensal_ok', '1', 21600);
}

/** Chamado pelo agendamento: resumo do mês anterior para os destinatários habituais. */
function relatorioMensal() {
  relatorioMensal_('', '');
}

/** mes: 'MM/yyyy' (vazio = mês anterior). Envia o resumo e a folha em Excel. */
function relatorioMensal_(emails, mes) {
  folha_();
  const reg = lerRegisto_();
  const col = n => COLUNAS_FOLHA_.indexOf(n);
  let alvo;
  const m = String(mes || '').match(/^(\d{2})\/(\d{4})$/);
  if (m) alvo = new Date(+m[2], +m[1] - 1, 1);
  else { const h = new Date(); alvo = new Date(h.getFullYear(), h.getMonth() - 1, 1); }
  const nomeMes = Utilities.formatDate(alvo, Session.getScriptTimeZone(), 'MM/yyyy');
  const doMes = Object.keys(reg).map(k => reg[k]).filter(r => {
    const x = String(r[col('Registado em')] || r[col('Enviado em')] || '').match(/\d{2}\/(\d{2})\/(\d{4})/);
    return x && +x[1] === alvo.getMonth() + 1 && +x[2] === alvo.getFullYear();
  });
  const conta = (i) => { const o = {}; doMes.forEach(r => { const k = r[i] || '—'; o[k] = (o[k] || 0) + 1; });
    return Object.keys(o).map(k => [k, o[k]]).sort((a, b) => b[1] - a[1]); };
  const tabela = (titulo, l) => !l.length ? '' : `<p style="margin:16px 0 4px;font-weight:bold;color:#3a393a">${esc_(titulo)}</p>
    <table cellpadding="6" style="border-collapse:collapse;font-size:13px">${l.map(([k, v]) =>
      `<tr><td style="border-bottom:1px solid #eee;min-width:220px">${esc_(k)}</td><td style="border-bottom:1px solid #eee;font-weight:bold;text-align:right">${v}</td></tr>`).join('')}</table>`;
  const lista = doMes.slice(0, 200).map(r => `<tr>
      <td style="border-bottom:1px solid #eee;font-family:monospace;color:#c9272e">${esc_(r[col('Código de rastreio')])}</td>
      <td style="border-bottom:1px solid #eee"><a href="${r[col('Ficha')]}" style="color:#222">${esc_(r[col('Serial')])}</a></td>
      <td style="border-bottom:1px solid #eee">${esc_(r[col('Grupo')])}</td>
      <td style="border-bottom:1px solid #eee">${esc_(r[col('Cliente / Obra')])}</td>
      <td style="border-bottom:1px solid #eee">${esc_(r[col('Registado em')])}</td></tr>`).join('');
  const html = `<div style="font-family:Arial,sans-serif;max-width:680px;color:#222">
    ${CONFIG.LOGOTIPOS ? '<p><img src="cid:logoCablotec" height="40" alt="Cablotec"></p>' : ''}
    <div style="background:#3a393a;color:#fff;padding:16px 20px;border-top:4px solid #c9272e">
      <div style="font-size:19px;font-weight:bold">Resumo mensal de registos – ${nomeMes}</div></div>
    <p>Exmos. Senhores,</p>
    <p>Segue o resumo dos equipamentos registados em <b>${nomeMes}</b>: <b>${doMes.length}</b> equipamento(s).
       Em anexo encontra-se a folha de registo completa em formato Excel.</p>
    ${tabela('Por cliente / obra', conta(col('Cliente / Obra')))}
    ${tabela('Por técnico', conta(col('Técnico')))}
    ${tabela('Por modelo', conta(col('Modelo')))}
    ${lista ? `<p style="margin:16px 0 4px;font-weight:bold;color:#3a393a">Equipamentos</p>
      <table cellpadding="6" style="border-collapse:collapse;font-size:12px"><tr style="background:#f0f0f0">
      <th align="left">Código</th><th align="left">Serial</th><th align="left">Grupo</th><th align="left">Cliente</th><th align="left">Registado</th></tr>${lista}</table>` : ''}
    <p style="margin-top:22px">Com os melhores cumprimentos,</p>
    <p style="border-left:4px solid #c9272e;padding-left:10px"><b style="color:#c9272e">Aplicação Cablotec</b><br>
      <span style="color:#555">Geração de Etiquetas e Registo de Equipamentos</span><br>
      <span style="color:#888;font-size:12px">Cablotec – Cablagens e Sistemas, Lda</span></p></div>`;
  const anexos = [];
  try {
    const id = PropertiesService.getScriptProperties().getProperty('FOLHA_ID');
    const res = UrlFetchApp.fetch('https://docs.google.com/spreadsheets/d/' + id + '/export?format=xlsx',
      { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true });
    if (res.getResponseCode() === 200) anexos.push(res.getBlob().setName('Registo de Seriais ' + nomeMes.replace('/', '-') + '.xlsx'));
  } catch (e) { Logger.log('Excel: ' + e.message); }
  MailApp.sendEmail({
    to: emails || CONFIG.EMAIL_DESTINO,
    subject: `Resumo mensal de registos – ${nomeMes} – ${doMes.length} equipamento(s)`,
    name: 'Cablotec – Geração de Etiquetas',
    htmlBody: html, attachments: anexos,
    inlineImages: CONFIG.LOGOTIPOS ? { logoCablotec: logoBlob_('cablotec') } : {},
  });
  return { mes: nomeMes, equipamentos: doMes.length, excel: anexos.length > 0 };
}


/* ===================== LIGAÇÃO PARA OUTRAS APLICAÇÕES ===================== */

/**
 * Consulta por serial (exato, sem diferenciar maiúsculas) ou por código de rastreio (RS-...).
 * Devolve todos os registos encontrados com os dados completos.
 * Pode ser chamado por POST {acao:'consultar', pin, serial} ou por GET ?api=consultar&serial=...&pin=...
 */
function apiConsultar_(q) {
  q = String(q || '').trim().toUpperCase();
  if (q.length < 2) throw new Error('Indique o serial ou o código de rastreio.');
  folha_();
  const reg = lerRegisto_();
  const col = n => COLUNAS_FOLHA_.indexOf(n);
  const ids = Object.keys(reg).filter(id => {
    const r = reg[id];
    return String(r[col('Serial')]).toUpperCase() === q || String(r[col('Código de rastreio')]).toUpperCase() === q ||
           String(r[col('Serial etiqueta')]).toUpperCase() === q;
  });
  const registos = ids.map(id => {
    const r = reg[id], o = apiObter_(id);
    return {
      serial: o.serial, grupo: o.grupo, rastreio: o.rastreio, estado: r[col('Estado')],
      registadoEm: r[col('Registado em')], enviadoEm: r[col('Enviado em')],
      cliente: (o.extras || {}).cliente || '', local: (o.extras || {}).local || '', tecnico: (o.extras || {}).tecnico || '',
      observacoes: (o.extras || {}).obs || '', gps: (o.extras || {}).gps || null,
      garantiaAte: r[col('Garantia até')], dados: o.dados, campos: o.campos,
      ficha: o.link, pasta: r[col('Pasta')],
    };
  });
  return { encontrado: registos.length > 0, total: registos.length, registos };
}
