import { useEffect, useState } from 'react';

import { AdminLayout } from '../components/AdminLayout';
import {
  createAdminDevice,
  listAdminClients,
  listAdminDevices,
} from '../services';
import type { Client, Device } from '../types/admin.types';

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Nunca';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getBooleanLabel(value: boolean) {
  return value ? 'Ativo' : 'Inativo';
}

export function AdminDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [clientId, setClientId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [deviceIdentifier, setDeviceIdentifier] = useState('');
  const [platform, setPlatform] = useState('');

  async function loadAdminData() {
    setIsLoading(true);
    setErrorMessage(null);

    const [devicesData, clientsData] = await Promise.all([
      listAdminDevices(),
      listAdminClients(),
    ]);

    setDevices(devicesData);
    setClients(clientsData);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        const [devicesData, clientsData] = await Promise.all([
          listAdminDevices(),
          listAdminClients(),
        ]);

        if (isMounted) {
          setDevices(devicesData);
          setClients(clientsData);
        }
      } catch {
        if (isMounted) {
          setErrorMessage('Não foi possível carregar os dispositivos.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleCreateDevice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedDeviceIdentifier = deviceIdentifier.trim();

    if (!clientId) {
      setErrorMessage('Selecione um cliente para vincular o dispositivo.');
      return;
    }

    if (!normalizedDeviceIdentifier) {
      setErrorMessage('Informe o identificador do dispositivo.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      await createAdminDevice({
        client_id: clientId,
        device_name: deviceName.trim() || null,
        device_identifier: normalizedDeviceIdentifier,
        platform: platform.trim() || null,
        is_active: true,
      });

      setDeviceName('');
      setDeviceIdentifier('');
      setPlatform('');
      setSuccessMessage('Dispositivo vinculado ao cliente com sucesso.');

      await loadAdminData();
    } catch {
      setErrorMessage('Não foi possível vincular o dispositivo ao cliente.');
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  }

  return (
    <AdminLayout>
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-xf-muted">
            Administração
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">
            Dispositivos
          </h1>
          <p className="mt-3 max-w-3xl text-base text-xf-muted">
            Cadastre e vincule o identificador local do app ao cliente
            autorizado.
          </p>
        </div>

        <form
          onSubmit={handleCreateDevice}
          className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <div>
            <h2 className="text-xl font-black text-white">
              Vincular novo dispositivo
            </h2>
            <p className="mt-2 text-sm text-xf-muted">
              O identificador deve ser igual ao gerado no app pelo helper
              local do dispositivo.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-white">
              Cliente
              <select
                className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-xf-red"
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
              >
                <option value="">Selecione um cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} · {client.status}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold text-white">
              Nome do dispositivo
              <input
                className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-xf-red"
                placeholder="Ex.: Fire Stick Sala"
                value={deviceName}
                onChange={(event) => setDeviceName(event.target.value)}
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-white">
              Identificador do dispositivo
              <input
                className="rounded-xl border border-white/10 bg-black px-4 py-3 font-mono text-white outline-none focus:border-xf-red"
                placeholder="Ex.: xf-..."
                value={deviceIdentifier}
                onChange={(event) => setDeviceIdentifier(event.target.value)}
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-white">
              Plataforma
              <input
                className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-xf-red"
                placeholder="Ex.: android-tv, fire-tv, web"
                value={platform}
                onChange={(event) => setPlatform(event.target.value)}
              />
            </label>
          </div>

          {errorMessage ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              {successMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-fit rounded-xl bg-xf-red px-6 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Vinculando...' : 'Vincular dispositivo'}
          </button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          {isLoading ? (
            <div className="p-6 text-sm text-xf-muted">
              Carregando dispositivos...
            </div>
          ) : devices.length === 0 ? (
            <div className="p-6 text-sm text-xf-muted">
              Nenhum dispositivo cadastrado até o momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="border-b border-white/10 bg-black/20 text-xs uppercase tracking-[0.2em] text-xf-muted">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Nome</th>
                    <th className="px-5 py-4 font-semibold">Cliente</th>
                    <th className="px-5 py-4 font-semibold">Plataforma</th>
                    <th className="px-5 py-4 font-semibold">Identificador</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Último acesso</th>
                    <th className="px-5 py-4 font-semibold">Criado em</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((device) => {
                    const client = clients.find(
                      (item) => item.id === device.client_id,
                    );

                    return (
                      <tr
                        key={device.id}
                        className="border-b border-white/5 last:border-0"
                      >
                        <td className="px-5 py-4 font-semibold text-white">
                          {device.device_name ?? 'Sem nome'}
                        </td>
                        <td className="px-5 py-4 text-xf-muted">
                          {client?.name ?? device.client_id}
                        </td>
                        <td className="px-5 py-4 text-xf-muted">
                          {device.platform ?? 'Não informada'}
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-xf-muted">
                          {device.device_identifier ?? 'Não informado'}
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                            {getBooleanLabel(device.is_active)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xf-muted">
                          {formatDateTime(device.last_seen_at)}
                        </td>
                        <td className="px-5 py-4 text-xf-muted">
                          {formatDateTime(device.created_at)}
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
