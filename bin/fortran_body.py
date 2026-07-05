#!/usr/bin/env python

"""
Extract just the executable body of a Fortran routine, stripping doc comments.

Usage:
  python bin/fortran_body.py data/BLAS-3.12.0/daxpy.f
  python bin/fortran_body.py data/lapack-3.12.0/SRC/dpotf2.f

Outputs only the subroutine/function body: declarations + executable statements.
Strips the documentation header (everything before the actual SUBROUTINE/FUNCTION
statement) and comment-only lines within the body.
"""

import sys
import re


def extract_body(path):
    with open(path) as f:
        lines = f.readlines()

    # Find the actual SUBROUTINE/FUNCTION statement (not in comments)
    start = 0
    for i, line in enumerate(lines):
        stripped = line.lstrip()
        if stripped and stripped[0] in ('*', 'C', 'c', '!'):
            continue
        if re.match(r'\s*(SUBROUTINE|FUNCTION|DOUBLE\s+PRECISION\s+FUNCTION|INTEGER\s+FUNCTION|COMPLEX\*16\s+FUNCTION|LOGICAL\s+FUNCTION|REAL\s+FUNCTION)',
                     line, re.IGNORECASE):
            start = i
            break

    # Find END
    end = len(lines)
    for i in range(len(lines) - 1, start, -1):
        stripped = lines[i].strip()
        if re.match(r'^END\b', stripped, re.IGNORECASE):
            end = i + 1
            break

    # Filter: keep declarations and executable statements, skip comment-only lines
    result = []
    for line in lines[start:end]:
        stripped = line.lstrip()
        # Keep blank lines between code blocks
        if not stripped:
            if result and result[-1].strip():
                result.append('\n')
            continue
        # Skip fixed-form comment lines. A fixed-form comment marker (C/c/*)
        # must be in COLUMN 1 (the literal first character of the line); an
        # indented statement such as `c = -c` (a cosine variable) is CODE, not
        # a comment. Testing `stripped[0]` (post-lstrip) instead of `line[0]`
        # silently dropped such lines.
        if line[0] in ('*', 'C', 'c'):
            continue
        if stripped.startswith('!') and not stripped.startswith('!$'):
            # Keep short algorithmic comments (< 60 chars), skip doc boilerplate
            comment_text = stripped[1:].strip()
            if len(comment_text) < 60 and not any(kw in comment_text.lower() for kw in
                    ['====', '----', 'author', 'license', 'reference', 'lapack is',
                     'univ.', 'parameter', 'verbatim', 'endverbatim', 'htmlonly']):
                result.append(line)
            continue
        result.append(line)

    return ''.join(result)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python bin/fortran_body.py <file.f>', file=sys.stderr)
        sys.exit(1)
    print(extract_body(sys.argv[1]))
