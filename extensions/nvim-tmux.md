# nvim-tmux

Open files from Pi conversations in nvim, with flexible tmux window layouts.

## Scope

This extension bridges Pi's conversation-driven workflow with nvim editing. When Pi reads, edits, or searches files, those files become available to open instantly in nvim without leaving your terminal workflow.

**Key features:**
- Opens files mentioned in Pi's recent tool calls
- Supports line/column positioning (file.ts:42:5)
- Multiple layout modes: tabs, vertical splits, horizontal splits
- Native iTerm2 integration via tmux -CC mode
- Keyboard shortcuts for instant access to last file

**Use case:** You're in Pi, discussing code. Pi just read `src/auth.ts` and suggested changes. Instead of manually opening your editor, type `/nvim src/auth.ts` or press `Ctrl+Shift+N` to open it instantly in a new tmux window.

## Requirements

- [tmux](https://github.com/tmux/tmux) (`brew install tmux`)
- [nvim](https://neovim.io/) (`brew install neovim`)
- Terminal that supports tmux (iTerm2 recommended)

## Usage

### Setup

```bash
# Start tmux (use -CC flag with iTerm2 for native tabs)
tmux -CC new -s coding

# Run pi inside the tmux session
pi
```

### Commands

| Command | Result |
|---------|--------|
| `/nvim README.md` | Opens in new tmux window (iTerm2 tab in -CC mode) |
| `/nvim src/main.ts:42` | Opens at line 42 |
| `/nvim src/main.ts:42:5` | Opens at line 42, column 5 |
| `/nvim README.md --tab` | Explicit new tab |
| `/nvim README.md --vsplit` | Vertical split (left/right) |
| `/nvim README.md --split` | Horizontal split (top/bottom) |
| `/nvim` | Interactive picker of files from recent conversation |

### Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+N` | Open last accessed file in new tab |
| `Ctrl+Shift+V` | Open last accessed file in vertical split |
| `Ctrl+Shift+S` | Open last accessed file in horizontal split |

## Layouts

```
Tab mode (--tab / default):
┌─────────────┐  ┌─────────────┐
│     pi      │  │    nvim     │
│             │  │  README.md  │
└─────────────┘  └─────────────┘
  iTerm2 tab 1    iTerm2 tab 2  (with -CC mode)

Vertical split (--vsplit):
┌──────────┬──────────┐
│    pi    │   nvim   │
│          │ README.md│
└──────────┴──────────┘

Horizontal split (--split):
┌──────────┐
│    pi    │
├──────────┤
│   nvim   │
│ README.md│
└──────────┘
```

## How It Works

1. **File tracking:** The extension monitors Pi's tool calls (read, edit, write, grep, find) and extracts file paths
2. **Recent files:** When you type `/nvim` without arguments, it shows files from the last 20 conversation entries
3. **Tmux integration:** Uses tmux's window/pane management to open nvim while keeping Pi running
4. **iTerm2 native tabs:** With `tmux -CC`, tmux windows become native iTerm2 tabs you can click

## Tips

**Best tmux settings for this workflow:**

```bash
# ~/.tmux.conf
# Easy window switching (matches iTerm2 Cmd+number)
bind-key -n C-1 select-window -t 1
bind-key -n C-2 select-window -t 2
bind-key -n C-3 select-window -t 3

# Mouse support for clicking between panes
set -g mouse on

# Status bar with window names
set -g status-style bg=default
set -g window-status-current-style fg=green,bold
```

**Workflow example:**

```text
# In Pi, discussing code
> Can you check the auth module?

[Pi uses read tool on src/auth.ts]

> /nvim src/auth.ts:50 --vsplit
✓ Opened src/auth.ts at line 50 (vsplit)

# Now you have Pi and nvim side by side
# Make edits in nvim, then ask Pi about them

> What do you think of my changes to src/auth.ts?
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Not in tmux session" | Start tmux first: `tmux -CC new -s pi` |
| Layout looks wrong | Use `--vsplit` for left/right, `--split` for top/bottom |
| File picker is empty | Pi hasn't used file tools yet. Read a file first |
| Shortcuts don't work | Check if tmux is capturing the keys. Press `Ctrl+B` then shortcut |

## See Also

- [tmux documentation](https://github.com/tmux/tmux/wiki)
- [iTerm2 tmux integration](https://iterm2.com/documentation-tmux-integration.html)
- [Pi extensions documentation](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/extensions.md)
