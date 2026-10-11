function generateTicketId() {
  const tz = CONFIG.TIMEZONE;
  const dateStr = Utilities.formatDate(new Date(), tz, 'yyyyMMdd');
  const sheet = getSheet(CONFIG.SHEET_LAPORAN);
  const data = sheet.getDataRange().getValues();
  let counter = 0;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).startsWith('CC-' + dateStr)) counter++;
  }
  return `CC-${dateStr}-${String(counter + 1).padStart(4,'0')}`;
}

function createLaporan(payload) {
  const required = ['nama_pelapor','divisi_pelapor','region','cou_kantor',
                    'divisi_tujuan','sifat_laporan','isi_laporan'];
  for (const f of required) {
    if (!payload[f] || String(payload[f]).trim() === '') {
      return fail('Field "' + f + '" wajib diisi.');
    }
  }
  if (!CONFIG.DIVISI.includes(payload.divisi_pelapor)) return fail('Divisi pelapor tidak valid.');
  if (!CONFIG.DIVISI.includes(payload.divisi_tujuan)) return fail('Divisi tujuan tidak valid.');
  if (!CONFIG.SIFAT.includes(payload.sifat_laporan)) return fail('Sifat laporan tidak valid.');
  if (!CONFIG.REGION.includes(payload.region)) return fail('Region tidak valid.');

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sheet = getSheet(CONFIG.SHEET_LAPORAN);
    const ticketId = generateTicketId();
    const now = nowStr();
    const tanggal = payload.tanggal_laporan || todayStr();

    sheet.appendRow([
      ticketId, tanggal, now,
      sanitize(payload.nama_pelapor),
      payload.divisi_pelapor,
      payload.region,
      sanitize(payload.cou_kantor),
      payload.divisi_tujuan,
      payload.sifat_laporan,
      sanitize(payload.isi_laporan),
      'Menunggu Respons',
      '', '', '', '', '', '', '', now, now
    ]);

    const rSheet = getSheet(CONFIG.SHEET_RIWAYAT);
    rSheet.appendRow([
      'PR-' + ticketId + '-01', ticketId, todayStr(), now,
      sanitize(payload.nama_pelapor),
      'Laporan dibuat oleh pelapor.',
      '-', 'Menunggu Respons', now
    ]);

    return ok({ ticket_id: ticketId, waktu_laporan: now },
              'Laporan berhasil dikirim. Nomor tiket: ' + ticketId);
  } catch (e) {
    return fail('Gagal menyimpan laporan: ' + e.message);
  } finally {
    lock.releaseLock();
  }
}
