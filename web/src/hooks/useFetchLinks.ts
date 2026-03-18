import { useEffect, useState } from "react";
import { LinkItem, UseFetchLinksReturn } from "../types/index";
import { BACKEND } from "../utils/constants";

export function useFetchLinks(): UseFetchLinksReturn {
  const [items, setItems] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para cursor-based pagination
  const [pagination, setPagination] = useState({
    hasNextPage: false,
    hasPreviousPage: false,
    nextCursor: null as string | null,
    prevCursors: [] as string[],
    limit: 20,
    isLoadingMore: false,
    currentPage: 1,
    canGoBack: false,
    canGoForward: false,
  });

  async function fetchLinks(
    cursor?: string | null,
    isNextPage: boolean = true,
  ) {
    if (loading) return;

    console.log("📡 Fetching links:", {
      cursor,
      isNextPage,
      currentPagination: pagination,
    });

    setLoading(true);
    setError(null);

    try {
      const url = new URL(`${BACKEND}/links`);
      url.searchParams.append("limit", pagination.limit.toString());

      if (cursor) {
        url.searchParams.append("cursor", cursor);
      }

      console.log("🔗 URL:", url.toString());

      const res = await fetch(url.toString());

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      console.log("📦 Data received:", data);

      const rawList = data.items || [];

      const list: LinkItem[] = rawList.map((item: any) => ({
        id: item.id,
        originalUrl: item.original_url,
        shortCode: item.short_code,
        accessCount: item.access_count,
        createdAt: item.created_at,
      }));

      setItems(list);

      // Calcular novos prevCursors
      let newPrevCursors = [...pagination.prevCursors];

      if (isNextPage && cursor) {
        // Indo para frente: adiciona o cursor atual à pilha
        newPrevCursors = [...pagination.prevCursors, cursor];
      } else if (!isNextPage && cursor) {
        // Voltando: já ajustamos a pilha no previousPage
        newPrevCursors = pagination.prevCursors;
      }

      // Calcular página atual
      let currentPage = isNextPage
        ? newPrevCursors.length + 1
        : Math.max(1, newPrevCursors.length);

      // 🚨 NOVO: Se a lista está vazia e não estamos na primeira página
      if (list.length === 0 && currentPage > 1) {
        console.log("⚠️ Página vazia detectada! Voltando para página anterior");

        // Remove o último cursor (página vazia)
        newPrevCursors.pop();
        currentPage = Math.max(1, newPrevCursors.length);

        // Recarrega a página anterior
        const newCursor =
          newPrevCursors.length > 0
            ? newPrevCursors[newPrevCursors.length - 1]
            : null;

        console.log("🔄 Recarregando página anterior:", {
          newPrevCursors,
          currentPage,
          newCursor,
        });

        // Atualiza estado e faz nova requisição
        setPagination((prev) => ({
          ...prev,
          prevCursors: newPrevCursors,
          currentPage,
        }));

        // Faz nova requisição para a página anterior
        fetchLinks(newCursor, false);
        return;
      }

      const hasPreviousPage = newPrevCursors.length > 0 && currentPage > 1;

      console.log("📊 Nova paginação:", {
        newPrevCursors,
        currentPage,
        hasNextPage: !!data.nextCursor,
        hasPreviousPage,
        canGoBack: hasPreviousPage,
        canGoForward: !!data.nextCursor,
      });

      setPagination((prev) => ({
        ...prev,
        hasNextPage: !!data.nextCursor,
        nextCursor: data.nextCursor || null,
        prevCursors: newPrevCursors,
        hasPreviousPage,
        currentPage,
        canGoBack: hasPreviousPage,
        canGoForward: !!data.nextCursor,
      }));
    } catch (err: any) {
      console.error("❌ Error:", err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  const nextPage = () => {
    console.log("➡️ Next page clicked", {
      hasNextPage: pagination.hasNextPage,
      nextCursor: pagination.nextCursor,
      loading,
    });

    if (pagination.hasNextPage && !loading) {
      fetchLinks(pagination.nextCursor, true);
    } else {
      // Se não tem nextPage mas o usuário clicou (por algum motivo)
      console.warn("⚠️ Tentativa de ir para próxima página sem nextCursor");
    }
  };

  const previousPage = () => {
    console.log("⬅️ Previous page clicked", {
      hasPreviousPage: pagination.hasPreviousPage,
      prevCursors: pagination.prevCursors,
      currentPage: pagination.currentPage,
      loading,
    });

    if (!loading && pagination.hasPreviousPage) {
      const prevCursors = [...pagination.prevCursors];
      // Remove o último cursor (que levou à página atual)
      prevCursors.pop();

      // O cursor para usar é o último da pilha (agora reduzida)
      const cursorToUse =
        prevCursors.length > 0 ? prevCursors[prevCursors.length - 1] : null;

      console.log("🔙 Voltando para página anterior", {
        oldPrevCursors: pagination.prevCursors,
        newPrevCursors: prevCursors,
        cursorToUse,
        newLength: prevCursors.length,
        newPageNumber: Math.max(1, prevCursors.length),
      });

      setPagination((prev) => ({
        ...prev,
        prevCursors,
      }));

      fetchLinks(cursorToUse, false);
    }
  };
  const refresh = () => {
    const currentCursor =
      pagination.prevCursors.length > 0
        ? pagination.prevCursors[pagination.prevCursors.length - 1]
        : null;

    fetchLinks(currentCursor, false);
  };

  const changeLimit = (newLimit: number) => {
    console.log("📏 Changing limit to:", newLimit);

    setPagination({
      hasNextPage: false,
      hasPreviousPage: false,
      nextCursor: null,
      prevCursors: [],
      limit: newLimit,
      isLoadingMore: false,
      currentPage: 1,
      canGoBack: false,
      canGoForward: false,
    });

    fetchLinks(null, true);
  };

  useEffect(() => {
    console.log("🚀 Initial fetch");
    void fetchLinks(null, true);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("👁️ Tab visible, refreshing");
        refresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pagination.prevCursors]);

  // Log do estado atual da paginação
  useEffect(() => {
    console.log("📊 Estado atual da paginação:", {
      currentPage: pagination.currentPage,
      canGoBack: pagination.canGoBack,
      canGoForward: pagination.canGoForward,
      hasPreviousPage: pagination.hasPreviousPage,
      hasNextPage: pagination.hasNextPage,
      prevCursors: pagination.prevCursors,
      nextCursor: pagination.nextCursor,
      itemsCount: items.length,
    });
  }, [pagination, items]);

  return {
    items,
    loading,
    error,
    refresh,
    setItems,
    pagination: {
      ...pagination,
      nextPage,
      previousPage,
      changeLimit,
    },
  };
}
