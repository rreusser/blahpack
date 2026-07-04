#!/usr/bin/env python3
"""
Apply mechanical fixes for the scaffold-noise gate check across all modules.

Fixes (one per --mode):
- comma-period: trailing ",." → "." in JSDoc/markdown lines
- stray-copyright: drop "// Copyright (c) 2025 Ricky Reusser. Apache-2.0 License." lines
- star-return: replace `@returns {*} result` with a routine-typed return tag
  (defaults to `{integer} info`; override with --returns-type for specific files)
- single-char-examples: rewrite single-char Fortran flags in examples/benchmark
  files to long-form strings using a per-flag lookup table
- ndarray-test-target: switch `require('./../lib/base.js')` → `lib/ndarray.js`
  in test/test.ndarray.js so the validator gets exercised

Usage:
    python bin/fix-scaffold-noise.py --mode comma-period [--dry-run]
    python bin/fix-scaffold-noise.py --mode stray-copyright [--dry-run]
    python bin/fix-scaffold-noise.py --mode star-return [--dry-run]
    python bin/fix-scaffold-noise.py --mode ndarray-test-target [--dry-run]
    python bin/fix-scaffold-noise.py --mode all [--dry-run]
"""
import argparse
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))


def find_module_dirs():
    """Yield (pkg, routine, abs_dir) for every routine module."""
    for pkg in ('blas', 'lapack'):
        pkg_dir = os.path.join(ROOT, 'lib', pkg, 'base')
        if not os.path.isdir(pkg_dir):
            continue
        for entry in sorted(os.listdir(pkg_dir)):
            mod_dir = os.path.join(pkg_dir, entry)
            if os.path.isdir(mod_dir):
                yield pkg, entry, mod_dir


def files_in_module(mod_dir, kinds):
    """Resolve relevant files in a module directory.

    kinds: 'lib', 'docs', 'examples', 'all'
    """
    paths = []
    if kinds in ('lib', 'all'):
        lib_dir = os.path.join(mod_dir, 'lib')
        if os.path.isdir(lib_dir):
            for fn in os.listdir(lib_dir):
                if fn.endswith('.js'):
                    paths.append(os.path.join(lib_dir, fn))
    if kinds in ('docs', 'all'):
        for rel in ('README.md', 'docs/repl.txt', 'docs/types/index.d.ts'):
            p = os.path.join(mod_dir, rel)
            if os.path.exists(p):
                paths.append(p)
    if kinds in ('examples', 'all'):
        for rel in ('examples/index.js', 'benchmark/benchmark.js', 'benchmark/benchmark.ndarray.js'):
            p = os.path.join(mod_dir, rel)
            if os.path.exists(p):
                paths.append(p)
    return paths


COMMA_PERIOD = re.compile(r',\.(\s*\*/|\s*$)', re.MULTILINE)


def fix_comma_period(content):
    """Replace `,.` with `.` at end-of-line or before `*/` (description trail)."""
    return COMMA_PERIOD.sub(r'.\1', content)


STRAY_COMMENT_LINE = re.compile(r'^// Copyright \(c\) 2025 Ricky Reusser\. Apache-2\.0 License\.\s*\n\n?', re.MULTILINE)
JSDOC_COPYRIGHT_LINE = re.compile(r'(^\s*\*\s*Copyright \([Cc]\) 2025 )Ricky Reusser(\.)', re.MULTILINE)


def fix_stray_copyright(content):
    """Strip stray translator-attribution comments and rewrite JSDoc copyright
    lines that name the translator instead of "The Stdlib Authors".
    """
    content = STRAY_COMMENT_LINE.sub('', content)
    content = JSDOC_COPYRIGHT_LINE.sub(r'\1The Stdlib Authors\2', content)
    return content


# Match a `@returns {*} ...` JSDoc tag, including the line indent + `* ` prefix
# so we can delete the entire line for void-return functions.
STAR_RETURN = re.compile(r'@returns\s*\{\*\}\s*([^\n]*)')
STAR_RETURN_LINE = re.compile(r'^[ \t]*\*[ \t]*@returns\s*\{\*\}\s*[^\n]*\n', re.MULTILINE)

