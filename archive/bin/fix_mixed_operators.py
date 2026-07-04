#!/usr/bin/env python3
"""
Fix no-mixed-operators lint errors by adding parentheses around * and /
subexpressions when mixed with + and -.

This is conservative: it only parenthesizes the `a * b` part in patterns
like `x + a * b` or `x - a * b`, and `a / b` in `x + a / b`.

It does NOT rearrange expressions or change operator precedence.

Usage:
    python3 bin/fix_mixed_operators.py [--dry-run] [files...]
    python3 bin/fix_mixed_operators.py --all           # Fix all base.js
    python3 bin/fix_mixed_operators.py --all --dry-run  # Preview
"""

import re
import sys
import glob
import os

# We need to add parens around multiplication/division terms when they appear
# in addition/subtraction contexts. The safest approach is to parse each line
# and add parens around `TERM * TERM` and `TERM / TERM` subexpressions.
#
# Strategy: Use a simple tokenizer to find `+` or `-` adjacent to `*` or `/`
# and wrap the higher-precedence operation in parens.


def tokenize(expr):
    """Simple tokenizer for JS expressions."""
    tokens = []
    i = 0
    while i < len(expr):
        c = expr[i]
        if c in '+-':
            # Check for += -= *= /=
            if i + 1 < len(expr) and expr[i+1] == '=':
                tokens.append(expr[i:i+2])
                i += 2
                continue
            tokens.append(c)
            i += 1
        elif c in '*/':
            if i + 1 < len(expr) and expr[i+1] == '=':
                tokens.append(expr[i:i+2])
                i += 2
                continue
            tokens.append(c)
            i += 1
        elif c == '(':
            tokens.append(c)
            i += 1
        elif c == ')':
            tokens.append(c)
            i += 1
        elif c == '[':
            # Find matching ]
            depth = 1
            j = i + 1
            while j < len(expr) and depth > 0:
                if expr[j] == '[':
                    depth += 1
                elif expr[j] == ']':
                    depth -= 1
                j += 1
            tokens.append(expr[i:j])
            i = j
        elif c in ' \t':
            tokens.append(c)
            i += 1
        elif c == ';':
            tokens.append(c)
            i += 1
        else:
            # Identifier, number, or other
            j = i
            while j < len(expr) and expr[j] not in '+-*/()[] \t;':
                j += 1
            tokens.append(expr[i:j])
            i = j
    return tokens


def fix_line(line):
    """Fix no-mixed-operators in a single line of code."""
    # Skip comments, strings, requires
    stripped = line.lstrip()
    if stripped.startswith('//') or stripped.startswith('*') or stripped.startswith("'") or 'require' in line:
        return line

    # Skip lines without both +/- and */
    has_additive = '+' in line or ('-' in line and '--' not in line)
    has_multiplicative = '*' in line or ('/' in line and '//' not in line and '/*' not in line)
    if not (has_additive and has_multiplicative):
        return line

    # Simple approach: find patterns like `TERM * TERM` or `TERM / TERM`
    # that are adjacent to + or - and wrap them in parens.
    #
    # Pattern: non-paren expression followed by * or / followed by non-paren expression
    # within a larger + or - context.
    #
    # We use a regex-based approach that handles the common cases in BLAS/LAPACK:
    #   offset + i * stride  →  offset + (i * stride)
    #   a + b * c - d * e    →  a + (b * c) - (d * e)

    # Match: WORD_OR_BRACKET * WORD_OR_BRACKET (not already in parens)
    # The key insight: we want to wrap `X * Y` in parens when:
    # - It appears after +, -, or at the start of an expression after =
    # - It appears before +, -, or at the end

    # Strategy: repeatedly find `+ TERM * TERM` and replace with `+ (TERM * TERM)`
    # where TERM is: identifier, number, or array access (possibly with dots)

    TERM = r'(?:[\w.]+(?:\[[^\]]*\])*)'  # identifier or array access

    result = line

    # Pattern 1: TERM * TERM that's preceded by + or -
    # e.g., offset + i * stride → offset + (i * stride)
    for op in [r'\*', r'/']:
        pattern = re.compile(
            r'(\+|-)\s*(' + TERM + r')\s*' + op + r'\s*(' + TERM + r')'
        )

        def replacer(m):
            sign = m.group(1)
            left = m.group(2)
            right = m.group(3)
            op_char = '*' if op == r'\*' else '/'
            return f'{sign} ({left} {op_char} {right})'

        # Apply repeatedly until no more matches (handles chained expressions)
        for _ in range(10):
            new_result = pattern.sub(replacer, result)
            if new_result == result:
                break
            result = new_result

    # Pattern 2: TERM * TERM that's followed by + or -
    # e.g., i * stride + offset → (i * stride) + offset
    # But only if not already parenthesized
    for op in [r'\*', r'/']:
        pattern = re.compile(
            r'(' + TERM + r')\s*' + op + r'\s*(' + TERM + r')\s*(\+|-)'
        )

        def replacer2(m):
            left = m.group(1)
            right = m.group(2)
            sign = m.group(3)
            op_char = '*' if op == r'\*' else '/'
            # Check if already wrapped in parens
            return f'({left} {op_char} {right}) {sign}'

        for _ in range(10):
            new_result = pattern.sub(replacer2, result)
            if new_result == result:
                break
            result = new_result

    return result


def fix_file(filepath, dry_run=False):
    """Fix a single file."""
    with open(filepath) as f:
        lines = f.readlines()

    new_lines = []
    changed = False
    for line in lines:
        new_line = fix_line(line)
        if new_line != line:
            changed = True
        new_lines.append(new_line)

    if changed and not dry_run:
        with open(filepath, 'w') as f:
            f.writelines(new_lines)

    return changed


def main():
    dry_run = '--dry-run' in sys.argv
    do_all = '--all' in sys.argv

    if do_all:
        files = sorted(glob.glob('lib/**/lib/base.js', recursive=True))
    else:
        files = [a for a in sys.argv[1:] if not a.startswith('-')]

    if not files:
        print("Usage: python3 bin/fix_mixed_operators.py [--dry-run] [files...]")
        print("       python3 bin/fix_mixed_operators.py --all [--dry-run]")
        sys.exit(1)

    count = 0
    for f in files:
        if fix_file(f, dry_run):
            count += 1
            if dry_run:
                print(f"[DRY RUN] Would fix: {f}")
            else:
                print(f"Fixed: {f}")

    print(f"\n{'Would fix' if dry_run else 'Fixed'}: {count} files")


if __name__ == '__main__':
    main()
