export type Phase = 'idle' | 'working'

declare module 'claude-code' {
  interface PluginState {
    'prompt-master': { phase: Phase; original: string | null }
  }
}
