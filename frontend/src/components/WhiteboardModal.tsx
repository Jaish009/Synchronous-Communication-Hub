import { useState } from "react";
import { Excalidraw, exportToBlob } from "@excalidraw/excalidraw";
import { X, Save, Loader2 } from "lucide-react";
import { useChannelStateContext } from "stream-chat-react";
import toast from "react-hot-toast";

interface WhiteboardModalProps {
  onClose: () => void;
}

export const WhiteboardModal = ({ onClose }: WhiteboardModalProps) => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { channel } = useChannelStateContext();

  const handleSaveToChannel = async () => {
    if (!excalidrawAPI || !channel) return;

    setIsSaving(true);
    try {
      const elements = excalidrawAPI.getSceneElements();
      if (!elements || !elements.length) {
        toast.error("Whiteboard is empty");
        setIsSaving(false);
        return;
      }

      const blob = await exportToBlob({
        elements,
        mimeType: "image/png",
        appState: excalidrawAPI.getAppState(),
        files: excalidrawAPI.getFiles(),
      });

      const file = new File([blob], "whiteboard.png", { type: "image/png" });
      
      const uploadResponse = await channel.sendFile(file, file.name, file.type);
      
      await channel.sendMessage({
        text: "Shared a whiteboard session",
        attachments: [
          {
            type: "image",
            image_url: uploadResponse.file,
            fallback: "Whiteboard image",
          },
        ],
      });

      toast.success("Saved to channel!");
      onClose();
    } catch (error) {
      console.error("Error saving whiteboard:", error);
      toast.error("Failed to save whiteboard");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#121212] w-full max-w-6xl h-[85vh] rounded-2xl flex flex-col overflow-hidden border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <span className="text-purple-400 font-bold">W</span>
            </div>
            <h2 className="text-lg font-semibold text-white">Collaborative Whiteboard</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveToChannel}
              disabled={isSaving}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save to Channel
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 relative excalidraw-wrapper">
          {/* Excalidraw comes with its own light/dark mode. We enforce dark mode here. */}
          <Excalidraw
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
            theme="dark"
            UIOptions={{
              canvasActions: {
                loadScene: false,
                export: false,
                saveAsImage: false,
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
