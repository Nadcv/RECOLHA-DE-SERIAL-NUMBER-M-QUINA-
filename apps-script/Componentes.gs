/* ===================== ETIQUETAS DOS COMPONENTES (Grupo / Clico) =====================
 * Totalmente à parte do registo do serial: não mexe nas pastas, fichas, PDF nem e-mails dos seriais.
 * Pasta própria no Drive "Etiquetas dos componentes" (ao lado da pasta dos seriais), com uma
 * subpasta por máquina "<SERIAL> - Grupo|Clico": fotos + componentes.json. Envio por e-mail próprio (PDF).
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
function compTipo_(t) { return t === 'clico' ? 'clico' : 'grupo'; }
function compSerial_(s) {
  s = String(s || '').trim().toUpperCase();
  if (!/^[A-Z0-9./]{2,30}$/.test(s)) throw new Error('Serial inválido.');
  return s;
}

/** Pasta "Etiquetas dos componentes" – fora da pasta dos seriais, para não aparecer nas listas nem nos relatórios. */
function compRaiz_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('COMP_PASTA_ID');
  if (id) { try { const f = DriveApp.getFolderById(id); if (!f.isTrashed()) return f; } catch (e) {} }
  const base = DriveApp.getFolderById(CONFIG.PASTA_ID), pais = base.getParents();
  const pai = pais.hasNext() ? pais.next() : DriveApp.getRootFolder();
  const it = pai.getFoldersByName('Etiquetas dos componentes');
  const f = it.hasNext() ? it.next() : pai.createFolder('Etiquetas dos componentes');
  props.setProperty('COMP_PASTA_ID', f.getId());
  return f;
}
function compPasta_(serial, tipo, criar) {
  const nome = serial + ' - ' + (tipo === 'clico' ? 'Clico' : 'Grupo');
  const raiz = compRaiz_(), it = raiz.getFoldersByName(nome);
  if (it.hasNext()) return it.next();
  return criar ? raiz.createFolder(nome) : null;
}
function compLer_(pasta) {
  if (!pasta) return null;
  const it = pasta.getFilesByName('componentes.json');
  if (!it.hasNext()) return null;
  try { return JSON.parse(it.next().getBlob().getDataAsString()); } catch (e) { return null; }
}
function compGuardar_(pasta, dados) {
  const txt = JSON.stringify(dados), it = pasta.getFilesByName('componentes.json');
  if (it.hasNext()) it.next().setContent(txt);
  else pasta.createFile(Utilities.newBlob(txt, 'application/json', 'componentes.json'));
}

/** POST lerComponente: guarda a foto do componente e lê a etiqueta. */
function apiLerComponente_(pin, req) {
  const user = verificarPin_(pin);
  const tipo = compTipo_(req.tipo), serial = compSerial_(req.serial);
  const def = compDef_(tipo, String(req.comp || ''));
  if (!def) throw new Error('Componente inválido.');
  if (!req.base64) throw new Error('Foto em falta.');
  const pasta = compPasta_(serial, tipo, true);
  const prefixo = def.k + '_';
  const files = pasta.getFiles();
  while (files.hasNext()) { const f = files.next(); if (f.getName().indexOf(prefixo) === 0) f.setTrashed(true); }
  const ts = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  const foto = pasta.createFile(Utilities.newBlob(Utilities.base64Decode(req.base64), 'image/jpeg', prefixo + ts + '.jpg'));
  let r;
  try { r = lerComponenteIA_(def, foto); }
  catch (e) {
    Logger.log('Leitura do componente falhou: ' + e.message);
    const texto = lerTextoOCR_([foto]);
    r = { campos: texto.split(/\n+/).map(l => l.trim()).filter(l => l.length > 2).slice(0, 25).map((l, i) => ['Linha ' + (i + 1), l]), fonte: 'OCR' };
  }
  const reg = { nome: def.nome, fabricante: r.fabricante || '', modelo: r.modelo || '', codigo: r.codigo || '', serial: r.serial || '',
                ano: r.ano || '', campos: (r.campos || []).slice(0, 40), fonte: r.fonte || '', fotoId: foto.getId(),
                lidoEm: agora_(), por: (user && user.nome) || '' };
  const d = compLer_(pasta) || { serial, tipo, itens: {} };
  d.grupo = String(req.grupo || d.grupo || '').trim().toUpperCase().slice(0, 30);
  d.itens = d.itens || {}; d.itens[def.k] = reg; d.atualizadoEm = agora_();
  compGuardar_(pasta, d);
  return { tipo, comp: def.k, registo: reg };
}

