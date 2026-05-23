import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";
import { productsByPlatform, type Product } from "@/data/products";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";

const platformConfig: Record<string, { commission: number; minBalance: number; maxBalance: number | null; rangeLabel: string }> = {
  Amazon: { commission: 4, minBalance: 20, maxBalance: 499, rangeLabel: "20~499" },
  Alibaba: { commission: 8, minBalance: 499, maxBalance: 899, rangeLabel: "499~899" },
  Aliexpress: { commission: 12, minBalance: 899, maxBalance: null, rangeLabel: "899+" },
};

const MAX_DAILY = 25;

const PlatformDetail = () => {
  const { platform } = useParams<{ platform: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [accountBalance, setAccountBalance] = useState(0);
  const [dailyOrderCount, setDailyOrderCount] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [showProduct, setShowProduct] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [pendingCombo, setPendingCombo] = useState<any>(null);
  const [comboPopup, setComboPopup] = useState(false);

  const config = platformConfig[platform || ""] || platformConfig.Amazon;
  const products = productsByPlatform[platform || ""] || [];
  const dailyRemaining = Math.max(0, MAX_DAILY - dailyOrderCount);

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!userId) return;

    const cachedBalance = localStorage.getItem('user-balance');
    const cachedCount = localStorage.getItem('daily-order-count');
    if (cachedBalance) setAccountBalance(Number(cachedBalance));
    if (cachedCount) setDailyOrderCount(Number(cachedCount));

    fetch(`http://localhost:5001/api/profile/order-status/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAccountBalance(Number(data.balance ?? 0));
          setDailyOrderCount(Number(data.dailyOrderCount ?? 0));
          setTotalCommission(Number(data.totalCommission ?? 0));
          localStorage.setItem('user-balance', String(data.balance ?? 0));
          localStorage.setItem('daily-order-count', String(data.dailyOrderCount ?? 0));
        }
      })
      .catch(() => {})
      .finally(() => setInitialized(true));
  }, [user]);

  const grabOrder = async () => {
    if (dailyOrderCount >= MAX_DAILY) {
      toast({ title: "Daily Limit Reached", description: "You have completed your daily limit of 25 orders.", variant: "destructive" });
      return;
    }

    const nextOrderNum = dailyOrderCount + 1;
    const userId2 = user?._id || user?.id;
    if (userId2) {
      try {
        const incRes = await fetch(`http://localhost:5001/api/combo/incomplete/${userId2}`);
        const incData = await incRes.json();
        if (incData.success && incData.hasIncomplete) {
          setPendingCombo(incData.order);
          setComboPopup(true);
          return;
        }

        const checkRes = await fetch(`http://localhost:5001/api/combo/check/${userId2}/${nextOrderNum}`);
        const checkData = await checkRes.json();
        if (checkData.success && checkData.matched) {
          setPendingCombo(checkData.comboInfo);
          if (checkData.isBlocked) {
            setComboPopup(true);
            return;
          }
          navigate(`/record?tab=incomplete&orderNum=${nextOrderNum}`);
          return;
        }
      } catch (e) { /* continue */ }
    }

    const bal = accountBalance;
    if (bal < config.minBalance) {
      toast({
        title: "⚠️ Insufficient Balance",
        description: `${platform} only allows users with balances ${config.rangeLabel} to grab orders.`,
        variant: "destructive",
      });
      return;
    }
    if (config.maxBalance && bal > config.maxBalance) {
      toast({
        title: "⚠️ Balance Exceeded",
        description: `${platform} only allows users with balances ${config.rangeLabel} to grab orders.`,
        variant: "destructive",
      });
      return;
    }

    const randomIndex = Math.floor(Math.random() * products.length);
    setCurrentProduct(products[randomIndex]);
    setShowProduct(true);
    setOrderSubmitted(false);
  };

  const submitOrder = () => {
    if (!currentProduct) return;
    setOrderSubmitted(true);

    const commission = currentProduct.commission;
    const newBalance = accountBalance + commission;
    const newCount = dailyOrderCount + 1;

    setAccountBalance(newBalance);
    setDailyOrderCount(newCount);
    setTotalCommission(prev => prev + commission);
    localStorage.setItem('user-balance', String(newBalance));
    localStorage.setItem('daily-order-count', String(newCount));

    const userId = user?._id || user?.id;
    if (userId) {
      fetch('http://localhost:5001/api/profile/complete-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, commission, platform }),
      }).catch(err => console.error("Failed to persist order:", err));
    }

    toast({
      title: "✅ Order Completed!",
      description: `You earned $${commission.toFixed(2)} commission.`,
    });

    setTimeout(() => {
      setShowProduct(false);
      setCurrentProduct(null);
      setOrderSubmitted(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title={platform || "Platform"} onBack={() => navigate("/menu")} />
      <div className="px-5 pt-4">
        <Card className="bg-card border border-border rounded-2xl shadow-[var(--shadow-tile)]">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Account Balance</p>
            <p className="text-3xl font-extrabold mt-2 gold-text">{accountBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className="text-xs font-medium text-muted-foreground mt-1">USDT</p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Card - IMPROVED GRID */}
      <div className="px-5 mt-4">
        <Card className="bg-card border border-border rounded-2xl shadow-[var(--shadow-tile)]">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="border-b border-r border-border pb-4 pr-4">
                <p className="text-2xl font-bold text-foreground text-center">{dailyOrderCount}</p>
                <p className="text-xs text-muted-foreground text-center mt-2 font-medium">Today's Orders</p>
              </div>
              <div className="border-b border-border pb-4">
                <p className="text-2xl font-bold gold-text text-center">{totalCommission.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground text-center mt-2 font-medium">Commission</p>
              </div>
              <div className="border-r border-border pr-4 pt-2">
                <p className="text-2xl font-bold text-foreground text-center">{dailyRemaining}</p>
                <p className="text-xs text-muted-foreground text-center mt-2 font-medium">Remaining</p>
              </div>
              <div className="pt-2">
                <p className="text-2xl font-bold text-foreground text-center">{config.commission}%</p>
                <p className="text-xs text-muted-foreground text-center mt-2 font-medium">Commission</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grab Order Button */}
      <div className="px-8 mt-8">
        <Button
          onClick={grabOrder}
          className="w-full h-14 rounded-full text-lg font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-[var(--shadow-glow-violet)] transition-all"
          disabled={dailyOrderCount >= MAX_DAILY || !initialized}
        >
          {dailyOrderCount >= MAX_DAILY ? "Daily Limit Reached" : initialized ? "Grab the order immediately" : "Loading..."}
        </Button>
      </div>

      {/* Global Progress */}
      <div className="px-8 mt-4 text-center space-y-1">
        <p className="text-sm font-medium text-muted-foreground">
          Completed: <span className="font-bold text-accent">{dailyOrderCount}</span> / {MAX_DAILY} orders
        </p>
        <p className="text-xs text-muted-foreground">
          Range: {config.rangeLabel} USDT | Commission: {config.commission}%
        </p>
      </div>

      {/* Hints */}
      <div className="px-5 mt-6">
        <p className="text-sm font-semibold text-muted-foreground mb-3">💡 Tips:</p>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">1: {config.commission}% commission on completed transactions</p>
          <p className="text-xs text-muted-foreground">2: Complete orders as soon as possible to avoid delays</p>
          <p className="text-xs text-muted-foreground">3: Daily limit of {MAX_DAILY} orders across all platforms</p>
        </div>
      </div>

      {/* Product Dialog */}
      <Dialog open={showProduct} onOpenChange={(open) => !orderSubmitted && setShowProduct(open)}>
        <DialogContent className="max-w-sm mx-auto bg-card border border-border">
          <DialogHeader>
            <DialogTitle className="text-center">Order #{dailyOrderCount + 1}</DialogTitle>
          </DialogHeader>
          {currentProduct && (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden border border-border">
                <img src={currentProduct.image} alt={currentProduct.name} className="w-full h-48 object-cover" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{currentProduct.name}</h3>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="font-bold">${currentProduct.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-muted-foreground">Commission</span>
                  <span className="font-bold gold-text">+${currentProduct.commission.toFixed(2)}</span>
                </div>
              </div>
              {orderSubmitted ? (
                <div className="flex flex-col items-center gap-2 py-4">
                  <CheckCircle className="h-12 w-12 text-success" />
                  <p className="font-bold text-success">Order Completed!</p>
                  <p className="text-sm text-muted-foreground">+${currentProduct.commission.toFixed(2)} earned</p>
                </div>
              ) : (
                <Button onClick={submitOrder} className="w-full h-12 rounded-full text-base font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-[var(--shadow-glow-violet)]">
                  Submit order
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Combo Order Popup */}
      {comboPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm mx-4 shadow-lg text-center space-y-4">
            <p className="text-lg font-bold text-foreground">⚠️ Incomplete Combo</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {pendingCombo && (Number(accountBalance || 0)) < (Number(pendingCombo.rechargeShortage) || 0)
                ? <>Balance insufficient. Recharge <span className="font-bold text-accent">${pendingCombo.rechargeShortage?.toFixed(2)}</span> to submit</>
                : <>Complete your pending combo order</>
              }
            </p>
            <button onClick={() => { setComboPopup(false); navigate('/record?tab=incomplete'); }}
              className="w-full rounded-lg bg-primary text-primary-foreground py-3 text-sm font-semibold hover:opacity-90 transition-opacity">
              Go to Incomplete Orders
            </button>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
};

export default PlatformDetail;
