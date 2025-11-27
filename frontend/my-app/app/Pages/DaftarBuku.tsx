import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { BookOpen, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';

interface Buku {
  id: number;
  isbn: string;
  judul: string;
  pengarang: string;
  penerbit?: string;
  tahunTerbit?: number;
  kategori: string;
  sinopsis?: string;
  stokTotal: number;
  stokTersedia: number;
  createdAt: string;
}

const DaftarBuku: React.FC = () => {
  const navigate = useNavigate();
  const [buku, setBuku] = useState<Buku[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    isbn: '',
    judul: '',
    pengarang: '',
    penerbit: '',
    tahunTerbit: new Date().getFullYear(),
    kategori: '',
    sinopsis: '',
    stokTotal: 0,
  });

  useEffect(() => {
    fetchBuku();
  }, []);

  const fetchBuku = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/buku');
      const data = await response.json();
      setBuku(data.data || []);
    } catch (error) {
      console.error('Error fetching buku:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `http://localhost:3000/api/buku/${editingId}`
        : 'http://localhost:3000/api/buku';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchBuku();
        resetForm();
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus buku ini?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/buku/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchBuku();
        }
      } catch (error) {
        console.error('Error deleting buku:', error);
      }
    }
  };

  const handleEdit = (item: Buku) => {
    setFormData({
      isbn: item.isbn,
      judul: item.judul,
      pengarang: item.pengarang,
      penerbit: item.penerbit || '',
      tahunTerbit: item.tahunTerbit || new Date().getFullYear(),
      kategori: item.kategori,
      sinopsis: item.sinopsis || '',
      stokTotal: item.stokTotal,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      isbn: '',
      judul: '',
      pengarang: '',
      penerbit: '',
      tahunTerbit: new Date().getFullYear(),
      kategori: '',
      sinopsis: '',
      stokTotal: 0,
    });
    setEditingId(null);
  };

  const filteredBuku = buku.filter(item =>
    item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.pengarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.isbn.includes(searchTerm)
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
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Buku
        </Button>
      </div>

      {/* Form Tambah/Edit Buku */}
      {showForm && (
        <Card className="p-6 bg-white shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingId ? 'Edit Buku' : 'Tambah Buku Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
              <Input
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                placeholder="ISBN"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
              <Input
                type="text"
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                placeholder="Judul Buku"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pengarang</label>
              <Input
                type="text"
                value={formData.pengarang}
                onChange={(e) => setFormData({ ...formData, pengarang: e.target.value })}
                placeholder="Pengarang"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Penerbit</label>
              <Input
                type="text"
                value={formData.penerbit}
                onChange={(e) => setFormData({ ...formData, penerbit: e.target.value })}
                placeholder="Penerbit"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Terbit</label>
              <Input
                type="number"
                value={formData.tahunTerbit}
                onChange={(e) => setFormData({ ...formData, tahunTerbit: parseInt(e.target.value) })}
                placeholder="Tahun Terbit"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <Input
                type="text"
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                placeholder="Kategori"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stok Total</label>
              <Input
                type="number"
                value={formData.stokTotal}
                onChange={(e) => setFormData({ ...formData, stokTotal: parseInt(e.target.value) })}
                placeholder="Stok Total"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sinopsis</label>
              <Input
                type="text"
                value={formData.sinopsis}
                onChange={(e) => setFormData({ ...formData, sinopsis: e.target.value })}
                placeholder="Sinopsis"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {editingId ? 'Update' : 'Tambah'} Buku
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                variant="outline"
              >
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Cari berdasarkan judul, pengarang, atau ISBN..."
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
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ISBN</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Judul</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Pengarang</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Kategori</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Stok</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredBuku.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-600">{item.isbn}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.judul}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{item.pengarang}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{item.kategori}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        item.stokTersedia > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.stokTersedia}/{item.stokTotal}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <Button
                          onClick={() => handleEdit(item)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(item.id)}
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