# Detect the function's actual return value by looking at its `return`
# statements. We classify into:
#   integer  — `return 0;` / `return INFO`/`return info`/`return -1`
#   array    — `return <Capitalized>` / `return <single-letter>` (most BLAS)
#   number   — `return <number-named-thing>` like nrm, sum (uncommon)
#   void     — no `return X;` statements at all (in-place mutation)
#
# When the return type is ambiguous (mixed integer + array, or only
# unparseable expressions), leave the `{*}` unchanged and report.
RETURN_STMT = re.compile(r'^\s*return\s+([^;]+);', re.MULTILINE)


def detect_return_type(content):
    """Inspect `return ...;` statements; return one of 'integer', 'array',
    'void', or None if ambiguous.
    """
    integer_returns = 0
    array_returns = 0
    other_returns = 0
    for m in RETURN_STMT.finditer(content):
        expr = m.group(1).strip()
        if expr in ('0', '-1', '1') or re.match(r'^-?\d+$', expr):
            integer_returns += 1
            continue
        # Bare identifier: classify by name.
        if re.match(r'^[A-Za-z_][A-Za-z0-9_]*$', expr):
            lname = expr.lower()
            if lname in ('info', 'k', 'i', 'j'):
                integer_returns += 1
            else:
                array_returns += 1
            continue
        # Anything else (function call, expression): can't classify simply.
        other_returns += 1
    if integer_returns == 0 and array_returns == 0 and other_returns == 0:
        return 'void'
    if integer_returns > 0 and array_returns == 0:
        return 'integer'
    if array_returns > 0 and integer_returns == 0:
        return 'array'
    return None


# Match the routine's own base.js relative path. Two forms appear in
# test.ndarray.js: `'./../lib/base.js'` (with leading `./`) and `'../lib/base.js'`
# (without). Do NOT match cross-module dependency requires
# (`./../../<dep>/lib/base.js` or `../../<dep>/lib/base.js`).
NDARRAY_TEST_REQUIRE = re.compile(r"(require\(\s*['\"])((?:\./)?\.\./lib/)base(\.js['\"]\s*\))")


def fix_ndarray_test_target(content):
    """Switch the require target inside test/test.ndarray.js from `lib/base.js`
    to `lib/ndarray.js` so validators get exercised.
    """
    return NDARRAY_TEST_REQUIRE.sub(r'\1\2ndarray\3', content)


# Match `@returns {Type} description` on a SINGLE line. The regex intentionally
# uses [^\S\n] (whitespace except newline) instead of \s — earlier `\s*` ate
# the newline and captured `*/` from the next line as the description, which
# corrupted `lib/lapack/base/dlarfx/lib/dlarfx.js` (#bug found in audit).
BASE_RETURNS_TAG = re.compile(r'@returns[^\S\n]*\{([^}*][^}]*)\}[^\S\n]*([^\n]*)')


