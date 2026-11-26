/* ===================== ETIQUETAS DOS COMPONENTES (Grupo / Clico) =====================
 * Uma foto por componente (depósito, compressor, unidade, ventilador, controlador…).
 * A foto fica na pasta do serial como "comp_<tipo>_<componente>_<data>.jpg" e os dados
 * lidos ficam em "componentes.json" na mesma pasta. Aparecem na ficha e no PDF (folha própria).
 */
const COMPONENTES_ = {
  grupo: [
    { k: 'deposito', nome: 'Depósito de refrigeração', icone: '🛢️',
      dica: 'Placa do fabricante do recipiente de líquido (ex.: Frigomec).',
      ia: 'Placa de um recipiente de líquido / depósito de refrigerante (ex.: Frigomec). Campos típicos: Type, Manufacture Nr., Manufacture year, Fluids Group, Category, Temperature TS °C (mín/máx), Volume V (L), Max. permissible pressure PS (bar), Test pressure PT (bar), Mat. Body. O "serial" é o Manufacture Nr. e o "modelo" é o Type.' },
    { k: 'compressor', nome: 'Compressor', icone: '⚙️',
      dica: 'Etiqueta do compressor (ex.: Danfoss MLZ…): Model no, Serial no, Tech no.',
      ia: 'Etiqueta de um compressor (ex.: Danfoss). Campos típicos: Model no, Serial no, Tech no, tensão/frequência (ex.: 380-415 V 3~50 Hz), LR (A), MAX OPER (A), Lubricant, Refrigerant, país de fabrico.' },
    { k: 'unidade', nome: 'Unidade condensadora', icone: '📦',
      dica: 'Etiqueta da unidade / caixa (ex.: Danfoss OP-…): código, Serial No, EAN.',
      ia: 'Etiqueta de uma unidade condensadora (ex.: Danfoss Optyma, "OP-MPXM068MLP00E"). Campos típicos: modelo (linha OP-...), código (ex.: 114X4311), Serial No., EAN No., Voltage, Refrigerants (1) e (2), país de fabrico.' },
    { k: 'ventilador', nome: 'Ventilador', icone: '🌀',
      dica: 'Etiqueta do motor do ventilador (ex.: ebm-papst A6E500…).',
      ia: 'Etiqueta de um motor de ventilador (ex.: ebm-papst). Campos típicos: modelo (ex.: A6E500-AJ05-04), tensão/frequência/corrente/potência/rotação para 50 Hz e 60 Hz, condensador (µF), IP, eficiência, data de fabrico (ex.: 06/22) e número de série (número longo junto ao código Data Matrix, ex.: 2206000398).' },
    { k: 'controlador', nome: 'Controlador', icone: '🎛️',
      dica: 'Controlador Optyma Plus: etiqueta com código de barras e a versão PV/SW.',
      ia: 'Controlador eletrónico (ex.: Danfoss Optyma Plus). Campos típicos: modelo/nome (ex.: Optyma Plus Controller), código (ex.: 084B8080), número da etiqueta de código de barras (ex.: 084B8080021106CC102 – é o "serial"), versão (ex.: PV06/SW3.61), alimentação (ex.: 230V AC).' },
  ],
  // Etiquetas dos Clicos: a preencher com as fotos dos componentes do Clico
  clico: [],
};

function compDef_(tipo, k) {
  return (COMPONENTES_[tipo] || []).filter(c => c.k === k)[0] || null;
}
function compDefsPublicas_() {
  const r = {};
  Object.keys(COMPONENTES_).forEach(t => { r[t] = COMPONENTES_[t].map(c => ({ k: c.k, nome: c.nome, icone: c.icone, dica: c.dica })); });
  return r;
}

/** componentes.json da pasta: { grupo: { compressor: {...} }, clico: {...} } */
function lerComponentes_(pasta) {
  const it = pasta.getFilesByName('componentes.json');
  if (!it.hasNext()) return {};
  try { return JSON.parse(it.next().getBlob().getDataAsString()) || {}; } catch (e) { return {}; }
}
function guardarComponentes_(pasta, dados) {
  const txt = JSON.stringify(dados);
  const it = pasta.getFilesByName('componentes.json');
  if (it.hasNext()) it.next().setContent(txt);
  else pasta.createFile(Utilities.newBlob(txt, 'application/json', 'componentes.json'));
}
function temComponentes_(c) {
  return Object.keys(c || {}).some(t => Object.keys(c[t] || {}).length);
}

