#!/usr/bin/env python3
"""
Audit stdlib-js conformance of translated BLAS/LAPACK modules.

Checks each module in lib/blas/* and lib/lapack/* against
the stdlib-js conventions documented in CLAUDE.md.

Usage:
    python bin/audit.py              # Full table
    python bin/audit.py --summary    # Just aggregates
    python bin/audit.py --failing    # Only show modules with issues
"""

import argparse
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Characters for the table
CHECK = '\u2713'
CROSS = '\u2717'

# Columns and their short names
COLUMNS = [
    ('base', 'base.js exists'),
    ('test', 'test/test.js exists'),
    ('strings', 'Single-char string params (not full-word)'),
    ('main', 'index.js uses setReadOnly (no main.js; ticket 0124)'),
    ('strided', 'strided.js has validation (TypeError/RangeError)'),
    ('routine', 'routine.js implemented (no "not implemented")'),
    ('learnings', 'LEARNINGS.md exists and filled in'),
    ('license', 'base.js has Apache-2.0 license header'),
    ('eslint', 'File-level eslint-disable (not inline)'),
    ('example', 'index.js has @example (not TODO)'),
]


def file_contains(path, patterns):
    """Check if a file contains any of the given patterns (case-sensitive)."""
    try:
        with open(path, 'r', errors='replace') as f:
            content = f.read()
        for pat in patterns:
            if re.search(pat, content):
                return True
        return False
    except FileNotFoundError:
        return False


def file_starts_with_license(path):
    """Check if a file starts with the Apache-2.0 license block."""
    try:
        with open(path, 'r', errors='replace') as f:
            head = f.read(200)
        return '@license Apache-2.0' in head
    except FileNotFoundError:
        return False


def has_string_params(base_js_path):
    """
    Check if base.js uses full-word string params (stdlib convention).

    Returns:
        None  - no string params detected (N/A)
        True  - uses full-word strings (conformant)
        False - still uses single-char strings (non-conformant)
    """
    try:
        with open(base_js_path, 'r', errors='replace') as f:
            content = f.read()
    except FileNotFoundError:
        return None

    # Check for full-word string comparisons (good — stdlib convention)
    full_word_patterns = [
        r"===\s*'upper'",
        r"===\s*'lower'",
        r"===\s*'no-transpose'",
        r"===\s*'transpose'",
        r"===\s*'conjugate-transpose'",
        r"===\s*'left'",
        r"===\s*'right'",
        r"===\s*'unit'",
        r"===\s*'non-unit'",
        r"===\s*'forward'",
        r"===\s*'backward'",
        r"===\s*'columnwise'",
        r"===\s*'rowwise'",
        r"===\s*'all'",
        r"===\s*'general'",
        r"===\s*'none'",
        r"===\s*'compute'",
        r"===\s*'initialize'",
        r"===\s*'update'",
        r"===\s*'max'",
        r"===\s*'one-norm'",
        r"===\s*'inf-norm'",
        r"===\s*'frobenius'",
    ]
    for pat in full_word_patterns:
        if re.search(pat, content):
            return True

    # Check for known single-char values that ARE the stdlib convention
    # (vect uses 'q'/'p' — these are correct, not old-style)
    stdlib_single_char_patterns = [
        r"vect\s*===\s*'[qp]'",
    ]
    for pat in stdlib_single_char_patterns:
        if re.search(pat, content):
            return True

    # Check for old single-char comparisons (bad)
    # Look for patterns like uplo === 'U' || uplo === 'u'
    param_names = r'uplo|trans|side|diag|direct|storev|job|vect|compq|compz|norm|jobu|jobvt|jobvl|jobvr|howmny|type|sort|pivot|transa|transb|transt|jobz'
    old_pattern = r'\b(?:' + param_names + r')\s*===\s*\'[A-Za-z]\''
    if re.search(old_pattern, content):
        return False

    # No string params found
    return None


