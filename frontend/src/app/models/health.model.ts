/** Resposta de GET /v1/checks (não usa o envelope { success, data }). */
export interface HealthCheck {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  version?: string;
  checks?: { name: string; status: 'ok' | 'down'; latencyMs?: number }[];
}
