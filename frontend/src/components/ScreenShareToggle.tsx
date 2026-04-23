import { useCall, useCallStateHooks, } from "@stream-io/video-react-sdk";
import { MonitorUp, MonitorOff } from "lucide-react";

const ScreenShareToggle = () => {
  const call = useCall();
  const { useHasOngoingScreenShare, useLocalParticipant } =
    useCallStateHooks();
  const hasOngoingScreenShare = useHasOngoingScreenShare();
  const localParticipant = useLocalParticipant();

  const isLocalScreenSharing = localParticipant?.publishedTracks?.some(
    (track) => track === 3 // SfuModels.TrackType.SCREEN_SHARE
  );

  const handleToggle = async () => {
    if (!call) return;

    try {
      if (isLocalScreenSharing) {
        await call.screenShare.disable();
      } else {
        await call.screenShare.enable();
      }
    } catch (error) {
      console.error("Screen share error:", error);
    }
  };

  return (
    <button
      onClick={handleToggle}
      title={isLocalScreenSharing ? "Stop Sharing" : "Share Screen"}
      className={`
        relative flex items-center justify-center gap-2 
        px-4 py-2 rounded-full text-sm font-medium
        transition-all duration-300 ease-out
        ${isLocalScreenSharing
          ? "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          : "bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.7)] border border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.14)] hover:text-white"
        }
      `}
    >
      {isLocalScreenSharing ? (
        <>
          <MonitorOff className="size-4" />
          <span>Stop Sharing</span>
          {/* Glow pulse indicator */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
        </>
      ) : (
        <>
          <MonitorUp className="size-4" />
          <span>Share Screen</span>
        </>
      )}
      {/* Show indicator if someone else is screen sharing */}
      {hasOngoingScreenShare && !isLocalScreenSharing && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
        </span>
      )}
    </button>
  );
};

export default ScreenShareToggle;
