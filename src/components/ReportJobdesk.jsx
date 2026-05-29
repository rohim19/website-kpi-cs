import React, { useState } from 'react';

const ReportJobdesk = ({ savedReports }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const TARGET_IDEAL = 3.50;

  // Memfilter laporan berdasarkan tanggal yang dipilih
  const filteredReports = savedReports.filter((report) => report.tanggal === selectedDate);
  
  // FITUR BARU: Mengurutkan data yang sudah difilter berdasarkan abjad nama (A-Z)
  const sortedReports = [...filteredReports].sort((a, b) => a.nama.localeCompare(b.nama));

  const jobdeskList = [
    { id: 'ketepatan', short: 'Ketepatan' },
    { id: 'kecepatan', short: 'Kecepatan' },
    { id: 'pemahaman', short: 'Pemahaman' },
    { id: 'kesopanan', short: 'Kesopanan' },
    { id: 'whitelist', short: 'Whitelist' },
    { id: 'qris', short: 'QRIS' },
    { id: 'report_error', short: 'Rep. Error' },
    { id: 'update_guide', short: 'Up. Guide' }
  ];

  // SINKRONISASI KUNCI: Menarik data langsung dari report.detailNilai
  const getNilaiIndikator = (report, id) => {
    if (report.detailNilai && report.detailNilai[id] !== undefined) {
      return Number(report.detailNilai[id]);
    }
    return 0;
  };

  return (
    <div style={styles.card}>
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.cardTitle}>📋 Laporan Asli Kinerja CS</h2>
          <p style={styles.cardSubtitle}>Pilih tanggal spesifik untuk melihat seluruh rincian nilai lembar kerja tim.</p>
        </div>

        <div style={styles.datePickerBox}>
          <label style={styles.dateLabel}>Cek Tanggal Laporan :</label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            style={styles.dateInput}
          />
        </div>
      </div>

      <div style={styles.tableSection}>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tr}>
                <th style={styles.th}>Nama Anggota</th>
                <th style={styles.thCenter}>Total Chat</th>
                {/* Judul Kolom Indikator */}
                {jobdeskList.map((job) => (
                  <th key={job.id} style={styles.thCenter}>{job.short}</th>
                ))}
                <th style={styles.thCenter}>Rata-Rata KPI</th>
              </tr>
            </thead>
            <tbody>
              {sortedReports.length === 0 ? (
                <tr>
                  <td colSpan={jobdeskList.length + 3} style={styles.tdEmpty}>
                    📭 Tidak ada data laporan kinerja untuk tanggal {selectedDate}
                  </td>
                </tr>
              ) : (
                // Menggunakan sortedReports agar data tampil sesuai abjad
                sortedReports.map((report, index) => {
                  // Langsung ambil rata-rata yang udah dihitung dari FormInput
                  const rataRataAkhir = Number(report.rataRata) || 0;
                  const isUnderTarget = rataRataAkhir < TARGET_IDEAL;

                  return (
                    <tr key={index} style={styles.tr}>
                      <td style={styles.tdNama}>{report.nama}</td>
                      {/* Sync dengan kunci 'totalChat' */}
                      <td style={styles.tdCenterChat}>{report.totalChat || 0}</td>
                      
                      {/* Narik nilai dari tiap indikator pekerjaan */}
                      {jobdeskList.map((job) => (
                        <td key={job.id} style={styles.tdCenter}>
                          {getNilaiIndikator(report, job.id)}
                        </td>
                      ))}

                      {/* Nampilin skor rata-rata tertimbang dari form */}
                      <td style={{
                        ...styles.tdCenterScore,
                        color: isUnderTarget ? '#ef4444' : '#10b981',
                        backgroundColor: isUnderTarget ? '#fef2f2' : '#f0fdf4'
                      }}>
                        {rataRataAkhir.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '10px' },
  cardTitle: { margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e293b' },
  cardSubtitle: { margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' },
  datePickerBox: { display: 'flex', alignItems: 'center', gap: '10px' },
  dateLabel: { fontSize: '13px', fontWeight: '600', color: '#475569' },
  dateInput: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#334155', outline: 'none', backgroundColor: 'white' },
  tableSection: { marginTop: '10px' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' },
  th: { padding: '14px 16px', backgroundColor: '#f8fafc', color: '#475569', fontWeight: '600', borderBottom: '2px solid #e2e8f0', fontSize: '13px' },
  thCenter: { padding: '14px 16px', backgroundColor: '#f8fafc', color: '#475569', fontWeight: '600', borderBottom: '2px solid #e2e8f0', fontSize: '13px', textAlign: 'center' },
  tr: { borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' },
  tdNama: { padding: '16px', fontSize: '14px', fontWeight: '600', color: '#1e293b' },
  tdCenterChat: { padding: '16px', fontSize: '14px', color: '#475569', textAlign: 'center', backgroundColor: '#f8fafc', fontWeight: '500' },
  tdCenterScore: { padding: '16px', fontSize: '14px', textAlign: 'center', fontWeight: 'bold' },
  tdCenter: { padding: '16px', fontSize: '14px', color: '#334155', textAlign: 'center' },
  tdEmpty: { padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '14px', fontStyle: 'italic' }
};

export default ReportJobdesk;