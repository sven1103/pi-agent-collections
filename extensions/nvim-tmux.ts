/**
 * nvim-tmux - Open files in nvim within tmux
 *
 * Opens files from Pi conversations in nvim, with support for:
 * - New tmux windows (become iTerm2 native tabs in -CC mode)
 * - Vertical splits (left/right)
 * - Horizontal splits (top/bottom)
 * - Line/column positioning (file.ts:42:5)
 *
 * Usage:
 *   /nvim README.md              # Open in new tab/window
 *   /nvim src/main.ts:42         # Open at line 42
 *   /nvim src/main.ts:42:5       # Open at line 42, column 5
 *   /nvim README.md --vsplit     # Vertical split (left/right)
 *   /nvim README.md --split      # Horizontal split (top/bottom)
 *   /nvim README.md --tab        # New tab (default)
 *   /nvim                        # Interactive picker of recent files
 *
 * Shortcuts:
 *   Ctrl+Shift+N  - Open last file in new tab
 *   Ctrl+Shift+V  - Open last file in vertical split
 *   Ctrl+Shift+S  - Open last file in horizontal split
 *
 * Requirements: tmux (brew install tmux)
 * Recommended: iTerm2 with `tmux -CC` for native tab integration
 */

import type { ExtensionAPI, SessionEntry } from "@mariozechner/pi-coding-agent";
import { spawn } from "node:child_process";
import { resolve, basename } from "node:path";

// Parse "file.ts", "file.ts:42", "file.ts:42:5", or "file.ts --tab"
function parseArgs(input: string): {
	path: string;
	line?: number;
	col?: number;
	mode: "tab" | "split" | "vsplit";
} {
	const parts = input.trim().split(/\s+/);
	const fileArg = parts[0] || "";
	const flags = parts.slice(1);

	const match = fileArg.match(/^(.+?)(?::(\d+))?(?::(\d+))?$/);
	const path = match?.[1] || fileArg;
	const line = match?.[2] ? parseInt(match[2], 10) : undefined;
	const col = match?.[3] ? parseInt(match[3], 10) : undefined;

	let mode: "tab" | "split" | "vsplit" = "tab";
	if (flags.includes("--split")) mode = "split";
	if (flags.includes("--vsplit")) mode = "vsplit";
	if (flags.includes("--tab")) mode = "tab";

	return { path, line, col, mode };
}

// Extract recent files from conversation
function getRecentFiles(ctx: ExtensionAPI[""], max = 10): string[] {
	const branch = ctx.sessionManager.getBranch();
	const files = new Set<string>();

	for (const entry of branch.slice(-20).reverse()) {
		if (entry.type !== "message") continue;
		const msg = entry.message;

		if (msg.role === "assistant" && msg.toolCalls) {
			for (const tc of msg.toolCalls) {
				if (["read", "edit", "write", "grep", "find"].includes(tc.toolName)) {
					const path = tc.input?.path || tc.input?.file || tc.input?.paths?.[0];
					if (typeof path === "string") files.add(path);
				}
			}
		}
	}

	return Array.from(files).slice(0, max);
}

// Open file in tmux with specified layout
async function openInTmux(
	filePath: string,
	options: { line?: number; col?: number; mode?: "tab" | "split" | "vsplit" } = {},
): Promise<void> {
	const { line, col, mode = "tab" } = options;

	// Build nvim position argument: +42 or +42:5
	const position = line ? `+${line}${col ? `:${col}` : ""}` : "";
	const nvimArgs = position ? [position, filePath] : [filePath];

	let tmuxCmd: string[];

	switch (mode) {
		case "split":
			// Horizontal split (top/bottom) = tmux -v (vertical division line)
			tmuxCmd = ["split-window", "-v", "-c", "#{pane_current_path}"];
			break;
		case "vsplit":
			// Vertical split (left/right) = tmux -h (horizontal division line)
			tmuxCmd = ["split-window", "-h", "-c", "#{pane_current_path}"];
			break;
		case "tab":
		default:
			// New window (becomes iTerm2 tab in -CC mode)
			tmuxCmd = ["new-window", "-n", basename(filePath), "-c", "#{pane_current_path}"];
			break;
	}

	return new Promise((resolve, reject) => {
		const child = spawn("tmux", [...tmuxCmd, "nvim", ...nvimArgs], {
			stdio: "ignore",
		});

		child.on("error", (err) => reject(new Error(`Failed to spawn tmux: ${err.message}`)));
		child.on("close", (code) => {
			if (code === 0 || code === null) {
				resolve();
			} else {
				reject(new Error(`tmux exited with code ${code}`));
			}
		});
	});
}

