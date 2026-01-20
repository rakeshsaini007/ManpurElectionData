
/**
 * Voter Data Management Backend
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Replace all code with this content.
 * 4. Create sheets named "Data" and "Deleted" with appropriate headers.
 * 5. Click "Deploy" > "New Deployment" > "Web App".
 * 6. Set access to "Anyone".
 * 7. Copy the Web App URL and paste it into `services/gasService.ts` in the React app.
 */

const SHEET_NAME = "Data";
const DELETED_SHEET_NAME = "Deleted";

function doGet(e) {
  const action = e.parameter.action;
  if (action === "getData") {
    return handleGetData();
  }
}

function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  const action = payload.action;

  if (action === "saveVoter") {
    return handleSaveVoter(payload.data);
  } else if (action === "deleteVoter") {
    return handleDeleteVoter(payload.data, payload.reason);
  }
}

function handleGetData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const voters = data.slice(1).map(row => {
    return {
      boothNo: String(row[0]),
      wardNo: String(row[1]),
      voterNo: String(row[2]),
      houseNo: String(row[3]),
      svn: String(row[4]),
      name: String(row[5]),
      relativeName: String(row[6]),
      gender: String(row[7]),
      age: String(row[8]),
      aadhaar: String(row[9]),
      dob: String(row[10]),
      calculatedAge: String(row[11]),
      photo: String(row[12])
    };
  });

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    data: voters
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleSaveVoter(voter) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  // Try to find existing record by SVN or Booth/Ward/VoterNo
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][4]) === String(voter.svn) && voter.svn !== '') {
      rowIndex = i + 1;
      break;
    }
  }

  const rowData = [
    voter.boothNo, voter.wardNo, voter.voterNo, voter.houseNo, 
    voter.svn, voter.name, voter.relativeName, voter.gender, 
    voter.age, voter.aadhaar, voter.dob, voter.calculatedAge, voter.photo
  ];

  if (rowIndex !== -1) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    return createJsonResponse(true, "Record updated successfully.");
  } else {
    sheet.appendRow(rowData);
    return createJsonResponse(true, "New record added successfully.");
  }
}

function handleDeleteVoter(voter, reason) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = ss.getSheetByName(SHEET_NAME);
  const deletedSheet = ss.getSheetByName(DELETED_SHEET_NAME);
  const data = dataSheet.getDataRange().getValues();

  let found = false;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][4]) === String(voter.svn)) {
      const rowToMove = data[i];
      // Append with reason
      deletedSheet.appendRow([...rowToMove, reason, new Date()]);
      dataSheet.deleteRow(i + 1);
      found = true;
      break;
    }
  }

  return createJsonResponse(found, found ? "Moved to deleted sheet." : "Record not found.");
}

function createJsonResponse(success, message) {
  return ContentService.createTextOutput(JSON.stringify({
    success: success,
    message: message
  })).setMimeType(ContentService.MimeType.JSON);
}
