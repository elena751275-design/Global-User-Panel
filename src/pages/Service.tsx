import { useState, useEffect, useRef } from "react";
import BottomNav from "@/components/BottomNav";
import { ChevronRight, Send, MessageCircle } from "lucide-react";
import customerServiceImg from "@/assets/customer-service.png";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import io from "socket.io-client";

interface ChatMessage {
  _id: string;
  text: string;
  sender: "admin" | "user";
  senderName: string;
  createdAt: string;
}

const Service = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    fetch("http://localhost:3002/api/support/telegram")
      .then(res => res.json())
      .then(data => setTelegramUsername(data.telegramUsername || ""))
      .catch(err => console.error("Telegram fetch error:", err));
  }, []);

  useEffect(() => {
    if (!showChat || !user?._id) return;
    const socket = io("http://localhost:3002", { transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("connect", () => {
      console.log("User connected to chat socket");
      socket.emit("join-room", user._id);
    });
    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });
    socket.on("new-message", (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });
    fetch(`http://localhost:3002/api/support/messages/${user._id}`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setMessages(data); })
      .catch(err => console.error("History fetch error:", err));
    return () => { socket.disconnect(); };
  }, [showChat, user?._id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !user?._id) {
      console.warn("Cannot send: input empty or user not logged in");
      return;
    }
    if (socketRef.current?.connected) {
      socketRef.current.emit("send-message", {
        customerId: user._id,
        text: input.trim(),
        sender: "user",
        senderName: user.username || user.email || "User",
      });
      setInput("");
    } else {
      console.warn("Socket not connected, trying reconnect...");
      if (socketRef.current) {
        socketRef.current.connect();
      }
    }
  };

  if (showChat) {
    return (
      <div className="min-h-screen pb-20 flex flex-col bg-goldBg">
        <PageHeader title="Live Chat Support" onBack={() => setShowChat(false)} />
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 text-xs py-8">
              Start a conversation. Our team is ready to help.
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={msg._id || i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.sender === "user"
                      ? "btn-gold text-black rounded-br-sm"
                      : "bg-[#0f131e] text-white border border-goldBorder rounded-bl-sm"
                  }`}
                >
                  <p className="text-xs font-medium opacity-70">{msg.senderName || (msg.sender === "admin" ? "Admin" : "You")}</p>
                  <p className="text-sm mt-0.5">{msg.text}</p>
                  <p className="text-[9px] mt-1 opacity-40">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="px-4 py-3 border-t border-goldBorder flex gap-2 bg-[#0a0d14]">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-[#0f131e] text-white placeholder:text-gray-500 rounded-full px-4 py-2.5 text-sm outline-none border border-goldBorder focus:border-[#C29F74] transition-colors"
          />
          <button
            onClick={sendMessage}
            className="w-10 h-10 flex items-center justify-center rounded-full btn-gold"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-goldBg">
      <PageHeader title="Customer Service" showBack={false} />
      <div className="px-5 pt-3 text-center">
        <p className="text-xs text-gray-400">Online customer service time 07:00-23:00 ( UK )</p>
      </div>
      <div className="flex justify-center px-8 py-6 relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-48 w-48 rounded-full bg-luxuryGold-main/8 blur-3xl" />
        </div>
        <img src={customerServiceImg} alt="Customer Service" className="relative w-64 h-auto" />
      </div>
      <div className="px-5 space-y-3">
        <button
          onClick={() => setShowChat(true)}
          className="w-full rounded-2xl px-4 py-4 flex items-center justify-between transition-all duration-300 luxury-card"
        >
          <div className="flex items-center gap-3">
            <div className="gold-icon-3d-sm">
              <MessageCircle className="h-4 w-4" strokeWidth={1.8} />
            </div>
            <span className="text-sm font-semibold text-brandHeading">Live Chat Support</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-500" />
        </button>
        <a
          href={telegramUsername ? `https://t.me/${telegramUsername.replace(/^@/, '')}` : "https://t.me/your_support_bot"}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full rounded-2xl px-4 py-4 flex items-center justify-between transition-all duration-300 luxury-card"
        >
          <div className="flex items-center gap-3">
            <div className="gold-icon-3d-sm">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-brandHeading">Telegram Support</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-500" />
        </a>
      </div>
      <BottomNav />
    </div>
  );
};

export default Service;
