"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LuActivity, LuRefreshCw } from "react-icons/lu";
import { Button } from "@/components/ui/button";

type ServiceStatus = "ok" | "error" | "loading" | "idle";

interface HealthResult {
  status: "ok" | "error";
  message?: string;
}

export function HealthCheckTab() {
  const [alpacaStatus, setAlpacaStatus] = useState<ServiceStatus>("idle");
  const [snaptradeStatus, setSnaptradeStatus] = useState<ServiceStatus>("idle");
  const [alpacaResult, setAlpacaResult] = useState<HealthResult | null>(null);
  const [snaptradeResult, setSnaptradeResult] = useState<HealthResult | null>(null);

  const runHealthCheck = async () => {
    setAlpacaStatus("loading");
    setSnaptradeStatus("loading");
    setAlpacaResult(null);
    setSnaptradeResult(null);

    try {
      const res = await fetch("/api/health");
      const data = await res.json();

      setAlpacaStatus(data.alpaca?.status === "ok" ? "ok" : "error");
      setAlpacaResult(data.alpaca);

      setSnaptradeStatus(data.snaptrade?.status === "ok" ? "ok" : "error");
      setSnaptradeResult(data.snaptrade);
    } catch {
      setAlpacaStatus("error");
      setSnaptradeStatus("error");
      setAlpacaResult({ status: "error", message: "Failed to reach health endpoint" });
      setSnaptradeResult({ status: "error", message: "Failed to reach health endpoint" });
    }
  };

  const StatusIndicator = ({ status }: { status: ServiceStatus }) => {
    if (status === "loading") {
      return <span className="inline-block h-3 w-3 rounded-full bg-yellow-400 animate-pulse" />;
    }
    if (status === "ok") {
      return <span className="inline-block h-3 w-3 rounded-full bg-green-500" />;
    }
    if (status === "error") {
      return <span className="inline-block h-3 w-3 rounded-full bg-red-500" />;
    }
    return <span className="inline-block h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600" />;
  };

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

      <div className="border-t pt-6">
        <Button onClick={runHealthCheck} variant="outline" size="sm">
          <LuRefreshCw className="mr-2 h-4 w-4" />
          Run Health Check
        </Button>

        <div className="mt-6 space-y-4 max-w-lg">
          {/* Alpaca */}
          <div className="flex items-start justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Alpaca</h3>
                <StatusIndicator status={alpacaStatus} />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Stock & options market data API
              </p>
              {alpacaResult && (
                <p className={`text-xs ${alpacaResult.status === "ok" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {alpacaResult.message}
                </p>
              )}
            </div>
          </div>

          {/* Snaptrade */}
          <div className="flex items-start justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Snaptrade</h3>
                <StatusIndicator status={snaptradeStatus} />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Brokerage account connectivity
              </p>
              {snaptradeResult && (
                <p className={`text-xs ${snaptradeResult.status === "ok" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {snaptradeResult.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
