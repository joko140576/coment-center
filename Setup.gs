function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const schemas = {
    [CONFIG.SHEET_LAPORAN]: [
      'ticket_id','tanggal_laporan','waktu_laporan','nama_pelapor',
      'divisi_pelapor','region','cou_kantor','divisi_tujuan',
      'sifat_laporan','isi_laporan','status','waktu_respons_pertama',
      'sla_respons_pertama','waktu_selesai','sla_penyelesaian',
      'progress_terakhir','nama_petugas_terakhir','waktu_update_terakhir',
      'created_at','updated_at'
    ],
    [CONFIG.SHEET_RIWAYAT]: [
      'progress_id','ticket_id','tanggal_menjawab','waktu_respons',
      'nama_petugas','isi_progress','status_sebelum','status_sesudah','created_at'
    ],
    [CONFIG.SHEET_USERS]: [
      'user_id','nama','email','divisi','role','status_akun','created_at'
    ],
    [CONFIG.SHEET_KONFIG]: [
      'kategori','kode','nilai','keterangan'
    ]
  };

  Object.keys(schemas).forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(schemas[name]);
      sheet.getRange(1, 1, 1, schemas[name].length)
        .setFontWeight('bold')
        .setBackground('#e3f2fd');
      sheet.setFrozenRows(1);
    }
  });

  seedKonfigurasi();
  seedAdmin();
  Logger.log('✅ Setup selesai.');
}

function seedKonfigurasi() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_KONFIG);
  if (sheet.getLastRow() > 1) return;
  const rows = [];
  CONFIG.DIVISI.forEach(d => rows.push(['DIVISI', d, d, 'Daftar divisi']));
  CONFIG.REGION.forEach(r => rows.push(['REGION', r, r, 'Daftar region']));
  CONFIG.SIFAT.forEach(s => rows.push(['SIFAT', s, s, 'Daftar sifat laporan']));
  CONFIG.STATUS.forEach(s => rows.push(['STATUS', s, s, 'Daftar status']));
  Object.keys(CONFIG.SLA_TARGET).forEach(k => {
    rows.push(['SLA', k, JSON.stringify(CONFIG.SLA_TARGET[k]), 'Target SLA (menit)']);
  });
  if (rows.length) sheet.getRange(sheet.getLastRow()+1, 1, rows.length, 4).setValues(rows);
}

function seedAdmin() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_USERS);
  if (sheet.getLastRow() > 1) return;
  sheet.appendRow(['U001','Administrator','admin@ssi.co.id','ALL','admin','aktif',
                   Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss')]);
}
