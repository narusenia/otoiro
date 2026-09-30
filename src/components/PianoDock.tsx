import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { sendKey } from '@/audio/keyInput'
import { Keyboard } from '@/components/Keyboard'
import { Button } from '@/components/ui/button'
import { updateState, useAppState } from '@/store'
import { t } from '@/i18n'

/** 画面下に常駐する練習用ピアノ。初学者が「この音はどんな音か」をいつでも確かめられる */
export function PianoDock() {
  const { settings } = useAppState()
  const open = settings.showPiano
  return (
    <div className="bg-background fixed inset-x-0 bottom-0 z-10 border-t">
      <div className="flex items-center justify-between px-4 py-1">
        <span className="text-muted-foreground text-xs">{t('piano.label')}</span>
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={open}
          onClick={() => updateState((s) => ({ ...s, settings: { ...s.settings, showPiano: !open } }))}
        >
          {open ? <ChevronDownIcon data-icon="inline-start" /> : <ChevronUpIcon data-icon="inline-start" />}
          {open ? t('piano.close') : t('piano.open')}
        </Button>
      </div>
      {open && <Keyboard from={48} to={83} height={112} labelStyle={settings.noteStyle} onPress={sendKey} className="rounded-none border-0 border-t" />}
    </div>
  )
}
