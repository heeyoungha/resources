import { useState, useEffect, useCallback, useRef } from 'react';

// ✅ Context7 패턴: useEffect와 setTimeout을 활용한 디바운스
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // ✅ 타이머 설정
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // ✅ 클린업 함수로 이전 타이머 정리
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]); // ✅ 의존성 배열에 모든 리액티브 값 포함

  return debouncedValue;
}

// ✅ Context7 패턴: 디바운스된 콜백 함수
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // ✅ 최신 콜백 레퍼런스 유지
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]) as T;

  // ✅ 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
} 