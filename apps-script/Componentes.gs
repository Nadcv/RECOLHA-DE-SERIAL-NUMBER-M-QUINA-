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
  let r, motivoIA = '';
  try { r = lerComponenteIA_(def, foto); }
  catch (e) {
    motivoIA = String(e.message || e).slice(0, 120);
    Logger.log('Leitura do componente por IA falhou: ' + motivoIA);
    r = camposOCRComponente_(def.k, lerTextoOCR_([foto]));
  }
  const reg = { nome: def.nome, fabricante: r.fabricante || '', modelo: r.modelo || '', codigo: r.codigo || '', serial: r.serial || '',
                ano: r.ano || '', campos: (r.campos || []).slice(0, 40), fonte: r.fonte || '', fotoId: foto.getId(),
                lidoEm: agora_(), por: (user && user.nome) || '', motivoIA };
  const d = compLer_(pasta) || { serial, tipo, itens: {} };
  d.grupo = String(req.grupo || d.grupo || '').trim().toUpperCase().slice(0, 30);
  d.itens = d.itens || {}; d.itens[def.k] = reg; d.atualizadoEm = agora_();
  compGuardar_(pasta, d);
  return { tipo, comp: def.k, registo: reg };
}

/* ---------- Leitura sem IA: reconhece os campos de cada etiqueta no texto do OCR ---------- */
function camposOCRComponente_(k, texto) {
  const t = String(texto || '').replace(/\r/g, '');
  const c = [], out = { fonte: 'OCR', campos: c };
  const add = (nome, v) => { v = String(v || '').replace(/\s+/g, ' ').trim(); if (v && !c.some(x => x[0] === nome)) c.push([nome, v]); return v; };
  const m = (re, g) => { const r = t.match(re); return r ? (r[g || 1] || '').trim() : ''; };
  const todos = re => (t.match(re) || []).map(x => x.replace(/\s+/g, ' ').trim()).filter((v, i, a) => a.indexOf(v) === i);
  if (k === 'deposito') {
    if (/RIGOMEC/i.test(t)) out.fabricante = add('Fabricante', 'Frigomec (Legnago, Itália)');
    out.modelo = add('Tipo (Type)', m(/\b(RV-[A-Z0-9\/\-]+)/i));
    out.serial = add('Nº de fabrico (Manufacture Nr.)', m(/^\s*(\d{6,8})\s*$/m));
    out.ano = add('Ano de fabrico', m(/\b((?:0[1-9]|1[0-2])\/20\d{2})\b/));
    add('Grupo de fluidos', m(/Fluids\s*Group[^\d\n]*([12](?:\s*[\/ ]\s*[12])?)/i));
    add('Excluído', m(/Excluded\s*(R\d{3,4}[A-Z]?)/i));
    add('Volume', (m(/^\s*(\d{1,3}[.,]\d)\s*$/m) || m(/Volume[^\d\n]*(\d+[.,]?\d*)/i)) ? (m(/^\s*(\d{1,3}[.,]\d)\s*$/m) || m(/Volume[^\d\n]*(\d+[.,]?\d*)/i)) + ' L' : '');
    add('Temperatura TS (°C)', m(/(-\d{1,2}\s+\d{2,3}\s+-\d{1,2}\s+\d{2,3})/));
    add('Pressão máx. PS (bar)', m(/(-1\s*\/\s*\d{2}\s+\d{2})/));
    add('Pressão de teste PT (bar)', m(/(\d{2}[.,]\d{1,2})\s*Mat/i) || m(/Test\s*press[^\d\n]*(\d{2}[.,]\d{1,2})/i));
    add('Material do corpo', m(/Mat\.?\s*Body\s*:?\s*([A-Za-z ]+?)(?:\n|$)/i));
    add('Marcação CE (organismo)', m(/^\s*(0\d{3})\s*$/m));
  } else if (k === 'compressor') {
    if (/Danfoss|Dankor|Danfo|Dantoss/i.test(t) || /\b[LM]LZ[0O]\d{2}/.test(t)) out.fabricante = add('Fabricante', 'Danfoss');
    out.modelo = add('Modelo (Model no)', (m(/Model\s*no\.?\s*:?\s*([A-Z0-9]{8,})/i) || m(/\b([LM]LZ[0O]\d{2}[A-Z0-9]{4,})\b/)).replace(/^([LM]LZ)O/, '$10'));
    out.serial = add('Nº de série (Serial no)', m(/Serial\s*no\.?\s*:?\s*([A-Z]{2}\d{8,})/i) || m(/\b([A-Z]{2}\d{10})\b/));
    add('Tech no', m(/Tech\s*no\.?\s*:?\s*([A-Z0-9]{6,})/i));
    add('Alimentação', todos(/\d{3}(?:\s*-\s*\d{3})?\s*V\s*3\s*[~\-]\s*\d{2}\s*Hz/gi).join(' · '));
    add('Corrente de arranque (LR)', m(/LR\s*:?\s*(\d+\s*A)/i));
    add('Corrente máx. (MAX OPER)', m(/MAX\s*OPER\.?\s*:?\s*([\d.,]+\s*A)/i));
    add('Óleo (Lubricant)', m(/Lubricant\s*:?\s*([A-Z]+\s*\/\s*[\d.,]+\s*L)/i));
    add('Refrigerante', m(/Refrigerant\s*:?\s*([^\n]+)/i));
    const bars = todos(/\b\d{1,2}[.,]\d{1,2}\s*bar\b/gi);
    if (bars.length >= 2) { add('PS – lado de baixa (LP)', bars[0]); add('PS – lado de alta (HP)', bars[1]); }
    const temps = (t.match(/-?\d{1,3}\s*°\s*C/g) || []).map(x => x.replace(/\s+/g, ' '));
    const tmax = temps.filter(x => !/^-/.test(x)), tmin = temps.filter(x => /^-/.test(x));
    if (tmax[0]) add('TS máx. – lado LP', tmax[0]); if (tmax[1]) add('TS máx. – lado HP', tmax[1]);
    if (tmin[0]) add('TS mín. – lado LP', tmin[0]); if (tmin[1]) add('TS mín. – lado HP', tmin[1]);
    const vols = t.split('\n').filter(l => !/lubric/i.test(l)).join('\n').match(/\b\d[.,]\d{1,2}\s*L\b/g) || [];
    if (vols[0]) add('Volume – lado LP', vols[0]); if (vols[1]) add('Volume – lado HP', vols[1]);
    if (/P\.?\s*E\.?\s*D/i.test(t)) add('Diretiva', 'P.E.D. (equipamentos sob pressão)');
    add('Fabricado em', m(/MADE\s*IN\s*([A-Z]+)/i));
  } else if (k === 'unidade') {
    if (/Danfoss/i.test(t) || /114X\d{4}/.test(t)) out.fabricante = add('Fabricante', 'Danfoss');
    out.modelo = add('Modelo', m(/\b(OP-[A-Z0-9]{8,})/));
    out.codigo = add('Código', m(/\b(114X\d{4})\b/));
    out.serial = add('Nº de série', m(/Serial\s*No\.?[:\-.\s]*([A-Z0-9]{8,})/i) || m(/\b(HTPL[\d-]+)/));
    add('EAN', m(/\b(\d{13})\b/));
    add('Alimentação', m(/(\d{3}\s*V\s*3N?\s*~\s*\d{2}\s*Hz)/i) || (m(/Voltage\s*:?\s*([^\n]+)/i) + (/^\s*50\s*Hz\s*$/m.test(t) && !/Hz/i.test(m(/Voltage\s*:?\s*([^\n]+)/i)) ? ' ~ 50 Hz' : '')));
    add('Refrigerantes – grupo 1', m(/\(1\)\s*([^\n(]+)/) || m(/Group\s*1\s*:?\s*([^\n]+)/i));
    add('Refrigerantes – grupo 2', m(/\(2\)\s*([^\n]+)/) || m(/Group\s*2\s*:?\s*([^\n]+)/i));
    add('Referência Danfoss', m(/\b(118A\d{4})\b/));
    add('Desenho (DW)', m(/DW\s*:?\s*-?\s*([A-Z0-9]+(?:\s*REV\.?\s*\d+)?)/i));
    const dt = m(/DATE\s*:?\s*-?\s*(\d{2}-\d{2}-\d{4})/i); if (dt) { add('Data', dt); out.ano = dt.slice(-4); }
    add('Fabricado em', m(/MADE\s*IN\s*([A-Z]+)/i));
  } else if (k === 'ventilador') {
    out.fabricante = add('Fabricante', /ebm/i.test(t) ? 'ebm-papst' : /Hidria/i.test(t) ? 'Hidria (Eslovénia)' : /ZIEHL|FN0\d{2}/i.test(t) ? 'Ziehl-Abegg (Alemanha)' : '');
    out.modelo = add('Modelo', m(/\b(A\dE\d{3}-[A-Z0-9]+-\d+)\b/) || m(/\b(R\d{2}E-[A-Z0-9-]{6,})/) || m(/\b(FN\d{3}-[A-Z0-9.]+)/));
    add('P/N', m(/P\/N\s*:?\s*(\d{5,})/i));
    out.serial = add('Nº de série', m(/S\/N\s*:?\s*([\d\/]{6,})/i) || m(/\b(22\d{8}|0\d{7})\b/));
    add('Código Danfoss', m(/(118A\d{4}\s*\/\s*118U\d{4})/));
    add('Alimentação', m(/(1\s*~\s*\d{3}(?:\s*-\s*\d{3})?\s*V[^\n]*?Hz)/i) || m(/\b(\d{3}(?:-\d{3})?\s*V\s+\d{2}(?:-\d{2})?\s*Hz)/i) || todos(/\d{3}V\s+\d{2}Hz\s*[\d.,]+A/gi).join(' · '));
    add('Código de produção', m(/\b(\d{4}-\d-\d{4})\b/));
    add('Temperatura ambiente máx.', m(/max\.?\s*amb\.?\s*(\d+\s*°\s*C)/i));
    add('Classe de isolamento', m(/Ins\.?\s*cl\.?\s*(\d{3})/i) || m(/THCL\s*(\d{3})/i));
    add('Massa', m(/m\s*=\s*([\d.,]+\s*kg)/i));
    add('Eficiência (ErP)', m(/(Eff\w*\s*=\s*[\d.,]+\s*%[^\n]*?N\s*=\s*[\d.,]+)/i) || m(/(statA\s*=\s*[\d.,]+\s*%)/i));
    add('País de fabrico', m(/Made\s*in\s*([A-Za-zé]+)/i));
    add('Potência', todos(/\b\d{2,4}\s*W\b/g).join(' · '));
    add('Corrente', m(/\b([\d.,]+(?:\s*-\s*[\d.,]+)?\s*A)\b/));
    add('Rotação', todos(/\b\d{3,4}\s*(?:RPM|rpm|min)/g).join(' · '));
    add('Proteção', m(/\b(IP\s?\d{2})\b/));
    add('Data / lote', m(/\b(\d{2}\/\d{2}(?:\s+\d{3})?)\b/));
    if (/VSD/i.test(t)) add('Velocidade variável', 'VSD integrado');
  } else if (k === 'controlador') {
    if (/Danfoss|Optyma|084B/i.test(t)) out.fabricante = add('Fabricante', 'Danfoss');
    out.modelo = add('Modelo', /Optyma/i.test(t) ? 'Optyma Plus Controller' : '');
    out.codigo = add('Código', m(/\b(084B\d{4})(?!\d)/));
    out.serial = add('Nº da etiqueta (código de barras)', m(/(084B\d{4}\d{5,}[A-Z]{2}\d{2,})/));
    if (!out.codigo && out.serial) out.codigo = add('Código', out.serial.slice(0, 8));
    if (!out.modelo && /084B8080/.test(t)) out.modelo = add('Modelo', 'Optyma Plus Controller');
    add('Versão do firmware', m(/(PV\s?\d{2}\s*\/\s*SW\s*\d[.,\s]?\d{2})/i).replace(/\s+/g, ''));
    add('Alimentação', m(/(230\s*V\s*AC)/i));
  } else if (k === 'evaporador') {
    if (/CENTAURO/i.test(t)) out.fabricante = add('Fabricante', 'Centauro (Portugal)');
    out.modelo = add('Modelo', m(/Modelo\s*:?\s*([A-Z]{2,4}\s*\d+\/\d+)/i) || m(/\b(ERC\s*\d+\/\d+)/));
    add('Descrição do modelo', m(/(DI\+BR[^\n]*)/i));
    out.serial = add('Nº de série', m(/N\.?\s*S[eé]rie\s*:?\s*(\d{6,})/i) || m(/\b(\d{9})\b/));
    const rz = t.match(/(\d\s*x\s*\d{3,4})\s+(\d\s*x\s*[\d.,]+)\s+(\d{3})/i);
    if (rz) { add('Resistências – potência (W)', rz[1]); add('Resistências – corrente (A)', rz[2]); add('Resistências – tensão (V)', rz[3]); }
    add('Pressão Ps', m(/Ps\s*(\d+\s*bar)/i));
    add('Pressão Pt', m(/Pt\s*(\d+\s*bar)/i));
  } else if (k === 'sonda') {
    if (/rotronic/i.test(t)) out.fabricante = add('Fabricante', 'Rotronic (Suíça)');
    add('Produto', /HYGROCLIP/i.test(t) ? 'HygroClip2 Advanced (HC2A)' : '');
    out.modelo = add('Artigo (ART)', m(/ART\s*:?\s*([A-Z0-9]+\s*-\s*[A-Z0-9]+|[A-Z0-9-]{5,})/i).replace(/\s+/g, ''));
    out.serial = add('Nº', m(/\b(\d{8})\b/));
    add('EAN', m(/\b(\d{13})\b/));
    add('País de origem', m(/Country\s*of\s*origin\s*:?\s*([A-Za-z]+)/i));
  }
  if (c.length < 3 && t.trim()) add('Texto lido na etiqueta', t.split(/\n+/).map(l => l.trim()).filter(l => l.length > 1).join(' · ').slice(0, 500));
  ['modelo', 'serial', 'fabricante', 'codigo', 'ano'].forEach(x => { if (!out[x]) delete out[x]; });
  return out;
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

/** Leituras antigas ("Linha 1", "Linha 2"…): volta a identificar os campos a partir do texto já lido. */
function compNormalizar_(k, r) {
  if (!r || !(r.campos || []).some(c => /^Linha \d+$/.test(c[0]))) return false;
  const texto = r.campos.map(c => c[1]).join('\n');
  const n = camposOCRComponente_(k, texto);
  r.campos = n.campos; r.fonte = 'OCR';
  ['fabricante', 'modelo', 'codigo', 'serial', 'ano'].forEach(x => { r[x] = n[x] || ''; });
  return true;
}
function compNormalizarTodos_(pasta, d) {
  if (!d || !d.itens) return d;
  let mudou = false;
  Object.keys(d.itens).forEach(k => { if (compNormalizar_(k, d.itens[k])) mudou = true; });
  if (mudou && pasta) compGuardar_(pasta, d);
  return d;
}

/** POST componentes: definições + o que já foi lido para um serial (Grupo e Clico). */
function apiComponentes_(serial) {
  try { migrarComponentesAntigos_(); } catch (e) { Logger.log('Migração componentes: ' + e.message); }
  const r = { defs: compDefsPublicas_(), componentes: {}, info: {} };
  let s = '';
  try { s = compSerial_(serial); } catch (e) { return r; }
  ['grupo', 'clico'].forEach(t => {
    const pt = compPasta_(s, t, false), d = compNormalizarTodos_(pt, compLer_(pt));
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
  const d = compNormalizarTodos_(pasta, compLer_(pasta));
  const ks = d ? (COMPONENTES_[tipo] || []).map(c => c.k).filter(k => d.itens && d.itens[k]) : [];
  if (!ks.length) throw new Error('Ainda não há etiquetas lidas para este serial.');
  const emails = validarEmails_(req.emails);
  const para = emails || CONFIG.EMAIL_DESTINO;
  const nomeTipo = tipo === 'clico' ? 'Clico' : 'Grupo';
  d.revisao = (d.enviadoEm ? (Number(d.revisao) || 0) + 1 : 0);
  const base = compDocNum_(serial, tipo) + '_Rev' + ('0' + (Number(d.revisao) || 0)).slice(-2) + '_Etiquetas_componentes';
  const fmt = Array.isArray(req.formatos) && req.formatos.length ? req.formatos : ['pdf'];
  const anexos = [], falhas = [];
  if (fmt.indexOf('pdf') >= 0) anexos.push(compPdf_(serial, tipo, d, ks, user).setName(base + '.pdf'));
  if (fmt.indexOf('docx') >= 0) { try { anexos.push(compDocx_(serial, tipo, d, ks, user, pasta).setName(base + '.docx')); } catch (x) { Logger.log('Word: ' + x.message); falhas.push('Word'); } }
  if (fmt.indexOf('xlsx') >= 0) { try { anexos.push(compXlsx_(serial, tipo, d, ks, pasta).setName(base + '.xlsx')); } catch (x) { Logger.log('Excel: ' + x.message); falhas.push('Excel'); } }
  if (!anexos.length) anexos.push(compPdf_(serial, tipo, d, ks, user).setName(base + '.pdf'));
  const nomesFmt = anexos.map(a => /\.pdf$/.test(a.getName()) ? 'PDF' : /\.docx$/.test(a.getName()) ? 'Word' : 'Excel');
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
<p style="margin:0 0 18px;font-size:14px;color:#222;line-height:1.55">Vimos por este meio remeter o registo das etiquetas dos componentes do ${nomeTipo.toLowerCase()} abaixo identificado, com o modelo e o número de série de cada componente. Segue em anexo o relatório técnico (${nomesFmt.join(', ').replace(/, ([^,]*)$/, ' e $1')}) com todos os dados lidos${nomesFmt.indexOf('Excel') >= 0 ? ', incluindo uma folha Excel para tratamento dos dados' : ''}.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e3e6ee"><tr><th style="${th}">Componente</th><th style="${th}">Modelo</th><th style="${th}">Nº de série</th></tr>${linhas}</table></td></tr>
<tr><td style="padding:20px 28px 4px"><p style="margin:0 0 22px;font-size:14px;color:#222">Ficamos ao dispor para qualquer esclarecimento adicional.</p><p style="margin:0 0 4px;font-size:14px;color:#222">Com os melhores cumprimentos,</p></td></tr>
<tr><td style="padding:10px 28px 26px"><div style="border-left:4px solid ${vermelho};padding:4px 0 4px 12px"><div style="font-size:15px;font-weight:bold;color:${vermelho}">Aplicação Cablotec</div><div style="font-size:13px;color:#555">Etiquetas dos componentes${user && user.nome ? ' · ' + e(user.nome) : ''}</div><div style="font-size:12px;color:#888;margin-top:2px">Cablotec – Cablagens e Sistemas, Lda</div></div></td></tr>
<tr><td style="background:#f4f6fa;padding:14px 28px;border-top:1px solid #e3e6ee"><p style="margin:0;font-size:11px;color:#888;line-height:1.5">Esta mensagem foi gerada automaticamente pela Aplicação Cablotec. O documento anexo contém informação técnica destinada exclusivamente aos destinatários indicados.</p></td></tr>
</table></td></tr></table></body></html>`;
  MailApp.sendEmail({ to: para, subject: 'Cablotec – Etiquetas dos componentes – ' + nomeTipo + ' – Serial ' + serial,
    body: 'Etiquetas dos componentes do ' + nomeTipo + ' (serial ' + serial + ') em anexo (PDF).',
    htmlBody: html, inlineImages: { logoCablotec: logoBlob_('cablotec') }, name: 'Cablotec – Etiquetas dos componentes', attachments: anexos });
  d.enviadoEm = agora_(); d.enviadoPara = para;
  compGuardar_(pasta, d);
  return { enviadoPara: para, enviadoEm: d.enviadoEm, formatos: nomesFmt, falhas };
}

/** Nº do documento técnico: ETC-<serial>-G|C */
function compDocNum_(serial, tipo) { return 'ETC-' + serial.replace(/[^A-Z0-9]+/g, '') + '-' + (tipo === 'clico' ? 'C' : 'G'); }

/** Classifica um campo por secção técnica. */
function compSecaoCampo_(nome, valor) {
  const n = String(nome), v = String(valor);
  if (/fabrico|n[ºo°]\s|fabricante|modelo|s[ée]rie|serial|c[óo]digo|tipo|type|ean|p\/n|artigo|art\b|ano|data|lote|produto|desenho|dw\b|n[ºo°]\b|tech|marca[çc][ãa]o|vers[ãa]o|firmware|origem|fabricado|descri[çc][ãa]o/i.test(n)) return 'id';
  if (/aliment|tens[ãa]o|corrente|pot[êe]ncia|rota[çc][ãa]o|frequ|resist|\bLR\b|max oper|velocidade|vsd|prote[çc][ãa]o|\bIP\b|el[ée]tric|condensador|µF/i.test(n) || /\b\d+\s*(V|Hz|W|A|rpm|RPM)\b/.test(v)) return 'ele';
  if (/press|\bPS\b|\bPT\b|\bTS\b|temperat|volume|bar|fluido|categoria|exclu|refrigerante|[óo]leo|lubric|material/i.test(n) || /\bbar\b|°C/.test(v)) return 'pt';
  return 'out';
}

/** HTML do documento técnico de engenharia (usado no PDF e no Word). */
function compHtml_(serial, tipo, d, ks, user, semFotos) {
  const e = esc_, nomeTipo = tipo === 'clico' ? 'Clico' : 'Grupo';
  const doc = compDocNum_(serial, tipo), rev = ('0' + (Number(d.revisao) || 0)).slice(-2), hoje = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy');
  const leituras = ks.map(k => d.itens[k]);
  const tecnicos = leituras.map(r => r.por).filter((v, i, a) => v && a.indexOf(v) === i).join(', ') || (user && user.nome) || '';
  const datas = leituras.map(r => (r.lidoEm || '').slice(0, 10)).filter((v, i, a) => v && a.indexOf(v) === i).join(', ');
  const css = '@page{size:A4;margin:12mm 12mm 14mm}body{font-family:Arial,Helvetica,sans-serif;font-size:9pt;color:#1a1a1a}' +
    'table{border-collapse:collapse}.cart{width:100%;border:1.5px solid #1a1a1a}.cart td{border:1px solid #1a1a1a;padding:4px 6px;vertical-align:middle}' +
    '.cart .lbl{font-size:6.8pt;color:#555;text-transform:uppercase;letter-spacing:.3px;display:block}.cart .val{font-size:9pt;font-weight:bold}' +
    'h2{font-size:10.5pt;margin:14px 0 5px;padding-bottom:2px;border-bottom:1.5px solid #c9272e;color:#1a1a1a;text-transform:uppercase;letter-spacing:.4px}' +
    'h3{font-size:9.5pt;margin:10px 0 3px;color:#c9272e}h4{font-size:8pt;margin:6px 0 2px;color:#444;text-transform:uppercase;letter-spacing:.3px}' +
    '.g{width:100%}.g th{font-size:7.5pt;text-transform:uppercase;color:#333;text-align:left;border:1px solid #888;padding:3px 5px}' +
    '.g td{border:1px solid #aaa;padding:3px 5px;vertical-align:top;font-size:8.6pt}.g td.n{width:40%;color:#333}.c{text-align:center}' +
    '.mono{font-family:Courier New,monospace;font-weight:bold}.ser{color:#c9272e}.comp{page-break-inside:avoid}' +
    '.fig{border:1px solid #aaa;max-width:230px;max-height:175px}.cap{font-size:7.2pt;color:#555;margin-top:2px}' +
    '.obs li{margin-bottom:3px}.aprov td{border:1px solid #1a1a1a;padding:5px 6px;height:34px;vertical-align:top;font-size:8pt}';
  let h = '<html><head><meta charset="utf-8"><style>' + css + '</style></head><body>';
  // Cartucho
  h += '<table class="cart"><tr>' +
    '<td rowspan="2" style="width:150px;text-align:center"><img src="' + logoDataUri_('cablotec') + '" style="height:32px"></td>' +
    '<td colspan="3" style="text-align:center"><span class="val" style="font-size:12pt">RELATÓRIO TÉCNICO</span><br><span style="font-size:9pt">Identificação dos componentes – ' + nomeTipo + '</span></td></tr>' +
    '<tr><td><span class="lbl">Documento nº</span><span class="val">' + e(doc) + '</span></td><td><span class="lbl">Revisão</span><span class="val">' + rev + '</span></td>' +
    '<td><span class="lbl">Data de emissão</span><span class="val">' + hoje + '</span></td></tr>' +
    '<tr><td><span class="lbl">Nº de série do equipamento</span><span class="val ser">' + e(serial) + '</span></td><td><span class="lbl">Tipo de equipamento</span><span class="val">' + nomeTipo + '</span></td>' +
    '<td><span class="lbl">Modelo / grupo</span><span class="val">' + e(d.grupo || '—') + '</span></td><td><span class="lbl">Nº de componentes</span><span class="val">' + ks.length + '</span></td></tr></table>';
  // 1. Identificação
  h += '<h2>1. Identificação do equipamento</h2><table class="g">' +
    [['Nº de série do equipamento', '<span class="mono ser">' + e(serial) + '</span>'], ['Tipo de equipamento', nomeTipo], ['Modelo / grupo', e(d.grupo || '—')],
     ['Data(s) de leitura das etiquetas', e(datas || '—')], ['Técnico(s) responsável(eis)', e(tecnicos || '—')], ['Entidade', 'Cablotec – Cablagens e Sistemas, Lda']]
      .map(x => '<tr><td class="n">' + x[0] + '</td><td>' + x[1] + '</td></tr>').join('') + '</table>';
  // 2. Lista de componentes
  h += '<h2>2. Lista de componentes</h2><table class="g"><tr><th class="c" style="width:28px">Item</th><th>Componente</th><th>Fabricante</th><th>Modelo / referência</th><th>Nº de série</th><th class="c">Ano</th></tr>' +
    ks.map((k, i) => { const r = d.itens[k]; return '<tr><td class="c">' + (i + 1) + '</td><td><b>' + e(r.nome) + '</b></td><td>' + e(r.fabricante || '—') + '</td><td class="mono" style="font-weight:normal">' + e(r.modelo || r.codigo || '—') +
      '</td><td class="mono ser">' + e(r.serial || '—') + '</td><td class="c">' + e(r.ano || '—') + '</td></tr>'; }).join('') + '</table>';
  // 3. Características técnicas
  h += '<h2>3. Características técnicas dos componentes</h2>';
  const nomesSec = { id: 'Identificação', ele: 'Dados elétricos', pt: 'Pressão, temperatura e fluidos', out: 'Outros dados' };
  ks.forEach((k, i) => {
    const r = d.itens[k], grupos = { id: [], ele: [], pt: [], out: [] };
    (r.campos || []).forEach(c => grupos[compSecaoCampo_(c[0], c[1])].push(c));
    let img = '';
    try { if (r.fotoId && !semFotos) { const b = miniatura_(DriveApp.getFileById(r.fotoId), 700); img = '<img class="fig" src="data:' + b.getContentType() + ';base64,' + Utilities.base64Encode(b.getBytes()) + '"><div class="cap">Fig. ' + (i + 1) + ' – Etiqueta: ' + e(r.nome.toLowerCase()) + '</div>'; } } catch (x) {}
    h += '<div class="comp"><h3>3.' + (i + 1) + ' ' + e(r.nome) + (r.fabricante ? ' – ' + e(r.fabricante) : '') + '</h3><table style="width:100%"><tr><td style="vertical-align:top;padding-right:10px">' +
      ['id', 'ele', 'pt', 'out'].filter(g => grupos[g].length).map(g => '<h4>' + nomesSec[g] + '</h4><table class="g">' +
        grupos[g].map(c => '<tr><td class="n">' + e(c[0]) + '</td><td' + (/s[ée]rie|serial/i.test(c[0]) ? ' class="mono ser"' : '') + '>' + e(c[1]) + '</td></tr>').join('') + '</table>').join('') +
      '<div class="cap" style="margin-top:4px">Leitura: ' + e(r.lidoEm || '—') + (r.por ? ' · ' + e(r.por) : '') + ' · ' + (r.fonte === 'IA' ? 'reconhecimento por IA' : 'reconhecimento de texto') + (r.corrigido ? ' · revista manualmente' : '') + '</div>' +
      '</td><td style="width:235px;vertical-align:top;text-align:center">' + img + '</td></tr></table></div>';
  });
  // 4. Observações técnicas
  const obs = [];
  const ctl = d.itens.controlador;
  if (ctl) { const v = ((ctl.campos || []).filter(c => /vers|firmware/i.test(c[0]))[0] || [])[1] || '';
    if (v && v.replace(/\s/g, '').toUpperCase() !== 'PV06/SW3.61') obs.push('Versão do firmware do controlador (' + e(v) + ') diferente da versão de referência PV06/SW3.61 – informar o cliente.'); }
  leituras.forEach(r => { if (r.fonte === 'OCR' && !r.corrigido) obs.push(e(r.nome) + ': dados obtidos por reconhecimento de texto – confirmar com a fotografia da etiqueta (figura anexa).'); });
  leituras.forEach(r => { if (!r.serial) obs.push(e(r.nome) + ': nº de série não identificado na etiqueta.'); });
  h += '<h2>4. Observações técnicas</h2>' + (obs.length ? '<ul class="obs">' + obs.map(o => '<li>' + o + '</li>').join('') + '</ul>' : '<p>Sem observações.</p>');
  // 5. Aprovação
  h += '<h2>5. Aprovação</h2><table class="aprov" style="width:100%"><tr><td style="width:33%"><b>Elaborado por</b><br>' + e(tecnicos) + '<br><span style="color:#777">Data: ' + hoje + '</span></td>' +
    '<td style="width:33%"><b>Verificado por</b><br><br><span style="color:#777">Data: ____/____/______</span></td><td><b>Aprovado por</b><br><br><span style="color:#777">Data: ____/____/______</span></td></tr></table>';
  h += '<p style="margin-top:10px;font-size:7.2pt;color:#666;border-top:1px solid #999;padding-top:4px">' + e(doc) + ' · Rev. ' + rev + ' · Cablotec – Cablagens e Sistemas, Lda · Documento gerado pela Aplicação Cablotec a partir das etiquetas dos componentes.</p></body></html>';
  return h;
}
function compPdf_(serial, tipo, d, ks, user) {
  return HtmlService.createHtmlOutput(compHtml_(serial, tipo, d, ks, user)).getAs(MimeType.PDF);
}

/** Exporta um ficheiro Google (Docs/Sheets) para Word/Excel e apaga o temporário. */
function compExportar_(id, mime) {
  try {
    const res = UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + id + '/export?mimeType=' + encodeURIComponent(mime),
      { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) throw new Error('HTTP ' + res.getResponseCode());
    return res.getBlob();
  } finally { try { DriveApp.getFileById(id).setTrashed(true); } catch (e) {} }
}

/** Word (.docx): o mesmo documento técnico, editável, com as fotografias das etiquetas em anexo. */
function compDocx_(serial, tipo, d, ks, user, pasta) {
  const html = compHtml_(serial, tipo, d, ks, user, true);
  const f = Drive.Files.create({ name: 'tmp_etc_' + serial, mimeType: MimeType.GOOGLE_DOCS, parents: [pasta.getId()] },
                               Utilities.newBlob(html, 'text/html', 'doc.html'));
  try {
    const doc = DocumentApp.openById(f.id), body = doc.getBody();
    body.appendPageBreak();
    body.appendParagraph('ANEXO – FOTOGRAFIAS DAS ETIQUETAS').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    ks.forEach((k, i) => {
      const r = d.itens[k];
      if (!r.fotoId) return;
      try {
        body.appendParagraph('Fig. ' + (i + 1) + ' – ' + r.nome).setBold(true);
        const im = body.appendParagraph('').appendInlineImage(miniatura_(DriveApp.getFileById(r.fotoId), 900));
        const w = 300, k2 = w / im.getWidth(); im.setWidth(w).setHeight(Math.round(im.getHeight() * k2));
      } catch (e) { Logger.log('Foto no Word: ' + e.message); }
    });
    doc.saveAndClose();
  } catch (e) { Logger.log('Word (fotos): ' + e.message); }
  return compExportar_(f.id, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}

/** Excel (.xlsx): resumo dos componentes + todos os dados (componente, secção, campo, valor). */
function compXlsx_(serial, tipo, d, ks, pasta) {
  const nomesSec = { id: 'Identificação', ele: 'Dados elétricos', pt: 'Pressão, temperatura e fluidos', out: 'Outros dados' };
  const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  const linhas = [
    ['Relatório técnico – Identificação dos componentes – ' + (tipo === 'clico' ? 'Clico' : 'Grupo')],
    ['Documento nº', compDocNum_(serial, tipo), 'Revisão', ('0' + (Number(d.revisao) || 0)).slice(-2)],
    ['Nº de série do equipamento', serial, 'Modelo / grupo', d.grupo || ''],
    [],
    ['Item', 'Componente', 'Fabricante', 'Modelo / referência', 'Nº de série', 'Ano', 'Lida em', 'Técnico'],
  ];
  ks.forEach((k, i) => { const r = d.itens[k]; linhas.push([i + 1, r.nome, r.fabricante || '', r.modelo || r.codigo || '', r.serial || '', r.ano || '', r.lidoEm || '', r.por || '']); });
  linhas.push([], ['Componente', 'Secção', 'Campo', 'Valor']);
  ks.forEach(k => { const r = d.itens[k]; (r.campos || []).forEach(c => linhas.push([r.nome, nomesSec[compSecaoCampo_(c[0], c[1])], c[0], c[1]])); });
  const csv = '\ufeff' + linhas.map(l => l.map(q).join(',')).join('\r\n');
  const f = Drive.Files.create({ name: 'tmp_etc_' + serial, mimeType: MimeType.GOOGLE_SHEETS, parents: [pasta.getId()] },
                               Utilities.newBlob(csv, 'text/csv', 'dados.csv'));
  return compExportar_(f.id, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}
