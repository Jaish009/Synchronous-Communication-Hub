import { useState } from "react";
import { Mic, MicOff, PhoneOff, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCallStateHooks, useCall } from "@stream-io/video-react-sdk";

export const HuddleOverlay = () => {
  const call = useCall();
  const { useParticipants, useMicrophoneState } = useCallStateHooks();
  const participants = useParticipants();
  const { isMute } = useMicrophoneState();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!call) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="fixed bottom-6 left-6 z-50 flex items-end gap-4"
      >
        <motion.div
          animate={{
            width: isExpanded ? 320 : 64,
            height: isExpanded ? "auto" : 64,
            borderRadius: isExpanded ? 24 : 32,
          }}
          className="bg-[#141414] border border-white/10 shadow-2xl overflow-hidden flex flex-col"
        >
          {isExpanded ? (
            <>
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-sm">Huddle</span>
                  <span className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">
                    {participants.length}
                  </span>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <Volume2 size={16} />
                </button>
              </div>
              <div className="p-4 flex gap-3 overflow-x-auto custom-scrollbar">
                {participants.map((p) => (
                  <div key={p.sessionId} className="relative shrink-0">
                    <img
                      src={p.image || `https://api.dicebear.com/7.x/notionists/svg?seed=${p.name}`}
                      alt={p.name}
                      className={`w-12 h-12 rounded-full border-2 ${
                        p.isSpeaking ? "border-emerald-500" : "border-transparent"
                      }`}
                    />
                  </div>
                ))}
              </div>
              <div className="p-3 bg-black/20 flex items-center justify-center gap-4">
                <button
                  onClick={() => call.microphone.toggle()}
                  className={`p-3 rounded-full ${
                    isMute ? "bg-red-500/20 text-red-500" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {isMute ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <button
                  onClick={() => call.leave()}
                  className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all"
                >
                  <PhoneOff size={20} />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              <Mic size={24} />
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
