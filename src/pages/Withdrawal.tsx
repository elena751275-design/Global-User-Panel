import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { AlertCircle, ShieldCheck, Link as LinkIcon, Lock, Wallet } from "lucide-react";
import { z } from "zod";
import PageHeader from "@/components/PageHeader";

const Withdrawal = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [walletNetwork, setWalletNetwork] = useState("");
  const [walletName, setWalletName] = useState("");
  const [isWalletBound, setIsWalletBound] = useState(false);
  const [withdrawalPassword, setWithdrawalPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) { setLoading(false); return; }
      setLoading(true);
      try {
        const res = await fetch(`/api/profile/${user._id || user.id}`);
        const data = await res.json();
        if (data.success && data.profile) {
          const p = data.profile;
          setBalance(Number(p.balance) || 0);
          setWalletAddress(p.walletAddress || "");
          setWalletNetwork(p.walletNetwork || "");
          setWalletName(p.walletName || "");
          setIsWalletBound(Boolean(p.isWalletBound));
        }
      } catch (err: any) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const amountNum = parseFloat(amount) || 0;
  const hasWallet = isWalletBound;

  const maskedAddress = walletAddress.length > 14
    ? `${walletAddress.slice(0, 8)}••••${walletAddress.slice(-6)}`
    : walletAddress;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!hasWallet) {
      toast.error("Please bind your wallet first");
      navigate("/bind-wallet");
      return;
    }
    setSubmitting(true);
    try {
      const schema = z.object({
        amount: z.coerce.number().min(1, "Minimum 1 USDT").max(balance, "Insufficient balance"),
        withdrawalPassword: z.string().min(1, "Withdrawal password is required"),
      });
      schema.parse({ amount, withdrawalPassword });

      const response = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id || user.id,
          amount: amountNum,
          withdrawalPassword,
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.message);
      toast.success("Withdrawal request submitted!");
      setBalance(result.balance ?? balance - amountNum);
      navigate("/withdrawal-records");
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || err.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <PageHeader title="Withdraw USDT" />
      <div className="px-5 pt-3 text-sm text-muted-foreground">
        Available: <span className="gold-text font-bold">${balance.toFixed(2)}</span>
      </div>
      <div className="px-5 mt-4">
        <Card className="p-4 bg-card border border-border rounded-2xl shadow-[var(--shadow-tile)]">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : !hasWallet ? (
            <div className="space-y-4 py-2 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center">
                <LinkIcon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold">No Wallet Bound</h3>
              <p className="text-sm text-muted-foreground mt-1">Bind your wallet address before requesting a withdrawal.</p>
              <Button className="w-full bg-primary text-primary-foreground hover:opacity-90" onClick={() => navigate("/bind-wallet")}>
                Bind Wallet Now
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Bound Wallet Read-Only */}
              <div className="rounded-xl border border-border bg-secondary/60 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-success" />
                    <span className="text-xs font-medium text-muted-foreground">Bound Wallet</span>
                  </div>
                  <button type="button" onClick={() => navigate("/bind-wallet")} className="text-xs text-accent hover:underline">
                    Manage
                  </button>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-3.5 w-3.5 text-accent" />
                    <p className="text-sm font-semibold">{walletName}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-accent font-semibold">
                      {walletNetwork}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground break-all">{walletAddress}</p>
                </div>
              </div>

              {/* Amount */}
              <div>
                <Label htmlFor="amount">Amount (USDT)</Label>
                <Input id="amount" type="number" step="0.01" min={1} max={balance} value={amount} onChange={e => setAmount(e.target.value)} required />
                <p className="text-xs text-muted-foreground mt-1">Min: 1 USDT</p>
              </div>

              {/* Withdrawal Password */}
              <div>
                <Label htmlFor="wdpass" className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" /> Withdrawal Password
                </Label>
                <Input id="wdpass" type="password" value={withdrawalPassword} onChange={e => setWithdrawalPassword(e.target.value)} placeholder="Enter your withdrawal password" required />
              </div>

              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-accent/10 border border-accent/20 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
                <p>Withdrawals are processed by admin within 24 hours. Funds will be sent to your bound wallet.</p>
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:opacity-90" disabled={submitting || balance < 1}>
                {submitting ? "Submitting..." : "Submit Withdrawal"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Withdrawal;