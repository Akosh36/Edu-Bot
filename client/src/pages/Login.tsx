import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertCircle, LogIn, UserPlus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Library } from "lucide-react";
import { useI18n, translations } from "@/lib/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();
  const { language } = useI18n();
  const t = translations[language];
  const queryClient = useQueryClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Update React Query cache with user data
      queryClient.setQueryData(["/api/auth/user"], data.user);
      
      // Redirect to home page on success
      setTimeout(() => navigate("/"), 100);
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate inputs
    if (!email || !password || !confirmPassword || !firstName) {
      setError("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Sign up failed");
        return;
      }

      // Update React Query cache with user data
      queryClient.setQueryData(["/api/auth/user"], data.user);
      
      // Redirect to home page on success
      setTimeout(() => navigate("/"), 100);
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700 shadow-2xl">
        <div className="p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="bg-primary p-2 rounded-lg">
              <Library className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-white">EduBot</span>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-700">
              <TabsTrigger value="signin" className="text-slate-200 data-[state=active]:text-white">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-slate-200 data-[state=active]:text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin" className="space-y-4">
              <div className="space-y-2 mb-6 text-center">
                <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
                <p className="text-slate-400">Access your learning profile</p>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-200">Email</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-200">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
                    disabled={loading}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6 bg-primary hover:bg-primary/90 text-white font-semibold py-2 rounded-lg gap-2"
                  disabled={loading}
                >
                  <LogIn className="w-4 h-4" />
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2 mb-6 text-center">
                <h1 className="text-2xl font-bold text-white">Create Account</h1>
                <p className="text-slate-400">Join our learning community</p>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-200">First Name *</label>
                  <Input
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-200">Last Name</label>
                  <Input
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-200">Email *</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-200">Password *</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
                    disabled={loading}
                    required
                  />
                  <p className="text-xs text-slate-400">At least 6 characters</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-200">Confirm Password *</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setConfirmPassword(e.target.value)
                    }
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
                    disabled={loading}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6 bg-primary hover:bg-primary/90 text-white font-semibold py-2 rounded-lg gap-2"
                  disabled={loading}
                >
                  <UserPlus className="w-4 h-4" />
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}