function lerComponenteIA_(def, foto) {
  if (!geminiDisponivel_()) throw new Error('IA indisponível');
  const pedido = 'Esta foto é a etiqueta de um componente de um equipamento de frio: ' + def.nome + '.\n' + def.ia + '\n' +
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

/** Uma vez só: leva as leituras feitas na 1.ª versão (dentro da pasta do serial) para a pasta própria. */
function migrarComponentesAntigos_() {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('COMP_MIGRADO') === '1') return;
  const raiz = DriveApp.getFolderById(CONFIG.PASTA_ID), pastas = [];
  const it = raiz.getFolders();
  while (it.hasNext()) {
    const f = it.next();
    if (f.getName() === 'Enviados') { const e = f.getFolders(); while (e.hasNext()) pastas.push(e.next()); }
    else pastas.push(f);
  }
  pastas.forEach(p => {
    const js = p.getFilesByName('componentes.json');
    const antigo = js.hasNext() ? js.next() : null;
    let dados = {};
    if (antigo) { try { dados = JSON.parse(antigo.getBlob().getDataAsString()) || {}; } catch (e) {} }
    const fotos = [], fs = p.getFiles();
    while (fs.hasNext()) { const f = fs.next(); if (/^comp_(grupo|clico)_/i.test(f.getName())) fotos.push(f); }
    if (!antigo && !fotos.length) return;
    const serial = p.getName().split(/\s*[-–_]\s*/)[0].trim().toUpperCase();
    ['grupo', 'clico'].forEach(t => {
      const itens = dados[t] || {}, fotosT = fotos.filter(f => f.getName().toLowerCase().indexOf('comp_' + t + '_') === 0);
      if (!Object.keys(itens).length && !fotosT.length) return;
      const dest = compPasta_(serial, t, true);
      fotosT.forEach(f => { f.moveTo(dest); f.setName(f.getName().replace(/^comp_(grupo|clico)_/i, '')); });
      const d = compLer_(dest) || { serial, tipo: t, itens: {} };
      Object.keys(itens).forEach(k => { if (!d.itens[k]) d.itens[k] = itens[k]; });
      compGuardar_(dest, d);
    });
    if (antigo) antigo.setTrashed(true);
  });
  props.setProperty('COMP_MIGRADO', '1');
}

/** POST componentes: definições + o que já foi lido para um serial (Grupo e Clico). */
function apiComponentes_(serial) {
  try { migrarComponentesAntigos_(); } catch (e) { Logger.log('Migração componentes: ' + e.message); }
  const r = { defs: compDefsPublicas_(), componentes: {}, info: {} };
  let s = '';
  try { s = compSerial_(serial); } catch (e) { return r; }
  ['grupo', 'clico'].forEach(t => {
    const d = compLer_(compPasta_(s, t, false));
    if (d) { r.componentes[t] = d.itens || {}; r.info[t] = { grupo: d.grupo || '', enviadoEm: d.enviadoEm || '', enviadoPara: d.enviadoPara || '' }; }
  });
  return r;
}

/** POST componenteCorrigir: corrigir à mão (ou apagar) a leitura de um componente. */
function apiComponenteCorrigir_(pin, req) {
  verificarPin_(pin);
  const tipo = compTipo_(req.tipo), pasta = compPasta_(compSerial_(req.serial), tipo, false);
  const d = compLer_(pasta);
  const reg = d && d.itens && d.itens[req.comp];
  if (!reg) throw new Error('Componente sem leitura.');
  if (req.apagar) { delete d.itens[req.comp]; compGuardar_(pasta, d); return { ok: true }; }
  reg.campos = (req.campos || []).map(c => [String(c[0] || '').trim().slice(0, 60), String(c[1] || '').trim().slice(0, 200)]).filter(c => c[0] && c[1]).slice(0, 40);
  if (req.modelo !== undefined) reg.modelo = String(req.modelo).trim().slice(0, 80);
  if (req.serialComp !== undefined) reg.serial = String(req.serialComp).trim().slice(0, 80);
  reg.corrigido = true;
  compGuardar_(pasta, d);
  return { registo: reg };
}

