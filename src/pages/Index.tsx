import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  TrendingUp,
  Wallet,
  Users,
  UserPlus,
  Globe,
  Gift,
  Copy,
  Share2,
} from "lucide-react";
import partnerAmazon from "@/assets/platform-amazon.png";
import partnerAlibaba from "@/assets/platform-alibaba.png";
import partnerAliexpress from "@/assets/platform-aliexpress.png";
import partnerEbay from "@/assets/partner-ebay.png";
import partnerWalmart from "@/assets/partner-walmart.png";
import partnerTarget from "@/assets/partner-target.png";
import partnerRakuten from "@/assets/partner-rakuten.png";
import partnerPaypal from "@/assets/partner-paypal.png";
import partnerDhl from "@/assets/partner-dhl.png";
import partnerFedex from "@/assets/partner-fedex.png";
import partnerUps from "@/assets/partner-ups.png";
import partnerVisa from "@/assets/partner-visa.png";
import partnerMastercard from "@/assets/partner-mastercard.png";
import partnerStripe from "@/assets/partner-stripe.png";

const partners = [
  { name: "Amazon", url: "https://amazon.com", logo: partnerAmazon },
  { name: "Alibaba", url: "https://alibaba.com", logo: partnerAlibaba },
  { name: "AliExpress", url: "https://aliexpress.com", logo: partnerAliexpress },
  { name: "eBay", url: "https://ebay.com", logo: partnerEbay },
  { name: "Walmart", url: "https://walmart.com", logo: partnerWalmart },
  { name: "Target", url: "https://target.com", logo: partnerTarget },
  { name: "Rakuten", url: "https://rakuten.com", logo: partnerRakuten },
  { name: "PayPal", url: "https://paypal.com", logo: partnerPaypal },
  { name: "DHL", url: "https://dhl.com", logo: partnerDhl },
  { name: "FedEx", url: "https://fedex.com", logo: partnerFedex },
  { name: "UPS", url: "https://ups.com", logo: partnerUps },
  { name: "Visa", url: "https://visa.com", logo: partnerVisa },
  { name: "Mastercard", url: "https://mastercard.com", logo: partnerMastercard },
  { name: "Stripe", url: "https://stripe.com", logo: partnerStripe },
];

const platformItems = [
  {
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop",
    title: "Platform profile",
    desc: "MALL is an intelligent cloud global order matching center...",
  },
  {
    image: "https://images.unsplash.com/photo-1573152143286-0c422b4d2175?w=400&h=250&fit=crop",
    title: "Platform rules",
    desc: "About recharge: [The platform will change the recharge...",
  },
  {
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=250&fit=crop",
    title: "Win-win cooperation",
    desc: "At MALL, we carry out win-win cooperation for all users...",
  },
  {
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=250&fit=crop",
    title: "No more events",
    desc: "To celebrate the MALL membership surpassing...",
  },
];

// Large user ID pool for infinite live withdrawal feed
const userPool = [
  "***905", "***312", "***748", "***156", "***623",
  "***491", "***837", "***264", "***519", "***103",
  "***672", "***888", "***345", "***721", "***198",
  "***431", "***562", "***819", "***274", "***651",
  "***937", "***108", "***456", "***729", "***385",
  "***513", "***847", "***290", "***664", "***129",
  "***775", "***318", "***549", "***887", "***233",
  "***691", "***104", "***462", "***839", "***570",
  "***216", "***953", "***378", "***621", "***185",
  "***742", "***509", "***837", "***260", "***414",
];

// Generate random withdrawal amount between 100–5000 USDT with 2 decimal places
const randomAmount = () => +(100 + Math.random() * 4900).toFixed(2);

// Pick a random user from the pool
const randomUser = () => userPool[Math.floor(Math.random() * userPool.length)];

