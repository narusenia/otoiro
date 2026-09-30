import { lazy, Suspense } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router'
import { t } from '@/i18n'
import Course from '@/pages/Course'
import Free from '@/pages/Free'
import Home from '@/pages/Home'
import SettingsPage from '@/pages/Settings'
import Unit from '@/pages/Unit'
import { useEffect } from 'react'
import { setTimbre } from '@/audio/engine'
import { useAppState } from '@/store'

// 開発時のみ部品確認ページを読み込む（本番ビルドでは null で除去される）
const Sandbox = import.meta.env.DEV ? lazy(() => import('@/pages/Sandbox')) : null

export default function App() {
  const { settings } = useAppState()

  useEffect(() => setTimbre(settings.timbre), [settings.timbre])

  // テーマ: dark クラスを html に付け外し。system は端末設定に追従
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () =>
      document.documentElement.classList.toggle('dark', settings.theme === 'dark' || (settings.theme === 'system' && mq.matches))
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [settings.theme])

  return (
    <BrowserRouter>
      <nav className="flex gap-4 border-b p-4">
        <Link to="/">{t('nav.home')}</Link>
        <Link to="/free">{t('nav.free')}</Link>
        <Link to="/settings">{t('nav.settings')}</Link>
      </nav>
      <main className="p-4">
        <Suspense>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/course/:courseId" element={<Course />} />
          <Route path="/course/:courseId/:unitId" element={<Unit />} />
          <Route path="/free" element={<Free />} />
          <Route path="/settings" element={<SettingsPage />} />
          {Sandbox && <Route path="/dev" element={<Sandbox />} />}
        </Routes>
        </Suspense>
      </main>
    </BrowserRouter>
  )
}
