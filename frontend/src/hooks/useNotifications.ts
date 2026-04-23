import { useEffect, useCallback, useState } from "react";
import type { StreamChat, Event } from "stream-chat";

interface UseNotificationsReturn {
  permissionStatus: NotificationPermission | "unsupported";
  requestPermission: () => Promise<void>;
  isEnabled: boolean;
}

export const useNotifications = (
  chatClient: StreamChat | null
): UseNotificationsReturn => {
  const [permissionStatus, setPermissionStatus] = useState<
    NotificationPermission | "unsupported"
  >(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission;
  });

  const isEnabled = permissionStatus === "granted";

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("SW registration failed:", err);
      });
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      setPermissionStatus("unsupported");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
    } catch (err) {
      console.error("Error requesting notification permission:", err);
    }
  }, []);

  // Listen for new messages from Stream Chat and show notifications
  useEffect(() => {
    if (!chatClient || !isEnabled) return;

    const handleNewMessage = (event: Event) => {
      // Don't notify for own messages
      if (event.user?.id === chatClient.userID) return;

      // Don't notify if page is focused
      if (document.hasFocus()) return;

      const title = event.user?.name || event.user?.id || "New Message";
      const body =
        event.message?.text || "You have a new message";

      new Notification(title, {
        body,
        icon: "/icons/icon-192x192.png",
        tag: `msg-${event.message?.id}`,
      });
    };

    chatClient.on("message.new", handleNewMessage);
    return () => {
      chatClient.off("message.new", handleNewMessage);
    };
  }, [chatClient, isEnabled]);

  return { permissionStatus, requestPermission, isEnabled };
};
