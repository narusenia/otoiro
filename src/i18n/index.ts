import { ja, type MessageKey } from './ja'

// ponytail: ja only; add a locale switch here when a second language lands
export const t = (key: MessageKey): string => ja[key]
