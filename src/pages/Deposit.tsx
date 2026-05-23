import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, ArrowLeft, QrCode, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const QUICK_AMOUNTS = [20, 50, 100, 200, 300, 500, 1000, 2000, 5000];

interface WalletInfo {
  label: string;
  address: string;
  network: string;
}

const Deposit = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"input" | "payment">("input");
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const fetchWallet = async () => {
    setLoadingWallet(true);
    try {
      const res = await fetch('/api/deposit/wallet-address');
      const data = await res.json();
      if (data.success && data.address) {
        setWalletInfo(data);
      } else {
        toast.error(data.message || "No wallet address available. Contact admin.");
        setStep("input");
      }
    } catch (err) {
      toast.error("Failed to get wallet address. Server may be down.");
      setStep("input");
    } finally {
      setLoadingWallet(false);
    }
  };

  const handleAmountClick = (val: number) => {
    setAmount(String(val));
  };

  const handleSubmitAmount = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    await fetchWallet();
    setStep("payment");
  };

  const copyAddress = () => {
    if (!walletInfo?.address) return;
    navigator.clipboard.writeText(walletInfo.address);
    toast.success("Wallet address copied to clipboard");
  };

  const handleConfirm = async () => {
    if (!user || !walletInfo) return;
    const num = parseFloat(amount);
    setConfirming(true);
    try {
      const res = await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id || user.id,
          amount: num,
          walletAddress: walletInfo.address,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Deposit submitted! Awaiting admin approval.");
        navigate("/", { replace: true });
      } else {
        toast.error(data.message || "Failed");
      }
    } catch {
      toast.error("Failed to submit deposit");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <PageHeader title="Deposit USDT" />

      {/* Step 1: Amount Selection */}
      {step === "input" && (
        <div className="px-5 mt-4 space-y-4">
          <Card className="p-4 bg-card border border-border rounded-2xl shadow-[var(--shadow-tile)]">
            <h2 className="font-semibold mb-4">Select Deposit Amount</h2>
            <div>
              <Label htmlFor="amount">Amount (USDT)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min={1}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
                className="text-lg font-bold"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {QUICK_AMOUNTS.map(val => (
                <button
                  key={val}
                  onClick={() => handleAmountClick(val)}
                  className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                    amount === String(val)
                      ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-glow-violet)]"
                      : "bg-card border-border text-foreground hover:border-primary/40"
                  }`}
                >
                  {val} USDT
                </button>
              ))}
            </div>

            <Button
              onClick={handleSubmitAmount}
              className="w-full mt-5 bg-primary text-primary-foreground hover:opacity-90 shadow-[var(--shadow-glow-violet)] h-12 text-base font-semibold"
            >
              Submit Deposit
            </Button>
          </Card>
        </div>
      )}

      {/* Step 2: QR Code + Wallet Address */}
      {step === "payment" && (
        <div className="px-5 mt-4 space-y-4">
          <button onClick={() => setStep("input")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <Card className="p-5 bg-card border border-border rounded-2xl shadow-[var(--shadow-tile)] text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <ShieldCheck className="h-5 w-5 text-success" />
              <span className="text-sm font-semibold text-success">Deposit {amount} USDT</span>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-4">
              {walletInfo?.address ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(walletInfo.address)}`}
                  alt="QR Code"
                  className="w-48 h-48 rounded-xl border border-border"
                />
              ) : (
                <div className="w-48 h-48 rounded-xl border border-border bg-secondary flex items-center justify-center">
                  <QrCode className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground mb-3">
              Scan QR code or copy the address below to send USDT
            </p>

            {/* Wallet Address */}
            <div className="rounded-xl border border-border bg-secondary p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-left min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {walletInfo?.network} · {walletInfo?.label}
                  </p>
                  <p className="font-mono text-xs text-foreground break-all mt-0.5">
                    {walletInfo?.address || "Loading..."}
                  </p>
                </div>
                <Button size="icon" variant="ghost" onClick={copyAddress} className="shrink-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-accent/10 border border-accent/20 p-3 rounded-lg mt-4 text-left">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
              <p>Send exactly {amount} USDT on {walletInfo?.network} network. Click confirm after payment.</p>
            </div>

            <Button
              onClick={handleConfirm}
              disabled={confirming || !walletInfo}
              className="w-full mt-4 bg-primary text-primary-foreground hover:opacity-90 shadow-[var(--shadow-glow-violet)] h-12 text-base font-semibold"
            >
              {confirming ? "Submitting..." : "I have paid — Confirm Deposit"}
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Deposit;