#!/usr/bin/env python3
"""Step 1 of the workspace-debt fix: remove internal fallback alloc blocks.

LAPACKE convention: WORK is a caller-provided strided-array parameter,
never internally allocated. See `.claude/skills/blahpack-translate/SKILL.md`
"Workspace Convention".

This codemod handles only the SAFE mechanical step: removing the
`if (!WORK || WORK.length < ws) { WORK = new ...; }` fallback block from
base.js (and ndarray.js mirror). It does NOT rename params or drop the
`lwork` integer-length param — those are entangled with tests and the
layout wrapper.

WARNING: removing the fallback often breaks tests that pass `null` for
WORK or under-size it. The minimal full fix for one module is:

  1. Run this codemod on the module to remove the fallback.
  2. Update tests (test.ndarray.js especially) to allocate WORK at the
     documented required size — replace `null, 1, 0, 0` placeholders.
  3. Update the layout wrapper (`<routine>.js`) to allocate WORK when
     the caller omits it (LAPACKE-style convenience).
  4. Optionally: rename WORK -> work in base/ndarray to clear the
     `workspace.naming` warning, and drop the `lwork` param.

Tiers:
  A (fallback)   — fallback alloc block present; this codemod removes it.
  B (no-param)   — WORK is allocated inline without a fallback wrapper.
                   The codemod skips these; they need manual partitioning.
  C (complex)    — fallback shape unrecognized OR multiple workspace
                   allocations. Skipped.

Usage:
  python bin/fix-workspace.py lib/lapack/base/dgebrd
  python bin/fix-workspace.py --all          # iterate every violator
  python bin/fix-workspace.py --check ...    # dry-run, show what would change
"""
from __future__ import annotations
import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import List, Tuple

ROOT = Path(__file__).resolve().parent.parent
WORK_NAMES = ("WORK", "RWORK", "IWORK", "SWORK", "BWORK")


def find_violators(json_path: Path) -> List[str]:
    """Read a gate --json dump and return modules failing no-internal-alloc."""
    data = json.loads(json_path.read_text())
    mods = []
    for m in data.get("modules", []):
        for c in m.get("checks", []) or []:
            if c.get("status") == "fail" and c.get("id") == "workspace.no-internal-alloc":
                mods.append(m["module"])
                break
    return mods


def regen_gate_json(out: Path) -> None:
    """Run the gate and capture --json output."""
    print("Regenerating gate JSON...", file=sys.stderr)
    cmd = ["node", str(ROOT / "bin" / "gate.js"), "--all", "--fast", "--json"]
    with out.open("w") as fh:
        subprocess.run(cmd, stdout=fh, check=True, cwd=ROOT)


def detect_tier(base_src: str) -> str:
    """Classify the module's allocation pattern.

    Returns one of: "fallback" (Tier A), "no-param" (Tier B), "complex" (Tier C).
    """
    has_work_param = bool(
        re.search(r"function\s+\w+\s*\([^)]*\bWORK\b", base_src, re.IGNORECASE)
    )
    if not has_work_param:
        return "no-param"
    # Detect the fallback pattern:
    # `if ( !WORK || WORK.length < ... ) { ... new Float64Array(...) ... }`
    if re.search(
        r"if\s*\(\s*!\s*WORK\b|WORK\s*\.\s*length\s*<",
        base_src,
    ) and re.search(r"WORK\s*=\s*new\s+(Float|Complex|Int|Uint)\w*Array", base_src):
        return "fallback"
    return "complex"


def remove_fallback_block(src: str) -> Tuple[str, int]:
    """Remove the `if WORK undersized -> alloc` block(s).

    Returns (new_src, count_removed).
    """
    # We look for blocks that:
    #   - Start with an optional one-line `// comment` mentioning WORK or alloc
    #   - Open with one of:
    #       `if ( !WORK ... )`
    #       `if ( WORK === null ... )`  /  `if ( WORK == null ... )`
    #       `if ( WORK.length < ... )`
    #   - End with the matching closing `}` for that if
    # Strategy: find the `if` line, then brace-match forward.
    null_check = (
        r"!\s*WORK\b"
        r"|WORK\s*===?\s*null\b"
        r"|WORK\s*\.\s*length\s*<"
    )
    pattern = re.compile(
        r"(?P<comment>(?:[ \t]*//[^\n]*\n)*)"
        r"(?P<head>[ \t]*if\s*\(\s*(?:" + null_check + r")[^{]*\{)",
    )
    out = []
    cursor = 0
    removed = 0
    for m in pattern.finditer(src):
        if m.start() < cursor:
            continue
        # Brace-match the body of the if.
        depth = 1
        i = m.end()
        n = len(src)
        while i < n and depth > 0:
            ch = src[i]
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
            i += 1
        # Drop trailing newline if the line was the whole thing.
        end = i
        while end < n and src[end] in (" ", "\t"):
            end += 1
        if end < n and src[end] == "\n":
            end += 1
        # Sanity: confirm the body actually contains a `new ...Array` allocation.
        body = src[m.start("head") : i]
        if "new " not in body:
            out.append(src[cursor : m.start()])
            cursor = m.start()
            continue
        # Drop the whole block (and any preceding comment lines).
        out.append(src[cursor : m.start()])
        cursor = end
        removed += 1
    out.append(src[cursor:])
    return ("".join(out), removed)


