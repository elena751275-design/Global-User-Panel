import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
  onBack?: () => void;
}

const PageHeader = ({ title, showBack = true, right, onBack }: PageHeaderProps) => {
  const navigate = useNavigate();
  return (
    <div
      className="relative px-5 pt-6 pb-5 text-white rounded-b-[24px] overflow-hidden border-b border-goldBorder"
      style={{ background: 'linear-gradient(160deg, #111620 0%, #0a0d14 100%)' }}
    >
      <div className="pointer-events-none absolute -top-16 -left-12 h-40 w-40 rounded-full bg-luxuryGold-main/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 right-0 h-32 w-32 rounded-full bg-luxuryGold-main/6 blur-3xl" />
      <div className="relative flex items-center gap-3">
        {showBack ? (
          <button
            onClick={() => (onBack ? onBack() : navigate(-1))}
            aria-label="Back"
            className="h-9 w-9 -ml-1 flex items-center justify-center rounded-full border border-goldBorder hover:border-[#2a3f52] transition-colors"
            style={{ backgroundColor: '#0a0d14' }}
          >
            <ChevronLeft className="h-5 w-5 text-gray-400" />
          </button>
        ) : (
          <span className="w-9" />
        )}
        <h1 className="flex-1 text-center text-lg font-bold tracking-tight pr-9 text-white">
          {title}
        </h1>
        {right ? <div className="absolute right-5 top-1/2 -translate-y-1/2">{right}</div> : null}
      </div>
    </div>
  );
};

export default PageHeader;
