import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // 👇 Ini yang bikin nyambung ke Cloud

import FormInput from './FormInput';
import KelolaAnggota from './KelolaAnggota';
import ReportJobdesk from './ReportJobdesk';
import DashboardPerforma from './DashboardPerforma'; 

const Dashboard = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard'); 
  
  // 👇 PERUBAHAN BARU: Ambil dari brankas browser (Local Storage) biar anti-refresh
  const [anggotaList, setAnggotaList] = useState(() => {
    const dataTersimpan = localStorage.getItem('daftarAnggota');
    return dataTersimpan ? JSON.parse(dataTersimpan) : ['Alex', 'Daniel', 'Putra', 'Ricko'];
  });

  // 👇 PERUBAHAN BARU: Simpan otomatis ke brankas setiap ada perubahan anggota
  useEffect(() => {
    localStorage.setItem('daftarAnggota', JSON.stringify(anggotaList));
  }, [anggotaList]);

  const [savedReports, setSavedReports] = useState([]); // Awalnya kosong, nanti diisi Supabase

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  // 👇 FUNGSI BARU: OTOMATIS TARIK DATA & AKTIFKAN REALTIME 👇
  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('tanggal', { ascending: false }) // 1. Tanggal terbaru di atas
        .order('nama', { ascending: true });    // 2. Sesuai abjad A-Z jika tanggalnya sama
      
      if (error) {
        console.error("Gagal tarik data dari Supabase:", error.message);
      } else {
        setSavedReports(data || []); // Masukkan data cloud ke dalam web!
      }
    };
    
    // 1. Panggil fungsinya saat web pertama kali dibuka
    fetchReports();

    // 2. AKTIFKAN SUPABASE REALTIME (AUTO REFRESH TANPA F5)
    const channel = supabase
      .channel('realtime-reports')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        (payload) => {
          // Jika ada perubahan (Hapus/Edit/Tambah) di Supabase, tarik data terbaru lagi!
          fetchReports(); 
        }
      )
      .subscribe();

    // 3. Bersihkan memori saat komponen ditutup
    return () => {
      supabase.removeChannel(channel);
    };
  }, []); 

  // 👇 LOGIKA JAM & TANGGAL LIVE 👇
  const [waktuSekarang, setWaktuSekarang] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setWaktuSekarang(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const tanggalFormat = waktuSekarang.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const jamFormat = waktuSekarang.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  return (
    <div style={styles.dashboardContainer}>
      {toast.show && (
        <div style={{...styles.toast, ...(toast.type === 'success' ? styles.toastSuccess : styles.toastWarning)}}>
          {toast.type === 'success' ? '✅ ' : '⚠️ '} {toast.message}
        </div>
      )}

      {/* Sidebar Navigasi */}
      <div style={styles.sidebar}>
        <div>
          <h2 style={styles.sidebarLogo}>🚀 KPI CS Admin</h2>
          <ul style={styles.menuList}>
            <li 
              style={activeMenu === 'dashboard' ? styles.menuItemActive : styles.menuItem} 
              onClick={() => setActiveMenu('dashboard')}
            >
              📊 Dashboard Monitor
            </li>
            <li 
              style={activeMenu === 'input' ? styles.menuItemActive : styles.menuItem} 
              onClick={() => setActiveMenu('input')}
            >
              📝 Input Penilaian
            </li>
            <li 
              style={activeMenu === 'report' ? styles.menuItemActive : styles.menuItem} 
              onClick={() => setActiveMenu('report')}
            >
              📊 Report Kinerja
            </li>
            <li 
              style={activeMenu === 'kelola' ? styles.menuItemActive : styles.menuItem} 
              onClick={() => setActiveMenu('kelola')}
            >
              👥 Kelola Tim
            </li>
          </ul>
        </div>
        
        <button style={styles.btnLogout} onClick={onLogout}>Logout</button>
      </div>

      {/* Main Content Area */}
      <div style={styles.mainContent}>
        <div style={styles.header}>
            <div style={{fontWeight: 'bold', fontSize: '18px', color: '#1e293b'}}>
               {activeMenu === 'dashboard' && '📈 Quick Monitor & Top Performa'}
               {activeMenu === 'input' && 'Form Penilaian KPI'}
               {activeMenu === 'report' && 'Laporan Kinerja'}
               {activeMenu === 'kelola' && 'Kelola Anggota'}
            </div>
            
            <div style={styles.timeBox}>
              <div style={styles.timeText}>🕰️ {jamFormat}</div>
              <div style={styles.dateText}>{tanggalFormat}</div>
            </div>
        </div>
        
        <div style={styles.content}>
           {/* Sekarang savedReports yang dilempar ke bawah ini isinya asli dari Supabase! */}
           {activeMenu === 'dashboard' && <DashboardPerforma savedReports={savedReports} />}
           {activeMenu === 'input' && <FormInput anggotaList={anggotaList} savedReports={savedReports} setSavedReports={setSavedReports} showNotification={showNotification} />}
           {activeMenu === 'report' && <ReportJobdesk savedReports={savedReports} />}
           
           {/* 👇 INI YANG DIUPDATE: Nambahin akses savedReports & setSavedReports ke KelolaAnggota */}
           {activeMenu === 'kelola' && (
             <KelolaAnggota 
                anggotaList={anggotaList} 
                setAnggotaList={setAnggotaList} 
                savedReports={savedReports} 
                setSavedReports={setSavedReports} 
              />
           )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  dashboardContainer: { display: 'flex', height: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
  sidebar: { width: '260px', backgroundColor: '#1e293b', color: 'white', padding: '30px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '2px 0 10px rgba(0,0,0,0.05)' },
  sidebarLogo: { margin: '0 0 35px 0', fontSize: '20px', textAlign: 'center', fontWeight: 'bold', letterSpacing: '0.5px' },
  menuList: { listStyle: 'none', padding: 0, margin: 0 },
  menuItemActive: { padding: '12px 15px', backgroundColor: '#334155', borderRadius: '8px', marginBottom: '10px', cursor: 'pointer', fontWeight: 'bold', color: '#38bdf8' },
  menuItem: { padding: '12px 15px', borderRadius: '8px', marginBottom: '10px', cursor: 'pointer', color: '#94a3b8', transition: 'background-color 0.2s' },
  btnLogout: { padding: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', width: '100%' },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { height: '70px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', boxShadow: '0 1px 5px rgba(0,0,0,0.05)', zIndex: 10 },
  content: { flex: 1, padding: '30px', overflowY: 'auto', boxSizing: 'border-box' },
  toast: { position: 'fixed', top: '20px', right: '20px', padding: '15px 25px', borderRadius: '8px', color: 'white', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 9999, transition: 'all 0.3s ease' },
  toastSuccess: { backgroundColor: '#10b981' },
  toastWarning: { backgroundColor: '#f59e0b' },
  timeBox: { backgroundColor: '#f1f5f9', padding: '8px 16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', border: '1px solid #e2e8f0' },
  timeText: { fontSize: '15px', fontWeight: 'bold', color: '#0f172a', letterSpacing: '0.5px' },
  dateText: { fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: '500' }
};

export default Dashboard;