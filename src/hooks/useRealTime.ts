import { useState, useEffect, useCallback } from "react";

// Hook for real-time data fetching with interval
export function useRealTimeData<T>(
  fetchFunction: () => Promise<T>,
  interval: number = 3000
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchFunction();
      setData(result);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  // Function to manually refresh data
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Effect to fetch data initially and set up interval
  useEffect(() => {
    fetchData();

    // Set up interval for auto-updates
    const intervalId = setInterval(fetchData, interval);

    // Clean up interval when component unmounts
    return () => clearInterval(intervalId);
  }, [fetchData, interval]);

  return { data, loading, error, refresh };
}

// Notification type
export type Notification = {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
};

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Add notification
  const addNotification = useCallback(
    (
      message: string,
      type: "info" | "success" | "warning" | "error" = "info"
    ) => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        message,
        type,
        timestamp: new Date(),
      };

      setNotifications((prev) => [newNotification, ...prev]);

      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5000);

      return newNotification.id;
    },
    []
  );

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };
}

// Socket connection status type
export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

// Mock real-time connection using polling for MVP
// This can be replaced with a real WebSocket implementation later
export function useRealTimeConnection(
  url: string,
  onMessage?: (data: any) => void,
  interval: number = 3000
) {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [lastMessage, setLastMessage] = useState<any>(null);

  // Fetch data periodically to simulate a real-time connection
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      setLastMessage(data);
      setStatus("connected");

      if (onMessage) {
        onMessage(data);
      }
    } catch (error) {
      console.error("Error fetching real-time data:", error);
      setStatus("error");
    }
  }, [url, onMessage]);

  // Set up polling
  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up interval
    const intervalId = setInterval(fetchData, interval);

    // Clean up
    return () => {
      clearInterval(intervalId);
      setStatus("disconnected");
    };
  }, [fetchData, interval]);

  // Function to manually reconnect
  const reconnect = useCallback(() => {
    setStatus("connecting");
    fetchData();
  }, [fetchData]);

  return {
    status,
    lastMessage,
    reconnect,
  };
}