def normalize_workspace_naming(src: str) -> Tuple[str, int]:
    """Rename uppercase WORK-family params to camelCase per stdlib convention.

    WORK -> work, RWORK -> rwork, IWORK -> iwork, SWORK -> swork, BWORK -> bwork
    strideWORK -> strideWork, offsetWORK -> offsetWork (and rwork/iwork variants).
    Drops lwork/lrwork/liwork params (size is documented in JSDoc).

    Returns (new_src, count_changes).
    """
    changes = 0
    # Order matters: do the compound names first so we don't double-rewrite.
    pairs = []
    for prefix in ("stride", "offset"):
        for full in WORK_NAMES:
            short = full[0] + full[1:].lower() if full != "WORK" else "Work"
            old = prefix + full
            new = prefix + short
            pairs.append((re.compile(r"\b" + re.escape(old) + r"\b"), new))
    # Bare WORK -> work, etc. — but only as identifier (already excludes WORK<paren>).
    for full in WORK_NAMES:
        new = full.lower()
        pairs.append((re.compile(r"\b" + re.escape(full) + r"\b"), new))

    new_src = src
    for pat, repl in pairs:
        new_src, n = pat.subn(repl, new_src)
        changes += n

    # Drop the integer length params lwork / lrwork / liwork.
    # Only inside function signatures and JSDoc — they don't appear elsewhere.
    drop_re = re.compile(
        r"(,\s*l(?:r|i|s|b)?work)|"
        r"(\* @param\s+\{[^}]+\}\s+l(?:r|i|s|b)?work[^\n]*\n)"
    )
    new_src, n = drop_re.subn("", new_src)
    changes += n
    return (new_src, changes)


def fix_module(module_dir: Path, check_only: bool = False) -> dict:
    """Apply the codemod to one module. Returns a result summary."""
    result = {
        "module": str(module_dir.relative_to(ROOT)),
        "tier": None,
        "base_changes": 0,
        "ndarray_changes": 0,
        "removed_blocks": 0,
        "skipped": None,
    }
    base_path = module_dir / "lib" / "base.js"
    ndarray_path = module_dir / "lib" / "ndarray.js"
    if not base_path.exists():
        result["skipped"] = "no base.js"
        return result
    base_src = base_path.read_text()
    tier = detect_tier(base_src)
    result["tier"] = tier
    if tier == "no-param":
        result["skipped"] = "no WORK param — needs Tier B handling (manual)"
        return result
    if tier == "complex":
        result["skipped"] = "no recognized fallback pattern — needs Tier C review"
        return result

    # Minimal-safe transform: ONLY remove the fallback alloc block. Leave
    # param naming (WORK -> work) and the `lwork` int param for manual
    # follow-up, since those changes are tightly coupled to test fixtures
    # and the layout wrapper. Removing only the block converts "silently
    # allocates" into "fails loudly if tests under-size WORK" — a real
    # forcing function for test fixups.
    new_base, removed = remove_fallback_block(base_src)
    result["removed_blocks"] = removed
    if removed == 0:
        result["skipped"] = "fallback pattern not removable by codemod (unrecognized shape)"
        result["tier"] = "complex"
        return result
    result["base_changes"] = 1

    if not check_only:
        base_path.write_text(new_base)

    if ndarray_path.exists():
        nd_src = ndarray_path.read_text()
        new_nd, nd_removed = remove_fallback_block(nd_src)
        result["ndarray_changes"] = nd_removed
        if not check_only and new_nd != nd_src:
            ndarray_path.write_text(new_nd)

    return result


def main(argv: List[str]) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("module", nargs="?", help="path to a single module (e.g. lib/lapack/base/dgebrd)")
    ap.add_argument("--all", action="store_true", help="apply to every violator in the codebase")
    ap.add_argument("--check", action="store_true", help="dry-run; do not write files")
    ap.add_argument("--gate-json", default="/tmp/gate.json", help="path to a cached gate --json output (regenerated if missing)")
    args = ap.parse_args(argv)

    if not args.module and not args.all:
        ap.error("provide a module path, or --all")

    if args.all:
        gp = Path(args.gate_json)
        if not gp.exists():
            regen_gate_json(gp)
        modules = [ROOT / m for m in find_violators(gp)]
    else:
        modules = [Path(args.module).resolve()]

    by_tier = {"fallback": [], "complex": [], "no-param": []}
    fixed = 0
    for d in modules:
        if not (d / "lib" / "base.js").exists():
            continue
        r = fix_module(d, check_only=args.check)
        tier = r["tier"] or "unknown"
        by_tier.setdefault(tier, []).append(r)
        if tier == "fallback" and r["base_changes"]:
            fixed += 1
            tag = "WOULD FIX" if args.check else "FIXED"
            print(f"  {tag}  {r['module']}  removed={r['removed_blocks']}  base_changes={r['base_changes']}  nd_changes={r['ndarray_changes']}")
        elif tier in ("no-param", "complex"):
            print(f"  SKIP    {r['module']}  ({tier}: {r['skipped']})")

    print()
    print(f"Tier A (fallback)  : {len(by_tier['fallback'])} module(s){' — auto-fixed' if not args.check else ' — dry-run'}")
    print(f"Tier B (no-param)  : {len(by_tier['no-param'])} module(s) — manual: add work, strideWork, offsetWork to signature and partition existing allocations")
    print(f"Tier C (complex)   : {len(by_tier['complex'])} module(s) — manual: review allocation pattern (multi-WORK or non-fallback shape)")
    print()
    if not args.check and fixed > 0:
        print("Re-run the gate to confirm:")
        print("  node bin/gate.js --all --fast --json > /tmp/gate.json")

    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
