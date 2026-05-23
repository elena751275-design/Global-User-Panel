import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import amazonLogo from "@/assets/platform-amazon.png";
import alibabaLogo from "@/assets/platform-alibaba.png";
import aliexpressLogo from "@/assets/platform-aliexpress.png";

const vipFilters = ["All", "VIP 1", "VIP 2", "VIP 3"];

const platforms = [
  { id: 1, name: "Amazon", vipLevel: "VIP 1", minBalance: 20, maxBalance: 499, commission: 4, logo: amazonLogo },
  { id: 2, name: "Alibaba", vipLevel: "VIP 2", minBalance: 499, maxBalance: 899, commission: 8, logo: alibabaLogo },
  { id: 3, name: "Aliexpress", vipLevel: "VIP 3", minBalance: 899, maxBalance: null, commission: 12, logo: aliexpressLogo },
];

const getVipBadgeColor = (vip: string) => "vip-badge";

const Menu = () => {
  const [selectedVip, setSelectedVip] = useState("All");
  const [balance, setBalance] = useState<number>(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?._id && !user?.id) return;
    const userId = user._id || user.id;
    fetch(`http://localhost:5001/api/profile/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.profile) {
          setBalance(Number(data.profile.balance ?? 0));
        } else {
          fetch(`http://localhost:3002/api/admin/users/search?email=${encodeURIComponent(user.email || '')}`)
            .then(r => r.json())
            .then(d => { if (d.balance !== undefined) setBalance(Number(d.balance)); })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [user]);

  const filteredPlatforms = selectedVip === "All"
    ? platforms
    : platforms.filter((p) => p.vipLevel === selectedVip);

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Menu" showBack={false} />

      {/* Balance Card - IMPROVED */}
      <div className="px-5 py-4">
        <div className="rounded-2xl bg-card border border-border p-4 shadow-[var(--shadow-tile)]">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Available Balance</p>
          <p className="mt-2 gold-text text-4xl font-extrabold tracking-tight">{balance.toFixed(2)}</p>
          <p className="text-xs font-medium text-muted-foreground mt-1">USDT</p>
        </div>
      </div>

      {/* VIP Filter Tabs - IMPROVED SPACING */}
      <div className="px-5 py-3">
        <div className="flex gap-2">
          {vipFilters.map((vip) => (
            <button
              key={vip}
              onClick={() => setSelectedVip(vip)}
              className={cn(
                "flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all border",
                selectedVip === vip
                  ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-glow-violet)]"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40"
              )}
            >
              {vip}
            </button>
          ))}
        </div>
      </div>

      {/* Platform List - UNIFORM SPACING */}
      <div className="px-5 mt-1 space-y-3">
        {filteredPlatforms.map((platform) => (
          <Card
            key={platform.id}
            className="bg-card border border-border rounded-2xl shadow-[var(--shadow-tile)] overflow-hidden cursor-pointer hover:border-primary/40 hover:shadow-[var(--shadow-glow-violet)] transition-all"
            onClick={() => navigate(`/platform/${platform.name}`)}
          >
            <CardContent className="p-4">
              <div className="mb-3">
                <span className={cn("text-xs font-bold px-2.5 py-1 rounded-md", getVipBadgeColor(platform.vipLevel))}>
                  {platform.vipLevel}
                </span>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-lg bg-white/95 border border-border flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
                  <img src={platform.logo} alt={`${platform.name} logo`} width={56} height={56} loading="lazy" className="h-full w-full object-contain p-2" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-foreground">{platform.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Available balance: <span className="gold-text font-bold">{balance.toFixed(2)} USDT</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Range: {platform.minBalance}USDT{platform.maxBalance ? `-${platform.maxBalance}USDT` : "+USDT"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Commissions: <span className="gold-text font-bold">{platform.commission}%</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <p className="text-center text-muted-foreground text-xs py-4 font-medium">No more</p>
      </div>

      <BottomNav />
    </div>
  );
};

export default Menu;
