import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
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
  { icon: ClipboardList, label: "Record", action: "record" },
  { icon: Wallet, label: "Wallet\nmanagement", action: "wallet" },
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
  const [profileLoading, setProfileLoading] = useState(true);

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
        const response = await fetch(`/api/profile/${user.id}`);
        const data = await response.json();
        if (data.success) {
          setProfile(data.profile);
        } else {
          throw new Error(data.message || "Failed to fetch profile");
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to load profile data.");
      } finally {
        setProfileLoading(false);
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
      toast.warning("Feature temporarily disabled.");
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
    else if (action === "record") navigate("/record");
    else if (action === "wallet") navigate("/deposit");
  };

  const username = profile?.username || user?.email?.split("@")[0] || "User";
  const initials = username.slice(0, 2).toUpperCase();
  const balance = Number(profile?.balance ?? 0);

  return (
    <div className="min-h-screen pb-24 bg-goldBg">
      {/* ── Frosted glass header with grid pattern ── */}
      <div
        className="relative px-5 pb-14 pt-8 text-white rounded-b-[28px] overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #111620 0%, #0a0d14 100%)' }}
      >
        {/* Ambient glow blobs */}
        <div className="pointer-events-none absolute -top-16 -left-12 h-56 w-56 rounded-full bg-luxuryGold-main/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 right-0 h-48 w-48 rounded-full bg-luxuryGold-main/8 blur-3xl" />

        {/* 3D Grid Pattern Overlay */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full text-luxuryGold-main opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-mine" width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M0 36 L36 0 M-9 9 L9 -9 M27 45 L45 27" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-mine)" />
        </svg>

        {/* ── Profile Row ── */}
        {profileLoading ? (
          <div className="relative flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#1a1f2e] animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[#1a1f2e] rounded animate-pulse w-1/3" />
              <div className="h-3 bg-[#1a1f2e] rounded animate-pulse w-1/2" />
            </div>
          </div>
        ) : (
          <div className="relative flex items-center gap-4">
            <button
              onClick={handleAvatarClick}
              disabled={uploading}
              className="relative h-16 w-16 rounded-full overflow-hidden ring-2 ring-luxuryGold-main shadow-[0_0_18px_-4px_rgba(194,159,116,0.5)] disabled:opacity-60 shrink-0"
              aria-label="Change profile picture"
            >
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url ?? undefined} alt={username} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-[#F0A500] via-[#A67C00] to-[#5C3D00] text-black/80 text-lg font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 left-0 bg-black/60 backdrop-blur-sm flex items-center justify-center py-0.5">
                <Camera className="h-3 w-3 text-white" />
              </span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-sans font-bold tracking-wide truncate max-w-[140px] text-xl gold-gradient-text">
                  {username}
                </h1>
                <Badge className="border-none font-bold text-[10px] px-2 py-0.5 shadow-lg shadow-amber-500/20" style={{ background: 'linear-gradient(to right, #BF953F, #FCF6BA, #B38728)', color: '#000000' }}>
                  VIP {profile?.vip_level ?? 1}
                </Badge>
              </div>
              <button onClick={() => copy(inviteCode, "Invitation code")} className="mt-1 flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                <span>Invitation code: {inviteCode}</span>
                <Copy className="h-3 w-3" />
              </button>
            </div>
            {/* Messages bell icon */}
            <button className="text-goldPrimary hover:opacity-80 transition shrink-0" aria-label="Messages">
              <Mail className="h-5 w-5" strokeWidth={1.7} />
            </button>
          </div>
        )}

        {/* ── Balance Card with 3D gold icons ── */}
        <div className="relative mt-7 rounded-2xl p-4 flex items-end justify-between"
          style={{ background: 'linear-gradient(180deg, rgba(10,13,20,0.75), rgba(10,13,20,0.55))', backdropFilter: 'blur(18px) saturate(140%)', WebkitBackdropFilter: 'blur(18px) saturate(140%)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="shrink-0">
            <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-white/90">My Account Balance</p>
            <p className="mt-1 flex items-baseline gap-1">
              <span className="gold-gradient-text text-3xl font-extrabold">
                {balance.toFixed(2)}
              </span>
              <span className="text-[11px] font-medium text-white/90">USDT</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/deposit")} className="flex flex-col items-center gap-1.5 group">
              <div className="gold-icon-3d">
                <svg viewBox="0 0 24 24" className="h-5 w-5">
                  <rect x="2" y="7" width="20" height="13" rx="3" fill="currentColor" opacity="0.3" />
                  <rect x="2" y="5" width="14" height="4" rx="2" fill="currentColor" opacity="0.9" />
                  <circle cx="17" cy="13" r="2" fill="currentColor" />
                </svg>
              </div>
              <span className="text-[10.5px] text-white/90 font-medium leading-tight">Deposit</span>
            </button>
            <button onClick={() => navigate("/withdrawal")} className="flex flex-col items-center gap-1.5 group">
              <div className="gold-icon-3d">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="13" rx="3" fill="currentColor" opacity="0.25" stroke="none" />
                  <path d="M12 9 v7 m-3 -3 l3 3 l3 -3" />
                </svg>
              </div>
              <span className="text-[10.5px] text-white/90 font-medium leading-tight">Withdrawal</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Quick Actions (overlapping the header) ── */}
      <div className="px-5 -mt-7 relative z-10">
        <div className="grid grid-cols-4 gap-2.5">
          {quickActions.map((item) => (
            <button
              key={item.label}
              onClick={() => handleQuickAction(item.action)}
              className="flex flex-col items-center justify-center gap-2 rounded-xl p-2.5 transition-all duration-300 luxury-card"
            >
              <div className="gold-icon-3d-sm">
                <item.icon className="h-4 w-4" strokeWidth={2} />
              </div>
              <span className="text-[10px] text-brandHeading font-medium leading-tight text-center whitespace-pre-line">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Menu List ── */}
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
            className="flex w-full items-center gap-3 rounded-2xl p-4 transition-all duration-300 luxury-card hover:translate-x-0.5"
          >
            <div className="gold-icon-3d-sm">
              <item.icon className={`h-4 w-4 ${item.danger ? 'text-red-400' : ''}`} strokeWidth={1.8} />
            </div>
            <span className={`flex-1 text-left text-sm font-semibold ${item.danger ? 'text-red-400' : 'text-brandHeading'}`}>
              {item.label}
            </span>
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </button>
        ))}

        {/* Logout Button */}
        <button
          onClick={() => setLogoutOpen(true)}
          className="flex w-full items-center gap-3 rounded-2xl p-4 transition-all duration-300 luxury-card hover:translate-x-0.5"
        >
          <div className="gold-icon-3d-sm" style={{ color: '#EF4444' }}>
            <LogOut className="h-4 w-4" strokeWidth={1.8} />
          </div>
          <span className="flex-1 text-left text-sm font-semibold text-red-400">Log out</span>
          <ChevronRight className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* ═══ DIALOGS ═══ */}

      {/* Invite friends dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-sm rounded-2xl" style={{ backgroundColor: '#0a0d14', border: '1px solid #1a1f2e' }}>
          <DialogHeader>
            <DialogTitle className="text-white">Invite friends</DialogTitle>
            <DialogDescription className="text-gray-400">
              Share your invitation code or link. Friends who sign up with it become your referrals.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Your invitation code</p>
              <div className="flex gap-2">
                <Input value={inviteCode} readOnly className="font-mono text-center text-lg tracking-widest rounded-xl text-goldPrimary" style={{ backgroundColor: '#0a0d14', border: '1px solid #1a1f2e' }} />
                <Button type="button" variant="outline" size="icon" onClick={() => copy(inviteCode, "Code")} className="rounded-xl" style={{ border: '1px solid #1a1f2e', color: '#F0A500' }}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Invitation link</p>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="text-xs bg-goldBg border border-goldBorder rounded-xl text-white" />
                <Button type="button" variant="outline" size="icon" onClick={() => copy(inviteLink, "Link")} className="border-goldBorder text-goldPrimary hover:bg-goldPrimary/10">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {typeof navigator !== "undefined" && "share" in navigator && (
              <Button
                type="button"
                className="w-full btn-gold"
                onClick={() =>
                  navigator.share({ title: "Join me", text: `Use my invitation code: ${inviteCode}`, url: inviteLink }).catch(() => {})
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

      <BottomNav />
    </div>
  );
};

export default Mine;
