import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ShieldCheck, AlertCircle, Wallet, User, Lock } from "lucide-react";
import { z } from "zod";
import PageHeader from "@/components/PageHeader";

const NETWORKS = ["TRC20", "BEP20", "ERC20"] as const;
const WALLET_NAMES = ["Binance", "Trust Wallet", "OKX", "Bybit", "Coinbase", "MetaMask", "Other"] as const;

const BindWallet = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);
  const [walletName, setWalletName] = useState<string>("Binance");
  const [network, setNetwork] = useState<string>("TRC20");
  const [address, setAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [withdrawalPassword, setWithdrawalPassword] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/profile/${user._id}`);
        const data = await response.json();
        if (data.success && data.profile) {
          const p = data.profile;
          if (p.walletAddress) {
            setAddress(p.walletAddress);
            setNetwork(p.walletNetwork || "TRC20");
            setWalletName(p.walletName || "Binance");
            setCustomerName(p.customerName || "");
            setHasExisting(true);
          }
        }
      } catch (err) {
        // silently fail
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const schema = z.object({
      walletName: z.string().trim().min(2).max(40),
      network: z.string().refine(v => (NETWORKS as readonly string[]).includes(v), { message: "Select a valid network" }),
      address: z.string().trim().min(20, "Wallet address too short").max(120, "Wallet address too long"),
      customerName: z.string().trim().min(1, "Customer name is required"),
      withdrawalPassword: z.string().min(6, "Password must be at least 6 characters"),
    });

    try {
      schema.parse({ walletName, network, address, customerName, withdrawalPassword });
      setSaving(true);

      const response = await fetch('/api/wallet/bind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          walletAddress: address,
          network,
          walletName,
          customerName,
          withdrawalPassword,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Wallet bound successfully!");
        navigate('/mine');
      } else {
        throw new Error(result.message || "Failed to save wallet");
      }
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || err.message || "Failed to save wallet");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <PageHeader title="Binding Wallet" />
      <div className="px-5 pt-3 flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
          <Wallet className="h-5 w-5 text-accent" />
        </div>
        <p className="text-xs text-muted-foreground">Bind your wallet address and set withdrawal security.</p>
      </div>
      <div className="px-5 mt-4">
        <Card className="p-5 bg-card border border-border rounded-2xl shadow-[var(--shadow-tile)]">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label>Wallet Name</Label>
                <Select value={walletName} onValueChange={setWalletName}>
                  <SelectTrigger><SelectValue placeholder="Select wallet" /></SelectTrigger>
                  <SelectContent>{WALLET_NAMES.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Network</Label>
                <Select value={network} onValueChange={setNetwork} disabled={hasExisting}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{NETWORKS.map(n => <SelectItem key={n} value={n}>USDT • {n}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Wallet Address</Label>
                <Input id="addr" value={address} onChange={e => setAddress(e.target.value.trim())} placeholder={network === "TRC20" ? "T..." : "0x..."} className="font-mono text-sm" required />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Customer Name</Label>
                <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Your full name" required />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Withdrawal Password</Label>
                <Input type="password" value={withdrawalPassword} onChange={e => setWithdrawalPassword(e.target.value)} placeholder="Min 6 characters" required />
              </div>
              <div className="flex items-start gap-2 text-xs text-accent bg-accent/10 p-3 rounded-lg border border-accent/20">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>Double-check your address. <span className="font-semibold">Cannot be recovered</span> if wrong.</p>
              </div>
              <Button type="submit" className="w-full h-11 text-base font-semibold bg-primary text-primary-foreground hover:opacity-90" disabled={saving}>
                {saving ? "Saving..." : hasExisting ? "Update Wallet" : "Bind Wallet"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BindWallet;