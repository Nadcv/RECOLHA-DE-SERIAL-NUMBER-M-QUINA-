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

/* ===================== CAMPOS EXTRA ===================== */

function limparExtras_(x) {
  x = x || {};
  const t = (v, n) => String(v || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
  const r = { tecnico: t(x.tecnico, 60), cliente: t(x.cliente, 80), local: t(x.local, 80),
              obs: String(x.obs || '').trim().slice(0, 1000) };
  Object.keys(r).forEach(k => { if (!r[k]) delete r[k]; });
  return r;
}

function extrasHtml_(x) {
  x = x || {};
  const l = [['Cliente / Obra', x.cliente], ['Local', x.local], ['Técnico', x.tecnico], ['Observações', x.obs]]
    .filter(c => c[1]).map(c => `<tr><th>${esc_(c[0])}</th><td>${esc_(c[1])}</td></tr>`).join('');
  return l ? `<div class="card"><div class="rotulo">REGISTO</div><table>${l}</table></div>` : '';
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

const COLUNAS_FOLHA_ = ['Serial', 'Grupo', 'Cliente / Obra', 'Local', 'Técnico', 'Registado em', 'Estado',
  'Enviado em', 'Leitura', 'Modelo', 'Código', 'Serial etiqueta', 'EAN', 'Tensão', 'Refrigerante', 'Ano',
  'Todos os campos', 'Observações', 'Ficha', 'Pasta', 'ID'];

/** Abre (ou cria, na pasta principal) a folha "Registo de Seriais". */
function folha_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('FOLHA_ID');
  if (id) {
    try {
      if (!DriveApp.getFileById(id).isTrashed()) return SpreadsheetApp.openById(id);
    } catch (e) { /* foi apagada: cria outra */ }
  }
  const ss = SpreadsheetApp.create('Registo de Seriais');
  DriveApp.getFileById(ss.getId()).moveTo(DriveApp.getFolderById(CONFIG.PASTA_ID));
  const sh = ss.getSheets()[0].setName('Registos');
  sh.getRange(1, 1, 1, COLUNAS_FOLHA_.length).setValues([COLUNAS_FOLHA_])
    .setFontWeight('bold').setBackground('#1a3d8f').setFontColor('#ffffff');
  sh.setFrozenRows(1);
  sh.setColumnWidth(COLUNAS_FOLHA_.indexOf('Todos os campos') + 1, 420);
  sh.hideColumns(COLUNAS_FOLHA_.length);
  props.setProperty('FOLHA_ID', ss.getId());
  preencherFolhaComExistentes_(sh);
  return ss;
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
    info.serial || partes[0], info.grupo || partes.slice(1).join(' '), x.cliente || '', x.local || '', x.tecnico || '',
    info.registadoEm || '', estado, info.enviadoEm && estado === 'Enviado' ? info.enviadoEm : '',
    (info.fonte || '') + (info.corrigido ? ' (revisto)' : ''),
    d.modelo || '', d.codigo || '', d.serial || '', d.ean || '', d.voltagem || '', d.refrigerante || '', d.ano || '',
    (info.campos || []).map(c => c[0] + ': ' + c[1]).join('\n'), x.obs || '',
    webApp + '?id=' + pasta.getId(), pasta.getUrl(), pasta.getId(),
  ].map(v => (typeof v === 'string' && /^[=+\-@]/.test(v)) ? "'" + v : v);   // evita fórmulas
}

/** Acrescenta ou atualiza a linha desta pasta. */
function registarNaFolha_(pasta, estado) {
  const sh = folha_().getSheets()[0];
  const linha = linhaFolha_(pasta, estado);
  const colId = COLUNAS_FOLHA_.length;
  const n = sh.getLastRow();
  if (n > 1) {
    const achado = sh.getRange(2, colId, n - 1, 1).createTextFinder(pasta.getId()).matchEntireCell(true).findNext();
    if (achado) { sh.getRange(achado.getRow(), 1, 1, linha.length).setValues([linha]); return; }
  }
  sh.appendRow(linha);
}

function preencherFolhaComExistentes_(sh) {
  const raiz = DriveApp.getFolderById(CONFIG.PASTA_ID);
  const linhas = [];
  const subs = raiz.getFolders();
  while (subs.hasNext()) {
    const f = subs.next();
    if (f.getName() === 'Enviados') {
      const env = f.getFolders();
      while (env.hasNext()) linhas.push(linhaFolha_(env.next(), 'Enviado'));
    } else if (!pastaDeSistema_(f.getName())) {
      linhas.push(linhaFolha_(f, 'Por enviar'));
    }
  }
  if (linhas.length) sh.getRange(2, 1, linhas.length, COLUNAS_FOLHA_.length).setValues(linhas);
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
             link: webApp + '?id=' + a.pasta.getId() };
  });
  return { existe: l.length > 0, registos: l };
}

function apiPesquisar_(q) {
  q = String(q || '').trim().toLowerCase();
  if (q.length < 2) throw new Error('Escreva pelo menos 2 letras ou números.');
  const webApp = CONFIG.WEB_APP_URL || ScriptApp.getService().getUrl();
  // 1) Pela folha de cálculo (rápido)
  try {
    const sh = folha_().getSheets()[0];
    const n = sh.getLastRow();
    if (n > 1) {
      const v = sh.getRange(2, 1, n - 1, COLUNAS_FOLHA_.length).getDisplayValues();
      const col = nome => COLUNAS_FOLHA_.indexOf(nome);
      const res = v.filter(r => r.join(' ').toLowerCase().indexOf(q) >= 0).slice(0, 50).map(r => ({
        serial: r[col('Serial')], grupo: r[col('Grupo')], cliente: r[col('Cliente / Obra')],
        modelo: r[col('Modelo')], estado: r[col('Estado')], data: r[col('Enviado em')] || r[col('Registado em')],
        link: r[col('Ficha')], id: r[col('ID')],
      }));
      return { resultados: res.reverse() };
    }
  } catch (e) { Logger.log('Pesquisa pela folha falhou: ' + e.message); }
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
                 link: webApp + '?id=' + f.getId(), id: f.getId() });
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
    corrigido: !!info.corrigido, link: webApp + '?id=' + pastaId,
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
             modelo: (info.dados || {}).modelo || '', link: webApp + '?id=' + id };
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
