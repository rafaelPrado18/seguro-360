import { useEffect, useState, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : "";
}

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<"loading" | "ok" | "denied">("loading");

  const validate = (signal?: AbortSignal) => {
    const token = getCookie("userToken");
    const userId = getCookie("userId");

    if (!token || !userId) {
      setStatus("denied");
      return;
    }

    fetch("https://crm-hataseg.com.br/v1/valid/authorization/token", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        target: location.pathname,
        action: "GET",
      }),
      signal,
    })
      .then((res) => {
        if (res.ok) setStatus("ok");
        else setStatus("denied");
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Auth validation error:", err);
          setStatus("denied");
        }
      });
  };

  // Validate on route change
  useEffect(() => {
    const controller = new AbortController();
    validate(controller.signal);
    return () => controller.abort();
  }, [location.pathname]);

  // Periodic revalidation every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      validate();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  // Auto-logout after 45 minutes of inactivity (no clicks)
  useEffect(() => {
    if (status !== "ok") return;

    const INACTIVITY_MS = 45 * 60 * 1000;
    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setStatus("denied");
      }, INACTIVITY_MS);
    };

    resetTimer();
    window.addEventListener("click", resetTimer);
    window.addEventListener("keydown", resetTimer);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [status]);

  useEffect(() => {
    if (status === "denied") {
      // Clear cookies
      document.cookie = "userToken=; path=/; max-age=0";
      document.cookie = "userId=; path=/; max-age=0";
      document.cookie = "userName=; path=/; max-age=0";
      document.cookie = "userEmail=; path=/; max-age=0";
      document.cookie = "userFunction=; path=/; max-age=0";
      document.cookie = "userStatus=; path=/; max-age=0";
      document.cookie = "assignedConsultant=; path=/; max-age=0";
      navigate("/login", { replace: true });
    }
  }, [status, navigate]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (status === "denied") return null;

  return <>{children}</>;
}