def audit_module(pkg, routine):
    """Audit a single module. Returns dict of check_name -> bool/None."""
    base_dir = os.path.join(ROOT, 'lib', pkg, routine)
    lib_dir = os.path.join(base_dir, 'lib')

    results = {}

    # 1. base.js exists
    base_js = os.path.join(lib_dir, 'base.js')
    results['base'] = os.path.isfile(base_js)

    # 2. test/test.js exists
    test_js = os.path.join(base_dir, 'test', 'test.js')
    results['test'] = os.path.isfile(test_js)

    # 3. String params — single chars vs full-word
    str_result = has_string_params(base_js)
    results['strings'] = str_result  # None means N/A

    # 4. index.js attaches .strided with setReadOnly (main.js was folded into
    # index.js; ticket 0124)
    index_js = os.path.join(lib_dir, 'index.js')
    if os.path.isfile(index_js):
        results['main'] = file_contains(index_js, [r'setReadOnly'])
    else:
        results['main'] = None  # no index.js

    # 5. strided.js has validation
    strided_js = os.path.join(lib_dir, 'strided.js')
    if os.path.isfile(strided_js):
        has_throws = file_contains(strided_js, [
            r'throw\s+new\s+TypeError',
            r'throw\s+new\s+RangeError',
        ])
        if has_throws:
            results['strided'] = True
        else:
            # Check if validation is actually needed (has string params or dimensions)
            needs_validation = False
            try:
                with open(base_js, 'r', errors='replace') as f:
                    bc = f.read()
                # Has string params?
                if re.search(r'@param\s*\{string\}', bc):
                    needs_validation = True
                # Has dimension params M, N, K?
                param_names = r'uplo|trans|side|diag|direct|storev|norm|job|vect|comp'
                if re.search(r'@param\s*\{[^}]*Integer[^}]*\}\s+[MNK]\b', bc):
                    needs_validation = True
            except FileNotFoundError:
                pass
            results['strided'] = None if not needs_validation else False
    else:
        results['strided'] = None  # no strided.js

    # 6. routine.js implemented (no "not implemented" strings)
    routine_js = os.path.join(lib_dir, routine + '.js')
    if os.path.isfile(routine_js):
        has_not_impl = file_contains(routine_js, [
            r'not\s+yet\s+implemented',
            r'not\s+implemented',
        ])
        results['routine'] = not has_not_impl
    else:
        results['routine'] = None  # no routine.js

    # 7. LEARNINGS.md exists, not a template, and has substantive content
    learnings = os.path.join(base_dir, 'LEARNINGS.md')
    if os.path.isfile(learnings):
        has_todo = file_contains(learnings, [r'TODO:\s*Fill\s+in'])
        if has_todo:
            results['learnings'] = False
        else:
            # Check for substantive content (>= 3 non-header, non-trivial lines)
            with open(learnings, 'r', errors='replace') as f:
                lines = [l.strip() for l in f if l.strip() and not l.strip().startswith('#') and not l.strip().startswith('---')]
            real = [l for l in lines if len(l) > 5 and l not in ('- N/A', 'N/A')]
            results['learnings'] = len(real) >= 3
    else:
        results['learnings'] = False

    # 8. License header
    results['license'] = file_starts_with_license(base_js)

    # 9. eslint — file-level disable (not inline eslint-disable-line)
    js_files = [base_js, strided_js, routine_js]
    has_inline = False
    has_any_eslint = False
    for jf in js_files:
        if os.path.isfile(jf):
            try:
                with open(jf, 'r', errors='replace') as f:
                    jcontent = f.read()
                if 'eslint-disable' in jcontent:
                    has_any_eslint = True
                if 'eslint-disable-line' in jcontent:
                    has_inline = True
            except FileNotFoundError:
                pass
    if has_any_eslint:
        results['eslint'] = not has_inline
    else:
        results['eslint'] = None  # No eslint directives needed

    # 10. index.js has @example blocks (not TODO placeholder)
    index_js = os.path.join(lib_dir, 'index.js')
    if os.path.isfile(index_js):
        try:
            with open(index_js, 'r', errors='replace') as f:
                idx_content = f.read()
            if 'TODO: Add example' in idx_content:
                results['example'] = False
            elif '@example' in idx_content:
                results['example'] = True
            else:
                results['example'] = False
        except FileNotFoundError:
            results['example'] = None
    else:
        results['example'] = None

    return results


