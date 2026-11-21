// Sync the central version file (versions.env) into the files that cannot read it directly.
//
// Usage:
//   node scripts/sync-versions.mjs          write values into the target files
//   node scripts/sync-versions.mjs --check  do not write; exit 1 if a target file differs
//
// Targets (written):  package.json, src-tauri/Cargo.toml, src-tauri/tauri.conf.json, rust-toolchain.toml
// Reported only:      Tauri npm/crate alignment, workflow Node versions, install script Yarn version
//
// Zero dependencies. Edits are line based so Prettier formatting is kept.
//
// Safety: all-or-nothing. The script first builds the new text of EVERY target in memory and
// checks it. If any target cannot be processed, it prints all problems and writes NOTHING.
// So it can never update one file and leave another one behind.
//
// How to add a new target later (for example Tauri versions):
//   1. Add the key to versions.env and to REQUIRED below.
//   2. Add a format check next to the other checks (semver test).
//   3. Write a function like buildCargoToml(text): it receives the file text and
//      returns the new text. Use replaceLine() so a missing line fails loudly.
//   4. Add { file, build } to the "targets" list.
// Keep each build function pure (text in, text out). Then --check and sync stay in step.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHECK = process.argv.includes("--check");
const REQUIRED = ["APP_VERSION", "YARN_VERSION", "NODE_MIN_VERSION", "RUST_MSRV", "RUST_TOOLCHAIN"];

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

// Read KEY=VALUE lines, ignore comments and empty lines.
function parseEnv(text) {
    const out = {};
    for (const raw of text.split(/\r?\n/)) {
        const line = raw.trim();
        if (!line || line.startsWith("#")) continue;
        const i = line.indexOf("=");
        if (i < 1) throw new Error(`versions.env: bad line "${raw}"`);
        out[line.slice(0, i).trim()] = line
            .slice(i + 1)
            .replace(/\s+#.*$/, "")
            .trim();
    }
    return out;
}

const v = parseEnv(read("versions.env"));
for (const key of REQUIRED) {
    if (!v[key]) throw new Error(`versions.env: missing ${key}`);
}
const semver = /^\d+\.\d+\.\d+$/;
for (const key of ["APP_VERSION", "YARN_VERSION", "NODE_MIN_VERSION", "RUST_MSRV"]) {
    if (!semver.test(v[key])) throw new Error(`versions.env: ${key}="${v[key]}" must look like 1.2.3`);
}
// stable, beta and nightly move over time, so only a fixed version is accepted.
if (!semver.test(v.RUST_TOOLCHAIN)) {
    throw new Error(
        `versions.env: RUST_TOOLCHAIN="${v.RUST_TOOLCHAIN}" must be a fixed version like 1.2.3 (stable, beta and nightly change over time)`,
    );
}

// Replace the first match of a line pattern. Fail loudly if the line is missing.
function replaceLine(text, pattern, replacement, label) {
    if (!pattern.test(text)) throw new Error(`Could not find ${label}`);
    return text.replace(pattern, replacement);
}

function buildPackageJson(text) {
    text = replaceLine(text, /^(\s*"version":\s*)"[^"]*"/m, `$1"${v.APP_VERSION}"`, 'package.json "version"');
    text = replaceLine(
        text,
        /^(\s*"packageManager":\s*)"[^"]*"/m,
        `$1"yarn@${v.YARN_VERSION}"`,
        'package.json "packageManager"',
    );
    const engines = `>=${v.NODE_MIN_VERSION}`;
    if (/^\s*"engines":/m.test(text)) {
        text = replaceLine(text, /^(\s*"node":\s*)"[^"]*"/m, `$1"${engines}"`, 'package.json "engines.node"');
    } else {
        // Insert a new "engines" block right after "packageManager".
        text = text.replace(
            /^(\s*)("packageManager":\s*"[^"]*",)\n/m,
            `$1$2\n$1"engines": {\n$1    "node": "${engines}"\n$1},\n`,
        );
    }
    return text;
}

