import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ShoppingCart, Plus, Eye, Trash2, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { getAllPeminjaman, deletePeminjaman, getDetailPeminjamanByKodePinjam, getPeminjamById, getBukuById, updatePeminjaman } from '~/lib/firebaseServices';

interface DetailPeminjaman {
  id: string;
  id_buku: string;
  buku?: {
    judul_buku: string;
  };
}

interface Peminjaman {
  kode_pinjam: string;
  id_peminjam: string;
  tgl_pesan?: any;
  tgl_ambil?: any;
  tgl_wajibkembali?: any;
  tgl_kembali?: any;
  status_pinjam: string; // A=Pending, S=Active, L=Returned, B=Overdue
  peminjam?: {
    nama_peminjam: string;
  };
  detailPeminjaman?: DetailPeminjaman[];
}

const PeminjamanBuku: React.FC = () => {
  const navigate = useNavigate();
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedPeminjaman, setSelectedPeminjaman] = useState<Peminjaman | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchPeminjaman();
  }, []);

  const fetchPeminjaman = async () => {
    try {
      setLoading(true);
      const data = await getAllPeminjaman();
      
      // Fetch additional data for each peminjaman
      const enrichedData = await Promise.all(
        data.map(async (pinjam: any) => {
          try {
            const peminjamData = await getPeminjamById(pinjam.id_peminjam);
            const details = await getDetailPeminjamanByKodePinjam(pinjam.kode_pinjam);
            
            return {
              ...pinjam,
              peminjam: peminjamData,
              detailPeminjaman: details,
            };
          } catch (err) {
            console.error('Error enriching peminjaman data:', err);
            return pinjam;
          }
        })
      );
      
      setPeminjaman(enrichedData || []);
    } catch (error) {
      console.error('Error fetching peminjaman:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (kode_pinjam: string) => {
    if (confirm('Yakin ingin menghapus data peminjaman ini?')) {
      try {
        await deletePeminjaman(kode_pinjam);
        fetchPeminjaman();
        alert('Data peminjaman berhasil dihapus!');
      } catch (error: any) {
        console.error('Error deleting peminjaman:', error);
        alert(error.message || 'Gagal menghapus data peminjaman');
      }
    }
  };

  const handleViewDetail = (item: Peminjaman) => {
    setSelectedPeminjaman(item);
    setShowDetail(true);
  };

  const handleTerima = async (kodePinjam: string) => {
    try {
      await updatePeminjaman(kodePinjam, {
        status_pinjam: 'S', // S = Sedang Dipinjam/Active
      });
      alert('Peminjaman berhasil diterima!');
      setShowDetail(false);
      fetchPeminjaman(); // Refresh data
    } catch (error: any) {
      console.error('Error accepting peminjaman:', error);
      alert(error.message || 'Gagal menerima peminjaman');
    }
  };

  const handleTolak = async (kodePinjam: string) => {
    try {
      // Delete peminjaman jika ditolak
      if (confirm('Yakin ingin menolak peminjaman ini? Data akan dihapus.')) {
        await deletePeminjaman(kodePinjam);
        alert('Peminjaman berhasil ditolak dan dihapus!');
        setShowDetail(false);
        fetchPeminjaman(); // Refresh data
      }
    } catch (error: any) {
      console.error('Error rejecting peminjaman:', error);
      alert(error.message || 'Gagal menolak peminjaman');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'S': // Active
        return 'bg-blue-100 text-blue-800';
      case 'L': // Returned
        return 'bg-green-100 text-green-800';
      case 'B': // Overdue
        return 'bg-red-100 text-red-800';
      case 'A': // Pending
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'L': // Returned
        return <CheckCircle className="w-4 h-4" />;
      case 'B': // Overdue
        return <Clock className="w-4 h-4" />;
      default:
        return <ShoppingCart className="w-4 h-4" />;
    }
  };

  const isOverdue = (tanggalBatas: string) => {
    return new Date(tanggalBatas) < new Date();
  };

  const filteredPeminjaman = peminjaman.filter(item => {
    const matchesSearch = 

      (item.peminjam?.nama_peminjam?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'ALL' || 
      item.status_pinjam === filterStatus ||
      (filterStatus === 'OVERDUE' && item.status_pinjam === 'B');
    
    return matchesSearch && matchesFilter;
  });

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
            <h1 className="text-4xl font-bold text-gray-900">Kelola Peminjaman</h1>
            <p className="text-gray-600 mt-1">Pantau semua peminjaman buku dari anggota</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 bg-white shadow-sm">
          <p className="text-gray-600 text-sm font-medium mb-2">Total Peminjaman</p>
          <p className="text-3xl font-bold text-gray-900">{peminjaman.length}</p>
        </Card>
        <Card className="p-4 bg-white shadow-sm">
          <p className="text-gray-600 text-sm font-medium mb-2">Aktif</p>
          <p className="text-3xl font-bold text-blue-600">
            {peminjaman.filter(p => p.status_pinjam === 'S').length}
          </p>
        </Card>
        <Card className="p-4 bg-white shadow-sm">
          <p className="text-gray-600 text-sm font-medium mb-2">Dikembalikan</p>
          <p className="text-3xl font-bold text-green-600">
            {peminjaman.filter(p => p.status_pinjam === 'L').length}
          </p>
        </Card>
        <Card className="p-4 bg-white shadow-sm">
          <p className="text-gray-600 text-sm font-medium mb-2">Terlambat</p>
          <p className="text-3xl font-bold text-red-600">
            {peminjaman.filter(p => p.status_pinjam === 'B').length}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cari Peminjam</label>
          <Input
            type="text"
            placeholder="Nama peminjam..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="A">Pending (Menunggu)</option>
            <option value="S">Aktif (Sedang Dipinjam)</option>
            <option value="L">Dikembalikan</option>
            <option value="B">Terlambat</option>
          </select>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedPeminjaman && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Detail Peminjaman</h2>
              <Button
                onClick={() => setShowDetail(false)}
                variant="outline"
                className="text-gray-600"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Peminjam</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedPeminjaman.peminjam?.nama_peminjam || 'N/A'}
                </p>

              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tanggal Pesan</p>
                  <p className="text-base font-medium text-gray-900">
                    {selectedPeminjaman.tgl_pesan ? new Date(selectedPeminjaman.tgl_pesan.seconds * 1000).toLocaleDateString('id-ID') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanggal Ambil</p>
                  <p className="text-base font-medium text-gray-900">
                    {selectedPeminjaman.tgl_ambil ? new Date(selectedPeminjaman.tgl_ambil.seconds * 1000).toLocaleDateString('id-ID') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Batas Kembali</p>
                  <p className="text-base font-medium text-gray-900">
                    {selectedPeminjaman.tgl_wajibkembali ? new Date(selectedPeminjaman.tgl_wajibkembali.seconds * 1000).toLocaleDateString('id-ID') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedPeminjaman.status_pinjam)}`}>
                    {selectedPeminjaman.status_pinjam === 'A' ? 'Pending' : selectedPeminjaman.status_pinjam === 'S' ? 'Aktif' : selectedPeminjaman.status_pinjam === 'L' ? 'Dikembalikan' : 'Terlambat'}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Buku yang Dipinjam</p>
                <div className="space-y-2">
                  {selectedPeminjaman.detailPeminjaman?.map((detail) => (
                    <div key={detail.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <ShoppingCart className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{detail.buku?.judul_buku || 'N/A'}</p>
                        <p className="text-xs text-gray-500">ID: {detail.id_buku}</p>
                      </div>
                    </div>
                  )) || <p className="text-gray-500">Tidak ada data detail</p>}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => handleTerima(selectedPeminjaman.kode_pinjam)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={selectedPeminjaman.status_pinjam !== 'A'}
              >
                Terima
              </Button>
              <Button
                onClick={() => handleTolak(selectedPeminjaman.kode_pinjam)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={selectedPeminjaman.status_pinjam !== 'A'}
              >
                Tolak
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tabel Peminjaman */}
      <Card className="p-6 bg-white shadow-sm">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : filteredPeminjaman.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Tidak ada peminjaman ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Peminjam</th>

                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tanggal Pinjam</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Batas Kembali</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredPeminjaman.map((item) => {
                  const overdue = item.status_pinjam === 'B';
                  return (
                    <tr 
                      key={item.kode_pinjam} 
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${overdue ? 'bg-red-50' : ''}`}
                    >
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {item.peminjam?.nama_peminjam || 'N/A'}
                      </td>

                      <td className="py-3 px-4 text-sm text-gray-600">
                        {item.tgl_pesan ? new Date(item.tgl_pesan.seconds * 1000).toLocaleDateString('id-ID') : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        <span className={overdue ? 'font-semibold text-red-600' : ''}>
                          {item.tgl_wajibkembali ? new Date(item.tgl_wajibkembali.seconds * 1000).toLocaleDateString('id-ID') : 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status_pinjam)}`}>
                            {getStatusIcon(item.status_pinjam)}
                            {item.status_pinjam === 'A' ? 'Pending' : item.status_pinjam === 'S' ? 'Aktif' : item.status_pinjam === 'L' ? 'Dikembalikan' : 'Terlambat'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <Button
                            onClick={() => handleViewDetail(item)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Lihat
                          </Button>
                          <Button
                            onClick={() => handleDelete(item.kode_pinjam)}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Menampilkan {filteredPeminjaman.length} dari {peminjaman.length} peminjaman</p>
      </div>
    </div>
  );
};

export default PeminjamanBuku;
