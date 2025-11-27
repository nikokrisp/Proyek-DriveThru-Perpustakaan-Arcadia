import { Button } from "~/components/ui/button";
import { useNavigate } from "react-router";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, Plus, X } from "lucide-react";

const bukuDetailSchema = z.object({
  judulBuku: z.string().min(3, "Judul buku harus minimal 3 karakter"),
  namaPengarang: z.string().min(3, "Nama pengarang harus minimal 3 karakter"),
  namaPenerbit: z.string().optional(),
  durasiPeminjaman: z.string().min(1, "Durasi peminjaman harus dipilih"),
});

const peminjamanSchema = z.object({
  namaPeminjam: z.string().min(3, "Nama harus minimal 3 karakter"),
  nimNpm: z.string().min(5, "NIM/NPM harus minimal 5 karakter"),
  email: z.string().email("Email tidak valid"),
  noTelepon: z.string().regex(/^[0-9]{10,12}$/, "Nomor telepon harus 10-12 digit"),
  bukuDetail: z.array(bukuDetailSchema).min(1, "Minimal ada satu buku yang harus dipinjam"),
});

type PeminjamanFormValues = z.infer<typeof peminjamanSchema>;

export default function FormPeminjaman() {
  const navigate = useNavigate();

  const form = useForm<PeminjamanFormValues>({
    resolver: zodResolver(peminjamanSchema),
    defaultValues: {
      namaPeminjam: "",
      nimNpm: "",
      email: "",
      noTelepon: "",
      bukuDetail: [
        {
          judulBuku: "",
          namaPengarang: "",
          namaPenerbit: "",
          durasiPeminjaman: "7",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "bukuDetail",
  });

  const onSubmit = (data: PeminjamanFormValues) => {
    const tanggalPeminjaman = new Date().toISOString();
    const statusPinjam = "aktif";

    const peminjamanData = {
      namaPeminjam: data.namaPeminjam,
      nimNpm: data.nimNpm,
      email: data.email,
      noTelepon: data.noTelepon,
      tanggalPeminjaman,
      statusPinjam,
      bukuDetail: data.bukuDetail,
    };

    console.log("Data Peminjaman:", peminjamanData);
    alert("Pemesanan buku berhasil! Silakan tunggu konfirmasi dari perpustakaan.");
    navigate("/dashboard-peminjam");
  };

  const tambahBuku = () => {
    append({
      judulBuku: "",
      namaPengarang: "",
      namaPenerbit: "",
      durasiPeminjaman: "7",
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Pesan Buku</h1>
          </div>
          <p className="text-gray-600">Isi formulir di bawah untuk memesan buku</p>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Formulir Peminjaman</CardTitle>
            <CardDescription>
              Pastikan semua informasi yang Anda masukkan sudah benar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Informasi Peminjam */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Informasi Peminjam</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nama Peminjam */}
                    <FormField
                      control={form.control}
                      name="namaPeminjam"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Lengkap</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Masukkan nama lengkap Anda"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* NIM/NPM */}
                    <FormField
                      control={form.control}
                      name="nimNpm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NIM/NPM</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Masukkan NIM atau NPM Anda"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Masukkan email Anda"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* No Telepon */}
                    <FormField
                      control={form.control}
                      name="noTelepon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor Telepon</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="08xxxxxxxxxx"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Detail Buku */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Detail Buku</h3>
                      <p className="text-sm text-gray-600">
                        Total buku: {fields.length}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={tambahBuku}
                      className="bg-green-600 hover:bg-green-700 text-white gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Buku
                    </Button>
                  </div>

                  {/* Buku Items */}
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="relative border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4"
                      >
                        {/* Delete Button */}
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                            title="Hapus buku"
                          >
                            <X className="w-5 h-5 text-gray-600" />
                          </button>
                        )}

                        {/* Book Number */}
                        <h4 className="text-sm font-semibold text-gray-700">Buku #{index + 1}</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Judul Buku */}
                          <FormField
                            control={form.control}
                            name={`bukuDetail.${index}.judulBuku`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Judul Buku</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Masukkan judul buku"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Nama Pengarang */}
                          <FormField
                            control={form.control}
                            name={`bukuDetail.${index}.namaPengarang`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nama Pengarang</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Masukkan nama pengarang"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Nama Penerbit */}
                          <FormField
                            control={form.control}
                            name={`bukuDetail.${index}.namaPenerbit`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nama Penerbit (Opsional)</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Masukkan nama penerbit (opsional)"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Durasi Peminjaman */}
                          <FormField
                            control={form.control}
                            name={`bukuDetail.${index}.durasiPeminjaman`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Durasi Peminjaman</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih durasi" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="3">3 hari</SelectItem>
                                    <SelectItem value="7">7 hari</SelectItem>
                                    <SelectItem value="14">14 hari</SelectItem>
                                    <SelectItem value="30">30 hari</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Pesan Buku
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-2 border-gray-300"
                    onClick={() => navigate("/dashboard-peminjam")}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
