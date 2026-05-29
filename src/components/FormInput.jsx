import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 

const FormInput = ({ anggotaList, savedReports, setSavedReports, showNotification }) => {
  const [namaAnggota, setNamaAnggota] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [banyakBalas, setBanyakBalas] = useState('');
  const [nilaiKpi, setNilaiKpi] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // State buat gembok tombol loading
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const jobdesks = [
    { id: 'ketepatan', name: 'Ketepatan Mengatasi Case', weight: 20 },
    { id: 'kecepatan', name: 'Kecepatan Balas', weight: 15 },
    { id: 'pemahaman', name: 'Pemahaman BO Keseluruhan', weight: 15 },
    { id: 'kesopanan', name: 'Kesopanan Tata Bahasa', weight: 10 },
    { id: 'whitelist', name: 'Whitelist & IP Management', weight: 10 },
    { id: 'qris', name: 'Manajemen QRIS', weight: 10 },
    { id: 'report_error', name: 'Report Error Provider', weight: 10 },
    { id: 'update_guide', name: 'Update Guide', weight: 10 }
  ];

  useEffect(() => {
    if (namaAnggota && tanggal) {
      const laporanAda = savedReports.find((r) => {
        const tglDatabase = r.tanggal ? r.tanggal.split('T')[0] : '';
        return r.nama === namaAnggota && tglDatabase === tanggal;
      });

      if (laporanAda) {
        setIsEditing(true);
        setEditId(laporanAda.id);
        setBanyakBalas(laporanAda.totalChat || '');
        setNilaiKpi(laporanAda.detailNilai || {});
      } else {
        setIsEditing(false);
        setEditId(null);
        setBanyakBalas('');
        setNilaiKpi({});
      }
    }
  }, [namaAnggota, tanggal, savedReports]);

  const handleRadioChange = (jobId, value) => {
    setNilaiKpi({ ...nilaiKpi, [jobId]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Cegah klik dobel
    if (isSubmitting) return; 
    setIsSubmitting(true); 

    let rataRata = 0;
    const filledJobIds = Object.keys(nilaiKpi);
    const jumlahDiisi = filledJobIds.length;

    if (jumlahDiisi > 0) {
      const totalBobotAktif = filledJobIds.reduce((total, id) => {
        const job = jobdesks.find(j => j.id === id);
        return total + (job ? job.weight : 0);
      }, 0);

      const skorTertimbang = filledJobIds.reduce((total, id) => {
        const job = jobdesks.find(j => j.id === id);
        const skor = Number(nilaiKpi[id]);
        return total + (skor * (job.weight / totalBobotAktif));
      }, 0);
      rataRata = skorTertimbang.toFixed(2);
    }

    if (isEditing) {
      // 👇 TAMBAH .select() BIAR DATA YANG DI-EDIT DIKEMBALIKAN
      const { data, error } = await supabase
        .from('reports')
        .update({ totalChat: banyakBalas, rataRata: rataRata, detailNilai: nilaiKpi })
        .eq('id', editId)
        .select();

      if (error) {
        showNotification(`Gagal update: ${error.message}`, 'warning');
      } else {
        showNotification(`Laporan ${namaAnggota} di-update!`, 'success');
        // 👇 UPDATE LAYAR SECARA INSTAN TANPA REFRESH
        if (data && data.length > 0) {
          const updatedReports = savedReports.map(r => r.id === editId ? data[0] : r);
          setSavedReports(updatedReports);
        }
      }
    } else {
      // 👇 TAMBAH .select() BIAR DATA YANG BARU DIBUAT DIKEMBALIKAN
      const { data, error } = await supabase
        .from('reports')
        .insert([{ tanggal, nama: namaAnggota, totalChat: banyakBalas, rataRata, detailNilai: nilaiKpi }])
        .select();

      if (error) {
        showNotification(`Gagal simpan: ${error.message}`, 'warning');
      } else {
        showNotification(`Penilaian tersimpan ke Cloud!`, 'success');
        // 👇 UPDATE LAYAR SECARA INSTAN TANPA REFRESH
        if (data && data.length > 0) {
          setSavedReports([...savedReports, data[0]]);
        }
        setNamaAnggota('');
        setBanyakBalas('');
        setNilaiKpi({});
      }
    }
    
    // Matikan loading
    setIsSubmitting(false);
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>Formulir Penilaian Kinerja</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Tanggal Penilaian</label>
            <input type="date" style={styles.inputForm} value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Pilih Anggota Tim</label>
            <select style={styles.inputForm} value={namaAnggota} onChange={(e) => setNamaAnggota(e.target.value)} required>
              <option value="" disabled>-- Pilih Anggota --</option>
              {anggotaList.map((nama, index) => <option key={index} value={nama}>{nama}</option>)}
            </select>
          </div>
        </div>

        {isEditing && <div style={styles.alertEdit}>⚠️ Anda sedang dalam <strong>Mode Edit</strong> untuk {namaAnggota}.</div>}

        <div style={styles.formGroup}>
          <label style={styles.label}>Total Chat Harian</label>
          <input type="number" style={styles.inputForm} value={banyakBalas} onChange={(e) => setBanyakBalas(e.target.value)} required />
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Indikator Pekerjaan</th>
                {[1, 2, 3, 4, 5].map(n => <th key={n} style={styles.thCenter}>{n}</th>)}
              </tr>
            </thead>
            <tbody>
              {jobdesks.map((job) => (
                <tr key={job.id} style={styles.tr}>
                  <td style={styles.td}><strong>{job.name}</strong> <span style={styles.badgeBobot}>{job.weight}%</span></td>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <td key={num} style={styles.tdCenter}>
                      <input type="radio" name={job.id} value={num} checked={nilaiKpi[job.id] === String(num)} onChange={() => handleRadioChange(job.id, String(num))} style={{ transform: 'scale(1.2)' }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ textAlign: 'right', marginTop: '20px' }}>
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{
              ...(isEditing ? styles.btnUpdate : styles.btnSubmit),
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? '⏳ Menyimpan...' : (isEditing ? '✏️ Update Penilaian' : '💾 Simpan Penilaian')}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  card: { backgroundColor: 'white', padding: '35px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  cardTitle: { margin: '0 0 20px 0', color: '#0f172a', fontSize: '24px' },
  formGroup: { marginBottom: '25px' },
  label: { display: 'block', marginBottom: '10px', fontWeight: '600', color: '#334155' },
  inputForm: { width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', backgroundColor: '#f8fafc', boxSizing: 'border-box' },
  alertEdit: { backgroundColor: '#fef3c7', color: '#92400e', padding: '15px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #f59e0b' },
  tableContainer: { overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '20px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '15px', backgroundColor: '#f1f5f9', color: '#475569', borderBottom: '2px solid #e2e8f0' },
  thCenter: { textAlign: 'center', padding: '15px', backgroundColor: '#f1f5f9', color: '#475569', borderBottom: '2px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #e2e8f0' },
  td: { padding: '15px', color: '#334155' },
  tdCenter: { padding: '15px', textAlign: 'center' },
  badgeBobot: { marginLeft: '10px', padding: '3px 8px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
  btnSubmit: { padding: '14px 30px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' },
  btnUpdate: { padding: '14px 30px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' }
};

export default FormInput;