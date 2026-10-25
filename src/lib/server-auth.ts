import { NextRequest } from 'next/server';

/**
 * Validador de autorización del servidor para operaciones administrativas y datos sensibles (PII).
 * Verifica:
 * 1. Cabecera 'x-admin-pin'
 * 2. Cabecera 'authorization: Bearer <TOKEN>'
 * 3. Token de entorno ADMIN_PIN / NEXT_PUBLIC_ADMIN_PIN
 */
export function isAuthorizedAdmin(request: NextRequest): boolean {
  const adminSecret = (
    process.env.ADMIN_PIN || 
    process.env.NEXT_PUBLIC_ADMIN_PIN || 
    'ICEMAN2026!'
  ).trim();

  // 1. Cabecera directa x-admin-pin
  const headerPin = request.headers.get('x-admin-pin')?.trim();
  if (headerPin && headerPin === adminSecret) {
    return true;
  }

  // 2. Cabecera Authorization Bearer
  const authHeader = request.headers.get('authorization')?.trim();
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token === adminSecret) {
      return true;
    }
  }

  return false;
}
