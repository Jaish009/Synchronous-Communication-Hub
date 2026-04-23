import { BarChart3 } from "lucide-react";

interface PollButtonProps {
  onClick: () => void;
}

const PollButton = ({ onClick }: PollButtonProps) => {
  return (
    <button
      onClick={onClick}
      title="Create a Poll"
      className="flex items-center justify-center p-2 rounded-lg
                 text-[rgba(255,255,255,0.5)] hover:text-[#6c63ff]
                 hover:bg-[rgba(255,255,255,0.08)] transition-all duration-200"
    >
      <BarChart3 className="size-5" />
    </button>
  );
};

export default PollButton;
