import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { logout, getAllBuku, getAllPeminjaman, getAllPeminjam } from "~/lib/firebaseServices";
import { BarChart, LogOut, BookOpen, Users, FileText } from "lucide-react";

interface Buku {
  id_buku: string;
  judul_buku?: string;
  nama_pengarang?: string;
  nama_penerbit?: string;
  tgl_terbit?: string;
  [key: string]: any;
}

interface Peminjaman {
  kode_pinjam: string;
  tgl_pesan?: any;
  status_pinjam?: string;
  tgl_wajib_kembali?: any;
  [key: string]: any;
}

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [bukuList, setBukuList] = useState<Buku[]>([]);
  const [peminjamanList, setPeminjamanList] = useState<Peminjaman[]>([]);
  const [peminjamCount, setPeminjamCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [buku, peminjaman, peminjam] = await Promise.all([
          getAllBuku(),
          getAllPeminjaman(),
          getAllPeminjam(),
        ]);
        
        setBukuList(buku);
        setPeminjamanList(peminjaman);
        setPeminjamCount(peminjam.length);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err: any) {
      console.error("Logout failed:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
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

  const totalPeminjaman = peminjamanList.length;
  const sedangDipinjam = peminjamanList.filter(p => p.status_pinjam === "S").length;
  const sudahDikembalikan = peminjamanList.filter(p => p.status_pinjam === "L").length;
  const terlambat = peminjamanList.filter(p => p.status_pinjam === "B").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Peminjam
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{peminjamCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Total Buku
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{bukuList.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Total Peminjaman
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{totalPeminjaman}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Sedang Dipinjam</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{sedangDipinjam}</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Sudah Dikembalikan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{sudahDikembalikan}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Terlambat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{terlambat}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Menunggu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">
                {peminjamanList.filter(p => p.status_pinjam === "A").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Buku Table */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Daftar Buku</CardTitle>
                <CardDescription>Total {bukuList.length} buku dalam sistem</CardDescription>
              </div>
              <Button
                onClick={() => navigate("/daftarbuku")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Lihat Semua
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {bukuList.length === 0 ? (
              <p className="text-gray-500">Belum ada data buku</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Judul Buku</TableHead>
                      <TableHead>Pengarang</TableHead>
                      <TableHead>Penerbit</TableHead>
                      <TableHead>Tahun Terbit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bukuList.slice(0, 5).map((buku) => (
                      <TableRow key={buku.id_buku}>
                        <TableCell className="font-medium">{buku.judul_buku || "-"}</TableCell>
                        <TableCell>{buku.nama_pengarang || "-"}</TableCell>
                        <TableCell>{buku.nama_penerbit || "-"}</TableCell>
                        <TableCell>
                          {buku.tgl_terbit && typeof buku.tgl_terbit === 'object' && 'toDate' in buku.tgl_terbit
                            ? (buku.tgl_terbit as any).toDate().toLocaleDateString()
                            : buku.tgl_terbit || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Peminjaman Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Riwayat Peminjaman Terbaru</CardTitle>
                <CardDescription>Total {totalPeminjaman} peminjaman</CardDescription>
              </div>
              <Button
                onClick={() => navigate("/peminjamanbuku")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Lihat Semua
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {peminjamanList.length === 0 ? (
              <p className="text-gray-500">Belum ada data peminjaman</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode Pinjam</TableHead>
                      <TableHead>Tanggal Pesan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Jatuh Tempo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {peminjamanList.slice(0, 5).map((peminjaman) => (
                      <TableRow key={peminjaman.kode_pinjam}>
                        <TableCell className="font-medium">{peminjaman.kode_pinjam}</TableCell>
                        <TableCell>
                          {peminjaman.tgl_pesan?.toDate?.()?.toLocaleDateString?.() ||
                            new Date().toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              peminjaman.status_pinjam === "A"
                                ? "bg-yellow-100 text-yellow-800"
                                : peminjaman.status_pinjam === "S"
                                ? "bg-blue-100 text-blue-800"
                                : peminjaman.status_pinjam === "L"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {peminjaman.status_pinjam === "A"
                              ? "Pending"
                              : peminjaman.status_pinjam === "S"
                              ? "Sedang Dipinjam"
                              : peminjaman.status_pinjam === "L"
                              ? "Dikembalikan"
                              : "Terlambat"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {peminjaman.tgl_wajib_kembali?.toDate?.()?.toLocaleDateString?.() ||
                            new Date().toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
