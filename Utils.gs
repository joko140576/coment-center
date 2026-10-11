function nowStr() {
  return Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
}
function todayStr() {
  return Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');
}
function sanitize(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
function ok(data, message) {
  return jsonOut({ success: true, message: message || 'OK', data: data || null });
}
function fail(message) {
  return jsonOut({ success: false, message: message || 'Terjadi kesalahan', data: null });
}
function formatDurasi(ms) {
  if (!ms || ms < 0) return '-';
  if (ms < 60000) return 'Baru saja';
  const menit = Math.floor(ms / 60000);
  if (menit < 60) return menit + ' menit';
  const jam = Math.floor(menit / 60);
  const sisaM = menit % 60;
  if (jam < 24) return jam + ' jam ' + sisaM + ' menit';
  const hari = Math.floor(jam / 24);
  const sisaJ = jam % 24;
  return hari + ' hari ' + sisaJ + ' jam ' + sisaM + ' menit';
}
function parseDateTime(str) {
  if (!str) return null;
  const d = new Date(String(str).replace(' ', 'T') + '+07:00');
  return isNaN(d.getTime()) ? null : d;
}
function getSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}
function rowsToObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  const dateOnly = ['tanggal_laporan', 'tanggal_menjawab'];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      let v = row[i];
      if (v instanceof Date) {
        v = Utilities.formatDate(v, CONFIG.TIMEZONE,
              dateOnly.includes(h) ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm:ss');
      }
      obj[h] = v;
    });
    return obj;
  });
}
