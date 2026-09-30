declare module '*.mdx' {
  import type { ComponentType } from 'react'
  export const frontmatter: Record<string, unknown>
  const Content: ComponentType<{ components?: Record<string, ComponentType<never>> }>
  export default Content
}
