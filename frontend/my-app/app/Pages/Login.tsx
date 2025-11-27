import { Button } from "~/components/ui/button";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
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
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "~/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const loginSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const isAdmin = data.username === "admin";
      
      if (isAdmin) {
        // Login as admin
        const email = `${data.username}@example.com`;
        await signInWithEmailAndPassword(auth, email, data.password);
        navigate("/dashboard-admin");
      } else {
        // Login as peminjam - check if exists in peminjam collection
        const q = query(collection(db, 'peminjam'), where('user_peminjam', '==', data.username));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          throw new Error('Username tidak terdaftar. Silakan register terlebih dahulu');
        }
        
        // Use username as email for Firebase Auth
        const email = `${data.username}@example.com`;
        await signInWithEmailAndPassword(auth, email, data.password);
        navigate("/dashboard-peminjam");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Log In</CardTitle>
          <CardDescription>Welcome back to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="username123"
                        type="text"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log In"}
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-2 border-blue-600 text-blue-600"
            onClick={() => navigate("/register")}
            disabled={isLoading}
          >
            Create Account
          </Button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full text-center text-sm text-gray-600 hover:text-gray-900 py-3 mt-4 disabled:opacity-50"
            disabled={isLoading}
          >
            Back to Home
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
