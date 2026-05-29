import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import BottomNav from "@/components/BottomNav";
import { categories } from "@/data/tasks";
import { Clock, ChevronRight, AlertCircle, Wallet, Globe } from "lucide-react";
import { toast } from "sonner";
// import { supabase } from "@/integrations/supabase/client"; // Removed Supabase
import { useAuth } from "@/hooks/useAuth";
import PageHeader from "@/components/PageHeader";

interface PendingOrder {
  id: string;
  order_no: string;
  product_name: string;
  product_image: string | null;
  amount: number;
  commission: number;
  platform: string;
}

interface CurrentActiveTask extends PendingOrder {
  recharge_needed: boolean;
  recharge_amount: number;
}

const Tasks = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
  const [currentActiveTask, setCurrentActiveTask] = useState<CurrentActiveTask | null>(null);

  const fetchCurrentTask = useCallback(async () => {
    if (!user || !profile) return;
    try {
      const response = await fetch(`/api/tasks/current/${user.id}`);
      const data = await response.json();

      if (data.success && data.task) {
        setCurrentActiveTask(data.task);

        // If the task requires recharge, open the dialog immediately upon loading
        if (data.task.recharge_needed) {
          setPendingOrder(data.task);
          setRechargeOpen(true);
        }
      } else {
        setCurrentActiveTask(null);
      }
    } catch (err: any) {
      toast.error("Failed to load current task.");
      console.error("Failed to fetch current task:", err);
    }
  }, [user, profile]);

  useEffect(() => {
    if (user && profile) {
      fetchCurrentTask();
    }
  }, [user, profile, fetchCurrentTask]);

  // Real-time socket listener for new orders or status updates
  useEffect(() => {
    if (!user) return;

    // const orderChannel = supabase
    //   .channel('order-updates')
    //   .on(
    //     'postgres_changes',
    //     { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
    //     () => {
    //       fetchCurrentTask(); // Refresh task status immediately
    //       refreshProfile();   // Ensure balance is synced
    //     }
    //   )
    //   .subscribe();

    // return () => {
    //   supabase.removeChannel(orderChannel);
    // };
  }, [user, fetchCurrentTask, refreshProfile]);

  const handleGrabOrder = async () => {
    if (!user) return;
    setLoading(true);
    // try {
    //   // Use the robust RPC API instead of client-side filtering
    //   const { data, error } = await supabase.rpc('grab_order', { p_user_id: user.id });
      
    //   if (error) throw error;
      
    //   const result = data as any;
    //   if (!result.success) {
    //     if (result.needs_recharge) {
    //       setPendingOrder(result.order);
    //       setRechargeOpen(true);
    //     } else {
    //       toast.info(result.message || "No new orders available right now. Please check back later.");
    //     }
    //     return;
    //   }
      
    //   toast.success(`New order received: ${result.order.order_no}`);
    //   navigate("/record");
    // } catch (err: any) {
    //   toast.error(err.message || "Failed to grab order");
    // } finally {
    //   setLoading(false);
    // }
    toast.info("Order grabbing is temporarily disabled.");
    setLoading(false);
  };

  const rechargeAmount = pendingOrder ? Math.max(Number(pendingOrder.amount) - (profile?.balance || 0), 0) : 0;

