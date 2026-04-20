# GitHub CLI Skill for Pi

This skill enables the pi agent to query GitHub using the `gh` CLI tool.

## Installation

This skill is already set up in `.pi/skills/github-cli/`. It will be automatically discovered by pi when it starts in this directory.

For global availability, copy to `~/.pi/agent/skills/`:
```bash
cp -r .pi/skills/github-cli ~/.pi/agent/skills/
```

## Usage

The skill is automatically loaded when you ask the agent to:
- List or view issues
- List or view pull requests
- Search GitHub
- Get repository information

### Manual Commands

You can also use the helper script directly:
```bash
.pi/skills/github-cli/scripts/gh-helper.sh issues --state open --limit 10
.pi/skills/github-cli/scripts/gh-helper.sh prs --author @me
.pi/skills/github-cli/scripts/gh-helper.sh issue 123
.pi/skills/github-cli/scripts/gh-helper.sh status
```

## Prerequisites

- `gh` CLI installed
- Authenticated with GitHub (`gh auth login`)

## Files

- `SKILL.md` - Main skill instructions
- `scripts/gh-helper.sh` - Helper script for common operations