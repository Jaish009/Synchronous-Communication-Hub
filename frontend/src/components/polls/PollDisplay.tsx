import { useState, useMemo } from "react";
import { BarChart3 } from "lucide-react";

interface PollDisplayProps {
  attachment: {
    title: string;
    poll_options: string[];
    votes: Record<string, string[]>;
  };
  currentUserId: string;
  onVote: (option: string) => void;
}

const PollDisplay = ({ attachment, currentUserId, onVote }: PollDisplayProps) => {
  const { title, poll_options, votes } = attachment;

  const totalVotes = useMemo(() => {
    return Object.values(votes || {}).reduce(
      (sum, voters) => sum + (voters?.length || 0),
      0
    );
  }, [votes]);

  const userVotedOption = useMemo(() => {
    for (const [option, voters] of Object.entries(votes || {})) {
      if (voters?.includes(currentUserId)) return option;
    }
    return null;
  }, [votes, currentUserId]);

  const hasVoted = userVotedOption !== null;

  return (
    <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-xl p-4 max-w-sm my-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="size-4 text-[#6c63ff]" />
        <span className="text-xs font-medium text-[#6c63ff] uppercase tracking-wide">
          Poll
        </span>
      </div>

      {/* Question */}
      <h4 className="text-sm font-semibold text-white mb-3">{title}</h4>

      {/* Options */}
      <div className="space-y-2">
        {poll_options?.map((option) => {
          const voteCount = votes?.[option]?.length || 0;
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
          const isSelected = userVotedOption === option;

          return (
            <button
              key={option}
              onClick={() => !hasVoted && onVote(option)}
              disabled={hasVoted}
              className={`
                relative w-full text-left px-3 py-2 rounded-lg text-sm overflow-hidden
                transition-all duration-300
                ${
                  hasVoted
                    ? "cursor-default"
                    : "cursor-pointer hover:bg-[rgba(255,255,255,0.08)]"
                }
                ${
                  isSelected
                    ? "border border-[#6c63ff]/50 bg-[#6c63ff]/10"
                    : "border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]"
                }
              `}
            >
              {/* Animated result bar */}
              {hasVoted && (
                <div
                  className="absolute inset-y-0 left-0 bg-[#6c63ff]/15 rounded-lg transition-all duration-700 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative flex items-center justify-between">
                <span
                  className={`${
                    isSelected
                      ? "text-[#6c63ff] font-medium"
                      : "text-[rgba(255,255,255,0.8)]"
                  }`}
                >
                  {option}
                </span>
                {hasVoted && (
                  <span className="text-xs text-[rgba(255,255,255,0.5)] ml-2 tabular-nums">
                    {Math.round(percentage)}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 text-xs text-[rgba(255,255,255,0.4)]">
        {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
        {hasVoted && " · You voted"}
      </div>
    </div>
  );
};

export default PollDisplay;
