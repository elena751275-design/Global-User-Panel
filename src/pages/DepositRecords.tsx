import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
// import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import { toast } from "sonner";

interface DepositRow {
  _id: string;
  amount: number;
  network: string;
  status: "pending" | "confirmed" | "rejected";
  tx_hash: string | null;
  createdAt: string;
  admin_note: string | null;
}

const statusStyle: Record<DepositRow["status"], string> = {
  pending: "bg-accent/15 text-accent border-accent/30",
  confirmed: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

const DepositRecords = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<DepositRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeposits = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/deposits/${user._id}`);
        const data = await response.json();

        if (data.success) {
          setRows(data.deposits ?? []);
        } else {
          throw new Error(data.message || "Failed to fetch deposit records");
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to load deposit records.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeposits();
  }, [user]);

return (
    <div className="min-h-screen bg-goldBg pb-10">
      <PageHeader title="Deposit Records" />

      <div className="px-5 pt-5 space-y-3">
        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : rows.length === 0 ? (
          <div className="luxury-card p-8 text-center text-sm text-gray-400">
            No deposit records yet.
          </div>
        ) : (
          rows.map((r) => (
            <div key={r._id} className="luxury-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold gold-gradient-text">
                    {Number(r.amount).toFixed(2)}{" "}
                    <span className="text-xs font-normal text-gray-400">USDT</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.network}</p>
                </div>
                <Badge variant="outline" className={statusStyle[r.status]}>
                  {r.status}
                </Badge>
              </div>
              {r.tx_hash && (
                <p className="text-[11px] text-gray-400 mt-2 break-all">
                  TX: {r.tx_hash}
                </p>
              )}
              <p className="text-[11px] text-gray-400 mt-1">
                {new Date(r.createdAt).toLocaleString()}
              </p>
              {r.admin_note && (
                <p className="text-xs mt-2 p-2 bg-[#0f131e] rounded-lg text-gray-400">
                  Note: {r.admin_note}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DepositRecords;