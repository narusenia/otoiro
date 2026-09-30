import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { updateState, useAppState, type AppState } from '@/store'

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
      <h1 className="text-2xl font-semibold">設定</h1>
      <Setting label="音色" name="timbre" value={settings.timbre} options={[['piano', 'ピアノ'], ['sine', 'サイン波']]} />
      <Setting
        label="音名の表記"
        name="noteStyle"
        value={settings.noteStyle}
        options={[['doremi', 'ドレミ'], ['english', 'C D E'], ['hani', 'ハニホ']]}
      />
      <Setting
        label="テーマ"
        name="theme"
        value={settings.theme}
        options={[['system', '端末に合わせる'], ['light', 'ライト'], ['dark', 'ダーク']]}
      />
      <section className="flex flex-col gap-1 text-sm text-muted-foreground">
        <h2 className="font-medium text-foreground">クレジット</h2>
        <p>
          ピアノ音源: Salamander Grand Piano V3 by Alexander Holm（
          <a className="underline" href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">
            CC BY 3.0
          </a>
          、C2〜C7 を間引いて使用）
        </p>
      </section>
    </div>
  )
}
