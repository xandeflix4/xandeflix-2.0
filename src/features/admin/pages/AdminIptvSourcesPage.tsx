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

function getClientBindingLabel(clientId: string | null) {
  return clientId ? 'Vinculada a cliente' : 'Sem cliente vinculado';
}

export function AdminIptvSourcesPage() {
  const [sources, setSources] = useState<IptvSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function loadSources() {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const data = await listAdminIptvSources();

      setSources(data);
    } catch {
      setErrorMessage('Não foi possível carregar as listas IPTV autorizadas.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadSources();
  }, []);

  function handleValidateSource(source: IptvSource) {
    setErrorMessage(null);
    setSuccessMessage(
      'Lista "' +
        source.name +
        '" mantida apenas como autorização. A importação/cache de canais no admin permanece desativada pela arquitetura atual.',
    );
  }

  return (
    <AdminLayout>
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-xf-muted">
            Administração
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight">
            Listas IPTV autorizadas por cliente
          </h1>

          <p className="mt-3 max-w-3xl text-base text-xf-muted">
            Cada lista IPTV deve pertencer a um cliente específico. O app só
            recebe a lista quando o ID permanente do dispositivo está vinculado
            ao cliente autorizado.
          </p>
        </div>

        <div className="rounded-2xl border border-xf-red/30 bg-xf-red/10 p-5">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-xf-red">
            Regra operacional
          </p>
          <p className="mt-3 max-w-4xl text-sm text-xf-muted">
            O cadastro principal da lista deve ser feito em Clientes, no fluxo
            Cliente + Dispositivo + Lista IPTV. Esta página serve para consulta
            e validação administrativa das listas já autorizadas.
          </p>
        </div>

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            {successMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            {errorMessage}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          {isLoading ? (
            <div className="p-6 text-sm text-xf-muted">
              Carregando listas IPTV autorizadas...
            </div>
          ) : sources.length === 0 ? (
            <div className="p-6 text-sm text-xf-muted">
              Nenhuma lista IPTV autorizada cadastrada até o momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1160px] text-left text-sm">
                <thead className="border-b border-white/10 bg-black/20 text-xs uppercase tracking-[0.2em] text-xf-muted">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Nome</th>
                    <th className="px-5 py-4 font-semibold">Vínculo</th>
                    <th className="px-5 py-4 font-semibold">Tipo</th>
                    <th className="px-5 py-4 font-semibold">URL</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">
                      Última sincronização
                    </th>
                    <th className="px-5 py-4 font-semibold">
                      Criada em
                    </th>
                    <th className="px-5 py-4 font-semibold">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {sources.map((source) => (
                    <tr
                      key={source.id}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="px-5 py-4 font-semibold text-white">
                        {source.name}
                      </td>

                      <td className="px-5 py-4 text-xf-muted">
                        {getClientBindingLabel(source.client_id)}
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

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleValidateSource(source)}
                          className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/20"
                        >
                          Validar regra
                        </button>
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
