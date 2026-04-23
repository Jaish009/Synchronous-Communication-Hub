import { UserButton } from "@clerk/clerk-react";
import PollButton from "../components/polls/PollButton";
import CreatePollModal from "../components/polls/CreatePollModal";
import { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router";
import { useStreamChat } from "../hooks/useStreamChat";
import PageLoader from "../components/PageLoader";

import {
  Chat,
  Channel,
  ChannelList,
  MessageList,
  MessageInput,
  Thread,
  Window,
} from "stream-chat-react";

import "../styles/stream-chat-theme.css";
import { HashIcon, PlusIcon, UsersIcon } from "lucide-react";
import CreateChannelModal from "../components/CreateChannelModal";
import CustomChannelPreview from "../components/CustomChannelPreview";
import UsersList from "../components/UsersList";
import CustomChannelHeader from "../components/CustomChannelHeader";
import ShinyText from "../components/ShinyText";

const HomePage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const { chatClient, error, isLoading } = useStreamChat();

  // derive active channel from URL params instead of useEffect to adhere to React best practices
  const activeChannel = useMemo(() => {
    const channelId = searchParams.get("channel");
    if (chatClient && channelId) {
      return chatClient.channel("messaging", channelId);
    }
    return null;
  }, [chatClient, searchParams]);

  // todo: handle this with a better component
  if (error) return <p>Something went wrong...</p>;
  if (isLoading || !chatClient) return <PageLoader />;

  return (
    <div className="chat-wrapper">
      <Chat client={chatClient}>
        <div className="chat-container">
          {/* LEFT SIDEBAR */}
          <div className="str-chat__channel-list">
            <div className="team-channel-list">
              {/* HEADER */}
              <div className="team-channel-list__header gap-4">
                <div className="brand-container">
                  <Link to="/"><img src="/logo.png" alt="Logo" className="brand-logo" /></Link>
                  <span className="brand-name">
                    <ShinyText text="Synchronous Communication Hub" speed={2} className="font-bold" />
                  </span>
                </div>
                <div className="user-button-wrapper">
                  <UserButton />
                </div>
              </div>
              {/* CHANNELS LIST */}
              <div className="team-channel-list__content">
                <div className="create-channel-section">
                  <button onClick={() => setIsCreateModalOpen(true)} className="create-channel-btn">
                    <PlusIcon className="size-4" />
                    <ShinyText text="Create Channel" />
                  </button>
                </div>

                {/* CHANNEL LIST */}
                <ChannelList
                  filters={{ members: { $in: [chatClient?.user?.id || ""] } }}
                  options={{ state: true, watch: true }}
                  Preview={({ channel }: any) => (
                    <CustomChannelPreview
                      channel={channel}
                      activeChannel={activeChannel}
                      setActiveChannel={(channel: any) => setSearchParams({ channel: channel.id })}
                    />
                  )}
                  List={({ children, loading, error }: any) => (
                    <div className="channel-sections">
                      <div className="section-header">
                        <div className="section-title">
                          <HashIcon className="size-4" />
                          <ShinyText text="Channels" />
                        </div>
                      </div>

                      {/* todos: add better components here instead of just a simple text  */}
                      {loading && <div className="loading-message">Loading channels...</div>}
                      {error && <div className="error-message">Error loading channels</div>}

                      <div className="channels-list">{children}</div>

                      <div className="section-header direct-messages">
                        <div className="section-title">
                          <UsersIcon className="size-4" />
                          <ShinyText text="Direct Messages" />
                        </div>
                      </div>
                      <UsersList activeChannel={activeChannel} />
                    </div>
                  )}
                />
              </div>
            </div>
          </div>

          {/* RIGHT CONTAINER */}
          <div className="chat-main">
            <Channel channel={activeChannel || undefined}>
              <Window>
                <CustomChannelHeader />
                <MessageList />
                <div className="flex items-center">
                  <div className="flex-1">
                    <MessageInput />
                  </div>
                  <div className="px-2">
                    <PollButton onClick={() => setIsPollModalOpen(true)} />
                  </div>
                </div>
              </Window>

              <Thread />
            </Channel>
          </div>
        </div>

        {isCreateModalOpen && <CreateChannelModal onClose={() => setIsCreateModalOpen(false)} />}
        {isPollModalOpen && <CreatePollModal onClose={() => setIsPollModalOpen(false)} />}
      </Chat>
    </div>
  );
};
export default HomePage;
