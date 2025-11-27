import { Button } from "~/components/ui/button";
import { useNavigate } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { BookOpen, Plus } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  year: number;
  status: "available" | "borrowed" | "reserved";
}

export default function DashboardPeminjam() {
  const navigate = useNavigate();

  // Sample data - dapat diganti dengan data dari API
  const books: Book[] = [];
  // const books: Book[] = [
  //   {
  //     id: "1",
  //     title: "Clean Code",
  //     author: "Robert C. Martin",
  //     isbn: "978-0132350884",
  //     category: "Programming",
  //     year: 2008,
  //     status: "available",
  //   },
  //   {
  //     id: "2",
  //     title: "The Pragmatic Programmer",
  //     author: "David Thomas",
  //     isbn: "978-0135957059",
  //     category: "Programming",
  //     year: 2019,
  //     status: "available",
  //   },
  //   {
  //     id: "3",
  //     title: "Design Patterns",
  //     author: "Gang of Four",
  //     isbn: "978-0201633610",
  //     category: "Programming",
  //     year: 1994,
  //     status: "borrowed",
  //   },
  // ];

  const getStatusBadgeColor = (status: Book["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "borrowed":
        return "bg-red-100 text-red-800";
      case "reserved":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: Book["status"]) => {
    switch (status) {
      case "available":
        return "Tersedia";
      case "borrowed":
        return "Dipinjam";
      case "reserved":
        return "Dipesan";
      default:
        return "Unknown";
    }
  };

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
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full md:w-auto"
            onClick={() => navigate("/form-peminjaman")}
          >
            <Plus className="w-5 h-5" />
            Pesan Buku
          </Button>
        </div>

        {/* Books Table Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Daftar Buku</CardTitle>
            <CardDescription>
              {books.length > 0
                ? `Total ${books.length} buku tersedia`
                : "Belum ada buku yang ditampilkan"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {books.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-gray-900 font-semibold">Judul</TableHead>
                      <TableHead className="text-gray-900 font-semibold">Pengarang</TableHead>
                      <TableHead className="text-gray-900 font-semibold">ISBN</TableHead>
                      <TableHead className="text-gray-900 font-semibold">Kategori</TableHead>
                      <TableHead className="text-gray-900 font-semibold text-center">Tahun</TableHead>
                      <TableHead className="text-gray-900 font-semibold">Status</TableHead>
                      <TableHead className="text-gray-900 font-semibold text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map((book) => (
                      <TableRow key={book.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900">{book.title}</TableCell>
                        <TableCell className="text-gray-700">{book.author}</TableCell>
                        <TableCell className="text-gray-700">{book.isbn}</TableCell>
                        <TableCell className="text-gray-700">{book.category}</TableCell>
                        <TableCell className="text-center text-gray-700">{book.year}</TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                              book.status
                            )}`}
                          >
                            {getStatusLabel(book.status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            onClick={() => navigate(`/form-peminjaman?book=${book.id}`)}
                            disabled={book.status !== "available"}
                          >
                            Pesan
                          </Button>
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
                  <h3 className="text-lg font-semibold text-gray-900">Belum Ada Buku</h3>
                  <p className="text-gray-600 max-w-sm">
                    Saat ini tidak ada buku yang tersedia. Silakan cek kembali nanti atau hubungi
                    perpustakaan.
                  </p>
                </div>
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2 mt-4"
                  onClick={() => navigate("/")}
                >
                  Kembali ke Home
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {books.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Buku Tersedia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {books.filter((b) => b.status === "available").length}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Buku Dipinjam</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">
                  {books.filter((b) => b.status === "borrowed").length}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Buku Dipesan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-600">
                  {books.filter((b) => b.status === "reserved").length}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
