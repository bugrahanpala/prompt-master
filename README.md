# Prompt Master

A Claude Code mod that rewrites your rough prompt draft into a clearer, better-structured prompt before you send it.

## What it does

- Adds a **✨ Prompt Master** button in the band directly above the prompt box (terminal and desktop app).
- Type a rough draft, click the button: the draft is rewritten (goal, context, task, constraints, expected output) while keeping your intent, names, numbers, code and language. Nothing is sent automatically, so you can review and edit it.
- **Undo** restores your original draft until you send.

Each click makes one extra model call (Sonnet) billed to your session.

## Install

At the prompt of a terminal session:

```
/plugin install prompt-master --marketplace bugrahanpala/prompt-master
```

Answer `y` to add the marketplace, then pick a scope (`user` makes it active in every session on this computer).

From a shell:

```
claude plugin install prompt-master --marketplace bugrahanpala/prompt-master
```
