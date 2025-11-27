import { Button } from "~/components/ui/button";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useState } from "react";
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
import { ImageInput } from "~/components/ui/image-input";
import { registerPeminjam } from "~/lib/firebaseServices";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const registerSchema = z.object({
  nama_peminjam: z.string().min(2, "Nama harus minimal 2 karakter"),
  user_peminjam: z.string().min(3, "Username harus minimal 3 karakter"),
  pass_peminjam: z.string().min(6, "Password harus minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Password harus minimal 6 karakter"),
  foto_peminjam: z.instanceof(File).optional(),
}).refine((data) => data.pass_peminjam === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nama_peminjam: "",
      user_peminjam: "",
      pass_peminjam: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      // Generate email from username for Firebase Auth
      const email = `${data.user_peminjam}@example.com`;
      
      await registerPeminjam(
        email,
        data.pass_peminjam,
        data.nama_peminjam,
        data.user_peminjam,
        photoFile || undefined
      );
      navigate("/dashboard-peminjam");
    } catch (error: any) {
      form.setError("root", { message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Sign Up</CardTitle>
          <CardDescription>Create your account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {form.formState.errors.root && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {form.formState.errors.root.message}
                </div>
              )}

              <FormField
                control={form.control}
                name="nama_peminjam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nama Lengkap"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="user_peminjam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="username123"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pass_peminjam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-2">
                <FormLabel>Foto Profil (Opsional)</FormLabel>
                <p className="text-xs text-gray-600 mb-3">
                  Tambahkan foto profil - akan dipotong menjadi persegi (300x300px)
                </p>
                <ImageInput
                  preview={photoPreview}
                  onImageCapture={setPhotoFile}
                  onPreviewChange={setPhotoPreview}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? "Mendaftar..." : "Buat Akun"}
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-2 border-blue-600 text-blue-600"
            onClick={() => navigate("/login")}
          >
            Log In
          </Button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full text-center text-sm text-gray-600 hover:text-gray-900 py-3 mt-4"
          >
            Back to Home
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
