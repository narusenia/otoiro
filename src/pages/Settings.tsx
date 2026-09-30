import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { updateState, useAppState, type AppState } from '@/store'
import { t } from '@/i18n'

type Settings = AppState['settings']

function Setting<K extends keyof Settings>({
  label,
  name,
  options,
  value,
}: {
  label: string
  name: K
  options: [Settings[K], string][]
  value: Settings[K]
}) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-medium">{label}</h2>
      <ToggleGroup
        variant="outline"
        value={[value as string]}
        onValueChange={(v) => v[0] && updateState((s) => ({ ...s, settings: { ...s.settings, [name]: v[0] } }))}
      >
        {options.map(([id, text]) => (
          <ToggleGroupItem key={id as string} value={id as string}>
            {text}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

export default function SettingsPage() {
  const { settings } = useAppState()
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t('settings.title')}</h1>
      <Setting label={t('settings.timbre')} name="timbre" value={settings.timbre} options={[['piano', t('settings.timbre.piano')], ['sine', t('settings.timbre.sine')]]} />
      <Setting
        label={t('settings.noteStyle')}
        name="noteStyle"
        value={settings.noteStyle}
        options={[['doremi', t('settings.noteStyle.doremi')], ['english', t('settings.noteStyle.english')], ['hani', t('settings.noteStyle.hani')]]}
      />
      <Setting
        label={t('settings.theme')}
        name="theme"
        value={settings.theme}
        options={[['system', t('settings.theme.system')], ['light', t('settings.theme.light')], ['dark', t('settings.theme.dark')]]}
      />
      <section className="flex flex-col gap-1 text-sm text-muted-foreground">
        <h2 className="font-medium text-foreground">{t('settings.credits')}</h2>
        <p>
          {t('settings.creditsBefore')}
          <a className="underline" href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">
            CC BY 3.0
          </a>
          {t('settings.creditsAfter')}
        </p>
      </section>
    </div>
  )
}
