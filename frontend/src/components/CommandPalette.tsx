import { KBarProvider, KBarPortal, KBarPositioner, KBarAnimator, KBarSearch, useMatches, KBarResults } from "kbar";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router";
import { forwardRef, useMemo } from "react";
import { Search, LogOut, LayoutDashboard, MessageSquare, Sun, Moon } from "lucide-react";

export const CommandPalette = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { user } = useUser();

  const actions = useMemo(() => [
    {
      id: "home",
      name: "Home (Chat)",
      shortcut: ["g", "h"],
      keywords: "home chat channel messages",
      perform: () => navigate("/"),
      icon: <MessageSquare size={18} />,
    },
    {
      id: "dashboard",
      name: "Dashboard",
      shortcut: ["g", "d"],
      keywords: "dashboard metrics stats analytics",
      perform: () => navigate("/dashboard"),
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: "theme",
      name: "Toggle Theme",
      shortcut: ["t", "t"],
      keywords: "theme dark light toggle color",
      perform: () => {
        const root = document.documentElement;
        const currentTheme = root.getAttribute("data-theme");
        root.setAttribute("data-theme", currentTheme === "cyber" ? "default" : "cyber");
      },
      icon: <Sun size={18} />,
    },
    {
      id: "logout",
      name: "Log Out",
      shortcut: ["l", "o"],
      keywords: "logout signout exit",
      perform: () => signOut(() => navigate("/auth")),
      icon: <LogOut size={18} />,
    },
  ], [navigate, signOut]);

  return (
    <KBarProvider actions={actions}>
      <KBarPortal>
        <KBarPositioner className="z-[100] bg-black/60 backdrop-blur-sm p-4 pt-[15vh]">
          <KBarAnimator className="max-w-xl w-full bg-[#141414] rounded-xl overflow-hidden border border-white/10 shadow-2xl drop-shadow-2xl">
            <div className="flex items-center px-4 py-3 border-b border-white/10">
              <Search className="text-gray-400 mr-3" size={20} />
              <KBarSearch 
                className="w-full bg-transparent text-white outline-none placeholder-gray-500 font-medium text-lg" 
                defaultPlaceholder="Type a command or search..."
              />
            </div>
            <RenderResults />
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </KBarProvider>
  );
};

const RenderResults = () => {
  const { results } = useMatches();

  if (results.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400">
        No results found.
      </div>
    );
  }

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === "string" ? (
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {item}
          </div>
        ) : (
          <ResultItem
            action={item}
            active={active}
          />
        )
      }
    />
  );
};

const ResultItem = forwardRef(({ action, active }: any, ref: any) => {
  return (
    <div
      ref={ref}
      className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
        active ? "bg-white/10 border-l-2 border-purple-500" : "bg-transparent border-l-2 border-transparent"
      }`}
    >
      <div className="flex items-center gap-3">
        {action.icon && <span className="text-gray-400">{action.icon}</span>}
        <span className="text-gray-200 font-medium">{action.name}</span>
      </div>
      {action.shortcut?.length > 0 && (
        <div className="flex gap-1">
          {action.shortcut.map((sc: string) => (
            <kbd
              key={sc}
              className="px-2 py-1 bg-white/10 rounded text-xs text-gray-400 font-mono border border-white/5"
            >
              {sc}
            </kbd>
          ))}
        </div>
      )}
    </div>
  );
});
ResultItem.displayName = "ResultItem";
