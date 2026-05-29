import { Home, MessageCircle, Menu, ClipboardList, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: MessageCircle, label: "Service", path: "/service" },
  { icon: Menu, label: "Menu", path: "/menu" },
  { icon: ClipboardList, label: "Record", path: "/record" },
  { icon: User, label: "Mine", path: "/mine" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ backgroundColor: '#0a0d14', borderTop: '1px solid #1a1f2e' }}>
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-[11px] font-medium transition-all",
                active ? "text-goldPrimary" : "text-gray-500 hover:text-gray-300"
              )}
            >
              {active && (
                <span className="absolute -top-0.5 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full"
                  style={{ background: 'linear-gradient(to right, #BF953F, #FCF6BA, #B38728)', boxShadow: '0 0 12px rgba(194, 159, 116, 0.5)' }}
                />
              )}
              <item.icon
                className={cn("h-5 w-5 transition-transform", active && "scale-110")}
                strokeWidth={active ? 2.2 : 1.7}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
