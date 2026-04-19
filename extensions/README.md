# Pi Extensions

This directory contains extensions for [Pi](https://github.com/badlogic/pi-mono), the AI coding agent.

## Installation

### Option 1: Global Installation (Recommended)

Copy the extension directory to Pi's global extensions folder:

```bash
# Copy the extension directory
mkdir -p ~/.pi/agent/extensions

cp -r nvim-tmux ~/.pi/agent/extensions/

# Or symlink for development
ln -s $(pwd)/nvim-tmux ~/.pi/agent/extensions/
```

### Option 2: Project-Local Installation

Copy to your project's `.pi/extensions/` directory:

```bash
mkdir -p .pi/extensions
cp -r nvim-tmux .pi/extensions/
```

### Option 3: Direct Testing

Test an extension without installing:

```bash
pi -e ./nvim-tmux/index.ts
```

## Activation

Extensions are auto-discovered. After copying:

1. Start or restart Pi
2. Or run `/reload` to hot-reload extensions

### nvim-tmux

Open files from Pi conversations in nvim, integrated with tmux for flexible window layouts.

**Requirements:**
- tmux (`brew install tmux`)
- nvim
- (Optional but recommended) iTerm2 with `tmux -CC` for native tab integration

**Quick Start:**

```bash
# 1. Start tmux (use -CC for iTerm2 native tabs)
tmux -CC new -s coding

# 2. Run pi inside tmux
pi

# 3. Use the extension
/nvim README.md              # New tab/window
/nvim src/main.ts:42         # At line 42
/nvim README.md --vsplit     # Vertical split
/nvim README.md --split      # Horizontal split
/nvim                        # Interactive file picker
```

**Shortcuts:**
- `Ctrl+Shift+N` - Last file in new tab
- `Ctrl+Shift+V` - Last file in vertical split
- `Ctrl+Shift+S` - Last file in horizontal split

See the extension's directory for full documentation.

### plan-toggle

Toggle between full coding mode and read-only question-answering mode.

**Quick Start:**
```bash
/plan on          # Enable read-only mode
/plan off         # Disable and return to full mode
/plan             # Toggle
```

**Status:** When active, shows `[PLAN]` in the footer. Attempting to use `write`, `edit`, or `bash` is blocked with a warning notification.

See [plan-toggle.md](plan-toggle.md) for full documentation.

## Extension Development

See [Pi's extension documentation](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/extensions.md) for the full API reference.

### Quick Reference

| API | Purpose |
|-----|---------|
| `pi.registerTool()` | Register tools the LLM can call |
| `pi.registerCommand()` | Add `/commands` |
| `pi.registerShortcut()` | Add keyboard shortcuts |
| `pi.on(event, handler)` | Subscribe to lifecycle events |
| `ctx.ui.notify()` | Show notifications |
| `ctx.ui.select()` | Interactive picker |

### File Structure

```
extensions/
├── README.md              # This file
└── nvim-tmux/            # Extension directory
    ├── index.ts          # Entry point (required)
    └── README.md         # Extension-specific docs (optional)
```

Extensions are TypeScript files loaded via [jiti](https://github.com/unjs/jiti) - no compilation needed.

## Security Warning

Extensions run with your full system permissions. Only install extensions from sources you trust. Review the code before installing.
