import { Button } from "~/components/ui/button";
import { useNavigate } from "react-router";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center">
      <div className="text-center space-y-8 px-4">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
            Welcome
          </h1>
          <p className="text-xl md:text-2xl text-gray-700">
            Get started with your account today
          </p>
        </div>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-gray-600 text-lg">
          Join our platform to unlock amazing features and opportunities.
          Create your account or sign in to your existing one.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
            onClick={() => navigate("/register")}
          >
            Sign Up
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg"
            onClick={() => navigate("/login")}
          >
            Log In
          </Button>
        </div>
      </div>
    </div>
  );
}