/** POST enviarComponentes: e-mail próprio com o PDF das etiquetas dos componentes de uma máquina. */
function apiEnviarComponentes_(pin, req) {
  const user = verificarPin_(pin);
  const tipo = compTipo_(req.tipo), serial = compSerial_(req.serial), pasta = compPasta_(serial, tipo, false);
  const d = compLer_(pasta);
  const ks = d ? (COMPONENTES_[tipo] || []).map(c => c.k).filter(k => d.itens && d.itens[k]) : [];
  if (!ks.length) throw new Error('Ainda não há etiquetas lidas para este serial.');
  const emails = validarEmails_(req.emails);
  const para = emails || CONFIG.EMAIL_DESTINO;
  const nomeTipo = tipo === 'clico' ? 'Clico' : 'Grupo';
  const pdf = compPdf_(serial, tipo, d, ks).setName('Etiquetas_componentes_' + nomeTipo + '_' + serial.replace(/[^A-Z0-9]+/g, '_') + '.pdf');
  const e = esc_, vermelho = '#c9272e', cinza = '#3a393a';
  const linhas = ks.map(k => { const r = d.itens[k]; return `<tr><td style="padding:8px 10px;border-bottom:1px solid #e3e6ee;font-size:13px;font-weight:bold">${e(r.nome)}</td>` +
    `<td style="padding:8px 10px;border-bottom:1px solid #e3e6ee;font-size:13px">${e(r.modelo || '—')}</td>` +
    `<td style="padding:8px 10px;border-bottom:1px solid #e3e6ee;font-size:13px;font-family:Consolas,monospace;color:${vermelho};font-weight:bold">${e(r.serial || '—')}</td></tr>`; }).join('');
  const th = `padding:9px 10px;font-size:12px;color:#fff;text-align:left;background:${cinza}`;
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#eef1f6"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f6;padding:24px 0"><tr><td align="center">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#fff;border-radius:8px;overflow:hidden;font-family:Arial,Helvetica,sans-serif">
<tr><td style="padding:18px 28px 14px;border-bottom:4px solid ${vermelho}"><img src="cid:logoCablotec" alt="Cablotec" height="44" style="display:block;height:44px;border:0"></td></tr>
<tr><td style="background:${cinza};padding:18px 28px"><div style="font-size:20px;font-weight:bold;color:#fff">Etiquetas dos componentes – ${nomeTipo}</div><div style="font-size:13px;color:#d6d6d6;margin-top:4px">Serial ${e(serial)}${d.grupo ? ' · ' + e(d.grupo) : ''}</div></td></tr>
<tr><td style="padding:26px 28px 6px"><p style="margin:0 0 14px;font-size:14px;color:#222">Exmos. Senhores,</p>
<p style="margin:0 0 18px;font-size:14px;color:#222;line-height:1.55">Vimos por este meio remeter o registo das etiquetas dos componentes do ${nomeTipo.toLowerCase()} abaixo identificado, com o modelo e o número de série de cada componente. Segue em anexo o documento em formato PDF com todos os dados lidos e as fotografias das etiquetas.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e3e6ee"><tr><th style="${th}">Componente</th><th style="${th}">Modelo</th><th style="${th}">Nº de série</th></tr>${linhas}</table></td></tr>
<tr><td style="padding:20px 28px 4px"><p style="margin:0 0 22px;font-size:14px;color:#222">Ficamos ao dispor para qualquer esclarecimento adicional.</p><p style="margin:0 0 4px;font-size:14px;color:#222">Com os melhores cumprimentos,</p></td></tr>
<tr><td style="padding:10px 28px 26px"><div style="border-left:4px solid ${vermelho};padding:4px 0 4px 12px"><div style="font-size:15px;font-weight:bold;color:${vermelho}">Aplicação Cablotec</div><div style="font-size:13px;color:#555">Etiquetas dos componentes${user && user.nome ? ' · ' + e(user.nome) : ''}</div><div style="font-size:12px;color:#888;margin-top:2px">Cablotec – Cablagens e Sistemas, Lda</div></div></td></tr>
<tr><td style="background:#f4f6fa;padding:14px 28px;border-top:1px solid #e3e6ee"><p style="margin:0;font-size:11px;color:#888;line-height:1.5">Esta mensagem foi gerada automaticamente pela Aplicação Cablotec. O documento anexo contém informação técnica destinada exclusivamente aos destinatários indicados.</p></td></tr>
</table></td></tr></table></body></html>`;
  MailApp.sendEmail({ to: para, subject: 'Cablotec – Etiquetas dos componentes – ' + nomeTipo + ' – Serial ' + serial,
    body: 'Etiquetas dos componentes do ' + nomeTipo + ' (serial ' + serial + ') em anexo (PDF).',
    htmlBody: html, inlineImages: { logoCablotec: logoBlob_('cablotec') }, name: 'Cablotec – Etiquetas dos componentes', attachments: [pdf] });
  d.enviadoEm = agora_(); d.enviadoPara = para;
  compGuardar_(pasta, d);
  return { enviadoPara: para, enviadoEm: d.enviadoEm };
}

/** PDF (HTML → PDF) com uma tabela e a foto de cada componente. */
function compPdf_(serial, tipo, d, ks) {
  const e = esc_;
  let h = '<html><head><meta charset="utf-8"><style>@page{size:A4;margin:14mm 12mm}body{font-family:Arial,Helvetica,sans-serif;font-size:9.5pt;color:#222}' +
    'h1{font-size:15pt;margin:0;color:#3a393a}.sub{font-size:9pt;color:#666}h2{font-size:11pt;margin:14px 0 4px;color:#c9272e}' +
    'table.d{width:100%;border-collapse:collapse}table.d td{border-bottom:1px solid #ddd;padding:3px 4px;vertical-align:top}table.d td.n{width:38%;font-weight:bold;color:#333}' +
    '.bloco{page-break-inside:avoid;margin-bottom:6px}.foto{max-width:260px;max-height:200px;border:1px solid #ddd;margin-top:4px}</style></head><body>' +
    '<table style="width:100%;border-bottom:2px solid #c9272e;margin-bottom:10px"><tr><td style="padding-bottom:8px"><img src="' + logoDataUri_('cablotec') + '" style="height:34px"></td>' +
    '<td style="text-align:right;padding-bottom:8px"><h1>Etiquetas dos componentes – ' + (tipo === 'clico' ? 'Clico' : 'Grupo') + '</h1>' +
    '<div class="sub">SERIAL NO: <b style="color:#c9272e">' + e(serial) + '</b>' + (d.grupo ? ' · ' + e(d.grupo) : '') + ' · ' + agora_() + '</div></td></tr></table>';
  ks.forEach(k => {
    const r = d.itens[k];
    let img = '';
    try { if (r.fotoId) { const b = miniatura_(DriveApp.getFileById(r.fotoId), 700); img = '<img class="foto" src="data:' + b.getContentType() + ';base64,' + Utilities.base64Encode(b.getBytes()) + '">'; } } catch (x) {}
    h += '<div class="bloco"><h2>' + e(r.nome) + (r.fabricante ? ' – ' + e(r.fabricante) : '') + '</h2><table class="d">' +
      (r.campos || []).map(c => '<tr><td class="n">' + e(c[0]) + '</td><td>' + e(c[1]) + '</td></tr>').join('') + '</table>' + img + '</div>';
  });
  h += '<p style="margin-top:14px;font-size:8pt;color:#888;border-top:1px solid #ddd;padding-top:6px">Cablotec – Cablagens e Sistemas, Lda · Documento gerado pela Aplicação Cablotec</p></body></html>';
  return HtmlService.createHtmlOutput(h).getAs(MimeType.PDF);
}
