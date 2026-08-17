"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LuActivity } from "react-icons/lu";

type ServiceStatus = "ok" | "error" | "loading";

export function HealthCheckTab() {
  const [alpacaStatus, setAlpacaStatus] = useState<ServiceStatus>("loading");
  const [snaptradeStatus, setSnaptradeStatus] = useState<ServiceStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/health");
        const data = await res.json();
        if (cancelled) return;
        setAlpacaStatus(data.alpaca?.status === "ok" ? "ok" : "error");
        setSnaptradeStatus(data.snaptrade?.status === "ok" ? "ok" : "error");
      } catch {
        if (cancelled) return;
        setAlpacaStatus("error");
        setSnaptradeStatus("error");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const StatusBadge = ({ status }: { status: ServiceStatus }) => {
    const dotClass = status === "ok"
      ? "bg-green-500"
      : status === "error"
        ? "bg-red-500"
        : "bg-yellow-400 animate-pulse";
    const label = status === "ok" ? "Healthy" : status === "error" ? "Unhealthy" : "Checking...";

    return (
      <div className="flex items-center gap-2">
        <span className={`inline-block h-3 w-3 rounded-full shrink-0 ${dotClass}`} />
        <span className="text-sm font-medium">{label}</span>
      </div>
    );
  };

  const services = [
    { name: "Alpaca", description: "Stock & options market data API", status: alpacaStatus },
    { name: "Snaptrade", description: "Brokerage account connectivity", status: snaptradeStatus },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <LuActivity size={32} className="text-gray-700 dark:text-gray-300" />
        <div>
          <h2 className="text-2xl font-bold">Healthcheck</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Verify connectivity to external APIs.
          </p>
        </div>
      </div>

      <div className="border-t pt-6 space-y-4 max-w-lg">
        {services.map((svc) => (
          <div key={svc.name} className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <h3 className="font-semibold">{svc.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{svc.description}</p>
            </div>
            <StatusBadge status={svc.status} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