def fix_star_return(content, mod_dir, routine):
    """Replace `@returns {*}` placeholders in `content`. The actual return
    type is inferred from the module's `lib/base.js` — first by reading its
    `@returns {<type>}` JSDoc tag, falling back to inspecting `return ...;`
    statements when JSDoc is missing or itself a `{*}` placeholder.
    """
    base_path = os.path.join(mod_dir, 'lib', 'base.js')
    if not os.path.exists(base_path):
        return content
    with open(base_path) as f:
        base_content = f.read()

    replacement_type = None
    default_desc = None

    # First try reading base.js's documented @returns {Type}.
    m = BASE_RETURNS_TAG.search(base_content)
    if m:
        replacement_type = m.group(1).strip()
        # Use base.js's description as default if available.
        base_desc = m.group(2).strip()
        if base_desc and base_desc not in ('-', 'result', 'output'):
            default_desc = base_desc

    # Fall back to inspecting return statements.
    if replacement_type is None:
        return_kind = detect_return_type(base_content)
        if return_kind is None:
            return content   # leave `{*}` alone for manual review
        if return_kind == 'void':
            # Void function: drop the entire `@returns {*}` line. Some other
            # JSDoc files (the wrapper) may still have a meaningful @returns
            # later — only matches the {*} placeholder.
            return STAR_RETURN_LINE.sub('', content)
        if return_kind == 'integer':
            replacement_type = 'integer'
            default_desc = 'info status code'
        else:
            if routine.startswith('z') or routine.startswith('c'):
                replacement_type = 'Complex128Array'
            else:
                replacement_type = 'Float64Array'
            default_desc = 'output array'
    if default_desc is None:
        default_desc = 'result'

    def repl(m):
        existing_desc = m.group(1).strip()
        if existing_desc.lower() in ('', 'result', 'output', '-'):
            existing_desc = default_desc
        return '@returns {' + replacement_type + '} ' + existing_desc
    return STAR_RETURN.sub(repl, content)


def apply(mode, dry_run, mod_filter=None):
    changed = []
    for pkg, routine, mod_dir in find_module_dirs():
        if mod_filter and mod_filter not in mod_dir:
            continue
        if mode == 'comma-period':
            paths = files_in_module(mod_dir, 'all')
            fix = fix_comma_period
        elif mode == 'stray-copyright':
            paths = files_in_module(mod_dir, 'all')
            # Also include test/, examples/, benchmark/, docs/types files
            for sub in ('test', 'examples', 'benchmark'):
                sub_dir = os.path.join(mod_dir, sub)
                if os.path.isdir(sub_dir):
                    for fn in os.listdir(sub_dir):
                        if fn.endswith('.js'):
                            paths.append(os.path.join(sub_dir, fn))
            types_dir = os.path.join(mod_dir, 'docs', 'types')
            if os.path.isdir(types_dir):
                for fn in os.listdir(types_dir):
                    if fn.endswith('.ts'):
                        paths.append(os.path.join(types_dir, fn))
            fix = fix_stray_copyright
        elif mode == 'star-return':
            paths = files_in_module(mod_dir, 'all')
            fix = lambda c, m=mod_dir, r=routine: fix_star_return(c, m, r)
        elif mode == 'ndarray-test-target':
            # Only swap when the module actually has an ndarray.js — otherwise
            # the test legitimately must require base.js (some BLAS Level-1
            # modules don't ship a separate ndarray wrapper).
            test_path = os.path.join(mod_dir, 'test', 'test.ndarray.js')
            ndarray_path = os.path.join(mod_dir, 'lib', 'ndarray.js')
            if os.path.exists(test_path) and os.path.exists(ndarray_path):
                paths = [test_path]
            else:
                paths = []
            fix = fix_ndarray_test_target
        else:
            raise SystemExit('unknown mode: ' + mode)
        for path in paths:
            with open(path) as f:
                original = f.read()
            updated = fix(original)
            if updated != original:
                changed.append(os.path.relpath(path, ROOT))
                if not dry_run:
                    with open(path, 'w') as f:
                        f.write(updated)
    return changed


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--mode', choices=['comma-period', 'stray-copyright', 'star-return', 'ndarray-test-target', 'all'], required=True)
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--module', help='restrict to module paths matching this substring')
    args = ap.parse_args()
    modes = ['comma-period', 'stray-copyright', 'star-return', 'ndarray-test-target'] if args.mode == 'all' else [args.mode]
    total = 0
    for mode in modes:
        changed = apply(mode, args.dry_run, args.module)
        print(f'[{mode}] {"(dry-run) " if args.dry_run else ""}files changed: {len(changed)}')
        for path in changed:
            print('  ' + path)
        total += len(changed)
    print(f'TOTAL: {total} files {"would be " if args.dry_run else ""}changed')


if __name__ == '__main__':
    main()
