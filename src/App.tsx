import { lazy, Suspense } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router'
import { t } from '@/i18n'
import Stub from '@/pages/Stub'

// 開発時のみ部品確認ページを読み込む（本番ビルドでは null で除去される）
const Sandbox = import.meta.env.DEV ? lazy(() => import('@/pages/Sandbox')) : null

export default function App() {
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
          <Route path="/" element={<Stub titleKey="home.title" />} />
          <Route path="/course/:courseId" element={<Stub titleKey="course.title" />} />
          <Route path="/course/:courseId/:unitId" element={<Stub titleKey="unit.title" />} />
          <Route path="/free" element={<Stub titleKey="free.title" />} />
          <Route path="/settings" element={<Stub titleKey="settings.title" />} />
          {Sandbox && <Route path="/dev" element={<Sandbox />} />}
        </Routes>
        </Suspense>
      </main>
    </BrowserRouter>
  )
}
