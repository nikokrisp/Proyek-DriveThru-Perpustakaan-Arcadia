import { Button } from "~/components/ui/button";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { BookOpen, Plus, LogOut } from "lucide-react";
import { getAllBuku, getPeminjamanByPeminjamId, getCurrentUser, logout } from "~/lib/firebaseServices";

interface Buku {
  id_buku: string;
  judul_buku?: string;
  nama_pengarang?: string;
  nama_penerbit?: string;
  tgl_terbit?: any;
}

interface Peminjaman {
  kode_pinjam: string;
  tgl_pesan?: any;
  tgl_ambil?: any;
  tgl_wajibkembali?: any;
  tgl_kembali?: any;
  status_pinjam?: string;
}

export default function DashboardPeminjam() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Buku[]>([]);
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const currentUser = getCurrentUser();
        
        if (!currentUser) {
          navigate("/login");
          return;
        }

        const [bukuData, peminjamanData] = await Promise.all([
          getAllBuku(),
          getPeminjamanByPeminjamId(currentUser.uid),
        ]);
        
        setBooks(bukuData as any || []);
        setPeminjaman(peminjamanData as any || []);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Gagal mengambil data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err: any) {
      console.error("Logout failed:", err);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate("/login")} className="w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Dashboard Peminjam
              </h1>
            </div>
            <p className="text-gray-600">Kelola peminjaman buku Anda</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full md:w-auto"
              onClick={() => navigate("/form-peminjaman")}
            >
              <Plus className="w-5 h-5" />
              Pesan Buku
            </Button>
            <Button
              size="lg"
              variant="destructive"
              className="gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </div>
        </div>

        {/* Peminjaman Table Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Riwayat Peminjaman Saya</CardTitle>
            <CardDescription>
              {peminjaman.length > 0
                ? `Total ${peminjaman.length} peminjaman`
                : "Belum ada riwayat peminjaman"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {peminjaman.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-gray-900 font-semibold">Kode Pinjam</TableHead>
                      <TableHead className="text-gray-900 font-semibold">Tanggal Pesan</TableHead>
                      <TableHead className="text-gray-900 font-semibold">Tanggal Ambil</TableHead>
                      <TableHead className="text-gray-900 font-semibold">Batas Kembali</TableHead>
                      <TableHead className="text-gray-900 font-semibold text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {peminjaman.map((pinjam) => (
                      <TableRow key={pinjam.kode_pinjam} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900">{pinjam.kode_pinjam}</TableCell>
                        <TableCell className="text-gray-700">
                          {pinjam.tgl_pesan ? new Date(pinjam.tgl_pesan.seconds * 1000).toLocaleDateString('id-ID') : '-'}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {pinjam.tgl_ambil ? new Date(pinjam.tgl_ambil.seconds * 1000).toLocaleDateString('id-ID') : '-'}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {pinjam.tgl_wajibkembali ? new Date(pinjam.tgl_wajibkembali.seconds * 1000).toLocaleDateString('id-ID') : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              pinjam.status_pinjam === 'S' ? 'bg-blue-100 text-blue-800' :
                              pinjam.status_pinjam === 'L' ? 'bg-green-100 text-green-800' :
                              pinjam.status_pinjam === 'B' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {pinjam.status_pinjam === 'A' ? 'Pending' :
                             pinjam.status_pinjam === 'S' ? 'Aktif' :
                             pinjam.status_pinjam === 'L' ? 'Dikembalikan' : 'Terlambat'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Belum Ada Peminjaman</h3>
                  <p className="text-gray-600 max-w-sm">
                    Anda belum memiliki riwayat peminjaman. Mulai pesan buku sekarang!
                  </p>
                </div>
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2 mt-4"
                  onClick={() => navigate("/form-peminjaman")}
                >
                  <Plus className="w-5 h-5" />
                  Pesan Buku
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {peminjaman.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Peminjaman</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">
                  {peminjaman.length}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-600">
                  {peminjaman.filter((p) => p.status_pinjam === "A").length}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Aktif</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">
                  {peminjaman.filter((p) => p.status_pinjam === "S").length}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Dikembalikan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {peminjaman.filter((p) => p.status_pinjam === "L").length}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
