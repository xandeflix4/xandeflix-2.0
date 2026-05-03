import { useDeviceType } from './useDeviceType'

export const useIsTv = () => {
  const deviceType = useDeviceType()
  return deviceType === 'tv'
}
