import { ja, type MessageKey } from './ja'

// ponytail: ja only; add a locale switch here when a second language lands
/** `{name}` を vars で置換する */
export const t = (key: MessageKey, vars: Record<string, string | number> = {}): string =>
  ja[key].replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''))
