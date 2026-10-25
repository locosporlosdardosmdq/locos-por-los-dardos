import { ADMIN_MASTER_PASSWORD } from './constants';

/**
 * Retorna las cabeceras de autorización necesarias para peticiones administrativas
 * a los endpoints /api/torneos, /api/inscripciones y /api/jugadores.
 */
export function getAdminRequestHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-admin-pin': ADMIN_MASTER_PASSWORD
  };
}
