import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";

import ShinyText from "../components/ShinyText";
import ScreenShareToggle from "../components/ScreenShareToggle";
import { HuddleOverlay } from "../components/HuddleOverlay";

import { getStreamToken } from "../lib/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const { user, isLoaded } = useUser();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const isHuddle = mode === "huddle";

  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!user,
  });

  useEffect(() => {
    const initCall = async () => {
      if (!tokenData?.token || !user || !callId) return;

      try {
        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user: {
            id: user.id,
            name: user.fullName || undefined,
            image: user.imageUrl,
          },
          token: tokenData.token,
        });

        // Use 'audio_room' type for huddles to default to audio only
        const callType = isHuddle ? "audio_room" : "default";
        const callInstance = videoClient.call(callType, callId);
        
        // If it's a huddle, join with camera off
        await callInstance.join({ create: true });
        
        if (isHuddle) {
          try {
            await callInstance.camera.disable();
          } catch (e) {
            console.log("Could not disable camera on join", e);
          }
        }
        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.log("Error init call:", error);
        toast.error("Cannot connect to the call.");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();
  }, [tokenData, user, callId, isHuddle]);

  if (isConnecting || !isLoaded) {
    return (
      <div className="h-screen flex justify-center items-center bg-[#0a0a0a]">
        <ShinyText text="Connecting..." speed={1.5} />
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col items-center justify-center ${isHuddle ? 'bg-[#0a0a0a]' : 'bg-gray-100'}`}>
      <div className="relative w-full max-w-4xl mx-auto h-full flex flex-col">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              {isHuddle ? (
                <>
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
                      <div className="w-12 h-12 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Audio Huddle</h2>
                    <p className="text-gray-400 max-w-md">You are in an audio-only huddle. You can navigate away, but the audio will stop unless you stay on this page.</p>
                  </div>
                  <HuddleOverlay />
                </>
              ) : (
                <CallContent />
              )}
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            <p>Could not initialize call. Please refresh or try again later</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();

  const callingState = useCallCallingState();
  const navigate = useNavigate();

  useEffect(() => {
    if (callingState === CallingState.LEFT) navigate("/");
  }, [callingState, navigate]);

  if (callingState === CallingState.LEFT) return null;

  return (
    <StreamTheme>
      <SpeakerLayout />
      <div className="flex items-center justify-center gap-3 py-2">
        <ScreenShareToggle />
        <CallControls />
      </div>
    </StreamTheme>
  );
};

export default CallPage;
