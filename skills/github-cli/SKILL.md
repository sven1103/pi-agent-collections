---
name: github-cli
description: Query GitHub for issues, pull requests, and repository information using the gh CLI. Use when the user wants to fetch, list, or search GitHub issues and PRs.
---

# GitHub CLI Skill

Use the `gh` CLI tool to interact with GitHub repositories, issues, and pull requests.

## Prerequisites

- `gh` must be installed and authenticated
- Run `gh auth status` to verify authentication

## Common Commands

### List Issues

```bash
gh issue list [flags]
```

Common flags:
- `--state [open|closed|all]` - Filter by state (default: open)
- `--limit <n>` - Number of results (default: 20, max: 100)
- `--assignee <user>` - Filter by assignee
- `--label <name>` - Filter by label
- `--author <user>` - Filter by author
- `--repo <owner/repo>` - Specify repository

### View Issue Details

```bash
gh issue view <issue-number> [flags]
```

Flags:
- `--repo <owner/repo>` - Specify repository
- `--comments` - Include comments

### List Pull Requests

```bash
gh pr list [flags]
```

Common flags:
- `--state [open|closed|merged|all]` - Filter by state (default: open)
- `--limit <n>` - Number of results
- `--assignee <user>` - Filter by assignee
- `--label <name>` - Filter by label
- `--author <user>` - Filter by author
- `--base <branch>` - Filter by base branch
- `--head <branch>` - Filter by head branch

### View PR Details

```bash
gh pr view <pr-number> [flags]
```

Flags:
- `--repo <owner/repo>` - Specify repository
- `--comments` - Include review comments

### View PR Checks / Status

```bash
gh pr view <pr-number> --repo <owner/repo> --json statusCheckRollup,checks
```

### Search Issues and PRs

```bash
gh search issues <query> [flags]
```

Flags:
- `--repo <owner/repo>` - Search within repository
- `--state [open|closed|all]` - Filter by state
- `--assignee <user>` - Filter by assignee
- `--author <user>` - Filter by author
- `--label <name>` - Filter by label (can repeat)
- `--limit <n>` - Number of results

### Search Repositories

```bash
gh search repos <query> [flags]
```

## Output Formats

### JSON Output (Preferred for parsing)

```bash
gh issue list --limit 10 --json number,title,state,author,labels,createdAt,updatedAt
gh pr list --state open --json number,title,state,author,labels,headRefName,isDraft
```

Available JSON fields for issues:
- `number`, `title`, `body`, `state`, `author`, `labels`, `assignees`
- `milestone`, `comments`, `createdAt`, `updatedAt`, `closedAt`
- `url`, `repository` (with name, owner)

Available JSON fields for PRs:
- `number`, `title`, `body`, `state`, `author`, `labels`, `assignees`
- `milestone`, `comments`, `createdAt`, `updatedAt`, `mergedAt`, `closedAt`
- `url`, `repository`, `headRefName`, `baseRefName`, `isDraft`, `isMergeable`
- `additions`, `deletions`, `changedFiles`

### Table Output

```bash
gh issue list --limit 10
```

### Wide Output (More Columns)

```bash
gh issue list --limit 10 -w
```

## Repository Detection

When inside a git repository with a GitHub remote, commands automatically use that repository. Use `--repo` flag to override:

```bash
gh issue list --repo owner/repo
```

## Examples

### List all open issues

```bash
gh issue list --state open --limit 20
```

### List issues assigned to a user

```bash
gh issue list --assignee @me
```

### View issue with comments

```bash
gh issue view 123 --comments
```

### List open PRs by the current user

```bash
gh pr list --author @me --state open
```

### Search for issues with a specific label

```bash
gh search issues --repo owner/repo --label "bug" --state open
```

### Get PR details as JSON

```bash
gh pr view 456 --json title,state,body,additions,deletions,changedFiles
```