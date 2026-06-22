/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import zlaein from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'zlaein.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
var FIXTURES = rawLines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, format( '%s: expected %s, got %s', msg, expected, actual ) );
}

function findCase( name ) {
	var i;
	for ( i = 0; i < FIXTURES.length; i++ ) {
		if ( FIXTURES[ i ].name === name ) {
			return FIXTURES[ i ];
		}
	}
	throw new Error( format( 'fixture not found: %s', name ) );
}

function viewBuf( cmplxArr ) {
	return new Float64Array( cmplxArr.buffer, cmplxArr.byteOffset, cmplxArr.length * 2 );
}

function buildH( N, entries ) {
	var arr = new Complex128Array( N * N );
	var buf = viewBuf( arr );
	var i;
	var t;
	var idx;
	for ( i = 0; i < entries.length; i++ ) {
		t = entries[ i ];
		idx = ( ( ( t[ 1 ] - 1 ) * N ) + ( t[ 0 ] - 1 ) ) * 2;
		buf[ idx ] = t[ 2 ];
		buf[ idx + 1 ] = t[ 3 ];
	}
	return arr;
}

function buildV( N, entries ) {
	var arr = new Complex128Array( N );
	var buf = viewBuf( arr );
	var i;
	var t;
	for ( i = 0; i < entries.length; i++ ) {
		t = entries[ i ];
		buf[ ( t[ 0 ] - 1 ) * 2 ] = t[ 1 ];
		buf[ ( ( t[ 0 ] - 1 ) * 2 ) + 1 ] = t[ 2 ];
	}
	return arr;
}

var EPS3 = 1.0e-4;
var SMLNUM = 2.2250738585072014e-308 / 2.220446049250313e-16;

function runCase( name, rightv, noinit, N, H, w, vInit ) {
	var v = vInit || new Complex128Array( N );
	var B = new Complex128Array( N * N );
	var RWORK = new Float64Array( N );
	var info;
	var tc;
	var buf;
	var i;

	info = zlaein( rightv, noinit, N, H, 1, N, 0, w, v, 1, 0, B, 1, N, 0, RWORK, 1, 0, EPS3, SMLNUM );

	tc = findCase( name );
	assert.equal( info, tc.info, name + ':info' );

	if ( tc.v ) {
		buf = viewBuf( v );
		for ( i = 0; i < tc.v.length; i++ ) {
			assertClose( buf[ i ], tc.v[ i ], 1e-9, name + '.v[' + i + ']' );
		}
	}
}

function mkH3() {
	return buildH( 3, [
		[ 1, 1, 2.0, 1.0 ], [ 1, 2, 1.0, 0.5 ], [ 1, 3, 0.5, 0.0 ],
		[ 2, 1, 0.1, 0.0 ], [ 2, 2, 3.0, 0.0 ], [ 2, 3, 1.0, -1.0 ],
		[ 3, 2, 0.05, 0.0 ], [ 3, 3, 4.0, -1.0 ]
	]);
}

function mkH4() {
	return buildH( 4, [
		[ 1, 1, 1.0, 0.5 ], [ 1, 2, 0.5, 0.0 ], [ 1, 3, 0.2, 0.1 ], [ 1, 4, 0.1, 0.0 ],
		[ 2, 1, 0.3, 0.0 ], [ 2, 2, 2.0, -0.5 ], [ 2, 3, 0.8, 0.2 ], [ 2, 4, 0.3, 0.1 ],
		[ 3, 2, 0.2, 0.0 ], [ 3, 3, 3.0, 1.0 ], [ 3, 4, 0.7, -0.3 ],
		[ 4, 3, 0.15, 0.0 ], [ 4, 4, 4.0, 0.5 ]
	]);
}

function mkH3Diag() {
	return buildH( 3, [
		[ 1, 1, 1.0, 0.0 ], [ 2, 2, 2.0, 0.0 ], [ 3, 3, 3.0, 0.0 ],
		[ 2, 1, 0.001, 0.0 ], [ 3, 2, 0.001, 0.0 ],
		[ 1, 2, 0.01, 0.0 ], [ 1, 3, 0.01, 0.0 ], [ 2, 3, 0.01, 0.0 ]
	]);
}


// TESTS //

test( 'zlaein: main export is a function', function t() {
	assert.strictEqual( typeof zlaein, 'function', 'is a function' );
});

test( 'zlaein: right_noinit_3x3', function t() {
	runCase( 'right_noinit_3x3', true, true, 3, mkH3(), new Complex128( 3.9, -0.95 ), null );
});

test( 'zlaein: left_noinit_3x3', function t() {
	runCase( 'left_noinit_3x3', false, true, 3, mkH3(), new Complex128( 3.9, -0.95 ), null );
});

test( 'zlaein: right_init_3x3 (with initial vector)', function t() {
	var v = buildV( 3, [ [ 1, 0.1, 0.0 ], [ 2, 0.2, 0.1 ], [ 3, 0.9, -0.2 ] ] );
	runCase( 'right_init_3x3', true, false, 3, mkH3(), new Complex128( 3.9, -0.95 ), v );
});

test( 'zlaein: right_noinit_4x4', function t() {
	runCase( 'right_noinit_4x4', true, true, 4, mkH4(), new Complex128( 3.95, 0.45 ), null );
});

test( 'zlaein: left_noinit_4x4', function t() {
	runCase( 'left_noinit_4x4', false, true, 4, mkH4(), new Complex128( 3.95, 0.45 ), null );
});

test( 'zlaein: right_noinit_2x2', function t() {
	var H = buildH( 2, [
		[ 1, 1, 1.0, 0.5 ], [ 1, 2, 0.7, -0.2 ],
		[ 2, 1, 0.3, 0.0 ], [ 2, 2, 2.5, 0.3 ]
	]);
	runCase( 'right_noinit_2x2', true, true, 2, H, new Complex128( 2.45, 0.28 ), null );
});

test( 'zlaein: right_near_eig_diag (converges)', function t() {
	runCase( 'right_near_eig_diag', true, true, 3, mkH3Diag(), new Complex128( 2.0001, 0.0 ), null );
});

test( 'zlaein: left_near_eig_diag (converges)', function t() {
	runCase( 'left_near_eig_diag', false, true, 3, mkH3Diag(), new Complex128( 2.0001, 0.0 ), null );
});
