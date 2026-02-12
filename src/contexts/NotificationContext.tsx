import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";

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

const NOTIFICATION_SOUND_URL = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdW+Jkpd/aXBygoyQf3VqcH+Lk5J8cW1xf4qQin5ybHKAi5GLfnJscoCLkYt+cmxygIuRi35ybHKAi5CLfnJscoCKkIt+cmxygIuRi35ybA==";

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "demo-1", type: "lead", title: "Novo Lead via WhatsApp", message: "Ricardo Pereira enviou mensagem", read: false, timestamp: new Date().toISOString() },
    { id: "demo-2", type: "whatsapp", title: "Mensagem recebida", message: "Luciana Mendes respondeu", read: false, timestamp: new Date(Date.now() - 300000).toISOString() },
  ]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const playSound = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
        audioRef.current.volume = 0.5;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {}
  }, []);

  const addNotification = useCallback((n: Omit<Notification, "id" | "read" | "timestamp">) => {
    const newNotif: Notification = {
      ...n,
      id: crypto.randomUUID(),
      read: false,
      timestamp: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
    playSound();
  }, [playSound]);

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
