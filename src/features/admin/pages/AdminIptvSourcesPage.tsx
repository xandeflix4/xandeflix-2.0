import { useEffect, useMemo, useState } from 'react';

import { AdminLayout } from '../components/AdminLayout';

import {
  listAdminIptvSources,
  listAdminLicenseIptvSources,
  listAdminLicenses,
} from '../services';

import type {
  IptvSource,
  IptvSourceType,
  License,
  LicenseIptvSource,
  LicenseStatus,
} from '../types/admin.types';

type IptvSourceOwnerKind = 'legacy-client' | 'license';

type IptvSourceOrigin = 'admin' | 'user' | 'legacy-client';

type LicenseSourceGroup = {
  license: License;
  sources: LicenseIptvSource[];
};

type AdminIptvSourceRow = {
  id: string;
  rowKey: string;
  ownerKind: IptvSourceOwnerKind;
  name: string;
  sourceUrl: string;
  type: IptvSourceType;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
  lastSyncAt?: string | null;
  clientId?: string | null;
  licenseId?: string | null;
  licenseCode?: string | null;
  licenseLabel?: string | null;
  licenseStatus?: LicenseStatus | null;
  origin: IptvSourceOrigin;
};

const sourceOriginLabels: Record<IptvSourceOrigin, string> = {
  admin: 'Admin',
  user: 'Usuário',
  'legacy-client': 'Legado/Cliente',
};

const ownerKindLabels: Record<IptvSourceOwnerKind, string> = {
  'legacy-client': 'Legado por cliente',
  license: 'Por licença',
};

const licenseStatusLabels: Record<LicenseStatus, string> = {
  active: 'Ativa',
  inactive: 'Inativa',
  expired: 'Expirada',
  blocked: 'Bloqueada',
  canceled: 'Cancelada',
};

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return 'Nunca';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getSourceTypeLabel(type: IptvSourceType) {
  const labels: Record<IptvSourceType, string> = {
    m3u: 'M3U',
    xtream: 'Xtream',
    manual: 'Manual',
  };

  return labels[type];
}

function getBooleanLabel(value: boolean) {
  return value ? 'Ativa' : 'Inativa';
}

function getShortId(value: string | null | undefined) {
  if (!value) {
    return 'Não informado';
  }

  return value.length > 10 ? value.slice(0, 8) + '...' : value;
}

function getLicenseStatusLabel(status: LicenseStatus | null | undefined) {
  return status ? licenseStatusLabels[status] : 'Não informado';
}

function getOriginBadgeClassName(origin: IptvSourceOrigin) {
  if (origin === 'admin') {
    return 'bg-emerald-500/10 text-emerald-200';
  }

  if (origin === 'user') {
    return 'bg-sky-500/10 text-sky-200';
  }

  return 'bg-amber-500/10 text-amber-200';
}

function getSourceStatusClassName(isActive: boolean) {
  return isActive ? 'bg-emerald-500/10 text-emerald-200' : 'bg-white/10 text-xf-muted';
}

function getOperationalStatus(row: AdminIptvSourceRow) {
  if (!row.isActive) {
    return {
      label: 'Inativa',
      className: 'bg-white/10 text-xf-muted',
    };
  }

  if (row.ownerKind === 'license' && !row.licenseId) {
    return {
      label: 'Sem licença',
      className: 'bg-red-500/10 text-red-200',
    };
  }

  if (row.ownerKind === 'license' && row.licenseStatus !== 'active') {
    return {
      label: 'Licença não ativa',
      className: 'bg-amber-500/10 text-amber-200',
    };
  }

  if (row.ownerKind === 'legacy-client' && !row.clientId) {
    return {
      label: 'Sem cliente',
      className: 'bg-red-500/10 text-red-200',
    };
  }

  return {
    label: 'Operacional',
    className: 'bg-emerald-500/10 text-emerald-200',
  };
}

function createLegacySourceRow(source: IptvSource): AdminIptvSourceRow {
  return {
    id: source.id,
    rowKey: 'legacy-client-' + source.id,
    ownerKind: 'legacy-client',
    name: source.name,
    sourceUrl: source.source_url,
    type: source.type,
    isActive: source.is_active,
    createdAt: source.created_at,
    updatedAt: source.updated_at,
    lastSyncAt: source.last_sync_at,
    clientId: source.client_id,
    origin: 'legacy-client',
  };
}

