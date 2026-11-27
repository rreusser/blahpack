#!/usr/bin/env python

"""
Generate JS test scaffold from existing Fortran fixture.

Usage:
  python bin/gen_test.py blas daxpy
  python bin/gen_test.py lapack dpotf2

Reads test/fixtures/<routine>.jsonl and the module's signature to generate
a test file with fixture loading, assertClose helper, and a test stub per
fixture case. Outputs to stdout (pipe to the test file).
"""

import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from signature import generate_signature

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

LICENSE = ""


def main():
    if len(sys.argv) < 3:
        print('Usage: python bin/gen_test.py <package> <routine>', file=sys.stderr)
        sys.exit(1)

    package = sys.argv[1]
    routine = sys.argv[2]

    # Load fixture
    fixture_path = os.path.join(ROOT, 'test', 'fixtures', f'{routine}.jsonl')
    if not os.path.exists(fixture_path):
        print(f'No fixture at {fixture_path}', file=sys.stderr)
        sys.exit(1)

    with open(fixture_path) as f:
        cases = [json.loads(line) for line in f if line.strip()]

    # Get case names and their output keys
    case_names = [c['name'] for c in cases]
    # Output keys are everything except 'name'
    output_keys = set()
    for c in cases:
        for k in c:
            if k != 'name':
                output_keys.add(k)

    print(LICENSE)
    print()
    print("/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */")
    print()
    print("'use strict';")
    print()
    print("// MODULES //")
    print()
    print("var test = require( 'node:test' );")
    print("var assert = require( 'node:assert/strict' );")
    print("var readFileSync = require( 'fs' ).readFileSync;")
    print("var path = require( 'path' );")
    # Tests must target the public ndarray interface, not lib/base.js. Going
    # through ndarray.js exercises the string-validator layer; bypassing it
    # to base.js has hidden silent-correctness bugs (validator disagreeing
    # with base dispatch keys). If you need a base-only test, put it in a
    # dedicated test.base.js.
    print(f"var {routine} = require( './../lib/ndarray.js' );")
    print()
    print()
    print("// FIXTURES //")
    print()
    print("var fixtureDir = path.join( __dirname, '..', '..', '..', '..', 'test', 'fixtures' );")
    print(f"var lines = readFileSync( path.join( fixtureDir, '{routine}.jsonl' ), 'utf8' ).trim().split( '\\n' );")
    print("var fixture = lines.map( function parse( line ) { return JSON.parse( line ); } );")
    print()
    print()
    print("// FUNCTIONS //")
    print()
    print("function findCase( name ) {")
    print("\treturn fixture.find( function find( t ) { return t.name === name; } );")
    print("}")
    print()
    print("function assertClose( actual, expected, tol, msg ) {")
    print("\tvar relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );")
    print("\tassert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );")
    print("}")
    print()
    print("function assertArrayClose( actual, expected, tol, msg ) {")
    print("\tvar i;")
    print("\tassert.equal( actual.length, expected.length, msg + ': length mismatch' );")
    print("\tfor ( i = 0; i < expected.length; i++ ) {")
    print("\t\tassertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );")
    print("\t}")
    print("}")
    print()
    print()
    print("// TESTS //")
    print()

    for case in cases:
        name = case['name']
        print(f"test( '{routine}: {name}', function t() {{")
        print(f"\tvar tc = findCase( '{name}' );")
        print(f"\t// TODO: set up inputs and call {routine}(...)")
        for key in sorted(case.keys()):
            if key == 'name':
                continue
            val = case[key]
            if isinstance(val, list):
                print(f"\t// assertArrayClose( result, tc.{key}, 1e-14, '{key}' );")
            elif isinstance(val, (int, float)):
                print(f"\t// assertClose( result, tc.{key}, 1e-14, '{key}' );")
        print(f"\tassert.fail( 'TODO: implement test for {name}' );")
        print("});")
        print()


if __name__ == '__main__':
    main()
