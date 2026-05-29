import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import BottomNav from "@/components/BottomNav";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  _type?: string;
  productList?: any[];
  expectedIncome?: number;
  shortageAmount?: number;
  rechargeNeeded?: number;
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
    <div className="min-h-screen bg-goldBg pb-20">
      <PageHeader title="Record" />

      {/* Tabs */}
      <div className="flex bg-[#0a0d14]">
        <button
          onClick={() => setActiveTab("incomplete")}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors border-b-2 ${
            activeTab === "incomplete"
              ? "text-luxuryGold-main border-luxuryGold-main"
              : "text-gray-500 border-transparent"
          }`}
        >
          Incomplete
        </button>
        <button
          onClick={() => setActiveTab("complete")}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors border-b-2 ${
            activeTab === "complete"
              ? "text-luxuryGold-main border-luxuryGold-main"
              : "text-gray-500 border-transparent"
          }`}
        >
          Complete
        </button>
      </div>

      {/* Orders */}
      <div className="px-4 py-4 space-y-3">
        {loading || profileLoading ? (
          <p className="text-center text-gray-400 text-sm py-10">Loading...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">No orders found</p>
        ) : (
          filteredOrders.map((order) => {
            const orderAmount = Number(order.amount);
            const commission = Number(order.commission);
            const expectedIncome = orderAmount + commission;
            const isCombo = orderAmount > balance && order.status !== "completed";

            return (
              <div key={order.id} className="rounded-2xl p-4 space-y-3 luxury-card">
                {/* Order No */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    Order Nos: <span className="bg-[#0f131e] px-2 py-0.5 rounded text-brandHeading font-mono text-xs">{order.order_no}</span>
                  </p>
                  {isCombo && (
                    <Badge className="border-none font-bold text-[10px] px-2 py-0.5 shadow-lg shadow-amber-500/20" style={{ background: 'linear-gradient(to right, #BF953F, #FCF6BA, #B38728)', color: '#000000' }}>
                      COMBO
                    </Badge>
                  )}
                </div>

                {/* Product Info */}
                {order._type === 'combo' && (order as any).productList ? (
                  <div className="space-y-2">
                    {(order as any).productList.map((p: any, i: number) => (
                      <div key={i} className="flex gap-2 items-center bg-[#0f131e] rounded-lg p-2">
                        <div className="w-10 h-10 rounded bg-[#1a1510] border border-goldBorder flex items-center justify-center flex-shrink-0">
                          {p.image && !String(p.image).startsWith('blob:') ? (
                            <img src={p.image} alt={p.name || `Product ${i+1}`} className="w-10 h-10 rounded object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          ) : (
                            <span className="text-[10px] font-bold text-goldPrimary">#{i+1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-brandHeading">{p.name || `Product ${i+1}`}</p>
                          <p className="text-[10px] text-gray-400">${p.unitPrice} &times; {p.quantity} = ${p.subtotal || p.unitPrice * p.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-3 items-start">
                    <img
                      src={order.product_image && !String(order.product_image).startsWith('blob:') ? order.product_image : "/placeholder.svg"}
                      alt={order.product_name}
                      className="w-16 h-16 rounded-lg object-cover border border-goldBorder"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight line-clamp-2 text-brandHeading">{order.product_name}</p>
                    </div>
                  </div>
                )}

                {/* Details */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Transaction time</span>
                    <span className="text-gray-300">{new Date(order.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Order amount</span>
                    <span className="text-gray-300">{orderAmount.toFixed(2)} USDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Commissions</span>
                    <span className="text-gray-300">{commission.toFixed(2)} USDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expected income</span>
                    <span className="gold-gradient-text font-bold text-base">{expectedIncome.toFixed(2)} USDT</span>
                  </div>
                </div>

                {/* Submit Button */}
                {order.status !== "completed" && (
                  <Button
                    disabled={submittingId === order.id}
                    onClick={() => handleSubmit(order)}
                    className="w-full btn-gold"
                  >
                    {submittingId === order.id ? "Submitting..." : isCombo ? "Recharge to submit" : "Submit order"}
                  </Button>
                )}
              </div>
            );
          })
        )}

        {!loading && filteredOrders.length > 0 && (
          <p className="text-center text-gray-500 text-xs py-2">No more</p>
        )}
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
                {rechargeOrder?._type === 'combo'
                  ? `Your balance is insufficient for this combo order. Recharge the amount below to submit.`
                  : `Your balance is insufficient to complete this order.`}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-5 space-y-3 bg-[#0a0d14]">
            {rechargeOrder && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Order amount</span>
                  <span className="font-medium text-white">{Number(rechargeOrder.amount).toFixed(2)} USDT</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Your balance</span>
                  <span className="font-medium text-white">{balance.toFixed(2)} USDT</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-goldBorder">
                  <span className="text-sm font-semibold text-white">Recharge needed</span>
                  <span className="text-xl font-bold gold-gradient-text">{rechargeAmount.toFixed(2)} USDT</span>
                </div>
              </>
            )}

            <DialogFooter className="flex-row gap-2 pt-2">
              <Button variant="outline" className="flex-1 border-goldBorder text-gray-400 hover:bg-[#1a1f2e]" onClick={() => setRechargeOpen(false)}>
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

export default Record;
