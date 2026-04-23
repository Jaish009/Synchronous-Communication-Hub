import { HashIcon, LockIcon, UsersIcon, PinIcon, VideoIcon } from "lucide-react";
import { useChannelStateContext } from "stream-chat-react";
import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import MembersModal from "./MembersModal";
import PinnedMessagesModal from "./PinnedMessagesModal";
import InviteModal from "./InviteModal";

const CustomChannelHeader = () => {
  const { channel } = useChannelStateContext();
  const { user } = useUser();

  const memberCount = Object.keys(channel.state.members).length;

  const [showInvite, setShowInvite] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<any[]>([]);

  const otherUser = Object.values(channel.state.members).find(
    (member: any) => member.user.id !== user?.id
  );

  const isDM = channel.data?.member_count === 2 && (channel.data?.id as string)?.includes("user_");

  const handleShowPinned = async () => {
    const channelState = await channel.query();
    setPinnedMessages(channelState.pinned_messages || []);
    setShowPinnedMessages(true);
  };

  const handleVideoCall = async () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      await channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });
    }
  };

  return (
    <div className="h-14 border-b border-[rgba(255,255,255,0.08)] flex items-center px-4 justify-between bg-[#111119]">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {(channel.data as any)?.private ? (
            <LockIcon className="size-4 text-[rgba(255,255,255,0.5)]" />
          ) : (
            <HashIcon className="size-4 text-[rgba(255,255,255,0.5)]" />
          )}

          {isDM && (otherUser as any)?.user?.image && (
            <img
              src={(otherUser as any).user.image}
              alt={(otherUser as any).user.name || (otherUser as any).user.id}
              className="size-7 rounded-full object-cover mr-1"
            />
          )}

          <span className="font-medium text-[rgba(255,255,255,0.9)]">
            {isDM ? (otherUser as any)?.user?.name || (otherUser as any)?.user?.id : channel.data?.id}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="flex items-center gap-2 hover:bg-[rgba(255,255,255,0.08)] py-1 px-2 rounded"
          onClick={() => setShowMembers(true)}
        >
          <UsersIcon className="size-5 text-[rgba(255,255,255,0.5)]" />
          <span className="text-sm text-[rgba(255,255,255,0.5)]">{memberCount}</span>
        </button>

        <button
          className="hover:bg-[rgba(255,255,255,0.08)] p-1 rounded"
          onClick={handleVideoCall}
          title="Start Video Call"
        >
          <VideoIcon className="size-5 text-[#1264A3]" />
        </button>

        {(channel.data as any)?.private && (
          <button className="btn btn-primary" onClick={() => setShowInvite(true)}>
            Invite
          </button>
        )}

        <button className="hover:bg-[rgba(255,255,255,0.08)] p-1 rounded" onClick={handleShowPinned}>
          <PinIcon className="size-4 text-[rgba(255,255,255,0.5)]" />
        </button>
      </div>

      {showMembers && (
        <MembersModal
          members={Object.values(channel.state.members)}
          onClose={() => setShowMembers(false)}
        />
      )}

      {showPinnedMessages && (
        <PinnedMessagesModal
          pinnedMessages={pinnedMessages}
          onClose={() => setShowPinnedMessages(false)}
        />
      )}

      {showInvite && <InviteModal channel={channel} onClose={() => setShowInvite(false)} />}
    </div>
  );
};

export default CustomChannelHeader;
