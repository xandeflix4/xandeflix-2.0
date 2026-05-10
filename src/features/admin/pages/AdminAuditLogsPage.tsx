import { useEffect, useState } from 'react';

import { AdminLayout } from '../components/AdminLayout';
import { listAdminAuditLogs } from '../services';
import type { AuditLog } from '../types/admin.types';

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatMetadata(metadata: Record<string, unknown>) {
  const text = JSON.stringify(metadata);

  return text === '{}' ? 'Sem metadados' : text;
}

export function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadLogs() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const data = await listAdminAuditLogs();

        if (isMounted) {
          setLogs(data);
        }
      } catch {
        if (isMounted) {
          setErrorMessage('Não foi possível carregar os registros de auditoria.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadLogs();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AdminLayout>
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-xf-muted">
            Administração
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Auditoria</h1>
          <p className="mt-3 max-w-3xl text-base text-xf-muted">
            Lista administrativa dos eventos registrados no sistema.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          {isLoading ? (
            <div className="p-6 text-sm text-xf-muted">
              Carregando registros de auditoria...
            </div>
          ) : errorMessage ? (
            <div className="p-6 text-sm text-red-300">{errorMessage}</div>
          ) : logs.length === 0 ? (
            <div className="p-6 text-sm text-xf-muted">
              Nenhum registro de auditoria encontrado até o momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="border-b border-white/10 bg-black/20 text-xs uppercase tracking-[0.2em] text-xf-muted">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Data</th>
                    <th className="px-5 py-4 font-semibold">Ação</th>
                    <th className="px-5 py-4 font-semibold">Entidade</th>
                    <th className="px-5 py-4 font-semibold">ID da entidade</th>
                    <th className="px-5 py-4 font-semibold">Ator</th>
                    <th className="px-5 py-4 font-semibold">Metadados</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-white/5 last:border-0">
                      <td className="px-5 py-4 text-xf-muted">
                        {formatDateTime(log.created_at)}
                      </td>
                      <td className="px-5 py-4 font-semibold text-white">
                        {log.action}
                      </td>
                      <td className="px-5 py-4 text-xf-muted">{log.entity}</td>
                      <td className="max-w-[180px] truncate px-5 py-4 text-xf-muted">
                        {log.entity_id ?? 'Não informado'}
                      </td>
                      <td className="max-w-[180px] truncate px-5 py-4 text-xf-muted">
                        {log.actor_id ?? 'Sistema'}
                      </td>
                      <td className="max-w-[260px] truncate px-5 py-4 text-xf-muted">
                        {formatMetadata(log.metadata)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}
