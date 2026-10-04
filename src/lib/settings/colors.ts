import type { CanonicalFace } from '@/types/cube'

export const CUBE_FACES: CanonicalFace[] = ['U', 'D', 'R', 'L', 'F', 'B']

export const COLOR_PRESETS: Array<{
  id: string
  label: string
  colors: Record<CanonicalFace, string>
}> = [
  {
    id: 'classic',
    label: 'Classic',
    colors: { F: '#22c55e', B: '#2563eb', R: '#ef4444', L: '#f97316', U: '#f8fafc', D: '#facc15' },
  },
  {
    id: 'pastel',
    label: 'Pastel',
    colors: { F: '#86efac', B: '#93c5fd', R: '#fca5a5', L: '#fdba74', U: '#f1f5f9', D: '#fef08a' },
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    colors: { F: '#06b6d4', B: '#d946ef', R: '#f43f5e', L: '#f97316', U: '#e2e8f0', D: '#eab308' },
  },
]
