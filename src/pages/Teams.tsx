import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
// Card components replaced with luxury-card divs
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
// import { supabase } from "@/integrations/supabase/client";
import { Users, Wallet, TrendingUp, UserCircle2 } from "lucide-react";

interface TeamMember {
  user_id: string;
  username: string | null;
  created_at: string;
  recharge: number;
  commission: number;
}

const COMMISSION_RATE = 0.1;

const Teams = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        // Supabase fetching logic removed
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const totalSize = members.length;
  const totalRecharge = members.reduce((s, m) => s + m.recharge, 0);
  const totalCommission = members.reduce((s, m) => s + m.commission, 0);

  const stats = [
    { icon: Users, label: "Team Size", value: totalSize.toString(), tint: "primary" as const },
    { icon: Wallet, label: "Team Recharge", value: `$${totalRecharge.toFixed(2)}`, tint: "accent" as const },
    { icon: TrendingUp, label: "Commission Earned", value: `$${totalCommission.toFixed(2)}`, tint: "primary" as const },
  ];

return (
    <div className="min-h-screen pb-24 bg-goldBg">
      <PageHeader title="My Team" />

      <div className="px-5 mt-8">
        <div className="grid grid-cols-3 gap-2.5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="luxury-card p-3 flex flex-col items-center text-center gap-1.5"
            >
              <span
                className={`h-9 w-9 rounded-xl flex items-center justify-center border ${
                  s.tint === "primary"
                    ? "bg-luxuryGold-main/10 border-luxuryGold-main/20"
                    : "bg-luxuryGold-main/10 border-luxuryGold-main/20"
                }`}
              >
                <s.icon
                  className="h-4.5 w-4.5 text-luxuryGold-main"
                  strokeWidth={1.7}
                />
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 leading-tight">
                {s.label}
              </span>
              <span className="text-sm font-bold gold-gradient-text">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mt-5">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-luxuryGold-main" />
          Team Members
        </h2>

        {loading ? (
          <div className="space-y-2.5">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="luxury-card p-8 flex flex-col items-center text-center gap-2">
            <Users className="h-10 w-10 text-gray-400/50" strokeWidth={1.5} />
            <p className="text-sm text-gray-400">
              No team members yet. Share your invitation code to grow your team.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {members.map((m) => (
              <div
                key={m.user_id}
                className="luxury-card p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-xl bg-luxuryGold-main/10 border border-luxuryGold-main/20 flex items-center justify-center">
                    <UserCircle2 className="h-6 w-6 text-luxuryGold-main" strokeWidth={1.5} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brandHeading truncate">
                      {m.username || `User ${m.user_id.slice(0, 6)}`}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Joined {new Date(m.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 pt-3 border-t border-goldBorder/60">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">
                      Recharge
                    </p>
                    <p className="text-sm font-bold text-white">
                      ${m.recharge.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">
                      Commission (10%)
                    </p>
                    <p className="text-sm font-bold gold-gradient-text">
                      ${m.commission.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Teams;