import { createContext, useContext, useRef, useEffect, type ReactNode } from "react";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";
import { useNotificationEvents, useMarkEventAsRead, useMarkAllEventsAsRead } from "@/hooks/useNotifications";
import type { NotificationEvent } from "@/services/notificationsService";

export interface Notification {
  id: string;
  type: "lead" | "whatsapp" | "system";
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  leadId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, "id" | "read" | "timestamp">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType);

export function useNotifications() {
  return useContext(NotificationContext);
}

const playNewLeadSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    const freqs = [1200, 1500, 1800];
    const beepDuration = 0.25;
    const gap = 0.1;
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.5, now + i * (beepDuration + gap));
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * (beepDuration + gap) + beepDuration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * (beepDuration + gap));
      osc.stop(now + i * (beepDuration + gap) + beepDuration);
    });
    setTimeout(() => ctx.close().catch(() => {}), 1500);
  } catch {}
};

function mapEventToNotification(event: NotificationEvent): Notification {
  return {
    id: event.id,
    type: event.type === "leads_novos" ? "lead" : event.type === "mensagens_novas" ? "whatsapp" : "system",
    title: event.title,
    message: event.message,
    read: event.read,
    timestamp: event.timestamp,
    leadId: event.leadId,
  };
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useRole();

  const { data: apiEvents } = useNotificationEvents(currentUser.id);
  const markReadMutation = useMarkEventAsRead();
  const markAllReadMutation = useMarkAllEventsAsRead();

  const prevEventIdsRef = useRef<Set<string>>(new Set());

  const notifications: Notification[] = (apiEvents || []).map(mapEventToNotification);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Sound + toast for new events
  useEffect(() => {
    if (apiEvents && apiEvents.length > 0) {
      const prevIds = prevEventIdsRef.current;
      const newEvents = apiEvents.filter(e => !e.read && !prevIds.has(e.id));

      if (newEvents.length > 0 && prevIds.size > 0) {
        playNewLeadSound();
        const leadEvents = newEvents.filter(e => e.type === "leads_novos");
        const msgEvents = newEvents.filter(e => e.type === "mensagens_novas");

        if (leadEvents.length > 0) {
          toast.success(`${leadEvents.length} novo${leadEvents.length > 1 ? "s" : ""} lead${leadEvents.length > 1 ? "s" : ""}!`, {
            description: leadEvents.map(e => e.message).join(", "),
          });
        }
        if (msgEvents.length > 0) {
          toast.info(`${msgEvents.length} nova${msgEvents.length > 1 ? "s" : ""} mensagen${msgEvents.length > 1 ? "s" : ""}!`, {
            description: msgEvents.map(e => e.message).join(", "),
          });
        }
      }

      prevEventIdsRef.current = new Set(apiEvents.map(e => e.id));
    }
  }, [apiEvents]);

  const markAsRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const markAllAsRead = () => {
    markAllReadMutation.mutate(currentUser.nome);
  };

  const addNotification = () => {
    // No-op: notifications now come from API
  };

  const clearAll = () => {
    markAllAsRead();
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}
