// @ts-nocheck
// server/graph/stream-utils.js
/**
 * Универсальная нормализация «стрим-лайков» к AsyncIterable.
 * Поддерживает:
 * - AsyncIterable / Iterable
 * - Promise (один элемент)
 * - Observable-like ({ subscribe(next,error,complete) })
 * - Node Readable/EventEmitter (on('data'))
 * - Function (ленивый вызов)
 * - Одиночное значение
 */

/**
 * Преобразует произвольный источник к AsyncIterable.
 * @param {any} src
 * @param {{ event?: string, signal?: AbortSignal }} [opts]
 */
export async function* toAsyncIterable(src, opts = {}) {
  const event = opts.event ?? 'data';
  const signal = opts.signal;

  if (signal?.aborted) return;

  // AsyncIterable
  if (src && typeof src[Symbol.asyncIterator] === 'function') {
    for await (const v of src) {
      if (signal?.aborted) break;
      yield v;
    }
    return;
  }

  // Iterable
  if (src && typeof src[Symbol.iterator] === 'function') {
    for (const v of src) {
      if (signal?.aborted) break;
      yield v;
    }
    return;
  }

  // Promise → single value
  if (src && typeof src.then === 'function') {
    const v = await src;
    if (!signal?.aborted) yield v;
    return;
  }

  // Observable-like
  if (src && typeof src.subscribe === 'function') {
    const queue = [];
    let done = false;
    let err;
    const sub = src.subscribe({
      next: (v) => queue.push(v),
      error: (e) => { err = e; },
      complete: () => { done = true; }
    });

    try {
      while (!done && !err && !signal?.aborted) {
        if (queue.length) yield queue.shift();
        else await new Promise(r => setTimeout(r, 10));
      }
      if (err) throw err;
      while (queue.length) yield queue.shift();
    } finally {
      if (sub?.unsubscribe) sub.unsubscribe();
    }
    return;
  }

  // Node Readable/EventEmitter
  if (src && typeof src.on === 'function') {
    const buf = [];
    let ended = false;
    let error;

    const onData = (c) => buf.push(c);
    const onEnd  = () => { ended = true; };
    const onErr  = (e) => { error = e; };

    src.on(event, onData);
    src.on('end', onEnd);
    src.on('close', onEnd);
    src.on('error', onErr);

    try {
      while (!ended && !error && !signal?.aborted) {
        if (buf.length) yield buf.shift();
        else await new Promise(r => setTimeout(r, 10));
      }
      if (error) throw error;
      while (buf.length) yield buf.shift();
    } finally {
      src.off?.(event, onData);
      src.off?.('end', onEnd);
      src.off?.('close', onEnd);
      src.off?.('error', onErr);
    }
    return;
  }

  // Function → вызвать и рекурсивно нормализовать
  if (typeof src === 'function') {
    yield* toAsyncIterable(src(), opts);
    return;
  }

  // Одиночное значение
  if (src != null) {
    yield src;
  }
}

/**
 * Упрощённый нормализатор «на лету» (для случаев, где важен объект с {data})
 * @param {any} src
 */
export async function* normalizeStream(src) {
  if (!src) return;
  // уже AsyncIterable
  if (src && typeof src[Symbol.asyncIterator] === 'function') {
    for await (const c of src) yield c;
    return;
  }
  // массив → поэлементно
  if (Array.isArray(src)) {
    for (const c of src) yield c;
    return;
  }
  // строка → оборачиваем
  if (typeof src === 'string') {
    yield { data: src };
    return;
  }
  // объект с полем data
  if (typeof src === 'object' && src.data !== undefined) {
    yield src;
    return;
  }
  // прочее → сериализуем
  yield { data: JSON.stringify(src) };
}

/**
 * Собирает все элементы из источника в массив (с ограничением).
 * @param {any} src
 * @param {number} [limit=Infinity]
 * @returns {Promise<any[]>}
 */
export async function collect(src, limit = Infinity) {
  const out = [];
  let i = 0;
  for await (const v of toAsyncIterable(src)) {
    out.push(v);
    if (++i >= limit) break;
  }
  return out;
}

/**
 * Совместимость с более ранним кодом (алиас).
 * @param {any} it
 * @returns {Promise<any[]>}
 */
export async function collectStream(it) {
  return collect(it);
}