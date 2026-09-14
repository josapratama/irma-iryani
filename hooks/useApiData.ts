"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type State<T> =
  | { status: "loading"; data: null; error: null }
  | { status: "success"; data: T; error: null }
  | { status: "error"; data: null; error: string };

/**
 * Generic data-fetching hook.
 *
 * Fixes:
 * - AbortController: cancels in-flight fetch when component unmounts
 * - fetcherRef: stores latest fetcher in a ref so useCallback deps stay
 *   stable and don't cause infinite re-fetch loops
 */
export function useApiData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
): State<T> & { refetch: () => void } {
  const [state, setState] = useState<State<T>>({
    status: "loading",
    data: null,
    error: null,
  });

  // Keep latest fetcher in a ref — never changes identity, prevents
  // unnecessary re-runs of the effect when caller re-renders
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher]);

  // Abort controller ref — cancelled on unmount or re-run
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    // Cancel any previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ status: "loading", data: null, error: null });

    try {
      const data = await fetcherRef.current();

      // Ignore if this call was aborted (component unmounted / re-fetched)
      if (controller.signal.aborted) return;

      setState({ status: "success", data, error: null });
    } catch (err) {
      if (controller.signal.aborted) return;

      setState({
        status: "error",
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
    return () => {
      // Abort on unmount
      abortRef.current?.abort();
    };
  }, [load]);

  return { ...state, refetch: load };
}