return (
    <div className="min-h-screen pb-20 bg-goldBg relative overflow-hidden">
      <PageHeader title="Global Tasks" showBack={false} />
      <div className="px-5 pt-4">
        <div className="luxury-card p-4 relative overflow-hidden">
          <Globe className="absolute -right-6 -top-6 h-32 w-32 text-luxuryGold-main opacity-[0.04]" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Available Balance</p>
              <p className="text-2xl font-extrabold mt-1 gold-gradient-text">
                {(profile?.balance || 0).toFixed(2)} <span className="text-sm font-medium text-gray-400">USDT</span>
              </p>
            </div>
            <div className="gold-icon-3d">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
        </div>
        
        {currentActiveTask ? (
          <div className="luxury-card p-4 relative overflow-hidden mt-4">
            <Globe className="absolute -right-6 -top-6 h-32 w-32 text-luxuryGold-main opacity-[0.04]" />
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Current Task</p>
            <div className="flex items-center gap-3 mt-2">
              <img
                src={currentActiveTask.product_image || "/placeholder.svg"}
                alt={currentActiveTask.product_name}
                className="w-16 h-16 rounded-lg object-cover border border-goldBorder"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight line-clamp-2 text-brandHeading">{currentActiveTask.product_name}</p>
                <p className="text-xs text-gray-400 mt-1">Order No: {currentActiveTask.order_no}</p>
                <p className="text-xs text-gray-400">Amount: {currentActiveTask.amount.toFixed(2)} USDT</p>
                <p className="text-xs text-gray-400">Commission: {currentActiveTask.commission.toFixed(2)} USDT</p>
              </div>
            </div>
            <Button
              onClick={() => {
                if (currentActiveTask.recharge_needed) {
                  setPendingOrder(currentActiveTask);
                  setRechargeOpen(true);
                } else {
                  navigate("/record");
                }
              }}
              disabled={loading}
              className="w-full mt-4 btn-gold h-12 text-base"
            >
              {loading ? "Loading..." : currentActiveTask.recharge_needed ? "Recharge to Submit" : "Continue Task"}
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleGrabOrder}
            disabled={loading}
            className="w-full mt-4 btn-gold h-12 text-base text-lg"
          >
            {loading ? "Loading..." : "Grab Order"}
          </Button>
        )}
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto px-5 py-3 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors border ${
              selectedCategory === cat
                ? "btn-gold border-[#B38728]"
                : "bg-[#0a0d14] text-gray-400 border-goldBorder hover:border-goldBorder"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Info card */}
      <div className="px-5">
        <div className="luxury-card p-4 relative overflow-hidden">
          <Globe className="absolute -left-4 -bottom-4 h-20 w-20 text-luxuryGold-main opacity-[0.03]" />
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-luxuryGold-main" />
            <p className="text-sm font-semibold text-white">How it works</p>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed mt-1">
            Click "Grab Order" to receive your next order. Complete the order to earn commission. If you receive a combo order that exceeds your balance, you'll need to recharge before completing it.
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-goldBorder mt-2">
            <span className="text-xs text-gray-400">View your orders</span>
            <button
              onClick={() => navigate("/record")}
              className="text-xs text-luxuryGold-main font-semibold flex items-center gap-1"
            >
              Record <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Recharge Popup */}
      <Dialog open={rechargeOpen} onOpenChange={setRechargeOpen}>
        <DialogContent className="max-w-sm mx-auto p-0 overflow-hidden border-0 rounded-2xl">
          <div className="p-6 text-white" style={{ background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 60%, #0a0d14 100%)' }}>
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-luxuryGold-main/10 border border-luxuryGold-main/20 backdrop-blur mx-auto mb-3">
              <AlertCircle className="h-8 w-8 text-luxuryGold-main" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-white text-center text-lg">Recharge Required</DialogTitle>
              <DialogDescription className="text-gray-400 text-center text-sm">
                You have received a combo order. Please recharge to continue.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-5 space-y-3 bg-[#0a0d14]">
            {pendingOrder && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Order No.</span>
                  <span className="font-medium text-white">{pendingOrder.order_no}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Order amount</span>
                  <span className="font-medium text-white">{Number(pendingOrder.amount).toFixed(2)} USDT</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Your balance</span>
                  <span className="font-medium text-white">{(profile?.balance || 0).toFixed(2)} USDT</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-goldBorder">
                  <span className="text-sm font-semibold text-white">Recharge needed</span>
                  <span className="text-xl font-bold gold-gradient-text">{rechargeAmount.toFixed(2)} USDT</span>
                </div>
              </>
            )}

            <DialogFooter className="flex-row gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-goldBorder text-gray-400 hover:bg-[#1a1f2e]"
                onClick={() => setRechargeOpen(false)}
              >
                Later
              </Button>
              <Button
                className="flex-1 btn-gold"
                onClick={() => {
                  setRechargeOpen(false);
                  navigate("/deposit");
                }}
              >
                Recharge Now
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

const ClockIcon = () => <Clock className="h-4 w-4 text-accent" />;

export default Tasks;