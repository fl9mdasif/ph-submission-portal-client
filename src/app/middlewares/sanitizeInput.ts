import { NextFunction, Request, Response } from 'express';

const sanitizeValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (key.startsWith('$') || key.includes('.')) continue;
      cleaned[key] = sanitizeValue(val);
    }
    return cleaned;
  }
  return value;
};

const sanitizeInPlace = (target: Record<string, unknown> | undefined) => {
  if (!target || typeof target !== 'object') return;
  const sanitized = sanitizeValue(target) as Record<string, unknown>;
  for (const key of Object.keys(target)) delete target[key];
  Object.assign(target, sanitized);
};

// req.query is read-only in Express 5 — never reassign it
const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => {
  sanitizeInPlace(req.body);
  sanitizeInPlace(req.params as unknown as Record<string, unknown>);
  next();
};

export default sanitizeInput;
