import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "Pages/Login.tsx"),
  route("register", "Pages/Register.tsx"),
  route("dashboard-peminjam", "Pages/DashboardPeminjam.tsx"),
  route("form-peminjaman", "Pages/FormPeminjaman.tsx"),
] satisfies RouteConfig;
