#!/usr/bin/env python

"""
Initialize everything needed to translate a routine. Single command that:

1. Generates the stdlib-js module scaffold (scaffold.py)
2. Auto-generates the Fortran deps file from deps.py
3. Generates the JS test scaffold from existing fixture (if any)
4. Prints a summary of what's ready and what the agent needs to do

Usage:
  python bin/init_routine.py blas daxpy -d "Multiply a vector by a constant and add to another vector."
  python bin/init_routine.py lapack dpotf2 -d "Cholesky factorization (unblocked)."
"""

import os
import sys
import json
import subprocess
import argparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BIN = os.path.join(ROOT, 'bin')


def find_source(routine, package):
    """Find the Fortran source file."""
    candidates = []
    if package == 'blas':
        candidates = [
            os.path.join(ROOT, 'data', 'BLAS-3.12.0', f'{routine}.f'),
            os.path.join(ROOT, 'data', 'BLAS-3.12.0', f'{routine}.f90'),
        ]
    elif package == 'arpack':
        candidates = [
            os.path.join(ROOT, 'data', 'arpack-ng-3.9.1', 'SRC', f'{routine}.f'),
            os.path.join(ROOT, 'data', 'arpack-ng-3.9.1', 'EXAMPLES', 'BAND', f'{routine}.f'),
        ]
    else:
        candidates = [
            os.path.join(ROOT, 'data', 'lapack-3.12.0', 'SRC', f'{routine}.f'),
            os.path.join(ROOT, 'data', 'lapack-3.12.0', 'SRC', f'{routine}.f90'),
            os.path.join(ROOT, 'data', 'lapack-3.12.0', 'INSTALL', f'{routine}.f'),
        ]
    for p in candidates:
        if os.path.exists(p):
            return p
    return None


