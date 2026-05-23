import { Card, CardContent } from "@/components/ui/card";
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
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="My Earnings" showBack={false} />
      <div className="px-5 pt-4">
        <Card className="bg-card border border-border rounded-2xl shadow-[var(--shadow-tile)]">
          <CardContent className="p-5 text-center">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Total Balance</p>
            <p className="text-3xl font-extrabold mt-1.5 gold-text">$0.90</p>
            <div className="grid grid-cols-2 gap-3 mt-5">
              <Button className="h-11 font-medium bg-primary text-primary-foreground hover:opacity-90">
                <ArrowDownToLine className="mr-1.5 h-4 w-4" /> Withdraw
              </Button>
              <Button variant="outline" className="h-11 font-medium border-border">
                <TrendingUp className="mr-1.5 h-4 w-4" /> Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="px-5 mt-4">
        <div className="grid grid-cols-3 gap-2">
          <Card className="bg-card border border-border rounded-2xl shadow-[var(--shadow-tile)]">
            <CardContent className="p-3 text-center">
              <Wallet className="h-4 w-4 mx-auto text-accent" />
              <p className="text-sm font-bold mt-1">$2.90</p>
              <p className="text-[10px] text-muted-foreground">Total Earned</p>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border rounded-2xl shadow-[var(--shadow-tile)]">
            <CardContent className="p-3 text-center">
              <ArrowDownToLine className="h-4 w-4 mx-auto text-success" />
              <p className="text-sm font-bold mt-1">$2.00</p>
              <p className="text-[10px] text-muted-foreground">Withdrawn</p>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border rounded-2xl shadow-[var(--shadow-tile)]">
            <CardContent className="p-3 text-center">
              <History className="h-4 w-4 mx-auto text-accent" />
              <p className="text-sm font-bold mt-1">$0.00</p>
              <p className="text-[10px] text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transaction History */}
      <div className="mt-6 px-5">
        <h2 className="text-base font-semibold mb-3 flex items-center gap-1.5">
          <History className="h-4 w-4 text-accent" /> Transaction History
        </h2>
        <div className="space-y-2">
          {transactions.map((tx) => (
            <Card key={tx.id} className="bg-card border border-border rounded-2xl shadow-[var(--shadow-tile)]">
              <CardContent className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-medium">{tx.title}</p>
                  <p className="text-[10px] text-muted-foreground">{tx.date}</p>
                </div>
                <span className={`text-sm font-bold ${tx.type === "credit" ? "text-success" : "text-destructive"}`}>
                  {tx.type === "credit" ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Earnings;
