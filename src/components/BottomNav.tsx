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
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-[11px] font-medium transition-all",
                active ? "text-violet" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <span className="absolute -top-0.5 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet to-accent shadow-[0_0_12px_hsl(var(--violet)/0.7)]" />
              )}
              <item.icon
                className={cn("h-5 w-5 transition-transform", active && "scale-110 drop-shadow-[0_0_6px_hsl(var(--violet)/0.6)]")}
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
