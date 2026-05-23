import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
// import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
import {
  Users,
  ClipboardList,
  Wallet,
  Mail,
  User,
  ChevronRight,
  Settings,
  FileText,
  ArrowDownToLine,
  Camera,
  Copy,
  Share2,
  LogOut,
  Link as LinkIcon,
} from "lucide-react";

const quickActions = [
  { icon: Users, label: "Teams", action: "teams" },
  { icon: ClipboardList, label: "Record" },
  { icon: Wallet, label: "Wallet\nmanagement" },
  { icon: Mail, label: "Invite friends", action: "invite" },
];

type MenuItem = {
  icon: typeof User;
  label: string;
  action?: string;
  danger?: boolean;
};

const menuItems: MenuItem[] = [
  { icon: User, label: "Profile", action: "profile" },
  { icon: LinkIcon, label: "Binding Wallet", action: "bind-wallet" },
  { icon: FileText, label: "Deposit records", action: "deposit-records" },
  { icon: ArrowDownToLine, label: "Withdrawal records", action: "withdrawal-records" },
  { icon: Settings, label: "Setting", action: "settings" },
];

interface Profile {
  username: string | null;
  avatar_url: string | null;
  invitation_code: string | null;
  vip_level: number;
  balance: number;
}

const Mine = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
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

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        // Assuming useAuth now provides a user object with an `id` compatible with the new API
        const response = await fetch(`/api/profile/${user.id}`);
        const data = await response.json();

        if (data.success) {
          setProfile(data.profile);
        } else {
          throw new Error(data.message || "Failed to fetch profile");
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to load profile data.");
      }
    };

    fetchProfile();
  }, [user]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setUploading(true);
    try {
      // const ext = file.name.split(".").pop();
      // const path = `${user.id}/avatar-${Date.now()}.${ext}`;

      // const { error: uploadError } = await supabase.storage
      //   .from("avatars")
      //   .upload(path, file, { upsert: true });
      // if (uploadError) throw uploadError;

      // const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      // const publicUrl = urlData.publicUrl;

      // const { error: updateError } = await supabase
      //   .from("profiles")
      //   .update({ avatar_url: publicUrl })
      //   .eq("user_id", user.id);
      // if (updateError) throw updateError;

      // setProfile((p) => (p ? { ...p, avatar_url: publicUrl } : p));
      toast.warn("Feature temporarily disabled.");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const inviteCode = profile?.invitation_code ?? "------";
  const inviteLink = `${window.location.origin}/auth?ref=${inviteCode}`;

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleQuickAction = (action?: string) => {
    if (action === "invite") setInviteOpen(true);
    else if (action === "teams") navigate("/teams");
  };

  const username = profile?.username || user?.email?.split("@")[0] || "User";
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Frosted glass header over midnight gradient */}
      <div
        className="relative px-5 pb-14 pt-8 text-foreground rounded-b-[28px] overflow-hidden"
        style={{ background: "var(--gradient-header)" }}
      >
        <div className="pointer-events-none absolute -top-16 -left-12 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 right-0 h-48 w-48 rounded-full bg-accent/15 blur-3xl" />
        <svg className="pointer-events-none absolute inset-0 h-full w-full text-foreground opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-mine" width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M0 36 L36 0 M-9 9 L9 -9 M27 45 L45 27" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-mine)" />
        </svg>

        <div className="relative flex items-center gap-4">
          <button
            onClick={handleAvatarClick}
            disabled={uploading}
            className="relative h-16 w-16 rounded-full overflow-hidden ring-2 ring-accent/40 shadow-[0_0_18px_-4px_hsl(var(--accent)/0.5)] disabled:opacity-60"
            aria-label="Change profile picture"
          >
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url ?? undefined} alt={username} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 left-0 bg-background/70 backdrop-blur-sm flex items-center justify-center py-0.5">
              <Camera className="h-3 w-3" />
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold truncate max-w-[160px] tracking-tight">{username}</h1>
              <Badge className="vip-badge border-none text-[10px] px-2 py-0.5 rounded-md">
                VIP {profile?.vip_level ?? 1}
              </Badge>
            </div>
            <button
              onClick={() => copy(inviteCode, "Invitation code")}
              className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Invitation code: {inviteCode}</span>
              <Copy className="h-3 w-3" />
            </button>
          </div>
          <button className="text-accent hover:opacity-80 transition" aria-label="Messages">
            <Mail className="h-5 w-5" strokeWidth={1.7} />
          </button>
        </div>

        <div className="relative mt-7 glass rounded-2xl p-4 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">My Account</p>
            <p className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">USDT</span>
              <span className="gold-text text-3xl font-extrabold tracking-tight">
                {Number(profile?.balance ?? 0).toFixed(2)}
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/deposit")} className="flex flex-col items-center gap-1.5 group">
              <div className="h-11 w-11 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center group-hover:bg-primary/25 transition-colors shadow-[0_0_18px_-6px_hsl(var(--primary)/0.6)]">
                <svg viewBox="0 0 24 24" className="h-6 w-6">
                  <rect x="2" y="7" width="20" height="13" rx="3" fill="hsl(var(--primary))" opacity="0.4" />
                  <rect x="2" y="5" width="14" height="4" rx="2" fill="hsl(var(--accent))" opacity="0.95" />
                  <circle cx="17" cy="13" r="2" fill="hsl(var(--accent))" />
                </svg>
              </div>
              <span className="text-[11px] font-medium">Deposit</span>
            </button>
            <button onClick={() => navigate("/withdrawal")} className="flex flex-col items-center gap-1.5 group">
              <div className="h-11 w-11 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center group-hover:bg-accent/25 transition-colors shadow-[0_0_18px_-6px_hsl(var(--accent)/0.6)]">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="hsl(var(--accent))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="13" rx="3" fill="hsl(var(--accent))" opacity="0.3" stroke="none" />
                  <path d="M12 9 v7 m-3 -3 l3 3 l3 -3" />
                </svg>
              </div>
              <span className="text-[11px] font-medium">Withdrawal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 -mt-7 relative z-10">
        <div className="grid grid-cols-4 gap-2.5">
          {quickActions.map((item) => (
            <button
              key={item.label}
              onClick={() => handleQuickAction(item.action)}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-card border border-border p-3 shadow-[var(--shadow-tile)] hover:border-primary/50 hover:shadow-[var(--shadow-glow-violet)] transition-all"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-accent" strokeWidth={1.6} fill="hsl(var(--primary) / 0.3)" />
              </div>
              <span className="text-[10.5px] text-foreground text-center whitespace-pre-line leading-tight font-medium">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Menu List */}
      <div className="mt-5 px-5 space-y-2.5">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              if (item.action === "logout") setLogoutOpen(true);
              else if (item.action === "profile") navigate("/profile");
              else if (item.action === "bind-wallet") navigate("/bind-wallet");
              else if (item.action === "deposit-records") navigate("/deposit-records");
              else if (item.action === "withdrawal-records") navigate("/withdrawal-records");
              else if (item.action === "settings") navigate("/settings");
            }}
            className="flex w-full items-center gap-3 rounded-2xl bg-card border border-border p-4 shadow-[var(--shadow-tile)] transition-all hover:border-primary/40 hover:translate-x-0.5"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                item.danger
                  ? "bg-destructive/10 border-destructive/30"
                  : "bg-primary/10 border-primary/30"
              }`}
            >
              <item.icon
                className={`h-5 w-5 ${item.danger ? "text-destructive" : "text-accent"}`}
                strokeWidth={1.6}
                fill={item.danger ? "hsl(var(--destructive) / 0.2)" : "hsl(var(--primary) / 0.3)"}
              />
            </span>
            <span
              className={`flex-1 text-left text-sm font-semibold ${
                item.danger ? "text-destructive" : "text-foreground"
              }`}
            >
              {item.label}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Invite friends dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Invite friends</DialogTitle>
            <DialogDescription>
              Share your invitation code or link. Friends who sign up with it become your referrals.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Your invitation code</p>
              <div className="flex gap-2">
                <Input value={inviteCode} readOnly className="font-mono text-center text-lg tracking-widest" />
                <Button type="button" variant="outline" size="icon" onClick={() => copy(inviteCode, "Code")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Invitation link</p>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="text-xs" />
                <Button type="button" variant="outline" size="icon" onClick={() => copy(inviteLink, "Link")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {typeof navigator !== "undefined" && "share" in navigator && (
              <Button
                type="button"
                className="w-full"
                onClick={() =>
                  navigator
                    .share({ title: "Join me", text: `Use my invitation code: ${inviteCode}`, url: inviteLink })
                    .catch(() => {})
                }
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Logout confirmation */}
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={signingOut}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              disabled={signingOut}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {signingOut ? "Logging out..." : "Log out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
};

export default Mine;