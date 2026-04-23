import { useState } from "react";
import { Sparkles, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useChannelStateContext } from "stream-chat-react";
import { summarizeChannelMessages } from "../lib/api";
import toast from "react-hot-toast";

export const SummaryButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const { messages } = useChannelStateContext();

  const handleSummarize = async () => {
    setIsOpen(true);
    if (summary) return; // Already summarized
    
    setIsLoading(true);
    try {
      // Get the last 100 messages max for context
      const recentMessages = messages ? messages.slice(-100) : [];
      if (recentMessages.length === 0) {
        setSummary("No messages to summarize yet.");
        setIsLoading(false);
        return;
      }
      
      const response = await summarizeChannelMessages(recentMessages);
      setSummary(response.summary);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate summary");
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleSummarize}
        className="p-1.5 rounded-md hover:bg-white/10 transition-colors group flex items-center justify-center"
        title="AI Summary"
      >
        <Sparkles className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0f0f0f] border border-white/10 rounded-xl shadow-2xl p-6 w-full max-w-md relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500" />
              
              <div className="flex items-center justify-between mb-6 mt-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Sparkles size={20} className="text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">AI Channel Summary</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="min-h-[150px] max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-32 gap-3 text-gray-400">
                    <Loader2 size={24} className="animate-spin text-purple-500" />
                    <p className="text-sm">Gemini is analyzing messages...</p>
                  </div>
                ) : (
                  <div className="text-gray-300 space-y-3 whitespace-pre-wrap text-sm leading-relaxed">
                    {summary}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