function createLicenseSourceRow(
  source: LicenseIptvSource,
  license: License,
): AdminIptvSourceRow {
  return {
    id: source.id,
    rowKey: 'license-' + source.id,
    ownerKind: 'license',
    name: source.name,
    sourceUrl: source.source_url,
    type: source.type,
    isActive: source.is_active,
    createdAt: source.created_at,
    updatedAt: source.updated_at,
    licenseId: source.license_id,
    licenseCode: license.license_code,
    licenseLabel: license.label,
    licenseStatus: license.status,
    origin: source.created_by,
  };
}

function renderOperationalBinding(row: AdminIptvSourceRow) {
  if (row.ownerKind === 'license') {
    if (!row.licenseId) {
      return (
        <div className="text-red-200">
          <p className="font-semibold">Sem vínculo operacional</p>
          <p className="mt-1 text-xs text-xf-muted">Fonte sem licença vinculada.</p>
        </div>
      );
    }

    return (
      <div className="min-w-[190px]">
        <p className="font-semibold text-white">
          Licença: {row.licenseCode ?? getShortId(row.licenseId)}
        </p>
        <p className="mt-1 text-xs text-xf-muted">
          {row.licenseLabel ? 'Rótulo: ' + row.licenseLabel : 'ID: ' + getShortId(row.licenseId)}
        </p>
        <p className="mt-1 text-xs text-xf-muted">
          Status: {getLicenseStatusLabel(row.licenseStatus)}
        </p>
      </div>
    );
  }

  if (!row.clientId) {
    return (
      <div className="text-red-200">
        <p className="font-semibold">Sem vínculo operacional</p>
        <p className="mt-1 text-xs text-xf-muted">Fonte legada sem cliente vinculado.</p>
      </div>
    );
  }

  return (
    <div className="min-w-[180px]">
      <p className="font-semibold text-white">Cliente legado vinculado</p>
      <p className="mt-1 text-xs text-xf-muted">ID: {getShortId(row.clientId)}</p>
    </div>
  );
}