/** POST lerComponente: guarda a foto do componente e lê a etiqueta. */
function apiLerComponente_(pin, req) {
  const user = verificarPin_(pin);
  const tipo = req.tipo === 'clico' ? 'clico' : 'grupo';
  const def = compDef_(tipo, String(req.comp || ''));
  if (!def) throw new Error('Componente inválido.');
  if (!req.base64) throw new Error('Foto em falta.');
  const pastaId = formCriarPasta(pin, req.serial, req.grupo);
  const pasta = DriveApp.getFolderById(pastaId);

  // substitui a foto anterior deste componente
  const prefixo = 'comp_' + tipo + '_' + def.k + '_';
  const files = pasta.getFiles();
  while (files.hasNext()) { const f = files.next(); if (f.getName().indexOf(prefixo) === 0) f.setTrashed(true); }
  const ts = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  const foto = pasta.createFile(Utilities.newBlob(Utilities.base64Decode(req.base64), 'image/jpeg', prefixo + ts + '.jpg'));

  let r;
  try { r = lerComponenteIA_(def, foto); }
  catch (e) {
    Logger.log('Leitura do componente falhou: ' + e.message);
    const texto = lerTextoOCR_([foto]);
    r = { campos: texto.split(/\n+/).map(l => l.trim()).filter(l => l.length > 2).slice(0, 25).map((l, i) => ['Linha ' + (i + 1), l]),
          fonte: 'OCR' };
  }
  const reg = { nome: def.nome, fabricante: r.fabricante || '', modelo: r.modelo || '', codigo: r.codigo || '', serial: r.serial || '',
                ano: r.ano || '', campos: (r.campos || []).slice(0, 40), fonte: r.fonte || '', fotoId: foto.getId(),
                lidoEm: agora_(), por: (user && user.nome) || '' };
  const todos = lerComponentes_(pasta);
  todos[tipo] = todos[tipo] || {};
  todos[tipo][def.k] = reg;
  guardarComponentes_(pasta, todos);
  return { pastaId, tipo, comp: def.k, registo: reg };
}

function lerComponenteIA_(def, foto) {
  if (!geminiDisponivel_()) throw new Error('IA indisponível');
  const pedido = 'Esta foto é a etiqueta de um componente de um grupo de frio: ' + def.nome + '.\n' + def.ia + '\n' +
    'Transcreve TODOS os campos e valores visíveis, exatamente como aparecem, sem inventar nada. ' +
    'Ignora avisos de segurança, moradas e texto em chinês. Se um valor não estiver visível, não o incluas.\n' +
    'Responde só com JSON neste formato:\n' +
    '{"campos":[{"campo":"...","valor":"..."}],"fabricante":"","modelo":"","codigo":"","serial":"","ano":""}';
  const b = blobImagem_(foto);
  const payload = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: pedido }, { inline_data: { mime_type: b.getContentType() || 'image/jpeg', data: Utilities.base64Encode(b.getBytes()) } }] }],
    generationConfig: { temperature: 0, responseMimeType: 'application/json' },
  });
  const cache = CacheService.getScriptCache();
  let res = null, erro = 'sem modelo disponível';
  for (const modelo of modelosGemini_()) {
    if (cache.get('gemini_pausa_' + modelo)) continue;
    res = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + modelo + ':generateContent?key=' +
                            encodeURIComponent(CONFIG.GEMINI_API_KEY),
                            { method: 'post', contentType: 'application/json', muteHttpExceptions: true, payload });
    const code = res.getResponseCode();
    if (code === 200) break;
    erro = modelo + ' HTTP ' + code;
    if (code === 503 || code === 500) cache.put('gemini_pausa_' + modelo, '1', 600);
    if (code === 429) cache.put('gemini_pausa_' + modelo, '1', 3600);
    if (code === 404) cache.remove('gemini_modelos');
    res = null;
  }
  if (!res) throw new Error(erro);
  contarLeituraGemini_();
  const cand = (JSON.parse(res.getContentText()).candidates || [])[0];
  const txt = cand && cand.content && cand.content.parts ? cand.content.parts.map(p => p.text || '').join('') : '';
  const j = JSON.parse(txt.replace(/^```(?:json)?|```$/g, '').trim());
  const out = { fonte: 'IA', campos: (j.campos || []).map(c => [String(c.campo || '').trim(), String(c.valor || '').trim()]).filter(c => c[0] && c[1]) };
  ['fabricante', 'modelo', 'codigo', 'serial', 'ano'].forEach(k => { if (j[k]) out[k] = String(j[k]).trim(); });
  return out;
}

/** POST componentes: o que já foi lido para um serial (para continuar mais tarde). */
function apiComponentes_(serial) {
  serial = String(serial || '').trim().toUpperCase();
  const r = { defs: compDefsPublicas_(), pastaId: '', componentes: {} };
  if (!serial) return r;
  const raiz = DriveApp.getFolderById(CONFIG.PASTA_ID);
  const prefixo = new RegExp('^' + serial.replace(/[.\/]/g, '\\$&') + '(\\s*[-–_]|$)');
  const procurar = (pasta) => {
    const it = pasta.getFolders();
    while (it.hasNext()) { const f = it.next(); if (prefixo.test(f.getName())) return f; }
    return null;
  };
  let p = procurar(raiz);
  if (!p) { const env = raiz.getFoldersByName('Enviados'); if (env.hasNext()) p = procurar(env.next()); }
  if (p) { r.pastaId = p.getId(); r.componentes = lerComponentes_(p); }
  return r;
}

