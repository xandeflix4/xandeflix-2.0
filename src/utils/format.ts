export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  
  const parts = []
  if (h > 0) parts.push(h.toString().padStart(2, '0'))
  parts.push(m.toString().padStart(2, '0'))
  parts.push(s.toString().padStart(2, '0'))
  
  return parts.join(':')
}

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}
