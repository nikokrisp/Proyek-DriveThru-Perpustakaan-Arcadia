import type { Route } from "./+types/home";
import LandingPage from "../Pages/LandingPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Welcome" },
    { name: "description", content: "Welcome to our platform!" },
  ];
}

export default function Home() {
  return <LandingPage />;
}
