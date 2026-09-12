/**
 * Parque Cândia — recebe os leads do site e grava na planilha.
 *
 * Onde colar: na planilha do Google, menu Extensões → Apps Script.
 * Apague o conteúdo do arquivo Code.gs e cole tudo isso.
 * O passo a passo completo está em README-planilha.md
 */

/* ====== AJUSTE AQUI ====== */

// Nome da aba onde os leads são gravados (é criada sozinha se não existir).
var ABA = 'Leads';

// Para receber um e-mail a cada lead novo, coloque seu e-mail entre as aspas.
// Deixe vazio ('') para não receber aviso.
var AVISAR_EMAIL = '';

/* ====== DAQUI PARA BAIXO NÃO PRECISA MEXER ====== */

var COLUNAS = [
  'Data/Hora', 'Nome', 'WhatsApp', 'Objetivo', 'Imóvel', 'Prioridade',
  'Campanha', 'Fonte', 'Mídia', 'Termo', 'Conteúdo', 'gclid',
  'Veio de', 'Página'
];

function doPost(e) {
  // Trava para não embaralhar linhas se dois leads chegarem no mesmo segundo.
  var trava = LockService.getScriptLock();
  try {
    trava.waitLock(20000);

    var d = JSON.parse(e.postData.contents);
    var aba = pegarAba();

    aba.appendRow([
      new Date(),
      d.nome || '',
      d.whatsapp || d.whatsapp_numeros || '',
      d.objetivo || '',
      d.imovel || '',
      d.prioridade || '',
      d.utm_campaign || '',
      d.utm_source || '',
      d.utm_medium || '',
      d.utm_term || '',
      d.utm_content || '',
      d.gclid || '',
      d.referencia || '',
      d.pagina || ''
    ]);

    if (AVISAR_EMAIL) avisar(d);

    return responder({ ok: true });
  } catch (err) {
    // Registra a falha numa aba separada para nenhum lead sumir em silêncio.
    try {
      var erros = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Erros')
                  || SpreadsheetApp.getActiveSpreadsheet().insertSheet('Erros');
      erros.appendRow([new Date(), String(err), e && e.postData ? e.postData.contents : '']);
    } catch (ignorar) {}
    return responder({ ok: false, erro: String(err) });
  } finally {
    trava.releaseLock();
  }
}

// Serve para testar no navegador: abrir a URL /exec deve mostrar {"ok":true,...}
function doGet() {
  return responder({ ok: true, status: 'online', aba: ABA });
}

function pegarAba() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(ABA);

  if (!aba) {
    aba = planilha.insertSheet(ABA);
    aba.appendRow(COLUNAS);
    aba.getRange(1, 1, 1, COLUNAS.length).setFontWeight('bold');
    aba.setFrozenRows(1);
    // WhatsApp como texto, senão o Sheets come o zero e vira número.
    aba.getRange('C:C').setNumberFormat('@');
    aba.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm:ss');
    aba.setColumnWidth(1, 140);
    aba.setColumnWidth(2, 180);
    aba.setColumnWidth(3, 140);
  }
  return aba;
}

function avisar(d) {
  var corpo =
    'Novo lead pelo site do Parque Cândia\n\n' +
    'Nome: ' + (d.nome || '-') + '\n' +
    'WhatsApp: ' + (d.whatsapp || '-') + '\n' +
    'Objetivo: ' + (d.objetivo || '-') + '\n' +
    'Imóvel: ' + (d.imovel || '-') + '\n' +
    'Prioridade: ' + (d.prioridade || '-') + '\n' +
    'Campanha: ' + (d.utm_campaign || '-') + '\n' +
    'Veio de: ' + (d.referencia || '-') + '\n';

  MailApp.sendEmail(AVISAR_EMAIL, 'Lead novo: ' + (d.nome || 'sem nome'), corpo);
}

function responder(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
