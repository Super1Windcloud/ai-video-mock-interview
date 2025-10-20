import fs from "fs";
import path from "path";

type RouteEntry = {
	route: string;
	file: string;
	type: "pages" | "app" | "api";
};

/**
 * 简要说明：
 * - 在项目根下查找 pages/ 和 app/ 目录（以脚本文件上一级目录为项目根）。
 * - pages: 直接根据文件名生成路由（index -> /，[id] -> :id，[...slug] -> *slug），pages/api 作为 api 类型。
 * - app: 根据 folder/page.xxx 生成路由，忽略 (group) 路由组。
 *
 * 用法：
 * - ts-node scripts/routes.ts
 * - 或先 tsc 编译再 node dist/scripts/routes.js
 */

const PROJECT_ROOT = path.resolve(__dirname, "..");
const PAGES_DIR = path.join(PROJECT_ROOT, "pages");
const APP_DIR = path.join(PROJECT_ROOT, "app");

const PAGE_EXTS = new Set([".js", ".jsx", ".ts", ".tsx", ".mdx"]);

function exists(p: string) {
	try {
		return fs.statSync(p).isDirectory() || fs.statSync(p).isFile();
	} catch {
		return false;
	}
}

function walkDir(dir: string, cb: (fpath: string) => void) {
	if (!exists(dir)) return;
	const entries = fs.readdirSync(dir);
	for (const e of entries) {
		const full = path.join(dir, e);
		const stat = fs.statSync(full);
		if (stat.isDirectory()) {
			walkDir(full, cb);
		} else if (stat.isFile()) {
			cb(full);
		}
	}
}

function toRouteFromPages(filePath: string, baseDir: string) {
	const rel = path.relative(baseDir, filePath).replace(/\\/g, "/");
	// pages/api special
	if (rel.startsWith("api/") || rel === "api") {
		const apiPath = rel.replace(/^api\/?/, "").replace(path.extname(rel), "");
		const route = apiPath === "" ? "/api" : `/api/${apiPath}`;
		return { route, type: "api" as const };
	}
	// remove extension
	let noExt = rel.replace(path.extname(rel), "");
	// index handling
	if (noExt === "index") noExt = "";
	if (noExt.endsWith("/index")) noExt = noExt.replace(/\/index$/, "");
	// convert dynamic segments
	const segs = noExt.split("/").filter(Boolean);
	const conv = segs.map(s => {
		// ignore _app or _document files if present
		if (s.startsWith("_")) return null;
		// dynamic [...slug] -> *slug, [[...slug]] -> *slug, [id] -> :id
		if (/^\[\.\.\.(.+)\]$/.test(s)) {
			const name = s.match(/^\[\.\.\.(.+)\]$/)![1];
			return `*${name}`;
		}
		if (/^\[\[(\.\.\.)?(.+)\]\]$/.test(s)) {
			// optional catch-all or optional dynamic -> treat as *name or :name
			const m = s.match(/^\[\[(\.\.\.)?(.+)\]\]$/)!;
			if (m[1]) return `*${m[2]}`;
			return `:${m[2]}`;
		}
		if (/^\[(.+)\]$/.test(s)) {
			const name = s.match(/^\[(.+)\]$/)![1];
			return `:${name}`;
		}
		return s;
	}).filter(Boolean) as string[];
	const route = "/" + conv.join("/");
	return { route: route === "/" ? "/" : route, type: "pages" as const };
}

function normalizeAppSegment(seg: string) {
	// ignore route groups like (group)
	if (seg.startsWith("(") && seg.endsWith(")")) return null;
	// ignore special files/folders starting with _
	if (seg.startsWith("_")) return null;
	return seg;
}

function toRouteFromApp(filePath: string, baseDir: string) {
	// filePath will be something like app/dashboard/page.tsx or app/(group)/dashboard/page.tsx
	let rel = path.relative(baseDir, filePath).replace(/\\/g, "/");
	// find path parts up to the page file
	const parts = rel.split("/");
	// remove the file (page.xxx) and process folders
	if (parts.length === 0) return { route: "/", type: "app" as const };
	parts.pop(); // remove filename
	const segs = parts.map(p => normalizeAppSegment(p)).filter(Boolean) as string[];
	// convert dynamic segments same as pages
	const conv = segs.map(s => {
		if (/^\[\.\.\.(.+)\]$/.test(s)) {
			const name = s.match(/^\[\.\.\.(.+)\]$/)![1];
			return `*${name}`;
		}
		if (/^\[\[(\.\.\.)?(.+)\]\]$/.test(s)) {
			const m = s.match(/^\[\[(\.\.\.)?(.+)\]\]$/)!;
			if (m[1]) return `*${m[2]}`;
			return `:${m[2]}`;
		}
		if (/^\[(.+)\]$/.test(s)) {
			const name = s.match(/^\[(.+)\]$/)![1];
			return `:${name}`;
		}
		return s;
	});
	const route = "/" + conv.join("/");
	return { route: route === "/" ? "/" : route, type: "app" as const };
}

function collectRoutes(): RouteEntry[] {
	const out: RouteEntry[] = [];
	// pages
	if (exists(PAGES_DIR)) {
		walkDir(PAGES_DIR, f => {
			const ext = path.extname(f);
			if (!PAGE_EXTS.has(ext)) return;
			const rel = path.relative(PAGES_DIR, f).replace(/\\/g, "/");
			// skip special top-level files if needed
			const { route, type } = toRouteFromPages(f, PAGES_DIR);
			out.push({ route, file: path.relative(PROJECT_ROOT, f).replace(/\\/g, "/"), type });
		});
	}
	// app
	if (exists(APP_DIR)) {
		walkDir(APP_DIR, f => {
			const ext = path.extname(f);
			const base = path.basename(f);
			// only consider page.* files in app router
			if (!/^page\.(js|jsx|ts|tsx|mdx)$/.test(base)) return;
			const { route, type } = toRouteFromApp(f, APP_DIR);
			out.push({ route, file: path.relative(PROJECT_ROOT, f).replace(/\\/g, "/"), type });
		});
	}
	// dedupe by route keeping first occurrence
	const seen = new Set<string>();
	const deduped: RouteEntry[] = [];
	for (const r of out) {
		if (!seen.has(r.route)) {
			seen.add(r.route);
			deduped.push(r);
		}
	}
	// sort for stable output
	deduped.sort((a, b) => a.route.localeCompare(b.route));
	return deduped;
}

function printRoutes(list: RouteEntry[], asJson = false) {
	if (asJson) {
		console.log(JSON.stringify(list, null, 2));
		return;
	}
	for (const r of list) {
		console.log(`${r.route}  \t[${r.type}]  \t${r.file}`);
	}
}

// CLI
const args = process.argv.slice(2);
const asJson = args.includes("--json") || args.includes("-j");
const routes = collectRoutes();
printRoutes(routes, asJson);