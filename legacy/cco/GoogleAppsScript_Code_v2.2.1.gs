/*
  Integração Google Sheets — Checklist CEM v2.2.1

  1. Abra a planilha de destino.
  2. Acesse Extensões > Apps Script e cole este conteúdo em Code.gs.
  3. Troque o valor de TOKEN abaixo por uma senha longa.
  4. Clique em Implantar > Nova implantação > Aplicativo da web.
  5. Execute como: você. Quem pode acessar: qualquer pessoa com o link.
  6. Copie a URL terminada em /exec para a Administração do checklist.
     Informe também o mesmo token configurado abaixo.
*/

const TOKEN = "TROQUE-POR-UM-TOKEN-SEGURO";
const SHEET_NAME = "Avaliacoes";

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    if (TOKEN && payload.token !== TOKEN) {
      return jsonResponse({ ok: false, error: "Token inválido" });
    }

    const sheet = getOrCreateSheet();
    if (payload.action === "test") {
      sheet.appendRow([new Date(), "TESTE", new Date(), 100, "Teste de integração", "Conexão com a planilha", "Conforme", "Registro de teste", "Não", "", payload.version || ""]);
      return jsonResponse({ ok: true, test: true });
    }

    const record = payload.record;
    if (!record || !record.ticket || !Array.isArray(record.answers)) {
      return jsonResponse({ ok: false, error: "Registro inválido" });
    }

    const rows = record.answers.map(function(answer) {
      return [
        new Date(record.createdAt || Date.now()),
        record.ticket,
        record.date,
        record.score,
        answer.block,
        answer.question,
        answer.answerLabel,
        answer.observation || "",
        record.reviewNeeded ? "Sim" : "Não",
        record.reviewReason || "",
        payload.version || ""
      ];
    });

    if (rows.length) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    }
    return jsonResponse({ ok: true, ticket: record.ticket, rows: rows.length });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  const headers = ["Enviado em", "Ticket", "Data da avaliação", "Conformidade (%)", "Lâmina", "Pergunta", "Resposta", "Observação", "Precisa de revisão", "Motivo da revisão", "Versão"];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  } else {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return sheet;
}

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
