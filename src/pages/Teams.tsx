import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="min-h-screen pb-24 bg-background">
      <PageHeader title="My Team" />

      <div className="px-5 mt-8">
        <div className="grid grid-cols-3 gap-2.5">
          {stats.map((s) => (
            <Card
              key={s.label}
              className="border-border bg-card shadow-[var(--shadow-tile)]"
            >
              <CardContent className="p-3 flex flex-col items-center text-center gap-1.5">
                <span
                  className={`h-9 w-9 rounded-xl flex items-center justify-center border ${
                    s.tint === "primary"
                      ? "bg-primary/15 border-primary/30"
                      : "bg-accent/15 border-accent/30"
                  }`}
                >
                  <s.icon
                    className={`h-4.5 w-4.5 ${s.tint === "primary" ? "text-accent" : "text-accent"}`}
                    strokeWidth={1.7}
                  />
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground leading-tight">
                  {s.label}
                </span>
                <span className="text-sm font-bold gold-text">{s.value}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="px-5 mt-5">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Team Members
        </h2>

        {loading ? (
          <div className="space-y-2.5">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="p-8 flex flex-col items-center text-center gap-2">
              <Users className="h-10 w-10 text-muted-foreground/50" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground">
                No team members yet. Share your invitation code to grow your team.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {members.map((m) => (
              <Card
                key={m.user_id}
                className="border-border bg-card shadow-[var(--shadow-tile)]"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                      <UserCircle2 className="h-6 w-6 text-accent" strokeWidth={1.5} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {m.username || `User ${m.user_id.slice(0, 6)}`}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Joined {new Date(m.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 pt-3 border-t border-border/60">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Recharge
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        ${m.recharge.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Commission (10%)
                      </p>
                      <p className="text-sm font-bold gold-text">
                        ${m.commission.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Teams;