function buildCargoToml(text) {
    if (!/^\[package\]/m.test(text)) throw new Error("Could not find Cargo.toml [package] section");
    // Only touch the [package] section (stop at the next [section]).
    return text.replace(/^\[package\][\s\S]*?(?=^\[|(?![\s\S]))/m, (pkg) => {
        pkg = replaceLine(pkg, /^(version\s*=\s*)"[^"]*"/m, `$1"${v.APP_VERSION}"`, "Cargo.toml [package] version");
        return replaceLine(pkg, /^(rust-version\s*=\s*)"[^"]*"/m, `$1"${v.RUST_MSRV}"`, "Cargo.toml rust-version");
    });
}

function buildTauriConf(text) {
    // tauri.conf.json has one top-level "version" line. Only that line is changed.
    return replaceLine(text, /^(\s*"version":\s*)"[^"]*"/m, `$1"${v.APP_VERSION}"`, 'tauri.conf.json "version"');
}

function buildToolchainToml() {
    return [
        "# Generated from versions.env by scripts/sync-versions.mjs. Do not edit by hand.",
        "# Change RUST_TOOLCHAIN in versions.env, then run: corepack yarn versions:sync",
        "[toolchain]",
        `channel = "${v.RUST_TOOLCHAIN}"`,
        "",
    ].join("\n");
}

// After building, read the new text back and check that every value really is what versions.env says.
// This catches a pattern that matched the wrong line, or a section that was not found.
function verifyPackageJson(text) {
    const j = JSON.parse(text);
    if (!j.name) throw new Error('package.json has no "name"');
    if (j.version !== v.APP_VERSION) throw new Error('package.json "version" was not set');
    if (j.packageManager !== `yarn@${v.YARN_VERSION}`) throw new Error('package.json "packageManager" was not set');
    if (j.engines?.node !== `>=${v.NODE_MIN_VERSION}`) throw new Error('package.json "engines.node" was not set');
}

function verifyCargoToml(text) {
    const pkg = (text.match(/^\[package\][\s\S]*?(?=^\[|(?![\s\S]))/m) || [""])[0];
    if (!/^name\s*=\s*"[^"]+"/m.test(pkg)) throw new Error('Cargo.toml [package] has no "name"');
    const hasLine = (key, value) => new RegExp(`^${key}\\s*=\\s*"${value}"`, "m").test(pkg);
    if (!hasLine("version", v.APP_VERSION)) throw new Error("Cargo.toml version was not set");
    if (!hasLine("rust-version", v.RUST_MSRV)) throw new Error("Cargo.toml rust-version was not set");
}

function verifyTauriConf(text) {
    if (JSON.parse(text).version !== v.APP_VERSION) throw new Error('tauri.conf.json top-level "version" was not set');
}

const targets = [
    { file: "package.json", build: buildPackageJson, verify: verifyPackageJson },
    { file: "src-tauri/Cargo.toml", build: buildCargoToml, verify: verifyCargoToml },
    { file: "src-tauri/tauri.conf.json", build: buildTauriConf, verify: verifyTauriConf },
    { file: "rust-toolchain.toml", build: () => buildToolchainToml() },
];

// Step 1: build and verify every target in memory. Nothing is written in this step.
const results = [];
const problems = [];
for (const { file, build, verify } of targets) {
    try {
        const existed = exists(file);
        const before = existed ? read(file) : "";
        const after = build(before);
        if (verify) verify(after);
        results.push({ file, existed, before, after });
    } catch (error) {
        problems.push(`${file}: ${error.message}`);
    }
}
if (problems.length > 0) {
    console.error("ERROR: no file was changed, because not every target could be processed:");
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
}

// Step 2: report, or write. If a write fails, put the already written files back.
let drift = 0;
const written = [];
for (const r of results) {
    if (r.before === r.after) {
        console.log(`OK       ${r.file}`);
    } else if (CHECK) {
        console.log(`DRIFT    ${r.file} differs from versions.env (run: corepack yarn versions:sync)`);
        drift++;
    } else {
        try {
            fs.writeFileSync(path.join(ROOT, r.file), r.after);
            written.push(r);
            console.log(`UPDATED  ${r.file}`);
        } catch (error) {
            console.error(`ERROR: could not write ${r.file}: ${error.message}`);
            for (const w of written.reverse()) {
                if (w.existed) fs.writeFileSync(path.join(ROOT, w.file), w.before);
                else fs.rmSync(path.join(ROOT, w.file), { force: true });
            }
            console.error("The files written before the error were put back. No file was left half updated.");
            process.exit(1);
        }
    }
}

// ---- Report only (never fails the check) ----
console.log("\nReport (not written by this script):");

const pkg = JSON.parse(read("package.json"));
const cargo = read("src-tauri/Cargo.toml");
const tauriCrate = (cargo.match(/^tauri\s*=\s*\{\s*version\s*=\s*"([^"]+)"/m) || [])[1];
const tauriNpm = { ...pkg.dependencies, ...pkg.devDependencies };
for (const name of Object.keys(tauriNpm).filter((n) => n.startsWith("@tauri-apps/"))) {
    console.log(`  INFO   ${name} = ${tauriNpm[name]}   (crate tauri = "${tauriCrate}")`);
}

const wfDir = path.join(ROOT, ".github/workflows");
if (fs.existsSync(wfDir)) {
    for (const f of fs.readdirSync(wfDir).filter((n) => /\.ya?ml$/.test(n))) {
        const nodes = [...read(`.github/workflows/${f}`).matchAll(/node-version:\s*([^\s#]+)/g)]
            .map((m) => m[1])
            .filter((n) => !n.startsWith("$")); // skip ${{ matrix... }} expressions
        if (nodes.length) console.log(`  INFO   workflow ${f}: node-version ${[...new Set(nodes)].join(", ")}`);
    }
}
const mediaDir = path.join(ROOT, "install-update-media");
if (fs.existsSync(mediaDir)) {
    for (const f of fs.readdirSync(mediaDir).filter((n) => n.endsWith(".sh"))) {
        const hits = [...read(`install-update-media/${f}`).matchAll(/yarn@(\d+\.\d+\.\d+)/g)].map((m) => m[1]);
        for (const h of hits) {
            const flag = h === v.YARN_VERSION ? "same as" : "DIFFERENT from";
            console.log(`  INFO   ${f}: yarn@${h} (${flag} YARN_VERSION)`);
        }
    }
}

if (CHECK && drift > 0) {
    console.log(`\n${drift} file(s) out of date.`);
    process.exit(1);
}
console.log(CHECK ? "\nAll target files match versions.env." : "\nDone.");
