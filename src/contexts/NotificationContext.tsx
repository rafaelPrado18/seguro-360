import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { leadsService } from "@/services/leadsService";
import { toast } from "sonner";
import { useRole } from "@/contexts/RoleContext";
import { v4 as uuidv4 } from "uuid";

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

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAdmin, currentUser } = useRole();
  
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "demo-1", type: "lead", title: "Novo Lead via WhatsApp", message: "Ricardo Pereira enviou mensagem", read: false, timestamp: new Date().toISOString() },
    { id: "demo-2", type: "whatsapp", title: "Mensagem recebida", message: "Luciana Mendes respondeu", read: false, timestamp: new Date(Date.now() - 300000).toISOString() },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((n: Omit<Notification, "id" | "read" | "timestamp">) => {
    const newNotif: Notification = {
      ...n,
      id: uuidv4(),
      read: false,
      timestamp: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
  }, []);
  // Global lead polling every 10 seconds
  const { data: apiLeads } = useQuery({
    queryKey: ["leads"],
    queryFn: () => leadsService.getLeads(null, currentUser.nome, currentUser.role),
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
    retry: 1,
  });

  const prevLeadIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (apiLeads?.data && apiLeads.data.length > 0) {
      console.log('testeeee', apiLeads?.data)
      const prevIds = prevLeadIdsRef.current;
      const newLeads = apiLeads.data.filter(l => !prevIds.has(l.id));

      if (newLeads.length > 0 && prevIds.size > 0) {
        playNewLeadSound();
        newLeads.forEach(lead => {
          addNotification({
            type: "lead",
            title: "🔔 Novo Lead!",
            message: `${lead.nome} — ${lead.ramo_interesse} (${lead.origem})`,
            leadId: lead.id,
          });
        });
        toast.success(`${newLeads.length} novo${newLeads.length > 1 ? "s" : ""} lead${newLeads.length > 1 ? "s" : ""} recebido${newLeads.length > 1 ? "s" : ""}!`, {
          description: newLeads.map(l => l.nome).join(", "),
        });
      }

      prevLeadIdsRef.current = new Set(apiLeads.data.map(l => l.id));
    }
  }, [apiLeads, addNotification]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}
