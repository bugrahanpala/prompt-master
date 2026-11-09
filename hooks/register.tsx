import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Phase } from '../types'

const phase = atom({ plugin: 'prompt-master', key: 'phase' } as const, 'idle' as Phase)
const original = atom({ plugin: 'prompt-master', key: 'original' } as const, null as string | null)

const SYSTEM = `You are Prompt Master. You rewrite a user's rough draft prompt for an AI coding/analysis assistant into a better prompt.
Rules:
- Keep the user's intent, facts, names, numbers, code, paths and language exactly (if the draft is Turkish, answer in Turkish).
- Make the goal explicit, add the missing structure: context, the concrete task, constraints, and the expected output format.
- Do not invent requirements or facts; where something essential is unknown, add a short "Belirsizse sor:" / "If unclear, ask:" line instead of guessing.
- Be concise; no preamble, no explanation, no quotes or code fences around the result.
Return ONLY the rewritten prompt text.`

export const register: Register = on => {
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) {
      return next(e)
    }

    const { Box, Button, Text } = $.ui.resolve(e)
    const current = await read($, phase)
    const saved = await read($, original)

    const rewrite = async () => {
      if ((await read($, phase)) === 'working') {
        return
      }

      const { text } = await $.prompt.read()
      const draft = text.trim()

      if (draft.length === 0) {
        $.ui.toast('Prompt Master: type a draft first')
        return
      }

      await update($, phase, () => 'working')

      try {
        const r = await $.model.complete({
          model: 'sonnet',
          system: SYSTEM,
          prompt: `Rewrite this draft prompt:\n\n<draft>\n${draft}\n</draft>`,
          maxTokens: 2048,
          effort: 'low',
          timeoutMs: 60000,
        })

        if (!r.isAnswered || r.text.trim().length === 0) {
          $.ui.toast(`Prompt Master: no rewrite (${r.isAnswered ? 'empty reply' : r.reason})`)
          return
        }

        await update($, original, () => text)
        await $.prompt.fill({ text: r.text.trim(), mode: 'replace' })
        $.ui.toast('Prompt Master: draft rewritten — review, then send')
      } finally {
        await update($, phase, () => 'idle')
      }
    }

    const undo = async () => {
      const prev = await read($, original)

      if (prev !== null) {
        await $.prompt.fill({ text: prev, mode: 'replace' })
        await update($, original, () => null)
      }
    }

    return (
      <Box>
        <Button key="pm" variant="primary" onPress={rewrite}>
          {current === 'working' ? '✨ Prompt Master…' : '✨ Prompt Master'}
        </Button>
        {saved !== null ? (
          <Button key="undo" onPress={undo}>
            Undo
          </Button>
        ) : null}
        <Text dimColor> rewrite the draft in the box</Text>
      </Box>
    )
  })

  on('prompt.submit', async ($, e, next) => {
    await update($, original, () => null)
    return next(e)
  })
}
