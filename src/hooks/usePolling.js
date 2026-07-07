import { useState, useRef, useCallback, useEffect } from 'react';
import { pollStatus } from '../api/pixazo';

export default function usePolling(apiKey) {
  const [status, setStatus] = useState('idle'); // idle | queued | processing | completed | failed | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const startPolling = useCallback((pollingUrl) => {
    setStatus('queued');
    setResult(null);
    setError(null);

    const poll = async () => {
      try {
        const data = await pollStatus(apiKey, pollingUrl);
        const s = (data.status || '').toUpperCase();
        if (s === 'QUEUED') {
          setStatus('queued');
        } else if (s === 'PROCESSING') {
          setStatus('processing');
        } else if (s === 'COMPLETED' || s === 'DONE') {
          setStatus('completed');
          setResult(data);
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        } else if (s === 'FAILED' || s === 'ERROR') {
          setStatus('failed');
          setError(data.error || data.message || 'Generation failed');
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        } else {
          setStatus('processing');
        }
      } catch (err) {
        setStatus('error');
        setError(err.message);
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Poll immediately, then every 5s
    poll();
    intervalRef.current = setInterval(poll, 5000);
  }, [apiKey]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setStatus('idle');
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { status, result, error, startPolling, stopPolling };
}