def generate_deps_file(routine, package):
    """Auto-generate the Fortran deps file from deps.py."""
    if package == 'blas':
        return  # BLAS routines link everything automatically

    deps_file = os.path.join(ROOT, 'test', 'fortran', f'deps_{routine}.txt')
    if os.path.exists(deps_file):
        print(f'  deps file exists: {deps_file}', file=sys.stderr)
        return

    # Get all LAPACK deps (not BLAS, those are linked automatically)
    try:
        result = subprocess.run(
            [sys.executable, os.path.join(BIN, 'deps.py'), routine, '--json'],
            capture_output=True, text=True
        )
        data = json.loads(result.stdout)
        lapack_deps = set()
        for node in data.get('nodes', []):
            if node.get('package') == 'lapack':
                name = node['id']
                # Check the source exists
                src = node.get('source', '')
                if src:
                    lapack_deps.add(name)

        # Also add dlamch if any dep uses it (common transitive dep)
        if 'dlamch' not in lapack_deps:
            # Check if any dep transitively needs dlamch
            for edge in data.get('edges', []):
                if edge['to'] == 'dlamch':
                    lapack_deps.add('dlamch')
                    break

        # Add common Fortran-only infrastructure deps that deps.py
        # misses. These are needed for Fortran test compilation but
        # not for JS (ILAENV is replaced with hardcoded constants).
        INFRA_DEPS = {'ilaenv', 'ieeeck', 'iparmq'}
        # Check if any dep transitively calls ILAENV
        all_dep_names = {n['id'] for n in data.get('nodes', [])}
        # Most LAPACK routines with >2 deps use ILAENV somewhere
        if len(lapack_deps) > 2:
            lapack_deps |= INFRA_DEPS

        with open(deps_file, 'w') as f:
            for dep in sorted(lapack_deps):
                f.write(dep + '\n')

        print(f'  Generated deps file: {deps_file} ({len(lapack_deps)} deps)', file=sys.stderr)
    except Exception as e:
        print(f'  Warning: could not generate deps file: {e}', file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(description='Initialize a routine for translation')
    parser.add_argument('package', choices=['blas', 'lapack', 'arpack'])
    parser.add_argument('routine')
    parser.add_argument('-d', '--description', default=None)
    args = parser.parse_args()

    routine = args.routine
    package = args.package
    description = args.description or f'TODO: Add description for {routine.upper()}.'

    source = find_source(routine, package)
    if not source:
        print(f'Error: source not found for {routine}', file=sys.stderr)
        sys.exit(1)

    module_dir = os.path.join(ROOT, 'lib', package, 'base', routine)
    base_js = os.path.join(module_dir, 'lib', 'base.js')

    print(f'\n=== Initializing {routine} ({package}) ===\n', file=sys.stderr)

    # Step 1: Scaffold
    print('1. Scaffold:', file=sys.stderr)
    subprocess.run([
        sys.executable, os.path.join(BIN, 'scaffold.py'),
        package, routine, '-d', description
    ], stderr=sys.stderr)

    # Step 2: Deps file (LAPACK only)
    print('\n2. Deps file:', file=sys.stderr)
    generate_deps_file(routine, package)

    # Step 3: Generate JS test scaffold if fixture exists
    fixture = os.path.join(ROOT, 'test', 'fixtures', f'{routine}.jsonl')
    test_js = os.path.join(module_dir, 'test', 'test.js')
    test_ndarray_js = os.path.join(module_dir, 'test', 'test.ndarray.js')
    if os.path.exists(fixture):
        print(f'\n3. JS test scaffold (from existing fixture):', file=sys.stderr)
        result = subprocess.run(
            [sys.executable, os.path.join(BIN, 'gen_test.py'), package, routine],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            # gen_test.py emits ndarray-targeted tests (require '../lib/ndarray.js').
            # Write to test.ndarray.js — overwriting scaffold.py's stub there is
            # intended. Do NOT clobber test.js (export-checks file the conformance check expects).
            with open(test_ndarray_js, 'w') as f:
                f.write(result.stdout)
            print(f'  Written: {test_ndarray_js}', file=sys.stderr)
    else:
        print(f'\n3. No fixture yet — write Fortran test first.', file=sys.stderr)

    # Step 4: Print summary
    print(f'\n=== Summary ===\n', file=sys.stderr)
    print(f'Source:    {source}', file=sys.stderr)
    print(f'Module:    {module_dir}/', file=sys.stderr)

    # Show stripped source stats
    try:
        result = subprocess.run(
            [sys.executable, os.path.join(BIN, 'fortran_body.py'), source],
            capture_output=True, text=True
        )
        body_lines = len(result.stdout.strip().split('\n'))
        full_lines = sum(1 for _ in open(source))
        print(f'Source:    {full_lines} lines total, {body_lines} lines code body', file=sys.stderr)
    except:
        pass

    # Show signature
    try:
        result = subprocess.run(
            [sys.executable, os.path.join(BIN, 'signature.py'), source, '--compact'],
            capture_output=True, text=True
        )
        print(f'Signature: {result.stdout.strip()}', file=sys.stderr)
    except:
        pass

    # Show what agent needs to do
    print(f'\n=== Agent TODO ===', file=sys.stderr)
    print(f'  1. Read stripped source: python bin/fortran_body.py {source}', file=sys.stderr)
    if not os.path.exists(fixture):
        print(f'  2. Write Fortran test: test/fortran/test_{routine}.f90', file=sys.stderr)
        print(f'  3. Generate fixture: ./test/run_fortran.sh {package} {routine}', file=sys.stderr)
        print(f'  4. Regenerate JS test: python bin/gen_test.py {package} {routine} > {test_ndarray_js}', file=sys.stderr)
    print(f'  5. Implement: {base_js}', file=sys.stderr)
    print(f'  6. Fill in test inputs: {test_ndarray_js}', file=sys.stderr)
    print(f'  7. Verify: node --test {test_js} {test_ndarray_js}', file=sys.stderr)
    print(f'  8. Coverage: node --test --experimental-test-coverage {test_js} {test_ndarray_js}', file=sys.stderr)
    print(f'  9. Lint: bin/lint.sh {base_js}', file=sys.stderr)
    print(f' 10. Write LEARNINGS.md (MANDATORY)', file=sys.stderr)
    print(f' 11. MANDATORY FINAL GATE: npm run check (must pass with 0 errors, 0 warnings)', file=sys.stderr)


if __name__ == '__main__':
    main()
