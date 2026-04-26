import { useEffect, useState } from "react";
import { SparklesIcon, Loader2 } from "lucide-react";
import { useChannelStateContext, useChatContext } from "stream-chat-react";
import { getSmartReplies } from "../lib/api";
import { motion, AnimatePresence } from "motion/react";

export const SmartReplies = () => {
  const { client } = useChatContext();
  const { channel, messages } = useChannelStateContext();
  const [replies, setReplies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchReplies = async () => {
      if (!messages || messages.length === 0) return;
      
      // Only fetch if the last message is from someone else
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.user?.id === client.userID) {
        setReplies([]);
        return;
      }

      setIsLoading(true);
      try {
        const recentMessages = messages.slice(-20);
        const response = await getSmartReplies(recentMessages);
        setReplies(response.replies);
      } catch (error) {
        console.error("Failed to fetch smart replies", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReplies();
  }, [messages, client.userID]);

  const handleSelectReply = async (reply: string) => {
    if (!channel) return;
    try {
      await channel.sendMessage({ text: reply });
      setReplies([]);
    } catch (error) {
      console.error("Failed to send smart reply", error);
    }
  };

  if (!replies.length && !isLoading) return null;

  return (
    <div className="px-4 py-2 border-t border-white/5 bg-black/20 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-2">
        <SparklesIcon size={14} className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
        <span className="text-[10px] font-bold text-white uppercase tracking-widest">AI SUGGESTIONS</span>
      </div>
      
      <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar pb-1">
        {isLoading ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
            <Loader2 size={12} className="animate-spin text-purple-500" />
            <span className="text-xs text-gray-400">Gemini is thinking...</span>
          </div>
        ) : (
          <AnimatePresence>
            {replies.map((reply, index) => (
              <motion.button
                key={reply}
                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelectReply(reply)}
                className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 hover:bg-purple-500/20 hover:border-purple-500/40 transition-all whitespace-nowrap"
              >
                {reply}
              </motion.button>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
