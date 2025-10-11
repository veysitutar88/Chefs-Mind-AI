import { Readable } from 'stream';

// Утилиты для нормализации потоковой передачи  
  
export type AnyStream =  
  | AsyncIterable<any>
  | Iterable<any>
  | Readable
  | { on?: Function; off?: Function; addListener?: Function; removeListener?: Function };

export async function* normalizeStream(src: any) {
  if (!src) return;
  
  // AsyncIterable
  if (typeof src[Symbol.asyncIterator] === 'function') {
    for await (const c of src) yield c;
    return;
  }
  
  // Array
  if (Array.isArray(src)) {
    for (const c of src) yield c;
    return;
  }
  
  // String
  if (typeof src === 'string') {
    yield { data: src };
    return;
  }
  
  // Object with data
  if (typeof src === 'object' && src.data) {
    yield src;
    return;
  }
  
  // Fallback
  yield { data: JSON.stringify(src) };
}

export async function collectStream(it: any) {
  const res = [];
  for await (const c of normalizeStream(it)) {
    res.push(c);
  }
  return res;
}