/**
 * Build WebSocket URL based on current location
 * Ensures correct protocol and host without hardcoded values
 */
export function buildWsUrl(path: string): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${protocol}//${host}${normalizedPath}`;
}

/**
 * Check if WebSocket is supported
 */
export function isWebSocketSupported(): boolean {
  return 'WebSocket' in window;
}

/**
 * Create WebSocket with error handling
 */
export function createWebSocket(
  path: string,
  options?: {
    onOpen?: (event: Event) => void;
    onMessage?: (event: MessageEvent) => void;
    onError?: (event: Event) => void;
    onClose?: (event: CloseEvent) => void;
  }
): WebSocket {
  const url = buildWsUrl(path);
  const ws = new WebSocket(url);

  if (options?.onOpen) ws.onopen = options.onOpen;
  if (options?.onMessage) ws.onmessage = options.onMessage;
  if (options?.onError) ws.onerror = options.onError;
  if (options?.onClose) ws.onclose = options.onClose;

  return ws;
}
