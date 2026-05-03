import { useState, useEffect } from 'react'

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'tv'

export const useDeviceType = (): DeviceType => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const userAgent = navigator.userAgent.toLowerCase()
      
      if (userAgent.includes('smart-tv') || userAgent.includes('androidtv') || userAgent.includes('firetv')) {
        setDeviceType('tv')
      } else if (width < 640) {
        setDeviceType('mobile')
      } else if (width < 1024) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return deviceType
}