export default function (pi: ExtensionAPI) {
	// Check if we're in tmux
	if (!process.env.TMUX) {
		console.warn("[nvim-tmux] Warning: not running inside tmux. Install tmux and run pi inside it.");
		console.warn("[nvim-tmux] For iTerm2: tmux -CC new -s pi");
	}

	pi.registerCommand("nvim", {
		description: "Open file(s) in nvim. Usage: /nvim file.ts, /nvim file.ts:42, /nvim file.ts --vsplit",

		handler: async (args, ctx) => {
			if (!ctx.hasUI) {
				ctx.ui.notify("nvim command requires interactive mode", "error");
				return;
			}

			// Check tmux
			if (!process.env.TMUX) {
				ctx.ui.notify("Not in tmux session", "error");
				ctx.ui.notify("Run: tmux -CC new -s pi", "info");
				ctx.ui.notify("Then run pi inside", "info");
				return;
			}

			// No args - show file picker from recent conversation
			if (!args.trim()) {
				const files = getRecentFiles(ctx);

				if (files.length === 0) {
					ctx.ui.notify("No files found in recent conversation", "warning");
					ctx.ui.notify("Usage: /nvim README.md or /nvim src/main.ts:42", "info");
					return;
				}

				// Let user pick which file and mode
				const choice = await ctx.ui.select("Open in nvim:", [
					...files.map((f) => ({ value: `${f} --tab`, label: `${basename(f)} (new tab)` })),
					...files.map((f) => ({ value: `${f} --vsplit`, label: `${basename(f)} (split right)` })),
					...files.map((f) => ({ value: `${f} --split`, label: `${basename(f)} (split below)` })),
				]);

				if (!choice) return;
				args = choice;
			}

			// Parse file path, line number, and mode
			const { path, line, col, mode } = parseArgs(args.trim());
			const fullPath = resolve(ctx.cwd, path);

			const modeLabel = mode === "tab" ? "tab" : mode === "vsplit" ? "vsplit" : "split";
			ctx.ui.setStatus("nvim", `Opening ${basename(path)} (${modeLabel})...`);

			try {
				await openInTmux(fullPath, { line, col, mode });
				ctx.ui.notify(`Opened ${path}${line ? ` at line ${line}` : ""} (${modeLabel})`, "success");
			} catch (err) {
				ctx.ui.notify(`Failed to open: ${err instanceof Error ? err.message : String(err)}`, "error");
			} finally {
				ctx.ui.setStatus("nvim", undefined);
			}
		},
	});

	// Quick shortcuts for different layouts
	pi.registerShortcut("ctrl+shift+n", {
		description: "Open last file in new tab",
		handler: async (ctx) => {
			if (!process.env.TMUX) {
				ctx.ui.notify("Not in tmux", "error");
				return;
			}
			const files = getRecentFiles(ctx, 1);
			if (files.length === 0) {
				ctx.ui.notify("No recent files", "warning");
				return;
			}
			const file = files[0];
			await openInTmux(resolve(ctx.cwd, file), { mode: "tab" });
			ctx.ui.notify(`Opened ${basename(file)} (tab)`, "success");
		},
	});

	pi.registerShortcut("ctrl+shift+v", {
		description: "Open last file in vertical split",
		handler: async (ctx) => {
			if (!process.env.TMUX) return;
			const files = getRecentFiles(ctx, 1);
			if (files.length === 0) return;
			const file = files[0];
			await openInTmux(resolve(ctx.cwd, file), { mode: "vsplit" });
			ctx.ui.notify(`Opened ${basename(file)} (vsplit)`, "success");
		},
	});

	pi.registerShortcut("ctrl+shift+s", {
		description: "Open last file in horizontal split",
		handler: async (ctx) => {
			if (!process.env.TMUX) return;
			const files = getRecentFiles(ctx, 1);
			if (files.length === 0) return;
			const file = files[0];
			await openInTmux(resolve(ctx.cwd, file), { mode: "split" });
			ctx.ui.notify(`Opened ${basename(file)} (split)`, "success");
		},
	});
}
