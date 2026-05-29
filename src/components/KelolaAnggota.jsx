import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // 👇 Wajib import ini biar bisa ngedit database!

// 👇 PERUBAHAN BARU: Nangkep savedReports dan setSavedReports dari Dashboard
const KelolaAnggota = ({ anggotaList, setAnggotaList, savedReports, setSavedReports }) => {
  const [namaBaru, setNamaBaru] = useState('');
  
  const [editIndex, setEditIndex] = useState(null);
  const [namaEdit, setNamaEdit] = useState('');

  const handleTambah = (e) => {
    e.preventDefault();
    if (namaBaru.trim()) {
      setAnggotaList([...anggotaList, namaBaru.trim()]);
      setNamaBaru('');
    }
  };

  const mulaiEdit = (index, namaLama) => {
    setEditIndex(index);
    setNamaEdit(namaLama);
  };

  // 👇 FUNGSI INI SUDAH DI-UPGRADE JADI ASYNC & NYAMBUNG KE SUPABASE
  const simpanEdit = async (index) => {
    if (namaEdit.trim() === '') return;
    
    const namaLama = anggotaList[index]; // Ingat nama lamanya
    const namaBaruFix = namaEdit.trim(); // Nama baru hasil editan
    
    // 1. Update daftar nama di layar (React State)
    const daftarBaru = [...anggotaList];
    daftarBaru[index] = namaBaruFix;
    
    setAnggotaList(daftarBaru);
    setEditIndex(null); 

    // 2. 🔥 NYURUH SUPABASE NGEDIT NAMA DI SEMUA LAPORAN LAMA 🔥
    if (namaLama !== namaBaruFix) {
      
      // 👇 FITUR BARU: Sinkronisasi instan (Lokal Realtime) biar ngga perlu F5!
      if (savedReports && setSavedReports) {
        const laporanTerupdate = savedReports.map((report) => 
          report.nama === namaLama ? { ...report, nama: namaBaruFix } : report
        );
        setSavedReports(laporanTerupdate); // Memperbarui layar detik itu juga
      }

      // Memperbarui data di cloud Supabase
      const { error } = await supabase
        .from('reports')
        .update({ nama: namaBaruFix })
        .eq('nama', namaLama);

      if (error) {
        alert(`Gagal update laporan lama di Supabase: ${error.message}`);
      }
    }
  };

  const hapusAnggota = (index, namaLama) => {
    const confirmDelete = window.confirm(`Yakin ingin menghapus ${namaLama} dari daftar anggota?`);
    
    if (confirmDelete) {
      const daftarBaru = anggotaList.filter((_, i) => i !== index);
      setAnggotaList(daftarBaru);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>Kelola Anggota Tim</h2>
      <p style={styles.cardSubtitle}>Tambah, edit, atau hapus nama anggota tim Customer Service di sini.</p>
      
      {/* Form Tambah Anggota */}
      <form onSubmit={handleTambah} style={styles.formGroup}>
        <label style={styles.label}>Nama Anggota Baru</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            style={styles.input} 
            placeholder="Masukkan nama anak buah baru..." 
            value={namaBaru}
            onChange={(e) => setNamaBaru(e.target.value)}
            required
          />
          <button type="submit" style={styles.btnSubmit}>➕ Tambah</button>
        </div>
      </form>

      {/* Daftar Anggota */}
      <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#334155' }}>Daftar Anggota Saat Ini:</h3>
      <ul style={styles.list}>
        {anggotaList.map((nama, index) => (
          <li key={index} style={styles.listItem}>
            {editIndex === index ? (
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <input 
                  type="text" 
                  style={styles.inputEdit} 
                  value={namaEdit}
                  onChange={(e) => setNamaEdit(e.target.value)}
                  autoFocus
                />
                <button onClick={() => simpanEdit(index)} style={styles.btnSave}>💾 Simpan</button>
                <button onClick={() => setEditIndex(null)} style={styles.btnCancel}>❌ Batal</button>
              </div>
            ) : (
              <>
                <span style={{ fontWeight: 'bold', color: '#475569' }}>{nama}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => mulaiEdit(index, nama)} style={styles.btnEdit}>✏️ Edit</button>
                  <button onClick={() => hapusAnggota(index, nama)} style={styles.btnDelete}>🗑️ Hapus</button>
                </div>
              </>
            )}
          </li>
        ))}
        {anggotaList.length === 0 && (
          <li style={{ padding: '15px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
            Belum ada anggota tim.
          </li>
        )}
      </ul>
    </div>
  );
};

const styles = {
  card: { backgroundColor: 'white', padding: '35px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', boxSizing: 'border-box' },
  cardTitle: { margin: '0 0 8px 0', color: '#0f172a', fontSize: '24px' },
  cardSubtitle: { margin: '0 0 30px 0', color: '#64748b', fontSize: '14px' },
  formGroup: { marginBottom: '25px' },
  label: { display: 'block', marginBottom: '10px', fontWeight: '600', color: '#334155' },
  input: { flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', backgroundColor: '#f8fafc' },
  inputEdit: { flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #3b82f6', fontSize: '14px', outline: 'none' },
  btnSubmit: { padding: '14px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', marginBottom: '8px', borderRadius: '8px', minHeight: '55px' },
  btnEdit: { padding: '8px 15px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' },
  btnDelete: { padding: '8px 15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' },
  btnSave: { padding: '8px 15px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' },
  btnCancel: { padding: '8px 15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }
};

export default KelolaAnggota;