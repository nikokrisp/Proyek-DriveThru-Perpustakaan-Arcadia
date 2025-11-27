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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, Plus, X, ArrowLeft } from "lucide-react";

const bukuSchema = z.object({
  judulBuku: z.string().min(3, "Judul buku harus minimal 3 karakter"),
  tglTerbit: z.string().optional(),
  namaPengarang: z.string().min(3, "Nama pengarang harus minimal 3 karakter"),
  namaPenerbit: z.string().optional(),
});

const tambahBukuSchema = z.object({
  bukuList: z.array(bukuSchema).min(1, "Minimal ada satu buku yang harus ditambahkan"),
});

type TambahBukuFormValues = z.infer<typeof tambahBukuSchema>;

export default function TambahBuku() {
  const navigate = useNavigate();

  const form = useForm<TambahBukuFormValues>({
    resolver: zodResolver(tambahBukuSchema),
    defaultValues: {
      bukuList: [
        {
          judulBuku: "",
          tglTerbit: "",
          namaPengarang: "",
          namaPenerbit: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "bukuList",
  });

  const onSubmit = async (data: TambahBukuFormValues) => {
    try {
      // Import Firebase functions at the top if not already done
      const { createBuku } = await import("~/lib/firebaseServices");
      
      // Transform and save each book
      const promises = data.bukuList.map(async (buku) => {
        const bukuData = {
          judul_buku: buku.judulBuku,
          tgl_terbit: buku.tglTerbit || null,
          nama_pengarang: buku.namaPengarang,
          nama_penerbit: buku.namaPenerbit || null,
        };
        return await createBuku(bukuData);
      });

      await Promise.all(promises);
      
      alert(`Berhasil menambahkan ${data.bukuList.length} buku!`);
      navigate("/daftar-buku");
    } catch (error: any) {
      console.error("Error menambahkan buku:", error);
      alert(error.message || "Gagal menambahkan buku. Silakan coba lagi.");
    }
  };

  const tambahBuku = () => {
    append({
      judulBuku: "",
      tglTerbit: "",
      namaPengarang: "",
      namaPenerbit: "",
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/daftar-buku")}
              variant="outline"
              size="icon"
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Tambah Buku</h1>
            </div>
          </div>
          <p className="text-gray-600 ml-14">Tambahkan buku baru ke dalam koleksi perpustakaan</p>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Formulir Penambahan Buku</CardTitle>
            <CardDescription>
              Isi informasi buku dengan lengkap. Anda dapat menambahkan beberapa buku sekaligus.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                            name={`bukuList.${index}.judulBuku`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Judul Buku <span className="text-red-500">*</span></FormLabel>
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

                          {/* Tanggal Terbit */}
                          <FormField
                            control={form.control}
                            name={`bukuList.${index}.tglTerbit`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tanggal Terbit (Opsional)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    placeholder="Pilih tanggal terbit"
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
                            name={`bukuList.${index}.namaPengarang`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nama Pengarang <span className="text-red-500">*</span></FormLabel>
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
                            name={`bukuList.${index}.namaPenerbit`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nama Penerbit (Opsional)</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Masukkan nama penerbit"
                                    {...field}
                                  />
                                </FormControl>
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
                    Simpan Buku
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-2 border-gray-300"
                    onClick={() => navigate("/daftar-buku")}
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
