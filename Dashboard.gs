function getLaporanList(filters) {
  filters = filters || {};
  let rows = rowsToObjects(getSheet(CONFIG.SHEET_LAPORAN));
  
  const divF = (filters.divisi && filters.divisi !== 'ALL') ? filters.divisi : '';
  if (filters.role && filters.role === 'petugas' && divF) {
    rows = rows.filter(r => r.divisi_tujuan === divF);
  }
  if (divF)                   rows = rows.filter(r => r.divisi_tujuan === divF);
  if (filters.divisi)         rows = rows.filter(r => r.divisi_tujuan === filters.divisi);
  if (filters.divisi_tujuan)  rows = rows.filter(r => r.divisi_tujuan === filters.divisi_tujuan);
  if (filters.region)         rows = rows.filter(r => r.region === filters.region);
  if (filters.sifat)          rows = rows.filter(r => r.sifat_laporan === filters.sifat);
  if (filters.status)         rows = rows.filter(r => r.status === filters.status);
  if (filters.tanggal_dari)   rows = rows.filter(r => r.tanggal_laporan >= filters.tanggal_dari);
  if (filters.tanggal_sampai) rows = rows.filter(r => r.tanggal_laporan <= filters.tanggal_sampai);
  if (filters.search) {
    const q = String(filters.search).toLowerCase();
    rows = rows.filter(r =>
      String(r.ticket_id).toLowerCase().includes(q) ||
      String(r.nama_pelapor).toLowerCase().includes(q) ||
      String(r.cou_kantor).toLowerCase().includes(q) ||
      String(r.isi_laporan).toLowerCase().includes(q)
    );
  }

  const nowMs = new Date().getTime();
  rows = rows.map(r => {
    const laporanMs = parseDateTime(r.waktu_laporan)?.getTime() || nowMs;
    const target = CONFIG.SLA_TARGET[r.sifat_laporan] || { respon:0, selesai:0 };
    const targetRespMs = target.respon * 60000;

    let slaBerjalanMs, slaBadge;
    if (!['Selesai','Ditutup'].includes(r.status)) {
      slaBerjalanMs = nowMs - laporanMs;
      if (targetRespMs > 0) {
        const persen = slaBerjalanMs / targetRespMs;
        slaBadge = persen < 0.5 ? 'aman' : persen < 0.8 ? 'warning' :
                   persen <= 1 ? 'kritis' : 'overdue';
      } else slaBadge = 'neutral';
    } else {
      slaBerjalanMs = 0;
      slaBadge = 'selesai';
    }

    return Object.assign(r, {
      sla_berjalan: ['Selesai','Ditutup'].includes(r.status) ? '-' : formatDurasi(slaBerjalanMs),
      sla_badge: slaBadge,
      usia_ms: slaBerjalanMs
    });
  });

  const sortBy = filters.sort_by || 'waktu_laporan';
  const order  = filters.order === 'asc' ? 1 : -1;
  rows.sort((a,b) => {
    if (sortBy === 'usia') return (b.usia_ms - a.usia_ms) * (order === 1 ? 1 : -1);
    return String(a[sortBy] || '').localeCompare(String(b[sortBy] || '')) * order;
  });

  return ok({ items: rows, total: rows.length });
}

function getStatistik(filters) {
  const res = JSON.parse(getLaporanList(filters).getContent());
  const items = res.data.items;

  const stats = {
    total: items.length,
    baru: items.filter(r => r.status === 'Menunggu Respons').length,
    menunggu: items.filter(r => r.status === 'Menunggu Respons').length,
    ditangani: items.filter(r => r.status === 'Sedang Ditangani').length,
    prioritas_tinggi: items.filter(r => String(r.sifat_laporan).startsWith('Prioritas Tinggi')).length,
    darurat: items.filter(r => String(r.sifat_laporan).startsWith('Darurat')).length,
    selesai: items.filter(r => ['Selesai','Ditutup'].includes(r.status)).length,
    overdue: items.filter(r => r.sla_badge === 'overdue').length,
    by_divisi: {}, by_status: {}, by_sifat: {}, by_tanggal: {},
    persen_selesai: 0
  };

  items.forEach(r => {
    stats.by_divisi[r.divisi_tujuan] = (stats.by_divisi[r.divisi_tujuan] || 0) + 1;
    stats.by_status[r.status] = (stats.by_status[r.status] || 0) + 1;
    stats.by_sifat[r.sifat_laporan] = (stats.by_sifat[r.sifat_laporan] || 0) + 1;
    const tgl = String(r.tanggal_laporan).substring(0,10);
    stats.by_tanggal[tgl] = (stats.by_tanggal[tgl] || 0) + 1;
  });

  stats.persen_selesai = stats.total ? Math.round((stats.selesai / stats.total) * 100) : 0;
  return ok(stats);
}

function getDetailLaporan(ticket_id) {
  const row = rowsToObjects(getSheet(CONFIG.SHEET_LAPORAN))
    .find(r => r.ticket_id === ticket_id);
  if (!row) return fail('Tiket tidak ditemukan.');

  const riwayat = rowsToObjects(getSheet(CONFIG.SHEET_RIWAYAT))
    .filter(r => r.ticket_id === ticket_id)
    .sort((a,b) => String(a.waktu_respons).localeCompare(String(b.waktu_respons)));

  return ok({ tiket: row, riwayat: riwayat });
}

function getKonfigurasi() {
  return ok({
    divisi: CONFIG.DIVISI,
    region: CONFIG.REGION,
    sifat: CONFIG.SIFAT,
    status: CONFIG.STATUS,
    sla: CONFIG.SLA_TARGET
  });
}
