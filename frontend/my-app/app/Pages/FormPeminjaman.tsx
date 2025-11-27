import { Button } from "~/components/ui/button";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Checkbox } from "~/components/ui/checkbox";
import { BookOpen, Calendar, Plus } from "lucide-react";

interface Buku {
  id_buku: string;
  judul_buku?: string;
  nama_pengarang?: string;
  nama_penerbit?: string;
  tgl_terbit?: any;
}

interface SelectedBuku {
  id_buku: string;
  judul_buku: string;
  nama_pengarang?: string;
  tgl_wajibkembali: string;
}

export default function FormPeminjaman() {
  const navigate = useNavigate();
  const [bukuList, setBukuList] = useState<Buku[]>([]);
  const [selectedBukuList, setSelectedBukuList] = useState<SelectedBuku[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadBuku();
  }, []);

  const loadBuku = async () => {
    try {
      const { getAllBuku } = await import("~/lib/firebaseServices");
      const data = await getAllBuku();
      setBukuList(data);
    } catch (error) {
      console.error("Error loading buku:", error);
      alert("Gagal memuat daftar buku");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBuku = (buku: Buku, checked: boolean) => {
    if (checked) {
      // Tambahkan buku ke selected list dengan default tgl_wajibkembali 7 hari dari sekarang
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      const dateString = defaultDate.toISOString().slice(0, 16);
      
      setSelectedBukuList([
        ...selectedBukuList,
        {
          id_buku: buku.id_buku,
          judul_buku: buku.judul_buku || "Tidak Ada Judul",
          nama_pengarang: buku.nama_pengarang,
          tgl_wajibkembali: dateString,
        },
      ]);
    } else {
      // Hapus buku dari selected list
      setSelectedBukuList(selectedBukuList.filter((b) => b.id_buku !== buku.id_buku));
    }
  };

  const handleDateChange = (id_buku: string, newDate: string) => {
    setSelectedBukuList(
      selectedBukuList.map((buku) =>
        buku.id_buku === id_buku ? { ...buku, tgl_wajibkembali: newDate } : buku
      )
    );
  };

  const isSelected = (id_buku: string) => {
    return selectedBukuList.some((b) => b.id_buku === id_buku);
  };

  const filteredBukuList = bukuList.filter(
    (buku) =>
      buku.judul_buku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buku.nama_pengarang?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async () => {
    if (selectedBukuList.length === 0) {
      alert("Pilih minimal satu buku untuk dipinjam!");
      return;
    }

    try {
      const { createPeminjaman, addDetailPeminjaman, getCurrentUser } = await import("~/lib/firebaseServices");
      
      const currentUser = getCurrentUser();
      if (!currentUser) {
        alert("Anda harus login terlebih dahulu!");
        navigate("/login");
        return;
      }

      // Create peminjaman record dengan tgl_wajibkembali dari buku pertama (atau bisa diganti logika lain)
      const today = new Date();
      const tglAmbil = new Date(today);
      tglAmbil.setDate(today.getDate() + 1); // Ambil besok
      
      // Gunakan tanggal terlama sebagai tgl_wajibkembali
      const latestDate = selectedBukuList.reduce((latest, buku) => {
        const bukuDate = new Date(buku.tgl_wajibkembali);
        return bukuDate > latest ? bukuDate : latest;
      }, new Date(selectedBukuList[0].tgl_wajibkembali));

      const peminjamanData = {
        id_peminjam: currentUser.uid,
        tgl_ambil: tglAmbil.toISOString(),
        tgl_wajibkembali: latestDate.toISOString(),
        status_pinjam: 'A', // A = Pending/Menunggu konfirmasi
      };

      const kodePinjam = await createPeminjaman(peminjamanData);

      // Add each selected book to detail_peminjaman
      for (const buku of selectedBukuList) {
        await addDetailPeminjaman(kodePinjam, buku.id_buku);
      }

      alert("Pemesanan buku berhasil! Silakan tunggu konfirmasi dari perpustakaan.");
      navigate("/dashboard-peminjam");
    } catch (error: any) {
      console.error("Error creating peminjaman:", error);
      alert(error.message || "Gagal membuat peminjaman. Silakan coba lagi.");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Pesan Buku</h1>
          </div>
          <p className="text-gray-600">Pilih buku yang ingin dipinjam dan atur tanggal pengembalian</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tabel Buku - 2/3 width */}
          <Card className="shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle>Daftar Buku Tersedia</CardTitle>
              <CardDescription>
                Pilih buku yang ingin Anda pinjam dari tabel di bawah
              </CardDescription>
              {/* Search */}
              <div className="mt-4">
                <Input
                  type="text"
                  placeholder="Cari judul buku atau pengarang..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Memuat daftar buku...</div>
              ) : filteredBukuList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Tidak ada buku tersedia</div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Pilih</TableHead>
                        <TableHead>Judul Buku</TableHead>
                        <TableHead>Pengarang</TableHead>
                        <TableHead>Penerbit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBukuList.map((buku) => (
                        <TableRow
                          key={buku.id_buku}
                          className={isSelected(buku.id_buku) ? "bg-blue-50" : ""}
                        >
                          <TableCell>
                            <Checkbox
                              checked={isSelected(buku.id_buku)}
                              onCheckedChange={(checked) =>
                                handleSelectBuku(buku, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium">{buku.judul_buku}</TableCell>
                          <TableCell>{buku.nama_pengarang || "-"}</TableCell>
                          <TableCell>{buku.nama_penerbit || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Buku Terpilih - 1/3 width */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Buku Terpilih
              </CardTitle>
              <CardDescription>
                {selectedBukuList.length} buku dipilih
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedBukuList.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Belum ada buku yang dipilih
                </div>
              ) : (
                <>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedBukuList.map((buku) => (
                      <div
                        key={buku.id_buku}
                        className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-3"
                      >
                        <div>
                          <h4 className="font-semibold text-sm text-gray-900">
                            {buku.judul_buku}
                          </h4>
                          <p className="text-xs text-gray-600">{buku.nama_pengarang || "-"}</p>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`date-${buku.id_buku}`} className="text-xs">
                            Tanggal Wajib Kembali
                          </Label>
                          <Input
                            id={`date-${buku.id_buku}`}
                            type="datetime-local"
                            value={buku.tgl_wajibkembali}
                            onChange={(e) => handleDateChange(buku.id_buku, e.target.value)}
                            className="text-sm"
                            min={new Date().toISOString().slice(0, 16)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <Button
                      onClick={onSubmit}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Pesan {selectedBukuList.length} Buku
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("/dashboard-peminjam")}
                    >
                      Batal
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
