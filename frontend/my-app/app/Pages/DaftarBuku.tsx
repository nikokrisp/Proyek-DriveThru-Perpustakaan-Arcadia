import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { BookOpen, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { getAllBuku, createBuku, updateBuku, deleteBuku } from '~/lib/firebaseServices';
import { Timestamp } from 'firebase/firestore';

interface Buku {
  id_buku: string;
  judul_buku?: string;
  tgl_terbit?: any;
  nama_pengarang?: string;
  nama_penerbit?: string;
}

const DaftarBuku: React.FC = () => {
  const navigate = useNavigate();
  const [buku, setBuku] = useState<Buku[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBuku();
  }, []);

  const fetchBuku = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllBuku();
      setBuku(data || []);
    } catch (error: any) {
      console.error('Error fetching buku:', error);
      setError(error.message || 'Gagal mengambil data buku');
    } finally {
      setLoading(false);
    }
  };



  const handleDelete = async (id_buku: string) => {
    if (confirm('Yakin ingin menghapus buku ini?')) {
      try {
        await deleteBuku(id_buku);
        fetchBuku();
        alert('Buku berhasil dihapus!');
      } catch (error: any) {
        console.error('Error deleting buku:', error);
        alert(error.message || 'Gagal menghapus buku');
      }
    }
  };



  const filteredBuku = buku.filter(item =>
    (item.judul_buku?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item.nama_pengarang?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header dengan tombol kembali */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/dashboard-admin')}
            variant="outline"
            size="icon"
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Daftar Buku</h1>
            <p className="text-gray-600 mt-1">Kelola koleksi buku perpustakaan</p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/tambah-buku')}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Buku
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Cari berdasarkan judul atau pengarang..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Tabel Buku */}
      <Card className="p-6 bg-white shadow-sm">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : filteredBuku.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Tidak ada buku ditemukan</p>
            <p className="text-gray-400 text-sm">Mulai dengan menambahkan buku baru</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Judul</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Pengarang</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Penerbit</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tanggal Terbit</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredBuku.map((item) => (
                  <tr key={item.id_buku} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.judul_buku || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{item.nama_pengarang || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{item.nama_penerbit || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {item.tgl_terbit ? new Date(item.tgl_terbit.seconds * 1000).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <Button
                          onClick={() => handleDelete(item.id_buku)}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Total Buku: {filteredBuku.length} / {buku.length}</p>
      </div>
    </div>
  );
};

export default DaftarBuku;
