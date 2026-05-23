import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import BottomNav from "@/components/BottomNav";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client"; // Removed Supabase
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";

interface OrderRow {
  id: string;
  order_no: string;
  product_name: string;
  product_image: string | null;
  amount: number;
  commission: number;
  created_at: string;
  completed_at: string | null;
  status: "pending" | "submitted" | "completed" | "cancelled";
}

const Record = () => {
  const [activeTab, setActiveTab] = useState<"incomplete" | "complete">("incomplete");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [profileLoading, setProfileLoading] = useState(true);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [rechargeOrder, setRechargeOrder] = useState<OrderRow | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setProfileLoading(true);
    try {
      const userId = user._id || user.id;
      const [ordersRes, profileRes, comboRes] = await Promise.all([
        fetch(`/api/orders/${userId}`),
        fetch(`/api/profile/${userId}`),
        fetch(`http://localhost:5001/api/combo/list/${userId}`),
      ]);

      const ordersData = await ordersRes.json();
      const profileData = await profileRes.json();
      const comboData = await comboRes.json();

      // Merge combo orders into orders list
      const regularOrders = ordersData.success ? (ordersData.orders || []) : [];
      const combos = comboData.success ? (comboData.combos || []) : [];
      const merged = [
        ...regularOrders.map((o: any) => ({ ...o, _type: 'regular' })),
        ...combos.map((c: any) => ({
          id: c._id,
          order_no: c.orderNumber || `CMB-${c._id?.slice(-6)}`,
          product_name: c.productList?.length ? `${c.productList.length} products` : 'Combo Order',
          product_image: c.productList?.[0]?.image || null,
          amount: c.comboAmount,
          commission: c.commission,
          created_at: c.transactionTime || c.createdAt,
          status: c.status === 'incomplete' ? 'pending' : c.status === 'completed' ? 'completed' : 'pending',
          _type: 'combo',
          productList: c.productList || [],
          expectedIncome: c.expectedIncome,
          shortageAmount: c.shortageAmount,
        })),
      ];
      setOrders(merged);

      if (profileData.success) {
        setBalance(profileData.profile.balance);
      } else {
        toast.error(profileData.message || "Failed to fetch profile.");
      }
    } catch (err) {
      toast.error("An error occurred while fetching data.");
    } finally {
      setLoading(false);
      setProfileLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredOrders = orders.filter((o) =>
    activeTab === "incomplete"
      ? o.status === "pending" || o.status === "submitted"
      : o.status === "completed"
  );

  const handleSubmit = async (order: any) => {
    if (!user) return;
    const userId = user._id || user.id;
    const orderAmount = Number(order.amount) || 0;
    const shortage = Number((order as any).shortageAmount) || 0;

    // For combo orders, check recharge needed vs balance
    const rechargeNeeded = order._type === 'combo'
      ? Math.max(shortage, orderAmount - balance)
      : Math.max(0, orderAmount - balance);

    if (rechargeNeeded > 0) {
      setRechargeOrder({ ...order, rechargeNeeded });
      setRechargeOpen(true);
      return;
    }
    setSubmittingId(order.id);
    try {
      const endpoint = order._type === 'combo'
        ? 'http://localhost:5001/api/combo/submit'
        : '/api/orders/submit';
      
      const body = order._type === 'combo'
        ? JSON.stringify({ userId, comboOrderId: order.id })
        : JSON.stringify({ orderId: order.id, userId });

      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      const result = await response.json();

      if (result.success) {
        toast.success(result.message || "Order submitted successfully");
        fetchData();
      } else {
        throw new Error(result.message || "Failed to submit order");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit order");
    } finally {
      setSubmittingId(null);
    }
  };

  const rechargeAmount = rechargeOrder
    ? ((rechargeOrder as any).rechargeNeeded || Math.max(Number(rechargeOrder.amount) - balance, 0))
    : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Record" />

      {/* Tabs */}
      <div className="flex border-b border-border bg-background">
        <button
          onClick={() => setActiveTab("incomplete")}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            activeTab === "incomplete"
              ? "text-accent border-b-2 border-accent"
              : "text-muted-foreground"
          }`}
        >
          Incomplete
        </button>
        <button
          onClick={() => setActiveTab("complete")}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            activeTab === "complete"
              ? "text-accent border-b-2 border-accent"
              : "text-muted-foreground"
          }`}
        >
          Complete
        </button>
      </div>

      {/* Orders */}
      <div className="px-5 py-4 space-y-3">
        {loading || profileLoading ? (
          <p className="text-center text-muted-foreground text-sm py-10">Loading...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-10">No orders found</p>
        ) : (
          filteredOrders.map((order) => {
            const orderAmount = Number(order.amount);
            const commission = Number(order.commission);
            const expectedIncome = orderAmount + commission;
            const isCombo = orderAmount > balance && order.status !== "completed";

            return (
              <Card key={order.id} className="bg-card border border-border rounded-2xl shadow-[var(--shadow-tile)] overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  {/* Order No */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Order Nos: <span className="bg-secondary px-2 py-0.5 rounded text-foreground font-mono">{order.order_no}</span>
                    </p>
                    {isCombo && (
                      <span className="text-[10px] vip-badge px-2 py-0.5 rounded font-bold">
                        COMBO
                      </span>
                    )}
                  </div>

                  {/* Product Info */}
                  {order._type === 'combo' && (order as any).productList ? (
                    <div className="space-y-2">
                      {(order as any).productList.map((p: any, i: number) => (
                        <div key={i} className="flex gap-2 items-center bg-secondary rounded-lg p-2">
                          <div className="w-10 h-10 rounded bg-accent/10 flex items-center justify-center flex-shrink-0">
                            {p.image && !String(p.image).startsWith('blob:') ? (
                              <img src={p.image} alt={p.name || `Product ${i+1}`} className="w-10 h-10 rounded object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            ) : (
                              <span className="text-[10px] font-bold text-accent">#{i+1}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium">{p.name || `Product ${i+1}`}</p>
                            <p className="text-[10px] text-muted-foreground">${p.unitPrice} × {p.quantity} = ${p.subtotal || p.unitPrice * p.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-3 items-start">
<img
                        src={order.product_image && !String(order.product_image).startsWith('blob:') ? order.product_image : "/placeholder.svg"}
                        alt={order.product_name}
                        className="w-16 h-16 rounded-lg object-cover border border-border"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight line-clamp-2">{order.product_name}</p>
                      </div>
                    </div>
                  )}

                  {/* Details */}
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction time</span>
                      <span>{new Date(order.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order amount</span>
                      <span>{orderAmount.toFixed(2)}USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Commissions</span>
                      <span>{commission.toFixed(2)}USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expected income</span>
                      <span className="gold-text font-bold text-base">{expectedIncome.toFixed(2)}USDT</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  {order.status !== "completed" && (
                    <Button
                      disabled={submittingId === order.id}
                      onClick={() => handleSubmit(order)}
                      className="w-full bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-[var(--shadow-glow-violet)]"
                    >
                      {submittingId === order.id ? "Submitting..." : isCombo ? "Recharge to submit" : "Submit order"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}

        {!loading && filteredOrders.length > 0 && (
          <p className="text-center text-muted-foreground text-xs py-2">No more</p>
        )}
      </div>

      {/* Recharge Popup */}
      <Dialog open={rechargeOpen} onOpenChange={setRechargeOpen}>
        <DialogContent className="max-w-sm mx-auto p-0 overflow-hidden border-0">
          <div className="p-6 text-foreground" style={{ background: "var(--gradient-header)" }}>
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent/15 border border-accent/30 backdrop-blur mx-auto mb-3">
              <AlertCircle className="h-8 w-8 text-accent" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-foreground text-center text-lg">Recharge Required</DialogTitle>
              <DialogDescription className="text-muted-foreground text-center text-sm">
                {rechargeOrder?._type === 'combo'
                  ? `Your balance is insufficient for this combo order. Recharge the amount below to submit.`
                  : `Your balance is insufficient to complete this order.`}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-5 space-y-3 bg-card">
            {rechargeOrder && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order amount</span>
                  <span className="font-medium">{Number(rechargeOrder.amount).toFixed(2)} USDT</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Your balance</span>
                  <span className="font-medium">{balance.toFixed(2)} USDT</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-dashed border-border">
                  <span className="text-sm font-semibold">Recharge needed</span>
                  <span className="text-xl font-bold gold-text">{rechargeAmount.toFixed(2)} USDT</span>
                </div>
              </>
            )}

            <DialogFooter className="flex-row gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setRechargeOpen(false)}>
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

export default Record;