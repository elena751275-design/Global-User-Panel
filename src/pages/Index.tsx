import { useState, useEffect, useCallback } from "react";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Wallet, Users, UserPlus, Globe } from "lucide-react";
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
  { name: "Amazon", logo: partnerAmazon },
  { name: "Alibaba", logo: partnerAlibaba },
  { name: "AliExpress", logo: partnerAliexpress },
  { name: "eBay", logo: partnerEbay },
  { name: "Walmart", logo: partnerWalmart },
  { name: "Target", logo: partnerTarget },
  { name: "Rakuten", logo: partnerRakuten },
  { name: "PayPal", logo: partnerPaypal },
  { name: "DHL", logo: partnerDhl },
  { name: "FedEx", logo: partnerFedex },
  { name: "UPS", logo: partnerUps },
  { name: "Visa", logo: partnerVisa },
  { name: "Mastercard", logo: partnerMastercard },
  { name: "Stripe", logo: partnerStripe },
];

const quickActions = [
  { icon: TrendingUp, label: "Recharge" },
  { icon: Wallet, label: "Withdrawal" },
  { icon: Users, label: "Teams" },
  { icon: UserPlus, label: "Invitation" },
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

const liveWithdrawals = [
  { user: "***905", amount: 901.04 },
  { user: "***312", amount: 1250.00 },
  { user: "***748", amount: 530.50 },
  { user: "***156", amount: 2100.75 },
  { user: "***623", amount: 870.30 },
  { user: "***491", amount: 1450.00 },
  { user: "***837", amount: 320.60 },
  { user: "***264", amount: 1780.25 },
  { user: "***519", amount: 640.90 },
  { user: "***103", amount: 3200.00 },
  { user: "***672", amount: 455.15 },
  { user: "***888", amount: 1920.50 },
  { user: "***345", amount: 710.80 },
  { user: "***721", amount: 2450.35 },
  { user: "***198", amount: 560.00 },
];

const Index = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch real balance
  useEffect(() => {
    if (!user?._id && !user?.id) return;
    const userId = user._id || user.id;
    fetch(`http://localhost:5001/api/profile/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.profile) setBalance(Number(data.profile.balance ?? 0));
      })
      .catch(() => {});
  }, [user]);

  const nextItem = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % liveWithdrawals.length);
      setIsAnimating(false);
    }, 500);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextItem, 3000);
    return () => clearInterval(interval);
  }, [nextItem]);

  const current = liveWithdrawals[currentIndex];
  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Top Header Bar - midnight glass */}
      <div
        className="relative px-4 py-4 overflow-hidden"
        style={{ background: "var(--gradient-header)" }}
      >
        <div className="pointer-events-none absolute -top-12 -right-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-0 h-32 w-32 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <span className="h-9 w-9" />
          <span className="h-9 w-9" />
        </div>
      </div>

      {/* Real Balance Display - IMPROVED */}
      <div className="px-4 -mt-2 relative z-10">
        <div className="rounded-2xl glass p-4 flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="stat-label">Balance</p>
            <p className="mt-2 gold-text text-4xl font-extrabold tracking-tight">
              {balance.toFixed(2)}
            </p>
            <p className="text-xs font-medium text-muted-foreground mt-1">USDT</p>
          </div>
          <Wallet className="h-12 w-12 text-accent opacity-40 flex-shrink-0" strokeWidth={1.5} />
        </div>
      </div>

      {/* Quick Actions - UNIFIED */}
      <div className="px-4 mt-4 relative z-10">
        <div className="grid grid-cols-4 gap-3 rounded-2xl glass p-4">
          {quickActions.map((item) => (
            <button key={item.label} className="flex flex-col items-center gap-2.5 group">
              <div className="h-14 w-14 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center group-hover:bg-primary/25 transition-colors shadow-[0_0_18px_-8px_hsl(var(--primary)/0.3)]">
                <item.icon className="h-6 w-6 text-accent" strokeWidth={1.6} fill="hsl(var(--primary) / 0.3)" />
              </div>
              <span className="text-xs font-semibold text-foreground text-center leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Live Withdrawal Banner */}
      <div className="mx-4 mt-4">
        <Card className="bg-card border border-border rounded-2xl shadow-[var(--shadow-tile)] overflow-hidden relative">
          <Globe className="absolute -right-4 -bottom-4 h-24 w-24 text-[#B8860B] opacity-[0.03] pointer-events-none" />
          <CardContent className="p-4">
            <div
              className={`flex items-center gap-3 transition-all duration-500 ${
                isAnimating ? "opacity-0 -translate-y-3" : "opacity-100 translate-y-0"
              }`}
            >
              <div className="text-accent flex-shrink-0">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
                  <line x1="2" y1="12" x2="6" y2="12" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{current.user}</p>
                <p className="text-xs text-success font-medium">withdrawal successful</p>
              </div>
              <p className="text-sm font-bold gold-text flex-shrink-0">{current.amount.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Introduction - CONSISTENT */}
      <div className="px-4 mt-6">
        <h2 className="text-base font-bold text-foreground mb-4">Platform introduction</h2>
        <div className="grid grid-cols-2 gap-4">
          {platformItems.map((item) => (
            <Card key={item.title} className="overflow-hidden border border-border bg-card rounded-2xl shadow-[var(--shadow-tile)] hover:border-primary/40 hover:shadow-[0_0_15px_-3px_rgba(184,134,11,0.2)] transition-all cursor-pointer">
              <Globe className="absolute -right-2 -bottom-2 h-12 w-12 text-[#B8860B] opacity-[0.05] pointer-events-none" />
              <div className="aspect-video w-full overflow-hidden bg-secondary relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover grayscale-[40%] contrast-110"
                  loading="lazy"
                />
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-semibold text-foreground leading-tight">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Trusted Partners - UNIFORM */}
      <div className="px-4 mt-6 pb-4">
        <h2 className="text-base font-bold text-foreground mb-4 uppercase tracking-wide">
          Our Trusted Global Partners
        </h2>
        <div className="grid grid-cols-4 gap-2.5">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="aspect-square bg-card border border-border rounded-xl flex items-center justify-center p-2.5 shadow-[var(--shadow-tile)] hover:border-primary/40 transition-all"
            >
              <img
                src={partner.logo}
                alt={`${partner.name} logo`}
                width={64}
                height={64}
                loading="lazy"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;
