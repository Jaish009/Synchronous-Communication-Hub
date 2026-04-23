import { useState } from "react";
import { useChannelStateContext } from "stream-chat-react";
import { X, Plus, Trash2 } from "lucide-react";

interface CreatePollModalProps {
  onClose: () => void;
}

const CreatePollModal = ({ onClose }: CreatePollModalProps) => {
  const { channel } = useChannelStateContext();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSubmit = async () => {
    const trimmedQuestion = question.trim();
    const validOptions = options.map((o) => o.trim()).filter(Boolean);

    if (!trimmedQuestion || validOptions.length < 2) return;

    setIsSubmitting(true);
    try {
      // Send poll as a custom message attachment
      await channel.sendMessage({
        text: `📊 **Poll: ${trimmedQuestion}**`,
        attachments: [
          {
            type: "poll",
            title: trimmedQuestion,
            poll_options: validOptions,
            votes: Object.fromEntries(validOptions.map((opt) => [opt, []])),
          } as any,
        ],
      });
      onClose();
    } catch (error) {
      console.error("Failed to create poll:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid =
    question.trim().length > 0 &&
    options.filter((o) => o.trim()).length >= 2;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="bg-[#1a1a2e] border border-[rgba(255,255,255,0.1)] rounded-2xl w-full max-w-md mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[rgba(255,255,255,0.08)]">
          <h2 className="text-lg font-semibold text-white">Create a Poll</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors"
          >
            <X className="size-5 text-[rgba(255,255,255,0.5)]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-1.5">
              Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask something..."
              className="w-full px-3 py-2.5 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]
                         rounded-xl text-white placeholder-[rgba(255,255,255,0.3)]
                         focus:outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff]/30
                         transition-all"
              autoFocus
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-1.5">
              Options
            </label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs text-[rgba(255,255,255,0.3)] w-5 text-center font-mono">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-3 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]
                               rounded-lg text-white placeholder-[rgba(255,255,255,0.3)]
                               focus:outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff]/30
                               transition-all text-sm"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => removeOption(index)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-[rgba(255,255,255,0.3)] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 10 && (
              <button
                onClick={addOption}
                className="mt-2 flex items-center gap-1.5 text-sm text-[#6c63ff] hover:text-[#8b83ff] transition-colors"
              >
                <Plus className="size-3.5" />
                Add Option
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[rgba(255,255,255,0.08)]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[rgba(255,255,255,0.6)] hover:text-white
                       hover:bg-[rgba(255,255,255,0.08)] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="px-4 py-2 text-sm font-medium bg-[#6c63ff] text-white rounded-lg
                       hover:bg-[#5a52e0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Poll"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePollModal;