/** POST componenteCorrigir: corrigir à mão os campos de um componente. */
function apiComponenteCorrigir_(pin, req) {
  verificarPin_(pin);
  const pasta = DriveApp.getFolderById(req.pastaId);
  if (!pastaPertenceAoRelatorio_(pasta)) throw new Error('Pasta inválida.');
  const tipo = req.tipo === 'clico' ? 'clico' : 'grupo';
  const todos = lerComponentes_(pasta);
  const reg = (todos[tipo] || {})[req.comp];
  if (!reg) throw new Error('Componente sem leitura.');
  if (req.apagar) { delete todos[tipo][req.comp]; guardarComponentes_(pasta, todos); return { ok: true }; }
  reg.campos = (req.campos || []).map(c => [String(c[0] || '').trim().slice(0, 60), String(c[1] || '').trim().slice(0, 200)]).filter(c => c[0] && c[1]).slice(0, 40);
  ['modelo', 'serial'].forEach(k => { if (req[k] !== undefined) reg[k] = String(req[k]).trim().slice(0, 80); });
  reg.corrigido = true;
  guardarComponentes_(pasta, todos);
  return { registo: reg };
}

/** HTML da ficha: um cartão por componente. */
function componentesHtmlFicha_(pasta) {
  const todos = lerComponentes_(pasta);
  if (!temComponentes_(todos)) return '';
  let h = '';
  ['grupo', 'clico'].forEach(tipo => {
    const c = todos[tipo] || {};
    const ks = (COMPONENTES_[tipo] || []).map(d => d.k).filter(k => c[k]).concat(Object.keys(c).filter(k => !compDef_(tipo, k)));
    if (!ks.length) return;
    h += `<div class="card"><div class="rotulo">${tipo === 'clico' ? 'ETIQUETAS DO CLICO' : 'ETIQUETAS DO GRUPO'}</div>`;
    ks.forEach(k => {
      const r = c[k], d = compDef_(tipo, k) || {};
      let img = '';
      try { if (r.fotoId) { const b = miniatura_(DriveApp.getFileById(r.fotoId), 900); img = `<img src="data:${b.getContentType()};base64,${Utilities.base64Encode(b.getBytes())}" onclick="this.classList.toggle('zoom')">`; } } catch (e) {}
      h += `<details style="border-top:1px solid #eee;padding:8px 0"><summary style="font-weight:700;cursor:pointer">${esc_(d.icone || '🔩')} ${esc_(r.nome || k)}` +
           `${r.modelo ? ` · <span style="font-weight:400">${esc_(r.modelo)}</span>` : ''}${r.serial ? ` · <span style="font-weight:400;color:#c9272e">S/N ${esc_(r.serial)}</span>` : ''}</summary>` +
           `<table>${(r.campos || []).map(x => `<tr><th>${esc_(x[0])}</th><td>${esc_(x[1])}</td></tr>`).join('')}</table>${img}</details>`;
    });
    h += '</div>';
  });
  return h;
}

/** PDF: folha "ETIQUETAS DOS COMPONENTES" com uma tabela por componente. */
function montarFolhaComponentes_(body, item) {
  if (!item.pasta) return;
  const todos = lerComponentes_(item.pasta);
  if (!temComponentes_(todos)) return;
  const quebra = body.appendParagraph('').setSpacingBefore(0).setSpacingAfter(0);
  quebra.appendPageBreak();
  quebra.editAsText().setFontSize(1);
  cabecalhoLogos_(body);
  const titulo = body.appendParagraph(T_('ETIQUETAS DOS COMPONENTES', 'COMPONENT LABELS'));
  titulo.editAsText().setBold(true).setFontSize(15).setForegroundColor('#000000');
  const sub = body.appendParagraph('SERIAL NO: ' + item.serial + (item.grupo ? '  ·  ' + item.grupo : ''));
  sub.editAsText().setBold(false).setFontSize(9).setForegroundColor('#555555');
  sub.setSpacingAfter(6);
  ['grupo', 'clico'].forEach(tipo => {
    const c = todos[tipo] || {};
    const ks = (COMPONENTES_[tipo] || []).map(d => d.k).filter(k => c[k]).concat(Object.keys(c).filter(k => !compDef_(tipo, k)));
    ks.forEach(k => {
      const r = c[k];
      const h = body.appendParagraph((r.nome || k) + (r.fabricante ? ' – ' + r.fabricante : ''));
      h.editAsText().setBold(true).setFontSize(10).setForegroundColor('#c9272e');
      h.setSpacingBefore(8).setSpacingAfter(2);
      const linhas = (r.campos || []).slice(0, 18).map(x => [String(x[0]), String(x[1])]);
      if (!linhas.length) linhas.push(['—', T_('Sem dados lidos', 'No data read')]);
      const t = body.appendTable(linhas);
      t.setBorderColor('#dddddd').setBorderWidth(0.5);
      for (let i = 0; i < t.getNumRows(); i++) {
        const row = t.getRow(i);
        row.getCell(0).setWidth(170).editAsText().setFontSize(8).setBold(true).setForegroundColor('#333333');
        row.getCell(1).editAsText().setFontSize(8).setBold(false).setForegroundColor('#111111');
        for (let j = 0; j < 2; j++) row.getCell(j).setPaddingTop(1).setPaddingBottom(1);
      }
    });
  });
}
