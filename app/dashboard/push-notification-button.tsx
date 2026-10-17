"use client";

import { Bell, BellRing } from "lucide-react";
import { useEffect, useState } from "react";

type Status = "checking" | "ready" | "enabled" | "unsupported" | "denied" | "error";

function isInstalledPwa() {
  return window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

export default function PushNotificationButton() {
  const [isPwa, setIsPwa] = useState(false);
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    async function readSubscription() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setStatus("unsupported");
        return;
      }

      setIsPwa(isInstalledPwa());
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setStatus(subscription ? "enabled" : Notification.permission === "denied" ? "denied" : "ready");
    }

    void readSubscription();
  }, []);

  async function enable() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      setStatus("error");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const payload = subscription.toJSON();
      const response = await fetch("/api/push-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: payload.endpoint, keys: payload.keys }),
      });

      if (!response.ok) throw new Error("subscription-save-failed");
      setStatus("enabled");
    } catch {
      setStatus("error");
    }
  }

  if (!isPwa || status === "checking" || status === "unsupported") return null;
  if (status === "enabled") return <span className="flex items-center gap-2 rounded-xl border border-lime-300/20 bg-lime-300/10 px-3 py-2 text-sm text-lime-300"><BellRing size={16} aria-hidden="true" />Notificações ativas</span>;
  if (status === "denied") return <span className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">Notificações bloqueadas</span>;

  return <div className="flex flex-col items-start gap-1"><button type="button" onClick={enable} className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#17171a] px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"><Bell size={16} aria-hidden="true" />Ativar notificações</button>{status === "error" && <span className="text-xs text-amber-200">Não foi possível ativar. Tente novamente.</span>}</div>;
}
