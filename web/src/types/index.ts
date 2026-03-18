export type LinkItem = {
  id: string;
  originalUrl: string;
  shortCode: string;
  accessCount: number;
  createdAt: string;
};

export interface PaginationState {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor: string | null;
  prevCursors: string[];
  limit: number;
  isLoadingMore: boolean;
  currentPage: number;
  canGoBack: boolean;
  canGoForward: boolean;
}

export interface PaginationActions {
  nextPage: () => void;
  previousPage: () => void;
  changeLimit: (limit: number) => void;
}

export type PaginationData = PaginationState & PaginationActions;

export interface UseFetchLinksReturn {
  items: LinkItem[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  setItems: React.Dispatch<React.SetStateAction<LinkItem[]>>;
  pagination: PaginationData;
}

export interface PaginationCursorProps {
  currentPage: number;
  canGoBack: boolean;
  canGoForward: boolean;
  hasItems: boolean;
  loading: boolean;
  itemCount: number;
  onNext: () => void;
  onPrevious: () => void;
  onLimitChange?: (limit: number) => void;
  currentLimit?: number;
}

export interface LinksListProps {
  items: LinkItem[];
  onRefresh: () => void;
  loading: boolean;
  pagination: PaginationData;
}

export interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface GlobalMessageProps {
  message: string;
  type: "error" | "success" | "warning";
  onClose: () => void;
}

export interface NewLinkCardProps {
  onCreated: () => void;
}

export interface EmptyStateProps {
  text?: string;
}
