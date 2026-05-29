import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
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
    <div className="min-h-screen pb-20 bg-goldBg">
      <PageHeader title="Menu" showBack={false} />

      {/* Balance Card */}
      <div className="px-4 pt-2 pb-3">
        <div className="rounded-2xl p-4 luxury-card">
          <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-white/90">Available Balance</p>
          <p className="mt-2 flex items-baseline gap-1.5">
            <span className="gold-gradient-text text-4xl font-extrabold">{balance.toFixed(2)}</span>
            <span className="text-xs font-medium text-white/70">USDT</span>
          </p>
        </div>
      </div>

      {/* VIP Filter Tabs */}
      <div className="px-4 py-3">
        <div className="flex gap-2">
          {vipFilters.map((vip) => (
            <button
              key={vip}
              onClick={() => setSelectedVip(vip)}
              className={cn(
                "flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all border",
                selectedVip === vip
                  ? "btn-gold border-[#B38728]"
                  : "bg-[#0a0d14] text-gray-400 border-goldBorder hover:border-[#2a3f52]"
              )}
            >
              {vip}
            </button>
          ))}
        </div>
      </div>

      {/* Platform List */}
      <div className="px-4 space-y-3">
        {filteredPlatforms.map((platform) => (
          <div
            key={platform.id}
            onClick={() => navigate(`/platform/${platform.name}`)}
            className="rounded-2xl p-4 cursor-pointer transition-all duration-300 luxury-card"
          >
            <div className="mb-3">
              <Badge className="border-none font-bold text-[11px] px-2 py-0.5 shadow-lg shadow-amber-500/20" style={{ background: 'linear-gradient(to right, #BF953F, #FCF6BA, #B38728)', color: '#000000' }}>
                {platform.vipLevel}
              </Badge>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-xl bg-white/95 border border-goldBorder flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
                <img src={platform.logo} alt={`${platform.name} logo`} loading="lazy" className="h-full w-full object-contain p-2" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-white">{platform.name}</h3>
                <div className="mt-1.5 space-y-1">
                  <p className="text-sm text-gray-400">
                    Available balance: <span className="gold-gradient-text font-bold">{balance.toFixed(2)} USDT</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Range: {platform.minBalance}USDT{platform.maxBalance ? `-${platform.maxBalance}USDT` : "+USDT"}
                  </p>
                  <p className="text-sm text-gray-400">
                    Commissions: <span className="gold-gradient-text font-bold">{platform.commission}%</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        <p className="text-center text-gray-500 text-xs py-4 font-medium">No more</p>
      </div>

      <BottomNav />
    </div>
  );
};

export default Menu;