def discover_modules():
    """Find all modules under lib/blas/* and lib/lapack/*."""
    modules = []
    for pkg in ['blas', 'lapack']:
        base_path = os.path.join(ROOT, 'lib', pkg)
        if not os.path.isdir(base_path):
            continue
        for entry in sorted(os.listdir(base_path)):
            entry_path = os.path.join(base_path, entry)
            if os.path.isdir(entry_path) and not entry.startswith('.'):
                modules.append((pkg, entry))
    return modules


def format_cell(value):
    """Format a check result as a table cell."""
    if value is None:
        return '-'
    return CHECK if value else CROSS


def is_failing(results):
    """Check if a module has any failing checks (excluding N/A)."""
    for key, val in results.items():
        if val is False:
            return True
    return False


def main():
    parser = argparse.ArgumentParser(description='Audit stdlib-js conformance')
    parser.add_argument('--summary', action='store_true',
                        help='Show only aggregate stats')
    parser.add_argument('--failing', action='store_true',
                        help='Show only modules with issues')
    args = parser.parse_args()

    modules = discover_modules()
    if not modules:
        print('No modules found.', file=sys.stderr)
        sys.exit(1)

    all_results = []
    for pkg, routine in modules:
        results = audit_module(pkg, routine)
        all_results.append((pkg, routine, results))

    col_keys = [c[0] for c in COLUMNS]
    col_headers = ['base', 'test', 'strings', 'main', 'strided', 'routine',
                   'learnings', 'license', 'eslint', 'example']

    # Compute column widths
    module_names = [f'{pkg}/{routine}' for pkg, routine, _ in all_results]
    name_width = max(len(n) for n in module_names) if module_names else 20
    col_width = 9  # enough for 'learnings'

    if not args.summary:
        # Print header
        header = f'{"Module":<{name_width}}  ' + '  '.join(
            f'{h:^{col_width}}' for h in col_headers
        )
        print(header)
        print('-' * len(header))

        # Print rows
        for (pkg, routine, results), name in zip(all_results, module_names):
            if args.failing and not is_failing(results):
                continue
            cells = '  '.join(
                f'{format_cell(results[k]):^{col_width}}'
                for k in col_keys
            )
            print(f'{name:<{name_width}}  {cells}')

        print()

    # Aggregate stats
    totals = {k: {'pass': 0, 'fail': 0, 'na': 0} for k in col_keys}
    for pkg, routine, results in all_results:
        for k in col_keys:
            v = results[k]
            if v is None:
                totals[k]['na'] += 1
            elif v:
                totals[k]['pass'] += 1
            else:
                totals[k]['fail'] += 1

    total_modules = len(all_results)
    print(f'Total: {total_modules} modules')

    labels = {
        'base': 'base.js',
        'test': 'test.js',
        'strings': 'strings',
        'main': 'main.js',
        'strided': 'strided',
        'routine': 'routine.js',
        'learnings': 'learnings',
        'license': 'license',
        'eslint': 'eslint',
        'example': 'example',
    }

    for k in col_keys:
        p = totals[k]['pass']
        f = totals[k]['fail']
        na = totals[k]['na']
        applicable = p + f
        label = labels[k]
        if na > 0:
            detail = f'  ({na} N/A'
            if f > 0:
                detail += f', {f} failing'
            detail += ')'
        elif f > 0:
            detail = f'  ({f} failing)'
        else:
            detail = ''
        print(f'  {label + ":":<14} {p:>3}/{applicable:<3}{detail}')


if __name__ == '__main__':
    main()
