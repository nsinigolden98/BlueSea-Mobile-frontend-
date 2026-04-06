import { useState, useCallback } from 'react';
import { getRequest, ENDPOINTS } from '@/types';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface UsePaginatedFetchOptions {
  pageSize?: number;
  endpoint: string;
}

export function usePaginatedFetch<T>({ pageSize = 20 }: UsePaginatedFetchOptions) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  const fetchData = useCallback(async (reset = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const currentPage = reset ? 1 : page;
      const response = await getRequest(`${ENDPOINTS.notifications}?page=${currentPage}&page_size=${pageSize}`);
      
      if (response) {
        if (reset) {
          setData(response.results || []);
          setPage(2);
        } else {
          setData(prev => [...prev, ...(response.results || [])]);
          setPage(prev => prev + 1);
        }
        
        setCount(response.count || 0);
        setHasMore(response.next !== null);
      }
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, loading]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchData();
    }
  }, [hasMore, loading, fetchData]);

  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    hasMore,
    count,
    page,
    fetchData,
    loadMore,
    refresh,
  };
}

export async function fetchPaginatedData<T>(
  endpoint: string,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<T>> {
  const response = await getRequest(`${endpoint}?page=${page}&page_size=${pageSize}`);
  return response as PaginatedResponse<T>;
}
