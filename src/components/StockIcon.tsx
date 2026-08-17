"use client";

import { useState } from "react";
import Image from "next/image";

interface StockIconProps {
  src: string;
  symbol: string;
  size?: number;
  className?: string;
}

export function StockIcon({ src, symbol, size = 32, className = "" }: StockIconProps) {
  const [imgError, setImgError] = useState(false);

  if (imgError || !src) {
    return (
      <div
        className={`rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300 shrink-0 ${className}`}
        style={{ width: size, height: size }}
        title={symbol}
      >
        {symbol?.slice(0, 2).toUpperCase() || "?"}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={symbol}
      width={size}
      height={size}
      className={`rounded-full shrink-0 ${className}`}
      onError={() => setImgError(true)}
    />
  );
}