interface Profile {
  username: string | null;
  invitation_code: string | null;
  vip_level: number;
  balance: number;
  avatarUrl: string | null;
  profileImage: string | null;
  avatar_url: string | null;
}

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [liveFeed, setLiveFeed] = useState<Array<{ user: string; amount: number }>>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [platformOpen, setPlatformOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [cooperationOpen, setCooperationOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch live withdrawal feed from backend, fallback to random infinite loop
  useEffect(() => {
    fetch("/api/withdrawals/live-feed")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.feed) && data.feed.length > 0) {
          setLiveFeed(data.feed);
        }
      })
      .catch(() => {
        // keep fallback — generate initial pool
        setLiveFeed(Array.from({ length: 50 }, () => ({ user: randomUser(), amount: randomAmount() })));
      });
  }, []);

  // Fetch profile + balance (same endpoint as Mine page)
  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!userId) return;
    fetch(`/api/profile/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.profile) {
          setBalance(Number(data.profile.balance ?? 0));
          const p = data.profile;
          setProfile({
            ...p,
            invitation_code: p.invitationCode ?? p.invitation_code ?? null,
            avatar_url: p.avatarUrl ?? p.profileImage ?? p.avatar_url ?? null,
          });
        }
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, [user]);

  // Ensure we always have items to display
  const displayPool = liveFeed.length > 0 ? liveFeed : Array.from({ length: 20 }, () => ({ user: randomUser(), amount: randomAmount() }));

  // Smooth marquee animation — infinite random loop
  const nextItem = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % 9999); // effectively infinite
      setIsAnimating(false);
    }, 500);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextItem, 3000);
    return () => clearInterval(interval);
  }, [nextItem]);

  // Derive current display item: use modulo on pool, or generate fresh random on overflow
  const safeIndex = currentIndex % displayPool.length;
  const current = displayPool[safeIndex] || { user: randomUser(), amount: randomAmount() };
  const username = profile?.username || user?.email?.split("@")[0] || "User";
  const inviteCode = profile?.invitation_code ?? "------";
  const inviteLink = `${window.location.origin}/auth?ref=${inviteCode}`;

  const copyToClipboard = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy failed");
    }
  };

  // Quick actions routing — exact same paths as Mine page
  const quickActions = [
    { icon: Users, label: "Teams", action: () => navigate("/teams") },
    { icon: UserPlus, label: "Invitation", action: () => setInviteOpen(true) },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden pb-24 bg-goldBg">

      {/* ========================================== */}
      {/* PROFILE SECTION — exact Mine layout       */}
      {/* ========================================== */}
      <div className="relative w-full px-4 pt-4 pb-2 mb-1 text-white overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-10 left-0 h-44 w-44 rounded-full bg-luxuryGold-main/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-6 right-0 h-36 w-36 rounded-full bg-luxuryGold-main/6 blur-3xl" />

        {profileLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="flex items-center gap-3.5">
              <div className="h-[68px] w-[68px] rounded-full bg-[#2a2a2a] shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#2a2a2a] rounded w-1/3"></div>
                <div className="h-3 bg-[#2a2a2a] rounded w-1/2"></div>
              </div>
            </div>
            <div className="glass-card p-4">
              <div className="h-3 bg-[#2a2a2a] rounded w-1/4 mb-2"></div>
              <div className="h-6 bg-[#2a2a2a] rounded w-1/3"></div>
            </div>
          </div>
        ) : (<div>

        {/* ── Row 1: Profile Info ── */}
        <div className="relative flex items-center gap-3.5">
          <div className="relative shrink-0 h-[68px] w-[68px] rounded-full overflow-hidden bg-[#171512]/80 backdrop-blur-md border-2 border-luxuryGold-main shadow-[0_4px_15px_0_rgba(0,0,0,0.35),_inset_0_0_12px_rgba(194,159,116,0.05),_0_0_10px_rgba(194,159,116,0.5)]">
            <Avatar className="h-[68px] w-[68px]">
              <AvatarImage
                src={profile?.avatarUrl || profile?.profileImage || profile?.avatar_url || undefined}
                alt={username}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-[#F0A500] via-[#A67C00] to-[#5C3D00] text-black/80 text-lg font-bold">
                {username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1
  className="font-sans font-bold tracking-wide truncate"
  style={{
    maxWidth: '180px',
    fontSize: '20px',
    background: 'linear-gradient(to bottom, #A2790D 20%, #EBD197 50%, #BB9B49 80%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  }}
>
  {username}
</h1>
              <Badge className="border-none font-bold text-[11px] px-2 py-0 shadow-lg shadow-amber-500/20" style={{ background: 'linear-gradient(to right, #BF953F, #FCF6BA, #B38728)', color: '#000000' }}>
                VIP {profile?.vip_level ?? 1}
              </Badge>
            </div>
            <button onClick={() => copyToClipboard(inviteCode, "Invitation code")} className="mt-1 flex items-center gap-1.5 text-xs text-white transition-colors">
              <span className="text-white">Invitation code: {inviteCode}</span>
              <Copy className="h-3 w-3 text-white" />
            </button>
          </div>
          {/* GLOBAL MARKETPLACE Logo — Right Side */}
          <div className="flex items-center space-x-2 cursor-pointer select-none shrink-0">
            <svg className="w-8 h-8 text-luxuryGold-main" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" stroke="url(#goldenGradientHome)" />
              <path d="M2 12h20" stroke="url(#goldenGradientHome)" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="url(#goldenGradientHome)" />
              <defs>
                <linearGradient id="goldenGradientHome" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E5CEB1" />
                  <stop offset="50%" stopColor="#C29F74" />
                  <stop offset="100%" stopColor="#8E6A46" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex flex-col justify-center leading-none">
              <span className="text-goldPrimary font-extrabold text-sm uppercase tracking-wider font-sans">Global</span>
              <span className="text-goldPrimary/60 text-[9px] font-bold uppercase tracking-[0.18em] mt-0.5">Marketplace</span>
            </div>
          </div>
        </div>

        {/* ── Row 2: My Account Card ── */}
        <div className="relative mt-2 rounded-2xl p-3 overflow-hidden transition-all duration-300" style={{ backgroundColor: '#0a0d14', border: '1px solid #1a1f2e', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2a3f52'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1a1f2e'}>
          <div className="flex items-end justify-between gap-3">
            <div className="shrink-0">
              <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-white/90">My Account Balance</p>
              <p className="mt-1 flex items-baseline gap-1">
                <span
                  style={{
                    background: 'linear-gradient(to right, #BF953F, #FCF6BA, #B38728)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    display: 'inline-block'
                  }}
                  className="text-2xl font-semibold"
                >
                  {balance.toFixed(2)}
                </span>
                <span className="text-[11px] font-medium text-white/90">USDT</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={() => navigate("/deposit")} className="flex flex-col items-center gap-1.5 group">
                <div className="gold-icon-3d-sm">
                  <svg viewBox="0 0 24 24" className="h-5 w-5">
                    <rect x="2" y="7" width="20" height="13" rx="3" fill="currentColor" opacity="0.3" />
                    <rect x="2" y="5" width="14" height="4" rx="2" fill="currentColor" opacity="0.9" />
                    <circle cx="17" cy="13" r="2" fill="currentColor" />
                  </svg>
                </div>
                <span className="text-[10.5px] text-white/90 font-medium leading-tight">Deposit</span>
              </button>
              <button onClick={() => navigate("/withdrawal")} className="flex flex-col items-center gap-1.5 group">
                <div className="gold-icon-3d-sm">
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
        </div>)}
      </div>

      {/* QUICK ACTIONS: 2×2 Grid — exact Mine layout */}
      <div className="grid grid-cols-2 gap-4 mt-1.5 mb-3 px-4">
          {quickActions.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="flex flex-col items-center justify-center gap-2 rounded-xl p-3 transition-all duration-300" style={{ backgroundColor: '#0a0d14', border: '1px solid #1a1f2e', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2a3f52'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1a1f2e'}
            >
              <div className="gold-icon-3d" style={{ border: '2px solid #2C251E !important' }}>
                <item.icon className="h-5 w-5" strokeWidth={2} style={{ stroke: '#BFA37A !important', color: '#BFA37A !important' }} />
              </div>
              <span className="text-[10.5px] text-brandHeading font-medium leading-tight">{item.label}</span>
            </button>
          ))}
        </div>

      {/* LIVE WITHDRAWAL MARQUEE */}
      <div className="px-4 mt-3">
        <div className="rounded-2xl overflow-hidden transition-all duration-300" style={{ backgroundColor: '#0a0d14', border: '1px solid #1a1f2e', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2a3f52'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1a1f2e'}>
          <Globe className="absolute right-0 bottom-0 h-16 w-16 opacity-[0.03] pointer-events-none" style={{ color: '#F0A500', stroke: '#F0A500' }} />
          <div className="p-3.5">
            <div className="flex items-center gap-1.5 mb-2">
              <Gift className="h-3.5 w-3.5" style={{ color: '#F0A500', stroke: '#F0A500' }} />
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Live Activity</span>
            </div>
            <div
              className={`flex items-center gap-3 transition-all duration-500 ${
                isAnimating ? "opacity-0 -translate-y-3" : "opacity-100 translate-y-0"
              }`}
            >
              <div className="gold-icon-3d-sm shrink-0">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <polyline points="16 11 18 13 22 9" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-brandHeading truncate">{current.user}</p>
                <p className="text-xs text-brandMuted">withdrawal successful</p>
              </div>
              <p
                className="text-sm font-bold shrink-0 tabular-nums"
                style={{
                  background: 'linear-gradient(to right, #BF953F, #FCF6BA, #B38728)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'inline-block'
                }}
              >
                {current.amount.toFixed(2)} USDT
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PLATFORM INTRODUCTION */}
      <div className="px-4 mt-4 pb-2">
        <h2 className="text-base font-bold text-white mb-2.5 tracking-wide">Platform introduction</h2>
        <div className="grid grid-cols-2 gap-3">
          {platformItems.map((item, index) => (
            <div
              key={item.title}
              onClick={() => index === 0 ? setPlatformOpen(true) : index === 1 ? setRulesOpen(true) : index === 2 ? setCooperationOpen(true) : navigate("/menu")}
              className="flex flex-col rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
              style={{ backgroundColor: '#0a0d14', border: '1px solid #1a1f2e', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2a3f52'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1a1f2e'}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover brightness-90"
                  loading="lazy"
                />
              </div>
              <div className="p-3 flex flex-col justify-between flex-1 min-h-0">
                <h3 className="text-sm font-semibold text-white truncate">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TRUSTED PARTNERS */}
      <div className="mx-4 mt-5 mb-2 rounded-2xl overflow-hidden" style={{ backgroundColor: '#0a0d14', border: '1px solid #1a1f2e', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }}>
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-xs font-bold text-white text-center uppercase tracking-[0.15em]">
            Our Trusted Global Partners &amp; Affiliates
          </h2>
        </div>
        <div className="grid grid-cols-6 gap-2 px-4 pb-4">
          {partners.map((partner) => (
            <a
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              title={partner.name}
              className="aspect-square flex items-center justify-center rounded-xl cursor-pointer transition-all duration-300"
              style={{ backgroundColor: '#0f131e', border: '1px solid #1a1f2e' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2a3f52'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1a1f2e'}
            >
              <img
                src={partner.logo}
                alt={`${partner.name} logo`}
                loading="lazy"
                className="max-h-10 w-4/5 object-contain opacity-60 hover:opacity-100 transition-opacity"
              />
            </a>
          ))}
        </div>
      </div>

      {/* PLATFORM PROFILE DIALOG */}
      <Dialog open={platformOpen} onOpenChange={setPlatformOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl" style={{ backgroundColor: '#0a0d14', border: '1px solid #1a1f2e' }}>
          <DialogHeader>
            <DialogTitle className="text-white text-lg">Platform Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm leading-relaxed text-gray-300 pr-1">
            <p>
              Global Marketplace is an innovative and purpose-driven 'Intelligent Cloud Global Order Matching Center', which plays an essential role in the ecosystem of major e-commerce platforms worldwide. Currently, this platform is being operated on the basis of strategic partnerships with internationally renowned e-commerce giants such as Amazon, Alibaba and AliExpress.
            </p>
            <p className="text-white font-semibold">
              Notable features and working methods of our platform:
            </p>
            <ul className="space-y-3 list-disc pl-5">
              <li><span className="text-white font-medium">Advanced technical capabilities:</span> By updating product information through online vacuuming, traffic optimization and digital product reconstruction, we facilitate various business scenarios and enhance competitive capabilities.</li>
              <li><span className="text-white font-medium">Smart algorithm engine:</span> Our intelligent cloud algorithm engine establishes perfect connections between buyers and sellers and automatically completes transactions, which helps merchants create their own unique position in the competitive market.</li>
              <li><span className="text-white font-medium">Partnership and revenue opportunities:</span> Global Marketplace is not just a simple shopping platform. This provides customers with a unique opportunity to earn commissions through referrals or sharing, in addition to regular purchases.</li>
              <li><span className="text-white font-medium">Merchant Support:</span> Through our platform, merchants receive promoter benefits as soon as they receive orders, which is very effective in expanding their business.</li>
            </ul>
            <p>
              Through our pioneering 5G intelligent cloud matching technology, we are continuously helping countless merchants and customers achieve their goals.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* PLATFORM RULES DIALOG */}
      <Dialog open={rulesOpen} onOpenChange={setRulesOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl" style={{ backgroundColor: '#0a0d14', border: '1px solid #1a1f2e' }}>
          <DialogHeader>
            <DialogTitle className="text-white text-lg">Platform Rules and Guidelines</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm leading-relaxed text-gray-300 pr-1">
            <div>
              <h4 className="text-white font-semibold mb-1">1. Recharge Guidelines:</h4>
              <p>
                The platform's recharge method may change from time to time. Therefore, to avoid any confusion or transaction failure, it is requested to check the latest update by visiting the recharge interface before each recharge. If for any reason your recharge is not completed, please contact our recharge customer service immediately.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-1">2. Withdrawal Policy:</h4>
              <p className="mb-2">
                The following terms and conditions apply to withdrawals on the Global Marketplace:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-2">
                <li>Minimum withdrawal amount: 20 USDT.</li>
                <li>Minimum deposit amount: 10 USDT.</li>
              </ul>
              <p>
                We take each of your withdrawal requests with the utmost importance and funds are usually disbursed within 24 hours. Due to the high number of users on the platform, we request you to be patient with our processing time to maintain a smooth experience. If you do not receive the money within the specified time, please contact our customer support team immediately.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-1">3. Reasons and solutions for freezing orders:</h4>
              <p>
                If the delivery is not completed within 10 minutes of ordering or if you exit the page after receiving the order, the system 'freezes' the order to ensure security. In such a situation, go to the [Order] option from the record to complete the order quickly and check again.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-1">4. Account usage rules:</h4>
              <p>
                To maintain the security and transparency of the system, each user is allowed to use only one account. More than one account cannot be opened using a valid mobile number. If the system's automatic monitoring detects multiple accounts of the same IP or person, it will be considered money laundering or suspicious activities. In this case, the authority reserves the right to freeze the account and suspend the withdrawal opportunity.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* WIN-WIN COOPERATION DIALOG */}
      <Dialog open={cooperationOpen} onOpenChange={setCooperationOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl" style={{ backgroundColor: '#0a0d14', border: '1px solid #1a1f2e' }}>
          <DialogHeader>
            <DialogTitle className="text-white text-lg">Commitment to Mutually Beneficial Cooperation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm leading-relaxed text-gray-300 pr-1">
            <p>
              Our main goal at Global Marketplace is to create a mutually beneficial environment for all users and business partners around the world. We are working tirelessly to increase user revenue and merchants' profits by building bridges between users and merchants.
            </p>
            <p>
              Maintaining the company's success and reputation is our priority. We are determined to establish ourselves as a trusted and well-known e-commerce organization by adhering to the highest transparency and rules and regulations. It is our goal and constant pursuit to set the benchmark for the e-commerce industry and lead the progress of this industry by using our own advanced technology.
            </p>
            <p>
              We sincerely thank all partners and users of Global Marketplace for their valuable time and unwavering support. Let's reach new heights through mutual cooperation and move forward on the path of collective prosperity!
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* INVITE DIALOG (Luxury Gold) */}
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
                <Button type="button" variant="outline" size="icon" onClick={() => copyToClipboard(inviteCode, "Code")} className="rounded-xl" style={{ border: '1px solid #1a1f2e', color: '#F0A500' }}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Invitation link</p>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="text-xs bg-goldBg border border-goldBorder rounded-xl text-white" />
                <Button type="button" variant="outline" size="icon" onClick={() => copyToClipboard(inviteLink, "Link")} className="border-goldBorder text-goldPrimary hover:bg-goldPrimary/10">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {typeof navigator !== "undefined" && "share" in navigator && (
              <Button
                type="button"
                className="w-full bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-black font-bold rounded-xl hover:opacity-90 shadow-lg shadow-amber-500/20"
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

      <BottomNav />
    </div>
  );
};

export default Index;