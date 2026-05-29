import React, { useState } from 'react';

const DashboardPerforma = ({ savedReports }) => {
  // 1. STATE FILTER WAKTU & STATE FILTER MODE TABEL (Default: 'kpi')
  const [filterWaktu, setFilterWaktu] = useState('This Month');
  const [activeTableMode, setActiveTableMode] = useState('kpi'); // Pilihan: 'kpi' atau 'chat'

  // 2. FUNGSI PENYARING DATA BERDASARKAN FILTER KALENDER
  const getFilteredReports = () => {
    const sekarang = new Date();
    
    // INI DIA YANG TYPO TADI BRO wkwkwk (Udah dibenerin)
    const hariIni = new Date(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate());

    return savedReports.filter((report) => {
      if (!report.tanggal) return false;
      
      const [year, month, day] = report.tanggal.split('-');
      const tanggalReport = new Date(year, month - 1, day);

      if (filterWaktu === 'Today') {
        return tanggalReport.getTime() === hariIni.getTime();
      } else if (filterWaktu === 'Yesterday') {
        const kemarin = new Date(hariIni);
        kemarin.setDate(kemarin.getDate() - 1);
        return tanggalReport.getTime() === kemarin.getTime();
      } else if (filterWaktu === 'This Week') {
        const hari = hariIni.getDay();
        const selisihKeSenin = hariIni.getDate() - hari + (hari === 0 ? -6 : 1);
        const awalMinggu = new Date(hariIni);
        awalMinggu.setDate(selisihKeSenin);
        const akhirMinggu = new Date(awalMinggu);
        akhirMinggu.setDate(akhirMinggu.getDate() + 6);
        return tanggalReport >= awalMinggu && tanggalReport <= akhirMinggu;
      } else if (filterWaktu === 'Last Week') {
        const hari = hariIni.getDay();
        const selisihKeSenin = hariIni.getDate() - hari + (hari === 0 ? -6 : 1);
        const awalMingguLalu = new Date(hariIni);
        awalMingguLalu.setDate(selisihKeSenin - 7);
        const akhirMingguLalu = new Date(awalMingguLalu);
        akhirMingguLalu.setDate(akhirMingguLalu.getDate() + 6);
        return tanggalReport >= awalMingguLalu && tanggalReport <= akhirMingguLalu;
      } else if (filterWaktu === 'This Month') {
        return tanggalReport.getMonth() === hariIni.getMonth() && tanggalReport.getFullYear() === hariIni.getFullYear();
      } else if (filterWaktu === 'Last Month') {
        const bulanLalu = new Date(hariIni);
        bulanLalu.setMonth(bulanLalu.getMonth() - 1);
        return tanggalReport.getMonth() === bulanLalu.getMonth() && tanggalReport.getFullYear() === bulanLalu.getFullYear();
      }
      return true;
    });
  };

  const filteredData = getFilteredReports();

  // 3. HITUNG RINGKASAN TOTAL TIM
  const totalChatTim = filteredData.reduce((acc, curr) => acc + (Number(curr.totalChat) || 0), 0);
  const rataRataKpiTim = filteredData.length > 0 
    ? (filteredData.reduce((acc, curr) => acc + (Number(curr.rataRata) || 0), 0) / filteredData.length).toFixed(2)
    : 0;

  // 4. LOGIKA PENGELOMPOKAN DATA PER CS
  const getGrupDatacs = () => {
    const grup = {};
    filteredData.forEach((report) => {
      const nama = report.nama;
      const skor = Number(report.rataRata) || 0;
      const chat = Number(report.totalChat) || 0;
      
      if (!grup[nama]) {
        grup[nama] = { nama, totalSkor: 0, jumlahInput: 0, totalChat: 0 };
      }
      grup[nama].totalSkor += skor;
      grup[nama].jumlahInput += 1;
      grup[nama].totalChat += chat;
    });

    return Object.values(grup).map(item => ({
      nama: item.nama,
      totalChat: item.totalChat,
      skorAkhir: (item.totalSkor / item.jumlahInput).toFixed(2)
    }));
  };

  const dataBaseTim = getGrupDatacs();

  // Mencari Jawara untuk ditaruh di Kotak Card Atas
  const mvpAgent = dataBaseTim.length > 0 ? [...dataBaseTim].sort((a, b) => b.skorAkhir - a.skorAkhir)[0] : null;
  const topChatAgent = dataBaseTim.length > 0 ? [...dataBaseTim].sort((a, b) => b.totalChat - a.totalChat)[0] : null;

  // 5. URUTKAN TABEL BERDASARKAN MODE YANG AKTIF (KPI atau CHAT)
  const sortedTableData = [...dataBaseTim].sort((a, b) => {
    if (activeTableMode === 'kpi') {
      return b.skorAkhir - a.skorAkhir; // Mengurutkan dari skor KPI tertinggi ke terlemah
    } else {
      return b.totalChat - a.totalChat; // Mengurutkan dari balas chat terbanyak ke tersedikit
    }
  });

  return (
    <div style={styles.container}>
      
      {/* HEADER & FILTER WAKTU */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>🏆 Dashboard Top Performa</h2>
          <p style={styles.subtitle}>Peringkat performa anggota tim Customer Service</p>
        </div>
        
        <div style={styles.filterContainer}>
          <span style={styles.filterLabel}>Filter Waktu:</span>
          <select 
            value={filterWaktu} 
            onChange={(e) => setFilterWaktu(e.target.value)}
            style={styles.selectBox}
          >
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="This Week">This Week</option>
            <option value="Last Week">Last Week</option>
            <option value="This Month">This Month</option>
            <option value="Last Month">Last Month</option>
          </select>
        </div>
      </div>

      {/* METRIK CARDS - BISA DI-KLIK SEBAGAI SWITCH TABEL */}
      <div style={styles.statsRow}>
        
        {/* CARD MVP CS (KLIK UNTUK GEBER TABEL KPI) */}
        <div 
          onClick={() => setActiveTableMode('kpi')}
          style={{
            ...styles.statCardInteract,
            border: activeTableMode === 'kpi' ? '2px solid #10b981' : '1px solid #f1f5f9',
            backgroundColor: activeTableMode === 'kpi' ? '#f0fdf4' : 'white'
          }}
        >
          <div style={{...styles.statIcon, backgroundColor: '#dcfce7'}}>🏆</div>
          <div>
            <div style={styles.statLabel}>MVP CS ({filterWaktu})</div>
            <div style={styles.statValue}>{mvpAgent ? mvpAgent.nama : '-'}</div>
            <div style={styles.statSub}>Skor: {mvpAgent ? mvpAgent.skorAkhir : '0'} (Klik Lihat Rank)</div>
          </div>
        </div>

        {/* CARD TOP CHAT (KLIK UNTUK GEBER TABEL CHAT) */}
        <div 
          onClick={() => setActiveTableMode('chat')}
          style={{
            ...styles.statCardInteract,
            border: activeTableMode === 'chat' ? '2px solid #2563eb' : '1px solid #f1f5f9',
            backgroundColor: activeTableMode === 'chat' ? '#eff6ff' : 'white'
          }}
        >
          <div style={{...styles.statIcon, backgroundColor: '#dbeafe'}}>🔥</div>
          <div>
            <div style={styles.statLabel}>Top Chat ({filterWaktu})</div>
            <div style={styles.statValue}>{topChatAgent ? topChatAgent.nama : '-'}</div>
            <div style={{...styles.statSub, color: '#2563eb', fontWeight: 'bold'}}>
              {topChatAgent ? topChatAgent.totalChat.toLocaleString() : '0'} Chat (Klik Lihat Rank)
            </div>
          </div>
        </div>

        {/* Card Ringkasan Total Chat Tim */}
        <div style={styles.statCardNormal}>
          <div style={{...styles.statIcon, backgroundColor: '#fef9c3'}}>💬</div>
          <div>
            <div style={styles.statLabel}>Total Chat Tim</div>
            <div style={styles.statValue}>{totalChatTim.toLocaleString()}</div>
            <div style={styles.statSub}>Seluruh periode ini</div>
          </div>
        </div>

        {/* Card Ringkasan Rata-Rata KPI */}
        <div style={styles.statCardNormal}>
          <div style={{...styles.statIcon, backgroundColor: '#f3e8ff'}}>📈</div>
          <div>
            <div style={styles.statLabel}>Rata-Rata KPI Tim</div>
            <div style={styles.statValue}>{rataRataKpiTim}</div>
            <div style={styles.statSub}>Target Ideal: &gt; 3.50</div>
          </div>
        </div>

      </div>

      {/* TAMPILAN TABEL DINAMIS DIKONTROL OLEH KLIK CARD DI ATAS */}
      <div style={styles.leaderboardSection}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={styles.sectionTitle}>
            {activeTableMode === 'kpi' ? '🥇 Urutan Top Performa KPI CS' : '🔥 Urutan Balas Chat CS Terbanyak'} ({filterWaktu})
          </h3>
          <span style={{ fontSize: '13px', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', backgroundColor: activeTableMode === 'kpi' ? '#dcfce7' : '#dbeafe', color: activeTableMode === 'kpi' ? '#15803d' : '#1e40af' }}>
            Mode: {activeTableMode === 'kpi' ? 'Skor KPI' : 'Total Chat'}
          </span>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Rank</th>
                <th style={styles.th}>Nama Anggota</th>
                
                {/* KOLUM DINAMIS: BERUBAH SESUAI KLIK USER */}
                {activeTableMode === 'kpi' ? (
                  <th style={styles.thCenter}>Rata-Rata Skor KPI</th>
                ) : (
                  <th style={styles.thCenter}>Total Chat Terbalas</th>
                )}
                
                <th style={styles.thCenter}>Status Periode Ini</th>
              </tr>
            </thead>
            <tbody>
              {sortedTableData.length > 0 ? (
                sortedTableData.map((item, index) => (
                  <tr key={index} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: 'bold' }}>
                      {index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`}
                    </td>
                    <td style={{ ...styles.td, fontWeight: '600', color: '#1e293b' }}>
                      {item.nama}
                      {activeTableMode === 'kpi' && index === 0 && <span style={{fontSize: '12px', marginLeft: '6px'}}>👑</span>}
                      {activeTableMode === 'chat' && index === 0 && <span style={{fontSize: '12px', marginLeft: '6px'}}>⚡</span>}
                    </td>

                    {/* DATA DINAMIS: BERUBAH SESUAI SWITCH CARD */}
                    {activeTableMode === 'kpi' ? (
                      <td style={{ ...styles.tdCenter, fontWeight: 'bold', color: '#0284c7', fontSize: '16px' }}>
                        {item.skorAkhir}
                      </td>
                    ) : (
                      <td style={{ ...styles.tdCenter, fontWeight: 'bold', color: '#2563eb', fontSize: '16px' }}>
                        {item.totalChat.toLocaleString()}
                      </td>
                    )}

                    <td style={styles.tdCenter}>
                      <span style={Number(item.skorAkhir) >= 85 ? styles.badgeGood : styles.badgeNormal}>
                        {Number(item.skorAkhir) >= 85 ? 'Sangat Bagus' : 'Cukup'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={styles.emptyTd}>
                    Belum ada data penilaian di periode <b>{filterWaktu}</b>.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '30px' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' },
  title: { margin: '0 0 5px 0', color: '#0f172a', fontSize: '26px' },
  subtitle: { margin: 0, color: '#64748b', fontSize: '15px' },
  filterContainer: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', padding: '10px 15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
  filterLabel: { fontSize: '14px', fontWeight: '600', color: '#475569' },
  selectBox: { padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', cursor: 'pointer', backgroundColor: '#f8fafc', fontWeight: 'bold', color: '#0f172a' },
  statsRow: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  
  // Gaya Card Fungsional Interaktif (Bisa di-klik)
  statCardInteract: { flex: 1, minWidth: '220px', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' },
  // Gaya Card Info Biasa (Nggak bisa di-klik)
  statCardNormal: { flex: 1, minWidth: '220px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #f1f5f9' },
  
  statIcon: { fontSize: '32px', padding: '12px', borderRadius: '12px' },
  statLabel: { fontSize: '13px', color: '#64748b', fontWeight: '500' },
  statValue: { fontSize: '20px', fontWeight: 'bold', color: '#0f172a', margin: '4px 0' },
  statSub: { fontSize: '12px', color: '#94a3b8' },
  leaderboardSection: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' },
  sectionTitle: { margin: '0', fontSize: '18px', color: '#1e293b' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '12px 16px', backgroundColor: '#f8fafc', color: '#475569', fontWeight: '600', borderBottom: '2px solid #e2e8f0', fontSize: '14px' },
  thCenter: { padding: '12px 16px', backgroundColor: '#f8fafc', color: '#475569', fontWeight: '600', borderBottom: '2px solid #e2e8f0', fontSize: '14px', textAlign: 'center' },
  tr: { borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' },
  td: { padding: '16px', fontSize: '14px', color: '#334155' },
  tdCenter: { padding: '16px', fontSize: '14px', color: '#334155', textAlign: 'center' },
  emptyTd: { padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '14px' },
  badgeGood: { backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' },
  badgeNormal: { backgroundColor: '#fef9c3', color: '#a16207', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }
};

export default DashboardPerforma;