function updateProgress(payload) {
  const required = ['ticket_id','nama_petugas','isi_progress','status'];
  for (const f of required) {
    if (!payload[f] || String(payload[f]).trim() === '') {
      return fail('Field "' + f + '" wajib diisi.');
    }
  }
  if (!CONFIG.STATUS.includes(payload.status)) return fail('Status tidak valid.');

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sheet = getSheet(CONFIG.SHEET_LAPORAN);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idx = {
      ticket: headers.indexOf('ticket_id'),
      status: headers.indexOf('status'),
      resp1: headers.indexOf('waktu_respons_pertama'),
      slaResp: headers.indexOf('sla_respons_pertama'),
      selesai: headers.indexOf('waktu_selesai'),
      slaSelesai: headers.indexOf('sla_penyelesaian'),
      progress: headers.indexOf('progress_terakhir'),
      petugas: headers.indexOf('nama_petugas_terakhir'),
      upd: headers.indexOf('waktu_update_terakhir'),
      waktu: headers.indexOf('waktu_laporan')
    };

    let rowIdx = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][idx.ticket] === payload.ticket_id) { rowIdx = i + 1; break; }
    }
    if (rowIdx === -1) return fail('Tiket tidak ditemukan.');

    const statusBefore = data[rowIdx-1][idx.status];
    const waktuLaporan = data[rowIdx-1][idx.waktu];
    const now = nowStr();
    const nowMs = new Date().getTime();
    const laporanMs = parseDateTime(waktuLaporan)?.getTime() || nowMs;

    if (!data[rowIdx-1][idx.resp1]) {
      sheet.getRange(rowIdx, idx.resp1 + 1).setValue(now);
      sheet.getRange(rowIdx, idx.slaResp + 1).setValue(formatDurasi(nowMs - laporanMs));
    }

    if (['Selesai','Ditutup'].includes(payload.status) && !data[rowIdx-1][idx.selesai]) {
      sheet.getRange(rowIdx, idx.selesai + 1).setValue(now);
      sheet.getRange(rowIdx, idx.slaSelesai + 1).setValue(formatDurasi(nowMs - laporanMs));
    }

    sheet.getRange(rowIdx, idx.status + 1).setValue(payload.status);
    sheet.getRange(rowIdx, idx.progress + 1).setValue(sanitize(payload.isi_progress));
    sheet.getRange(rowIdx, idx.petugas + 1).setValue(sanitize(payload.nama_petugas));
    sheet.getRange(rowIdx, idx.upd + 1).setValue(now);
    sheet.getRange(rowIdx, headers.indexOf('updated_at') + 1).setValue(now);

    const rSheet = getSheet(CONFIG.SHEET_RIWAYAT);
    const total = rSheet.getLastRow();
    rSheet.appendRow([
      'PR-' + payload.ticket_id + '-' + String(total).padStart(2,'0'),
      payload.ticket_id,
      payload.tanggal_menjawab || todayStr(),
      now,
      sanitize(payload.nama_petugas),
      sanitize(payload.isi_progress),
      statusBefore,
      payload.status,
      now
    ]);

    return ok({ ticket_id: payload.ticket_id, status: payload.status },
              'Progress berhasil disimpan.');
  } catch (e) {
    return fail('Gagal menyimpan progress: ' + e.message);
  } finally {
    lock.releaseLock();
  }
}
