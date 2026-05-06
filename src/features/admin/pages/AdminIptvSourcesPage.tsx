import { useEffect, useState } from 'react';

import { AdminLayout } from '../components/AdminLayout';
import { listAdminIptvSources } from '../services';
import type { IptvSource } from '../types/admin.types';

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Nunca';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getSourceTypeLabel(type: IptvSource['type']) {
  const labels: Record<IptvSource['type'], string> = {
    m3u: 'M3U',
    xtream: 'Xtream',
    manual: 'Manual',
  };

  return labels[type];
}

function getBooleanLabel(value: boolean) {
  return value ? 'Ativa' : 'Inativa';
}

export function AdminIptvSourcesPage() {
  const [sources, setSources] = useState<IptvSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSources() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const data = await listAdminIptvSources();

        if (isMounted) {
          setSources(data);
        }
      } catch {
        if (isMounted) {
          setErrorMessage('Não foi possível carregar as fontes IPTV.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSources();

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
          <h1 className="mt-3 text-4xl font-black tracking-tight">Fontes IPTV</h1>
          <p className="mt-3 max-w-3xl text-base text-xf-muted">
            Lista administrativa das fontes IPTV cadastradas no Xandeflix.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          {isLoading ? (
            <div className="p-6 text-sm text-xf-muted">
              Carregando fontes IPTV...
            </div>
          ) : errorMessage ? (
            <div className="p-6 text-sm text-red-300">{errorMessage}</div>
          ) : sources.length === 0 ? (
            <div className="p-6 text-sm text-xf-muted">
              Nenhuma fonte IPTV cadastrada até o momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="border-b border-white/10 bg-black/20 text-xs uppercase tracking-[0.2em] text-xf-muted">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Nome</th>
                    <th className="px-5 py-4 font-semibold">Tipo</th>
                    <th className="px-5 py-4 font-semibold">URL</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Última sincronização</th>
                    <th className="px-5 py-4 font-semibold">Criada em</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((source) => (
                    <tr key={source.id} className="border-b border-white/5 last:border-0">
                      <td className="px-5 py-4 font-semibold text-white">
                        {source.name}
                      </td>
                      <td className="px-5 py-4 text-xf-muted">
                        {getSourceTypeLabel(source.type)}
                      </td>
                      <td className="max-w-[260px] truncate px-5 py-4 text-xf-muted">
                        {source.source_url}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                          {getBooleanLabel(source.is_active)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xf-muted">
                        {formatDateTime(source.last_sync_at)}
                      </td>
                      <td className="px-5 py-4 text-xf-muted">
                        {formatDateTime(source.created_at)}
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
