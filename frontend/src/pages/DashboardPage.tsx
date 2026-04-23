import { ArrowLeft, BarChart3, Users, Activity, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useChatContext } from "stream-chat-react";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { client } = useChatContext();
  const [stats, setStats] = useState({
    totalChannels: 0,
    activeUsers: 0,
    totalMessages: 0,
    onlineMembers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch some basic stats from Stream
        // In a real app, this would be a dedicated backend endpoint aggregating data
        const channels = await client.queryChannels({}, { last_message_at: -1 }, { limit: 30 });
        
        let messagesCount = 0;
        const uniqueUsers = new Set();
        
        channels.forEach(c => {
          messagesCount += c.state.messages.length;
          Object.keys(c.state.members).forEach(id => uniqueUsers.add(id));
        });

        setStats({
          totalChannels: channels.length,
          activeUsers: uniqueUsers.size,
          totalMessages: messagesCount,
          onlineMembers: Math.floor(uniqueUsers.size * 0.4), // Simulated online count
        });
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };
    
    if (client) {
      fetchStats();
    }
  }, [client]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Chat</span>
        </button>

        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2 tracking-tight">Workspace Dashboard</h1>
          <p className="text-gray-400">Overview of your team's activity and metrics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            title="Total Channels" 
            value={stats.totalChannels.toString()} 
            icon={<HashIcon />} 
            trend="+12% this week" 
            delay={0.1}
          />
          <StatCard 
            title="Active Members" 
            value={stats.activeUsers.toString()} 
            icon={<Users size={22} className="text-blue-400" />} 
            trend="+3% this week"
            delay={0.2}
          />
          <StatCard 
            title="Messages Sent" 
            value={stats.totalMessages.toString()} 
            icon={<MessageSquare size={22} className="text-purple-400" />} 
            trend="+24% this week"
            delay={0.3}
          />
          <StatCard 
            title="Online Now" 
            value={stats.onlineMembers.toString()} 
            icon={<Activity size={22} className="text-emerald-400" />} 
            trend="Live"
            delay={0.4}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#141414] border border-white/10 rounded-2xl p-6 h-80 flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
             <BarChart3 size={48} className="text-gray-600 mb-4" />
             <p className="text-gray-400 font-medium text-lg">Activity Chart</p>
             <p className="text-gray-500 text-sm mt-2 max-w-sm text-center">
               Connect a chart library like Recharts to visualize message volume over time.
             </p>
          </div>
          
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 h-80 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <h3 className="text-lg font-semibold mb-4">Top Channels</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">#</span>
                    </div>
                    <div className="w-24 h-4 bg-white/10 rounded animate-pulse" />
                  </div>
                  <div className="w-8 h-4 bg-white/10 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon, trend, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: "easeOut" }}
    className="bg-[#141414] border border-white/10 rounded-2xl p-6 relative group overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-white/5 rounded-xl border border-white/5">
        {icon}
      </div>
      <span className="text-xs font-medium text-gray-500 bg-white/5 px-2 py-1 rounded-full">
        {trend}
      </span>
    </div>
    <div>
      <h4 className="text-gray-400 text-sm font-medium mb-1">{title}</h4>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
    </div>
  </motion.div>
);

const HashIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <line x1="4" x2="20" y1="9" y2="9" />
    <line x1="4" x2="20" y1="15" y2="15" />
    <line x1="10" x2="8" y1="3" y2="21" />
    <line x1="16" x2="14" y1="3" y2="21" />
  </svg>
);