export function AdminIptvSourcesPage() {
  const [legacySources, setLegacySources] = useState<IptvSource[]>([]);
  const [licenseSourceGroups, setLicenseSourceGroups] = useState<LicenseSourceGroup[]>([]);
  const [loadWarnings, setLoadWarnings] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const rows = useMemo(() => {
    const legacyRows = legacySources.map(createLegacySourceRow);
    const licenseRows = licenseSourceGroups.flatMap(({ license, sources }) =>
      sources.map((source) => createLicenseSourceRow(source, license)),
    );

    return [...licenseRows, ...legacyRows].sort(
      (current, next) =>
        new Date(next.createdAt).getTime() - new Date(current.createdAt).getTime(),
    );
  }, [legacySources, licenseSourceGroups]);

  async function loadSources() {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const warnings: string[] = [];

      const [legacySourcesResult, licensesResult] = await Promise.allSettled([
        listAdminIptvSources(),
        listAdminLicenses(),
      ]);

      const nextLegacySources =
        legacySourcesResult.status === 'fulfilled' ? legacySourcesResult.value : [];
      const licenses = licensesResult.status === 'fulfilled' ? licensesResult.value : [];

      if (legacySourcesResult.status === 'rejected') {
        warnings.push('Não foi possível carregar as fontes legadas por cliente.');
      }

      if (licensesResult.status === 'rejected') {
        warnings.push('Não foi possível carregar as licenças para mapear fontes por licença.');
      }

      if (
        legacySourcesResult.status === 'rejected' &&
        licensesResult.status === 'rejected'
      ) {
        setLegacySources([]);
        setLicenseSourceGroups([]);
        setLoadWarnings([]);
        setErrorMessage('Não foi possível carregar as fontes IPTV administrativas.');
        return;
      }

      const licenseSourceResults = await Promise.allSettled(
        licenses.map(async (license) => ({
          license,
          sources: await listAdminLicenseIptvSources(license.id),
        })),
      );

      const nextLicenseSourceGroups: LicenseSourceGroup[] = [];

      licenseSourceResults.forEach((result, index) => {
        const license = licenses[index];

        if (result.status === 'fulfilled') {
          nextLicenseSourceGroups.push(result.value);
          return;
        }

        warnings.push(
          'Não foi possível carregar fontes da licença ' +
            license.license_code +
            '. As demais fontes continuam visíveis.',
        );
      });

      setLegacySources(nextLegacySources);
      setLicenseSourceGroups(nextLicenseSourceGroups);
      setLoadWarnings(warnings);
    } catch {
      setErrorMessage('Não foi possível carregar as fontes IPTV administrativas.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadSources();
  }, []);

  function handleValidateSource(row: AdminIptvSourceRow) {
    setErrorMessage(null);

    if (row.ownerKind === 'license') {
      setSuccessMessage(
        'Fonte "' +
          row.name +
          '" vinculada à licença ' +
          (row.licenseCode ?? getShortId(row.licenseId)) +
          '. Origem: ' +
          sourceOriginLabels[row.origin] +
          '. Teste/importação operacional deve ser feita nos detalhes da licença nesta etapa.',
      );
      return;
    }

    setSuccessMessage(
      'Fonte "' +
        row.name +
        '" pertence ao modelo legado por cliente. Migração para fonte por licença deve ser avaliada antes do self-service.',
    );
  }

  return (
    <AdminLayout>
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-xf-muted">
            Administração
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight">
            Fontes IPTV
          </h1>

          <p className="mt-3 max-w-4xl text-base text-xf-muted">
            Acompanhe fontes legadas por cliente e fontes vinculadas a licenças.
            O modelo por licença é o caminho principal para canais autorizados,
            origem da lista e futuro self-service.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-white">
              Modelo atual
            </p>
            <p className="mt-3 text-sm text-xf-muted">
              Fontes por licença concentram a operação atual: origem da lista,
              autorização e importação de canais por licença.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-white">
              Legado visível
            </p>
            <p className="mt-3 text-sm text-xf-muted">
              Fontes por cliente continuam listadas para rastreabilidade e
              análise antes de qualquer migração operacional.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-white">
              Origem da lista
            </p>
            <p className="mt-3 text-sm text-xf-muted">
              Admin indica cadastro pelo operador. Usuário prepara o caminho do
              self-service futuro. Legado/Cliente identifica fontes antigas.
            </p>
          </div>
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

        {loadWarnings.length > 0 ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
            <p className="font-semibold">Atenção ao carregamento parcial</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {loadWarnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          {isLoading ? (
            <div className="p-6 text-sm text-xf-muted">
              Carregando fontes IPTV administrativas...
            </div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-sm text-xf-muted">
              Nenhuma fonte IPTV cadastrada até o momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1380px] text-left text-sm">
                <thead className="border-b border-white/10 bg-black/20 text-xs uppercase tracking-[0.2em] text-xf-muted">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Nome</th>
                    <th className="px-5 py-4 font-semibold">Origem</th>
                    <th className="px-5 py-4 font-semibold">
                      Vínculo operacional
                    </th>
                    <th className="px-5 py-4 font-semibold">Tipo</th>
                    <th className="px-5 py-4 font-semibold">URL</th>
                    <th className="px-5 py-4 font-semibold">Fonte</th>
                    <th className="px-5 py-4 font-semibold">
                      Status operacional
                    </th>
                    <th className="px-5 py-4 font-semibold">
                      Atualização
                    </th>
                    <th className="px-5 py-4 font-semibold">
                      Criada em
                    </th>
                    <th className="px-5 py-4 font-semibold">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => {
                    const operationalStatus = getOperationalStatus(row);

                    return (
                      <tr
                        key={row.rowKey}
                        className="border-b border-white/5 last:border-0"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-white">{row.name}</p>
                          <p className="mt-1 text-xs text-xf-muted">
                            {ownerKindLabels[row.ownerKind]}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={
                              'rounded-full px-3 py-1 text-xs font-bold ' +
                              getOriginBadgeClassName(row.origin)
                            }
                          >
                            {sourceOriginLabels[row.origin]}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-xf-muted">
                          {renderOperationalBinding(row)}
                        </td>

                        <td className="px-5 py-4 text-xf-muted">
                          {getSourceTypeLabel(row.type)}
                        </td>

                        <td className="max-w-[280px] truncate px-5 py-4 text-xf-muted">
                          {row.sourceUrl}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={
                              'rounded-full px-3 py-1 text-xs font-bold ' +
                              getSourceStatusClassName(row.isActive)
                            }
                          >
                            {getBooleanLabel(row.isActive)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={
                              'rounded-full px-3 py-1 text-xs font-bold ' +
                              operationalStatus.className
                            }
                          >
                            {operationalStatus.label}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-xf-muted">
                          {row.ownerKind === 'legacy-client'
                            ? formatDateTime(row.lastSyncAt)
                            : formatDateTime(row.updatedAt)}
                        </td>

                        <td className="px-5 py-4 text-xf-muted">
                          {formatDateTime(row.createdAt)}
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => handleValidateSource(row)}
                            className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/20"
                          >
                            Validar regra
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}
