/** KONFIGURASI GLOBAL */
const CONFIG = {
  APP_NAME: 'Coment Center',
  APP_SUBTITLE: 'Complaint & Operational Issue Monitoring System',
  TIMEZONE: 'Asia/Jakarta',
  SHEET_LAPORAN: 'Laporan',
  SHEET_RIWAYAT: 'RiwayatProgress',
  SHEET_USERS: 'Users',
  SHEET_KONFIG: 'Konfigurasi',
  DIVISI: ['OPR','OPS','INA','HCC','PLM','FRM','CSI','MBS','SBD'],
  REGION: ['Kantor Pusat','Region 1','Region 2','Region 3','Region 4',
           'Region 5','Region 6','Region 7','Region 8','Region 9','Region 10'],
  SIFAT: [
    'Darurat — Butuh Tindakan Segera',
    'Prioritas Tinggi — Berdampak pada Operasional',
    'Prioritas Biasa — Ditangani dalam Waktu Dekat',
    'Normal — Sesuai Antrean',
    'Disesuaikan — Melihat Situasi dan Kondisi'
  ],
  STATUS: [
    'Menunggu Respons',
    'Sedang Ditangani',
    'Menunggu Informasi Pelapor',
    'Menunggu Pihak Ketiga',
    'Selesai',
    'Ditutup'
  ],
  SLA_TARGET: {
    'Darurat — Butuh Tindakan Segera':               { respon: 15,   selesai: 240 },
    'Prioritas Tinggi — Berdampak pada Operasional': { respon: 60,   selesai: 1440 },
    'Prioritas Biasa — Ditangani dalam Waktu Dekat': { respon: 240,  selesai: 4320 },
    'Normal — Sesuai Antrean':                       { respon: 1440, selesai: 10080 },
    'Disesuaikan — Melihat Situasi dan Kondisi':     { respon: 0,    selesai: 0 }
  }
};
