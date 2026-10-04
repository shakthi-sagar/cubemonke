import type { SolveRecord } from '@/lib/solves'

export const formatAccountTime = (milliseconds: number) => {
  const totalCentiseconds = Math.floor(milliseconds / 10)
  const minutes = Math.floor(totalCentiseconds / 6000)
  const seconds = Math.floor((totalCentiseconds % 6000) / 100)
  const centiseconds = totalCentiseconds % 100

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
  }
  return `${seconds}.${centiseconds.toString().padStart(2, '0')}`
}

export const average = (values: number[]) => {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export const bestSolve = (solves: SolveRecord[]) =>
  solves.reduce<SolveRecord | null>((best, solve) => (!best || solve.timeMs < best.timeMs ? solve : best), null)
