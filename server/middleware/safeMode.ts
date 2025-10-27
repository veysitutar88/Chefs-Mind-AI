import { Request, Response, NextFunction } from "express";

/**
 * Safe Mode:
 * - SAFE_MODE=on  => все write-операции требуют X-Confirm-Code
 * - CONFIRM_CODE  => секрет для подтверждения (печатаем в консоль при старте)
 *
 * Применяем на всех маршрутах, которые меняют БД/файлы.
 */
export function requireWriteConfirm(req: Request, res: Response, next: NextFunction) {
  const safe = (process.env.SAFE_MODE || "on").toLowerCase() === "on";
  if (!safe) return next();
  const code = process.env.CONFIRM_CODE || "";
  const provided = req.header("x-confirm-code") || req.body?.confirm_code || req.query?.confirm_code;
  if (!code || provided !== code) {
    return res.status(403).json({
      success: false,
      error: "Write operation requires confirmation",
      how_to_confirm: "Add header X-Confirm-Code: <CONFIRM_CODE>",
      detail: "SAFE_MODE is ON. Reads are allowed, writes require confirmation."
    });
  }
  return next();
}

/** Read-only помощник (для ясности на импорт) */
export function assertTableWhitelist(table: string, whitelist: string[]) {
  if (!whitelist.includes(table)) {
    const w = whitelist.join(", ");
    const msg = `Table not allowed for import: ${table}. Allowed: ${w}`;
    throw Object.assign(new Error(msg), { status: 400 });
  }
}
