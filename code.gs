function doGet(e) {
  const action = (e.parameter.action || '').trim();
  try {
    switch (action) {
      case 'getLaporan':       return getLaporanList(e.parameter);
      case 'getStatistik':     return getStatistik(e.parameter);
      case 'getDetailLaporan': return getDetailLaporan(e.parameter.ticket_id);
      case 'getRiwayat':       return getDetailLaporan(e.parameter.ticket_id);
      case 'getKonfigurasi':   return getKonfigurasi();
      case 'ping':             return ok({ status: 'alive', time: nowStr() });
      default:                 return fail('Action tidak dikenal: ' + action);
    }
  } catch (err) {
    return fail('Server error: ' + err.message);
  }
}

function doPost(e) {
  let payload = {};
  try { payload = JSON.parse(e.postData.contents); } catch(_) {}
  const action = (e.parameter.action || payload.action || '').trim();
  try {
    switch (action) {
      case 'createLaporan':   return createLaporan(payload);
      case 'updateProgress':  return updateProgress(payload);
      case 'saveKonfigurasi': return ok(null, 'Fitur konfigurasi belum diaktifkan.');
      default:                return fail('Action tidak dikenal: ' + action);
    }
  } catch (err) {
    return fail('Server error: ' + err.message);
  }
}
