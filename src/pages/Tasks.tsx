import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="min-h-screen pb-20 bg-background relative overflow-hidden">
      <PageHeader title="Global Tasks" showBack={false} />
      <div className="px-5 pt-4">
        <Card className="glass border border-[#B8860B]/30 rounded-2xl relative overflow-hidden">
          <Globe className="absolute -right-6 -top-6 h-32 w-32 text-[#B8860B] opacity-5" />
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-extrabold mt-1 gold-text"> {/* */}
                {(profile?.balance || 0).toFixed(2)} <span className="text-sm font-medium text-muted-foreground">USDT</span>
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-[#B8860B]/20 border border-[#B8860B]/40 flex items-center justify-center shadow-[0_0_15px_-5px_rgba(184,134,11,0.5)]">
              <Wallet className="h-6 w-6 text-[#B8860B]" />
            </div>
          </CardContent>
        </Card>
        
        {currentActiveTask ? (
          <Card className="glass border border-[#B8860B]/30 rounded-2xl relative overflow-hidden mt-4">
            <Globe className="absolute -right-6 -top-6 h-32 w-32 text-[#B8860B] opacity-5" />
            <CardContent className="p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Current Task</p>
              <div className="flex items-center gap-3 mt-2">
                <img
                  src={currentActiveTask.product_image || "/placeholder.svg"}
                  alt={currentActiveTask.product_name}
                  className="w-16 h-16 rounded-lg object-cover border border-border"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight line-clamp-2">{currentActiveTask.product_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">Order No: {currentActiveTask.order_no}</p>
                  <p className="text-xs text-muted-foreground">Amount: {currentActiveTask.amount.toFixed(2)} USDT</p>
                  <p className="text-xs text-muted-foreground">Commission: {currentActiveTask.commission.toFixed(2)} USDT</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  if (currentActiveTask.recharge_needed) {
                    setPendingOrder(currentActiveTask);
                    setRechargeOpen(true);
                  } else {
                    navigate("/record"); // Go to record to submit the order
                  }
                }}
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-[#B8860B] to-[#8B6508] text-white hover:opacity-90 font-bold h-12 text-base shadow-[0_4px_15px_-3px_rgba(184,134,11,0.4)]"
              >
                {loading ? "Loading..." : currentActiveTask.recharge_needed ? "Recharge to Submit" : "Continue Task"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Button
            onClick={handleGrabOrder}
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-[#B8860B] to-[#8B6508] text-white hover:opacity-90 font-bold h-12 text-base shadow-[0_4px_15px_-3px_rgba(184,134,11,0.4)]"
          >
            {loading ? "Loading..." : "🎯 Grab Order"}
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
                ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-glow-violet)]"
                : "bg-card text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Info card */}
      <div className="px-5">
        <Card className="bg-card border border-border rounded-2xl shadow-[var(--shadow-tile)] relative overflow-hidden">
          <Globe className="absolute -left-4 -bottom-4 h-20 w-20 text-[#B8860B] opacity-[0.03]" />
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#B8860B]" />
              <p className="text-sm font-semibold">How it works</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Click "Grab Order" to receive your next order. Complete the order to earn commission. If you receive a combo order that exceeds your balance, you'll need to recharge before completing it.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">View your orders</span>
              <button
                onClick={() => navigate("/record")}
                className="text-xs text-accent font-semibold flex items-center gap-1"
              >
                Record <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recharge Popup — water/cyan colored */}
      <Dialog open={rechargeOpen} onOpenChange={setRechargeOpen}>
        <DialogContent className="max-w-sm mx-auto p-0 overflow-hidden border-0">
          <div className="p-6 text-foreground" style={{ background: "var(--gradient-header)" }}>
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent/15 border border-accent/30 backdrop-blur mx-auto mb-3">
              <AlertCircle className="h-8 w-8 text-accent" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-foreground text-center text-lg">Recharge Required</DialogTitle>
              <DialogDescription className="text-muted-foreground text-center text-sm">
                You have received a combo order. Please recharge to continue.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-5 space-y-3 bg-card">
            {pendingOrder && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order No.</span>
                  <span className="font-medium">{pendingOrder.order_no}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order amount</span>
                  <span className="font-medium">{Number(pendingOrder.amount).toFixed(2)} USDT</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Your balance</span>
                  <span className="font-medium">{(profile?.balance || 0).toFixed(2)} USDT</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-dashed border-border">
                  <span className="text-sm font-semibold">Recharge needed</span>
                  <span className="text-xl font-bold gold-text">{rechargeAmount.toFixed(2)} USDT</span> {/* */}
                </div>
              </>
            )}

            <DialogFooter className="flex-row gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setRechargeOpen(false)}
              >
                Later
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:opacity-90"
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