import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().trim().email("Invalid email").max(255);
const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(72);
const usernameSchema = z.string().trim().min(2, "Username too short").max(50);
const inviteSchema = z.string().trim().max(20).optional();

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // Sign in
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign up
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpUsername, setSignUpUsername] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [defaultTab, setDefaultTab] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setInviteCode(ref);
      setDefaultTab("signup");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      emailSchema.parse(signInEmail);
      passwordSchema.parse(signInPassword);

      // Use our custom backend for login
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signInEmail, password: signInPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Sign in failed");
      }

      login(result.user); // Save user data in the context
      toast.success(result.message || "Logged in successfully");
      navigate("/", { replace: true });

    } catch (err: any) {
      toast.error(err.message || "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Validate inputs using Zod schemas
      emailSchema.parse(signUpEmail);
      passwordSchema.parse(signUpPassword);
      usernameSchema.parse(signUpUsername);
      const code = inviteCode.trim();
      inviteSchema.parse(code);

      // Directly call our backend server for registration
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: signUpUsername,
          email: signUpEmail,
          password: signUpPassword,
          invitationCode: code, // Send the invitation code to the backend
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Use the error message from our backend
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // Handle success
      toast.success(data.message || 'Account created! You can now sign in.');
      // Switch to the sign-in form after successful registration
      setDefaultTab("signin");
      // Clear signup form fields
      setSignUpEmail("");
      setSignUpPassword("");
      setSignUpUsername("");
      setInviteCode("");

    } catch (err: any) {
      // Display validation or server errors
      toast.error(err.message || "Sign up failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#B8860B] via-[#FFD700] to-[#8B6508] flex items-center justify-center shadow-lg mb-3">
            <span className="text-2xl font-black text-white drop-shadow-md">GM</span>
          </div>
          <h1 className="text-2xl font-bold text-center text-[#B8860B]">Global Marketplace</h1>
        </div>
        <Tabs defaultValue={defaultTab} key={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin" className="data-[state=active]:bg-[#B8860B] data-[state=active]:text-white">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-[#B8860B] data-[state=active]:text-white">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-[#B8860B] to-[#8B6508] hover:opacity-90" disabled={submitting}>
                {submitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="signup-username">Username</Label>
                <Input
                  id="signup-username"
                  value={signUpUsername}
                  onChange={(e) => setSignUpUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-invite">Invitation code (optional)</Label>
                <Input
                  id="signup-invite"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Enter code if you have one"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-[#B8860B] to-[#8B6508] hover:opacity-90" disabled={submitting}>
                {submitting ? "Creating..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;