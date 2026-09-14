"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type State<T> =
  | { status: "loading"; data: null; error: null; isTimeout: false }
  | { status: "success"; data: T; error: null; isTimeout: false }
  | { status: "error"; data: null; error: string; isTimeout: boolean };

/**
 * Generic data-fetching hook.
 *
 * - AbortController: cancels in-flight fetch when component unmounts
 * - fetcherRef: stores latest fetcher in a ref so useCallback deps stay
 *   stable and don't cause infinite re-fetch loops
 * - isTimeout: true jika error disebabkan timeout (backend tidak merespons)
 */
export function useApiData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
): State<T> & { refetch: () => void } {
  const [state, setState] = useState<State<T>>({
    status: "loading",
    data: null,
    error: null,
    isTimeout: false,
  });

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher]);

  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ status: "loading", data: null, error: null, isTimeout: false });

    try {
      const data = await fetcherRef.current();
      if (controller.signal.aborted) return;
      setState({ status: "success", data, error: null, isTimeout: false });
    } catch (err) {
      if (controller.signal.aborted) return;

      // Deteksi timeout: DOMException dengan name TimeoutError atau AbortError
      const isTimeout =
        err instanceof DOMException &&
        (err.name === "TimeoutError" || err.name === "AbortError");

      setState({
        status: "error",
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        isTimeout,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
    return () => {
      abortRef.current?.abort();
    };
  }, [load]);

  return { ...state, refetch: load };
}
