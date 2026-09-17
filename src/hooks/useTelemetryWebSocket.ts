'use client';

import { useState, useEffect, useRef } from 'react';

export interface TelemetryMessage {
  type: string;
  timestamp?: number;
  status?: string;
  channel?: string;
  address?: string;
  mempool_queue_size?: number;
  active_surveillance_targets?: number;
  [key: string]: unknown;
}

export function useTelemetryWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<TelemetryMessage | null>(null);
  const [telemetryEvents, setTelemetryEvents] = useState<TelemetryMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace(/^https?:\/\//, '')
      : 'localhost:8000';
    const wsUrl = `${protocol}//${host}/api/v1/ws/telemetry`;

    let reconnectTimer: NodeJS.Timeout;

    function connect() {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data: TelemetryMessage = JSON.parse(event.data);
            setLastMessage(data);
            setTelemetryEvents((prev) => [data, ...prev.slice(0, 19)]);
          } catch {
            // Ignore non-json frames
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimer = setTimeout(connect, 5000);
        };

        ws.onerror = () => {
          setIsConnected(false);
          ws.close();
        };
      } catch {
        setIsConnected(false);
        reconnectTimer = setTimeout(connect, 5000);
      }
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const subscribeWallet = (address: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'subscribe_wallet', address }));
    }
  };

  return {
    isConnected,
    lastMessage,
    telemetryEvents,
    subscribeWallet,
  };
}
