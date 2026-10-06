import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const packages = [
  {
    dir: path.join(root, "node_modules", "@gemini-wallet", "core"),
    from: "src",
    to: "dist",
    rewriteAt: ["@/"],
  },
  {
    dir: path.join(root, "node_modules", "@noble", "curves"),
    from: "src",
    to: "esm",
    rewriteAt: [],
  },
];

function relativeImport(fromFile, absoluteTarget) {
  let rel = path.relative(path.dirname(fromFile), absoluteTarget);
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel.split(path.sep).join("/");
}

function rewriteSpecifier(file, specifier, pkg) {
  if (pkg.rewriteAt.some((prefix) => specifier.startsWith(prefix))) {
    return relativeImport(
      file,
      path.join(pkg.dir, pkg.to, specifier.slice(2)),
    );
  }

  if (!specifier.startsWith(".")) return specifier;

  const resolved = path.resolve(path.dirname(file), specifier);
  const marker = `${path.sep}${pkg.from}${path.sep}`;
  const index = resolved.lastIndexOf(marker);
  if (index === -1 || !resolved.startsWith(pkg.dir)) return specifier;

  const mapped = `${resolved.slice(0, index)}${path.sep}${pkg.to}${path.sep}${resolved.slice(index + marker.length)}`;
  return relativeImport(file, mapped.replace(/\.js$/, ""));
}

function rewriteFile(file, source, pkg) {
  return source.replace(
    /(["'])(\.\.?\/[^"']+|@\/[^"']+)\1/g,
    (match, quote, specifier) => {
      const next = rewriteSpecifier(file, specifier, pkg);
      return next === specifier ? match : `${quote}${next}${quote}`;
    },
  );
}

function walk(dir, pkg) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "src" || entry.name === "node_modules") continue;
      walk(full, pkg);
      continue;
    }
    if (!entry.name.endsWith(".d.ts")) continue;

    const original = fs.readFileSync(full, "utf8");
    const patched = rewriteFile(full, original, pkg);
    if (patched !== original) fs.writeFileSync(full, patched);
  }
}

for (const pkg of packages) {
  walk(path.join(pkg.dir, pkg.to), pkg);
}
