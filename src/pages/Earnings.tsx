import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { Wallet, ArrowDownToLine, TrendingUp, History } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const transactions = [
  { id: 1, title: "Product Review", amount: 0.50, date: "Today", type: "credit" },
  { id: 2, title: "Survey Completed", amount: 0.30, date: "Today", type: "credit" },
  { id: 3, title: "PayPal Withdrawal", amount: -2.00, date: "Yesterday", type: "debit" },
  { id: 4, title: "Order Commission", amount: 2.00, date: "Yesterday", type: "credit" },
  { id: 5, title: "Daily Bonus", amount: 0.10, date: "2 days ago", type: "credit" },
];

const Earnings = () => {
  return (
<div className="min-h-screen pb-20 bg-goldBg">
      <PageHeader title="My Earnings" showBack={false} />
      <div className="px-5 pt-4">
        <div className="luxury-card p-5 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Total Balance</p>
          <p className="text-3xl font-extrabold mt-1.5 gold-gradient-text">$0.90</p>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <Button className="h-11 font-medium btn-gold">
              <ArrowDownToLine className="mr-1.5 h-4 w-4" /> Withdraw
            </Button>
            <Button variant="outline" className="h-11 font-medium border-goldBorder text-gray-400">
              <TrendingUp className="mr-1.5 h-4 w-4" /> Report
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-5 mt-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="luxury-card p-3 text-center">
            <Wallet className="h-4 w-4 mx-auto text-luxuryGold-main" />
            <p className="text-sm font-bold mt-1 gold-gradient-text">$2.90</p>
            <p className="text-[10px] text-gray-400">Total Earned</p>
          </div>
          <div className="luxury-card p-3 text-center">
            <ArrowDownToLine className="h-4 w-4 mx-auto text-green-500" />
            <p className="text-sm font-bold mt-1 text-white">$2.00</p>
            <p className="text-[10px] text-gray-400">Withdrawn</p>
          </div>
          <div className="luxury-card p-3 text-center">
            <History className="h-4 w-4 mx-auto text-luxuryGold-main" />
            <p className="text-sm font-bold mt-1 gold-gradient-text">$0.00</p>
            <p className="text-[10px] text-gray-400">Pending</p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="mt-6 px-5">
        <h2 className="text-base font-semibold mb-3 flex items-center gap-1.5 text-white">
          <History className="h-4 w-4 text-luxuryGold-main" /> Transaction History
        </h2>
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div key={tx.id} className="luxury-card p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brandHeading">{tx.title}</p>
                <p className="text-[10px] text-gray-400">{tx.date}</p>
              </div>
              <span className={`text-sm font-bold ${tx.type === "credit" ? "text-green-500" : "text-red-500"}`}>
                {tx.type === "credit" ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Earnings;
