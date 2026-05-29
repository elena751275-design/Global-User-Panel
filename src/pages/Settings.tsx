import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/useAuth";

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [oldLoginPassword, setOldLoginPassword] = useState("");
  const [newLoginPassword, setNewLoginPassword] = useState("");
  const [confirmLoginPassword, setConfirmLoginPassword] = useState("");
  const [savingLogin, setSavingLogin] = useState(false);
  const [oldFundPassword, setOldFundPassword] = useState("");
  const [newFundPassword, setNewFundPassword] = useState("");
  const [confirmFundPassword, setConfirmFundPassword] = useState("");
  const [savingFund, setSavingFund] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await signOut();
      toast.success("Logged out");
      navigate("/auth", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Logout failed");
    } finally {
      setSigningOut(false);
      setLogoutOpen(false);
    }
  };

  const handleChangeLoginPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newLoginPassword !== confirmLoginPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newLoginPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    setSavingLogin(true);
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          oldPassword: oldLoginPassword,
          newPassword: newLoginPassword,
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success(result.message);
        setOldLoginPassword("");
        setNewLoginPassword("");
        setConfirmLoginPassword("");
      } else {
        throw new Error(result.message || 'Failed to change login password.');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingLogin(false);
    }
  };

  const handleChangeFundPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newFundPassword !== confirmFundPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newFundPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    setSavingFund(true);
    try {
      const response = await fetch('/api/user/change-fund-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          oldPassword: oldFundPassword,
          newPassword: newFundPassword,
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success(result.message);
        setOldFundPassword("");
        setNewFundPassword("");
        setConfirmFundPassword("");
      } else {
        throw new Error(result.message || 'Failed to update fund password.');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingFund(false);
    }
  };

return (
    <div className="min-h-screen bg-goldBg">
      <PageHeader title="Settings" />

      <div className="px-5 pt-5">
        <div className="luxury-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Change Login Password</h2>
          <form onSubmit={handleChangeLoginPassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="old-login-password" className="text-white">Old Password</Label>
              <Input id="old-login-password" type="password" value={oldLoginPassword} onChange={(e) => setOldLoginPassword(e.target.value)} autoComplete="current-password" className="bg-[#0f131e] border-goldBorder text-white" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-login-password" className="text-white">New Password</Label>
              <Input id="new-login-password" type="password" value={newLoginPassword} onChange={(e) => setNewLoginPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" className="bg-[#0f131e] border-goldBorder text-white" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-login-password" className="text-white">Confirm New Password</Label>
              <Input id="confirm-login-password" type="password" value={confirmLoginPassword} onChange={(e) => setConfirmLoginPassword(e.target.value)} autoComplete="new-password" className="bg-[#0f131e] border-goldBorder text-white" />
            </div>
            <Button type="submit" className="w-full btn-gold" disabled={savingLogin}>
              {savingLogin ? "Saving..." : "Update Login Password"}
            </Button>
          </form>
        </div>

        <div className="luxury-card p-5 mt-4">
          <h2 className="text-sm font-semibold text-white mb-4">Change Fund Password</h2>
          <form onSubmit={handleChangeFundPassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="old-fund-password" className="text-white">Old Fund Password</Label>
              <Input id="old-fund-password" type="password" value={oldFundPassword} onChange={(e) => setOldFundPassword(e.target.value)} autoComplete="new-password" className="bg-[#0f131e] border-goldBorder text-white" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-fund-password" className="text-white">New Fund Password</Label>
              <Input id="new-fund-password" type="password" value={newFundPassword} onChange={(e) => setNewFundPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" className="bg-[#0f131e] border-goldBorder text-white" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-fund-password" className="text-white">Confirm New Fund Password</Label>
              <Input id="confirm-fund-password" type="password" value={confirmFundPassword} onChange={(e) => setConfirmFundPassword(e.target.value)} autoComplete="new-password" className="bg-[#0f131e] border-goldBorder text-white" />
            </div>
            <Button type="submit" className="w-full btn-gold" disabled={savingFund}>
              {savingFund ? "Saving..." : "Update Fund Password"}
            </Button>
          </form>
        </div>

        <div className="luxury-card mt-4 p-2">
          <button
            onClick={() => setLogoutOpen(true)}
            className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[#1a1f2e] transition-colors"
          >
            <span className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                <LogOut className="h-4 w-4 text-red-500" />
              </span>
              <span className="text-sm font-medium text-red-500">Log out</span>
            </span>
          </button>
        </div>
      </div>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent style={{ backgroundColor: '#0a0d14', border: '1px solid #1a1f2e' }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Log out?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              You will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={signingOut} className="border-goldBorder text-gray-400">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleLogout(); }}
              disabled={signingOut}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {signingOut ? "Logging out..." : "Log out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;