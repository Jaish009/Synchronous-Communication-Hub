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
import { HashIcon, PlusIcon, UsersIcon, SparklesIcon } from "lucide-react";
import CreateChannelModal from "../components/CreateChannelModal";
import CustomChannelPreview from "../components/CustomChannelPreview";
import UsersList from "../components/UsersList";
import CustomChannelHeader from "../components/CustomChannelHeader";
import ShinyText from "../components/ShinyText";
import { SmartReplies } from "../components/SmartReplies";

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
            {activeChannel ? (
              <Channel channel={activeChannel}>
                <Window>
                  <CustomChannelHeader />
                  <MessageList />
                  <div className="flex flex-col">
                    <SmartReplies />
                    <div className="flex items-center">
                      <div className="flex-1">
                        <MessageInput />
                      </div>
                      <div className="px-2">
                        <PollButton onClick={() => setIsPollModalOpen(true)} />
                      </div>
                    </div>
                  </div>
                </Window>

                <Thread />
              </Channel>
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-[#0a0a0a] p-8 text-center">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-purple-500/20 blur-[60px] rounded-full" />
                  <div className="relative p-6 bg-purple-500/10 border border-purple-500/20 rounded-3xl backdrop-blur-xl">
                    <SparklesIcon size={48} className="text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                  Synchronous AI Hub
                </h2>
                <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
                  Select a channel from the sidebar to start collaborating. Our AI assistant is ready to summarize discussions and suggest smart replies.
                </p>
                
                <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <SparklesIcon size={16} className="text-purple-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">AI Summaries</span>
                    </div>
                    <p className="text-xs text-gray-500">Get instant summaries of missed conversations.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <SparklesIcon size={16} className="text-purple-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Smart Replies</span>
                    </div>
                    <p className="text-xs text-gray-500">Speed up your workflow with AI-generated suggestions.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {isCreateModalOpen && <CreateChannelModal onClose={() => setIsCreateModalOpen(false)} />}
        {isPollModalOpen && <CreatePollModal onClose={() => setIsPollModalOpen(false)} />}
      </Chat>
    </div>
  );
};
export default HomePage;
