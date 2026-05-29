import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

  // Fetch order status (balance + daily count) from backend on mount
  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!userId) return;

    // Show localStorage cache immediately
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
    // Global daily limit
    if (dailyOrderCount >= MAX_DAILY) {
      toast({ title: "Daily Limit Reached", description: "You have completed your daily limit of 25 orders.", variant: "destructive" });
      return;
    }

    // Check for combo order + incomplete order
    const nextOrderNum = dailyOrderCount + 1;
    const userId2 = user?._id || user?.id;
    if (userId2) {
      try {
        // First check: any existing incomplete combo order?
        const incRes = await fetch(`http://localhost:5001/api/combo/incomplete/${userId2}`);
        const incData = await incRes.json();
        if (incData.success && incData.hasIncomplete) {
          setPendingCombo(incData.order);
          // Always show popup for incomplete combos
          setComboPopup(true);
          return;
        }

        // Second check: combo match at this sequence
        const checkRes = await fetch(`http://localhost:5001/api/combo/check/${userId2}/${nextOrderNum}`);
        const checkData = await checkRes.json();
        if (checkData.success && checkData.matched) {
          setPendingCombo(checkData.comboInfo);
          if (checkData.isBlocked) {
            setComboPopup(true);
            return;
          }
          // Create incomplete order and redirect
          navigate(`/record?tab=incomplete&orderNum=${nextOrderNum}`);
          return;
        }
      } catch (e) { /* continue */ }
    }

    // Balance check per platform
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

    // Update local state immediately
    setAccountBalance(newBalance);
    setDailyOrderCount(newCount);
    setTotalCommission(prev => prev + commission);
    localStorage.setItem('user-balance', String(newBalance));
    localStorage.setItem('daily-order-count', String(newCount));

    // Persist to backend
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
    <div className="min-h-screen pb-20 bg-goldBg">
      <PageHeader title={platform || "Platform"} onBack={() => navigate("/menu")} />
      <div className="px-5 pt-4">
        <div className="luxury-card p-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Account Balance</p>
          <p className="text-2xl font-extrabold mt-1 gold-gradient-text">{accountBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-sm font-medium text-gray-400">USDT</span></p>
        </div>
      </div>

      {/* Stats Card */}
      <div className="px-5 mt-4">
        <div className="luxury-card p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="border-b border-r border-goldBorder pb-3">
              <p className="text-lg font-bold text-white">{dailyOrderCount}</p>
              <p className="text-xs text-gray-400">Today's Orders</p>
            </div>
            <div className="border-b border-goldBorder pb-3">
              <p className="text-lg font-bold gold-gradient-text">{totalCommission.toFixed(2)} USDT</p>
              <p className="text-xs text-gray-400">Today's commission</p>
            </div>
            <div className="border-r border-goldBorder pb-1">
              <p className="text-lg font-bold text-white">{dailyRemaining}</p>
              <p className="text-xs text-gray-400">Remaining Today</p>
            </div>
            <div className="pb-1">
              <p className="text-lg font-bold text-white">{config.commission}%</p>
              <p className="text-xs text-gray-400">Commission Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grab Order Button */}
      <div className="px-8 mt-8">
        <Button
          onClick={grabOrder}
          className="btn-gold w-full h-14 rounded-full text-lg font-bold"
          disabled={dailyOrderCount >= MAX_DAILY || !initialized}
        >
          {dailyOrderCount >= MAX_DAILY ? "Daily Limit Reached" : initialized ? "Grab the order immediately" : "Loading..."}
        </Button>
      </div>

      {/* Global Progress */}
      <div className="px-8 mt-4 text-center">
        <p className="text-sm text-gray-400">
          Completed: <span className="font-bold text-luxuryGold-main">{dailyOrderCount}</span> / {MAX_DAILY} orders today
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Balance Range: {config.rangeLabel} USDT | Commission: {config.commission}%
        </p>
      </div>

      {/* Hints */}
      <div className="px-5 mt-6">
        <p className="text-sm text-gray-400 font-medium">Hint:</p>
        <p className="text-xs text-gray-400 mt-1">
          1: {config.commission}% commission on completed transactions.
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          2: Complete orders as soon as possible after matching to avoid delays.
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          3: Daily limit of {MAX_DAILY} orders shared across all platforms.
        </p>
      </div>

      {/* Product Dialog */}
      <Dialog open={showProduct} onOpenChange={(open) => !orderSubmitted && setShowProduct(open)}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl" style={{ backgroundColor: '#0a0d14', border: '1px solid #1a1f2e' }}>
          <DialogHeader>
            <DialogTitle className="text-white text-center">Order #{dailyOrderCount + 1}</DialogTitle>
          </DialogHeader>
          {currentProduct && (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden border border-goldBorder">
                <img src={currentProduct.image} alt={currentProduct.name} className="w-full h-48 object-cover" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{currentProduct.name}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-400">Price</span>
                  <span className="font-bold text-white">${currentProduct.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-400">Commission</span>
                  <span className="font-bold gold-gradient-text">+${currentProduct.commission.toFixed(2)}</span>
                </div>
              </div>
              {orderSubmitted ? (
                <div className="flex flex-col items-center gap-2 py-4">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                  <p className="font-bold text-green-500">Order Completed!</p>
                  <p className="text-sm text-gray-400">
                    Commission +${currentProduct.commission.toFixed(2)} added
                  </p>
                </div>
              ) : (
                <Button onClick={submitOrder} className="btn-gold w-full h-12 rounded-full text-base font-bold">
                  Submit order
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Combo Order Restriction Popup */}
      {comboPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="luxury-card p-6 max-w-sm mx-4 shadow-lg text-center">
            <p className="text-lg font-bold text-white mb-2">Incomplete Combo Order</p>
            <p className="text-sm text-gray-400 mb-4">
              {pendingCombo && (Number(accountBalance || 0)) < (Number(pendingCombo.rechargeShortage) || 0)
                ? <>Your account balance is not enough, you need to recharge <span className="font-bold text-luxuryGold-main">${pendingCombo.rechargeShortage?.toFixed(2)}</span> to submit this order</>
                : <>You have an incomplete combo order at task #{pendingCombo?.comboOrderNumber || pendingCombo?.orderNumber}. Complete it in your Record page.</>
              }
            </p>
            <button onClick={() => { setComboPopup(false); navigate('/record?tab=incomplete'); }}
              className="w-full rounded-xl btn-gold py-2.5 text-sm font-semibold">
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