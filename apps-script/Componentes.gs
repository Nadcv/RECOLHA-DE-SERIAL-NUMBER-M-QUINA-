/* ===================== ETIQUETAS DOS COMPONENTES (Grupo / Clico) =====================
 * Uma foto por componente (depósito, compressor, unidade, ventilador, controlador…).
 * A foto fica na pasta do serial como "comp_<tipo>_<componente>_<data>.jpg" e os dados
 * lidos ficam em "componentes.json" na mesma pasta. Aparecem na ficha e no PDF (folha própria).
 */
const COMPONENTES_ = {
  grupo: [
    { k: 'deposito', nome: 'Depósito de refrigeração', icone: '🛢️',
      dica: 'Placa do fabricante do recipiente de líquido (ex.: Frigomec).',
      ia: 'Placa de um recipiente de líquido / depósito de refrigerante (ex.: Frigomec; a etiqueta pode ser branca ou amarela). Campos típicos: Type (ex.: RV-160X385/118A4212/118U5306), Manufacture Nr., Manufacture year (ex.: 04/2026), Fluids Group (pode ter duas colunas, ex.: 1 e 2), Category (ex.: II e I), Excluded (ex.: R717), Volume V (L), Temperature TS °C (dois pares mín/máx), Max. permissible pressure PS (bar, ex.: -1/32 e 24), Test pressure PT (bar), Mat. Body, marcação CE com nº do organismo (ex.: 0036). Há também uma etiqueta de código de barras com o mesmo número de fabrico. O "serial" é o Manufacture Nr. e o "modelo" é o Type.' },
    { k: 'compressor', nome: 'Compressor', icone: '⚙️',
      dica: 'Etiqueta do compressor (ex.: Danfoss MLZ…): Model no, Serial no, Tech no.',
      ia: 'Etiqueta de um compressor (ex.: Danfoss MLZ… ou LLZ…). Campos típicos: Model no, Serial no, Tech no (se existir), tensão/frequência (ex.: 380-415 V 3~50 Hz e 460 V 3~60 Hz), LR (A), MAX OPER (A), Lubricant (ex.: POE / 1.64 L), Refrigerant (ex.: Group1-Group2), país de fabrico. Se houver quadro P.E.D. com lado LP e lado HP, regista cada valor separado: "PS LP", "PS HP", "TS max LP", "TS max HP", "TS min LP", "TS min HP", "Volume LP", "Volume HP".' },
    { k: 'unidade', nome: 'Unidade condensadora', icone: '📦',
      dica: 'Etiqueta da unidade / caixa (ex.: Danfoss OP-…): código, Serial No, EAN.',
      ia: 'Etiqueta de uma unidade condensadora Danfoss Optyma. Pode ser (a) a etiqueta da caixa/placa: modelo (linha OP-..., ex.: OP-MPXM068MLP00E), código (ex.: 114X4311), Serial No., EAN No., Voltage, Refrigerants (1) e (2), país de fabrico; ou (b) a etiqueta interna de produção: código (ex.: 114X3304), linha por baixo do código de barras (ex.: "114X3304 HTPL2026-06-9593" – o "serial" é a parte HTPL…), DW (desenho, ex.: 118R0520 REV.01) e DATE (ex.: 23-06-2026 – o "ano" é 2026). Ignora autocolantes como "OK TESTED", "PULL TEST OK" e "IQC OK".' },
    { k: 'ventilador', nome: 'Ventilador', icone: '🌀',
      dica: 'Etiqueta do motor do ventilador (ex.: ebm-papst A6E500…).',
      ia: 'Etiqueta de um motor de ventilador (ex.: ebm-papst ou Hidria). ebm-papst: modelo (ex.: A6E500-AJ05-04), tensão/frequência/corrente/potência/rotação para 50 Hz e 60 Hz, condensador (µF), IP, eficiência, data de fabrico (ex.: 06/22) e número de série (número longo junto ao código Data Matrix, ex.: 2206000398). Hidria: fabricante (Hidria d.o.o., Slovenia), modelo (ex.: R10E-56LPB-ES50B-04C10), número de série (ex.: 08260046), código de produção (ex.: 0310-4-0207), código Danfoss (ex.: 118A3750/118U5296), tensão/frequência (ex.: 1~230-240V 50-60Hz), potência (W), corrente (A), rotação (RPM), temperatura ambiente máx., proteção (ex.: Th. Prot. IP54 Class I), massa (kg), ErP / eficiência (ex.: 50,8% N=60,7), "VSD INTEGRATED". A etiqueta pode estar rodada.' },
    { k: 'controlador', nome: 'Controlador', icone: '🎛️',
      dica: 'Controlador Optyma Plus: etiqueta com código de barras e a versão PV/SW.',
      ia: 'Controlador eletrónico (ex.: Danfoss Optyma Plus). Campos típicos: modelo/nome (ex.: Optyma Plus Controller), código (ex.: 084B8080), número da etiqueta de código de barras (ex.: 084B8080021106CC102 ou 084B8080016807CC196 – é o "serial"), versão do firmware tal como está escrita (ex.: PV06/SW3.61 ou PV07/SW3.70 – campo "Versão"), alimentação (ex.: 230V AC). Ignora os números dos bornes e as etiquetas dos fios (ex.: UC4).' },
  ],
  clico: [
    { k: 'evaporador', nome: 'Evaporador (com resistências)', icone: '❄️',
      dica: 'Placa do evaporador (ex.: Centauro ERC 16/6818): modelo, nº de série, resistências, Ps / Pt.',
      ia: 'Placa de um evaporador (ex.: Centauro, Made in Portugal). Campos típicos: Modelo (ex.: ERC 16/6818), descrição do modelo (ex.: DI+BR-8,64kW (Nomotor)), N.Serie / Serial Number (ex.: 260120580 – é o "serial"), Motor [W] [A] [V] [Hz] (pode estar vazio "-"), Resist./Heaters [W] [A] [V] [fase] (ex.: 6 x 1440 W, 6 x 6,26 A, 230 V, 1~ – regista "Resistências potência", "Resistências corrente", "Resistências tensão", "Resistências fase"), Ps (bar), Pt (bar), Ts min/max. Se houver o autocolante verde de controlo de qualidade, regista só a data escrita à mão como "Controlo de qualidade (data)". Ignora morada, telefone e site.' },
    { k: 'ventilador', nome: 'Ventilador', icone: '🌀',
      dica: 'Etiqueta do ventilador (ex.: Ziehl-Abegg FN040-6IW.BD.A7P1): P/N, tipo, S/N.',
      ia: 'Etiqueta circular de um ventilador (ex.: Ziehl-Abegg, Made in Germany; o texto pode estar em arco ou rodado). Campos típicos: P/N (ex.: 169535), tipo/modelo (ex.: FN040-6IW.BD.A7P1 – é o "modelo"), S/N (ex.: 33188323/005 – é o "serial"), data/lote (ex.: 22/25 812), tensão/frequência (ex.: 1~ 200-277V 50/60Hz), potência P1 (W), corrente (A), rotação (rpm), temperatura máx., IP, classe térmica (ex.: THCL 155), eletrónica (ex.: ECblue basic incl. MODBUS), ErP (ex.: ErP 2015 (N40) N=58,5 statA=49,5%), "VSD integrated". Ignora o número gravado no metal fora da etiqueta.' },
    { k: 'sonda', nome: 'Sonda de humidade / temperatura', icone: '💧',
      dica: 'Etiqueta da caixa da sonda (ex.: Rotronic HygroClip2): ART, nº, EAN.',
      ia: 'Etiqueta da caixa de uma sonda de humidade e temperatura (ex.: Rotronic HygroClip2 Advanced, Switzerland). Campos típicos: fabricante (ex.: rotronic, CH-8303 Bassersdorf), produto (ex.: HygroClip2 Advanced – HC2A), ART (ex.: XD33A-S3X – é o "modelo"/"codigo"), número junto ao código de barras de cima (ex.: 26057209 – é o "serial"), EAN (ex.: 7611990502097), Country of origin. Ignora os textos publicitários em várias línguas.' },
  ],
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
