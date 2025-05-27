import { useState, useEffect, useCallback } from "react";

export interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
}

// Hook genérico para dados em tempo real
export function useRealTimeData<T>(
  fetchFunction: () => Promise<T>,
  interval: number = 3000,
  dependencies: any[] = []
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
  lastUpdate: Date | null;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      console.log("🔄 Atualizando dados em tempo real...");
      const result = await fetchFunction();

      if (result !== undefined && result !== null) {
        setData(result);
        setError(null);
        setLastUpdate(new Date());
        console.log("✅ Dados atualizados com sucesso");
      } else {
        console.warn("⚠️ Função retornou dados vazios");
      }
    } catch (err) {
      console.error("❌ Error fetching data:", err);

      // Não substituir dados existentes em caso de erro de rede temporário
      if (err instanceof Error) {
        // Se é o primeiro carregamento, definir o erro
        if (data === null) {
          setError(err);
        } else {
          // Se já temos dados, apenas logar o erro mas manter os dados
          console.warn(
            "Erro na atualização, mantendo dados anteriores:",
            err.message
          );
        }
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, data]);

  // Função para refresh manual
  const refresh = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  // Efeito para buscar dados iniciais e configurar o intervalo
  useEffect(() => {
    // Buscar dados imediatamente
    fetchData();

    // Configurar intervalo para atualizações automáticas
    const intervalId = setInterval(() => {
      // Só atualizar se não estiver em loading
      if (!loading) {
        fetchData();
      }
    }, interval);

    // Limpar intervalo quando o componente for desmontado ou dependências mudarem
    return () => {
      clearInterval(intervalId);
    };
  }, [...dependencies, interval]);

  return { data, loading, error, refresh, lastUpdate };
}

// Hook para notificações
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (
      message: string,
      type: "info" | "success" | "warning" | "error" = "info"
    ) => {
      const notification: Notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        message,
        type,
        timestamp: new Date(),
      };

      setNotifications((prev) => [notification, ...prev]);

      // Auto-remover notificação após 5 segundos
      setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);

      console.log(`📢 Nova notificação (${type}):`, message);
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

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

// Hook especializado para conexão em tempo real
export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastConnectionCheck, setLastConnectionCheck] = useState<Date>(
    new Date()
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastConnectionCheck(new Date());
      console.log("🟢 Conectado à internet");
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastConnectionCheck(new Date());
      console.log("🔴 Desconectado da internet");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Verificar conexão periodicamente
    const intervalId = setInterval(() => {
      const wasOnline = isOnline;
      const currentOnline = navigator.onLine;

      if (wasOnline !== currentOnline) {
        setIsOnline(currentOnline);
        setLastConnectionCheck(new Date());
      }
    }, 10000); // Verificar a cada 10 segundos

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(intervalId);
    };
  }, [isOnline]);

  return {
    isOnline,
    lastConnectionCheck,
  };
}
