import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Tasks from "./pages/Tasks";
import Earnings from "./pages/Earnings";
import Record from "./pages/Record";
import Mine from "./pages/Mine";
import Menu from "./pages/Menu";
import Service from "./pages/Service";
import NotFound from "./pages/NotFound";
import PlatformDetail from "./pages/PlatformDetail";
import Deposit from "./pages/Deposit";
import Withdrawal from "./pages/Withdrawal";
import Profile from "./pages/Profile";
import DepositRecords from "./pages/DepositRecords";
import WithdrawalRecords from "./pages/WithdrawalRecords";
import Settings from "./pages/Settings";
import BindWallet from "./pages/BindWallet";
import Teams from "./pages/Teams";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Index />} />
            <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
            <Route path="/earnings" element={<ProtectedRoute><Earnings /></ProtectedRoute>} />
            <Route path="/mine" element={<ProtectedRoute><Mine /></ProtectedRoute>} />
            <Route path="/service" element={<Service />} />
            <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
            <Route path="/platform/:platform" element={<ProtectedRoute><PlatformDetail /></ProtectedRoute>} />
            <Route path="/record" element={<ProtectedRoute><Record /></ProtectedRoute>} />
            <Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
            <Route path="/withdrawal" element={<ProtectedRoute><Withdrawal /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/deposit-records" element={<ProtectedRoute><DepositRecords /></ProtectedRoute>} />
            <Route path="/withdrawal-records" element={<ProtectedRoute><WithdrawalRecords /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/bind-wallet" element={<ProtectedRoute><BindWallet /></ProtectedRoute>} />
            <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
