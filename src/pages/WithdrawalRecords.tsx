import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import PageHeader from "@/components/PageHeader";
import { toast } from "sonner";

interface WithdrawalRow {
  _id: string;
  amount: number;
  walletName: string;
  walletAddress: string;
  walletNetwork: string;
  customerName: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

const statusBadge: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  approved: "bg-green-500/15 text-green-400 border border-green-500/30",
  rejected: "bg-red-500/15 text-red-400 border border-red-500/30",
};

const statusLabel: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const WithdrawalRecords = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<WithdrawalRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const userId = user._id || user.id;
        const response = await fetch(`/api/withdrawals/${userId}`);
        const data = await response.json();
        if (data.success) {
          setRecords(data.withdrawals || []);
        }
      } catch (err: any) {
        toast.error("Failed to load withdrawal records.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [user]);

return (
    <div className="min-h-screen bg-goldBg pb-10">
      <PageHeader title="Withdrawal Records" />
      <div className="px-5 pt-5 space-y-3">
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-8">Loading records...</p>
        ) : records.length === 0 ? (
          <div className="luxury-card p-8 text-center text-sm text-gray-400">
            No withdrawal records yet.
          </div>
        ) : (
          <>{records.map((record) => (
            <div key={record._id} className="luxury-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-lg font-bold gold-gradient-text">
                    {Number(record.amount).toFixed(2)}{" "}
                    <span className="text-xs font-normal text-gray-400">USDT</span>
                  </p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusBadge[record.status] || statusBadge.pending}`}>
                  {statusLabel[record.status] || record.status}
                </span>
              </div>

              <div className="space-y-1 text-xs text-gray-400">
                {record.walletName && (
                  <p className="flex items-center gap-1">
                    <span className="text-gray-400/60">Wallet:</span>
                    <span className="font-medium text-white">{record.walletName}</span>
                    {record.walletNetwork && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-luxuryGold-main/10 text-luxuryGold-main">{record.walletNetwork}</span>
                    )}
                  </p>
                )}
                <p className="font-mono text-[11px] break-all text-gray-400">
                  {record.walletAddress}
                </p>
                <p className="text-[10px]">
                  {new Date(record.createdAt).toLocaleString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}</>
        )}
      </div>
    </div>
  );
};

export default WithdrawalRecords;