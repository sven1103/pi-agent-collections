# Plan Toggle Extension

Toggle between full coding mode and read-only question-answering mode.

## Overview

When working with pi, you often want to ask questions about your codebase without triggering file modifications. The plan extension enables a read-only "plan mode" that restricts tools to research-only operations.

## Features

- **Toggle with `/plan`** - Single command to switch modes
- **Explicit control** - `/plan on` or `/plan off` for precise control
- **Tool restriction** - Only `read`, `grep`, `find`, `ls` available in plan mode
- **Visual indicator** - `[PLAN]` status shown in footer when active
- **Blocked tools** - Attempting to use `write`, `edit`, or `bash` shows a warning and is blocked

## Usage

| Command | Description |
|---------|-------------|
| `/plan` | Toggle between modes |
| `/plan on` | Enable read-only plan mode |
| `/plan off` | Disable and return to full coding mode |

## Checking Mode Status

When plan mode is active, you will see:
- **`[PLAN]`** in the footer status bar
- A notification: "Plan ON - read-only mode"

When disabled:
- Status bar clears
- Full toolset restored: `read`, `bash`, `edit`, `write`

## Example Workflow

```
> /plan on
✓ Plan ON - read-only mode
[READ-ONLY MODE] Answer questions only. Use: read, grep, find, ls. Do not modify files.

> what files are here?
✓ Listed directory contents (using ls tool)

> explain the auth flow
✓ Provided explanation using read/grep tools

> /plan off
✓ Plan OFF - full mode

> implement the auth flow
✓ Now ready to use write/edit/bash tools
```

## Installation

Copy `plan-toggle.ts` to your pi extensions directory:

```bash
# Global installation
cp extensions/plan-toggle.ts ~/.pi/agent/extensions/

# Project-local installation  
cp extensions/plan-toggle.ts .pi/extensions/
```

Then reload pi: `/reload`

## How It Works

1. **`/plan on`** calls `pi.setActiveTools()` to restrict available tools
2. **Tool blocking** via `tool_call` event intercepts any attempts to use restricted tools
3. **Status indicator** updates the footer to show current mode
4. **Session reset** - Plan mode resets when you start a new session
