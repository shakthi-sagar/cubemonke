import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import PlayPage from '@/pages/play/index'

const ReplaysPage = lazy(() => import('@/pages/replays/index'))
const ReplayPlayerPage = lazy(() => import('@/pages/replays/player'))
const SettingsPage = lazy(() => import('@/pages/settings/index'))
const AccountPage = lazy(() => import('@/pages/account/index'))
const AccountSettingsPage = lazy(() => import('@/pages/account/settings'))
const ContactPage = lazy(() => import('@/pages/info/contact'))
const PrivacyPage = lazy(() => import('@/pages/info/privacy'))

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<PlayPage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/account/settings" element={<AccountSettingsPage />} />
        <Route path="/replays" element={<ReplaysPage />} />
        <Route path="/replays/:replayId" element={<ReplayPlayerPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<PlayPage />} />
      </Route>
    </Routes>
  )
}
