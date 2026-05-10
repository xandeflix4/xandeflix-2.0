export type ActivatedLicense = {
  id: string;
  code: string;
  status: string;
  planType: string;
  expiresAt: string | null;
  maxDevices: number;
  maxConcurrentStreams: number;
};

export type ActivatedLicenseDevice = {
  id: string;
  deviceIdentifier: string;
  isActive: boolean;
};

export type LicenseActivationResult = {
  license: ActivatedLicense;
  device: ActivatedLicenseDevice;
};

export type StoredLicenseActivation = {
  licenseCode: string;
  deviceIdentifier: string;
  licenseId?: string;
  licenseDeviceId?: string;
  activatedAt: string;
};
