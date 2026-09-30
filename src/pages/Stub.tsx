import { t } from '@/i18n'
import type { MessageKey } from '@/i18n/ja'

export default function Stub({ titleKey }: { titleKey: MessageKey }) {
  return <h1 className="text-2xl font-semibold">{t(titleKey)}</h1>
}
