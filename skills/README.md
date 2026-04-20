# Pi Skills

This directory contains reusable skills for the [pi coding agent](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent).

## Installation

Copy a skill to your pi skills directory:

```bash
# Project-local
cp -r skills/github-cli ~/.pi/agent/skills/  # global
cp -r skills/github-cli .pi/skills/           # project-local
```

## Available Skills

### github-cli

Query GitHub issues, pull requests, and repository information using the `gh` CLI.

**Requirements:**
- `gh` installed and authenticated (`gh auth login`)

**Usage:**
```
/skill:github-cli list issues from badlogic/pi-mono
/skill:github-cli show PR 123
```

The agent automatically uses this skill when you ask about GitHub issues or PRs.

**Files:**
- `SKILL.md` - Main skill instructions and common commands
- `scripts/gh-helper.sh` - CLI wrapper for common operations

See `github-cli/SKILL.md` for detailed documentation.

## Related

- [Extensions directory](../extensions/) - Custom pi extensions for additional features