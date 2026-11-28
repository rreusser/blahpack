/* eslint-disable no-restricted-syntax, max-len, max-params, max-lines, max-statements, max-lines-per-function */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import dgges from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'dgges.jsonl' ), 'utf8' ).trim().split( '\n' );
const fixture = lines.map( function parse( line ) { return JSON.parse( line ); } );


// FUNCTIONS //

function findCase( name ) {
	return fixture.find( function find( t ) { return t.name === name; } );
}

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function noop() { return false; }

// A diagonal pencil (diag(2s,3s), I) is its own generalized Schur form, so S
// must come back as diag(2s,3s) up to sign and order, at the input's scale.
function assertSchurScale( S, s ) {
	const d = [ Math.abs( S[ 0 ] ) / s, Math.abs( S[ 3 ] ) / s ].sort();
	assertClose( d[ 0 ], 2, 1e-14, 'S(1,1)/s' );
	assertClose( d[ 1 ], 3, 1e-14, 'S(2,2)/s' );
	assert.equal( S[ 1 ], 0, 'S(2,1)' );
}

function selectAll() { return true; }

function selectPositiveReal( alphar, alphai, beta ) { // eslint-disable-line no-unused-vars
	if ( beta === 0.0 ) { return false; }
	return ( alphar / beta ) > 0.0;
}

function selectLargeBeta( alphar, alphai, beta ) { // eslint-disable-line no-unused-vars
	return Math.abs( beta ) > 0.5;
}

function runFixture( tc, jobvslStr, jobvsrStr, sortStr, sel ) {
	const sdim = new Int32Array( 1 );
	const tol = 1e-9;

	const n = tc.n;
	const A = new Float64Array( tc.Ain );
	const B = new Float64Array( tc.Bin );
	const ALPHAR = new Float64Array( n );
	const ALPHAI = new Float64Array( n );
	const BETA = new Float64Array( n );
	const VSL = new Float64Array( Math.max( 1, n * n ) );
	const VSR = new Float64Array( Math.max( 1, n * n ) );
	const WORK = new Float64Array( Math.max( 8 * n, ( 6 * n ) + 16, 1 ) );
	const BWORK = new Uint8Array( Math.max( 1, n ) );

	const result = dgges( jobvslStr, jobvsrStr, sortStr, sel, n, A, 1, n, 0, B, 1, n, 0, sdim, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VSL, 1, n, 0, VSR, 1, n, 0, WORK, 1, 0, BWORK, 1, 0 );

	assert.equal( result, tc.info, 'info' );
	assertArrayClose( A, tc.S, tol, 'S' );
	assertArrayClose( B, tc.T, tol, 'T' );
	assertArrayClose( ALPHAR, tc.alphar, tol, 'alphar' );
	assertArrayClose( ALPHAI, tc.alphai, tol, 'alphai' );
	assertArrayClose( BETA, tc.beta, tol, 'beta' );
}


// TESTS //

test( 'dgges: main export is a function', function t() {
	assert.strictEqual( typeof dgges, 'function', 'is a function' );
});

test( 'dgges: throws TypeError for invalid jobvsl', function t() {
	assert.throws( function throws() {
		const sdim = new Int32Array( 1 );
		dgges( 'invalid', 'compute-vectors', 'none', noop, 2, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, sdim, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 16 ), 1, 0, new Uint8Array( 2 ), 1, 0 );
	}, TypeError );
});

test( 'dgges: throws TypeError for invalid jobvsr', function t() {
	assert.throws( function throws() {
		const sdim = new Int32Array( 1 );
		dgges( 'compute-vectors', 'invalid', 'none', noop, 2, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, sdim, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 16 ), 1, 0, new Uint8Array( 2 ), 1, 0 );
	}, TypeError );
});

test( 'dgges: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const sdim = new Int32Array( 1 );
		dgges( 'compute-vectors', 'compute-vectors', 'none', noop, -1, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, sdim, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 16 ), 1, 0, new Uint8Array( 2 ), 1, 0 );
	}, RangeError );
});

test( 'dgges: N=0 quick return', function t() {
	const sdim = new Int32Array( 1 );
	const result = dgges( 'compute-vectors', 'compute-vectors', 'none', noop, 0, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 1, 0, sdim, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Uint8Array( 1 ), 1, 0 );
	assert.equal( result, 0, 'info' );
	assert.equal( sdim[ 0 ], 0, 'sdim' );
});

test( 'dgges: 2x2 diagonal jobvsl=N jobvsr=N (fixture)', function t() {
	runFixture( findCase( '2x2_diag_no_vectors' ), 'no-vectors', 'no-vectors', 'none', noop );
});

test( 'dgges: 2x2 both vectors (fixture)', function t() {
	runFixture( findCase( '2x2_both_vectors' ), 'compute-vectors', 'compute-vectors', 'none', noop );
});

test( 'dgges: 3x3 right-only (fixture)', function t() {
	runFixture( findCase( '3x3_right_only' ), 'no-vectors', 'compute-vectors', 'none', noop );
});

test( 'dgges: 3x3 left-only (fixture)', function t() {
	runFixture( findCase( '3x3_left_only' ), 'compute-vectors', 'no-vectors', 'none', noop );
});

test( 'dgges: 4x4 complex eigs (fixture)', function t() {
	runFixture( findCase( '4x4_complex_eigs' ), 'compute-vectors', 'compute-vectors', 'none', noop );
});

test( 'dgges: 1x1 trivial (fixture)', function t() {
	runFixture( findCase( '1x1_trivial' ), 'compute-vectors', 'compute-vectors', 'none', noop );
});

test( 'dgges: 4x4 general (fixture)', function t() {
	runFixture( findCase( '4x4_general' ), 'compute-vectors', 'compute-vectors', 'none', noop );
});

test( 'dgges: sort=sort, selectAll triggers complex pair logic', function t() {
	const sdim = new Int32Array( 1 );
	const n = 2;
	const A = new Float64Array( [ 0, 1, -1, 0 ] ); // pure rotation -> complex eigs
	const B = new Float64Array( [ 1, 0, 0, 1 ] );
	const ALPHAR = new Float64Array( n );
	const ALPHAI = new Float64Array( n );
	const BETA = new Float64Array( n );
	const VSL = new Float64Array( n * n );
	const VSR = new Float64Array( n * n );
	const WORK = new Float64Array( Math.max( 8 * n, ( 6 * n ) + 16 ) );
	const BWORK = new Uint8Array( n );
	const result = dgges( 'compute-vectors', 'compute-vectors', 'sort', selectAll, n, A, 1, n, 0, B, 1, n, 0, sdim, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VSL, 1, n, 0, VSR, 1, n, 0, WORK, 1, 0, BWORK, 1, 0 );
	assert.equal( result, 0, 'info' );
	assert.equal( sdim[ 0 ], 2, 'sdim' );
});

test( 'dgges: sort=sort, none selected', function t() {
	const sdim = new Int32Array( 1 );
	const n = 2;
	const A = new Float64Array( [ 1, 0, 0, 2 ] );
	const B = new Float64Array( [ 1, 0, 0, 1 ] );
	const ALPHAR = new Float64Array( n );
	const ALPHAI = new Float64Array( n );
	const BETA = new Float64Array( n );
	const VSL = new Float64Array( n * n );
	const VSR = new Float64Array( n * n );
	const WORK = new Float64Array( Math.max( 8 * n, ( 6 * n ) + 16 ) );
	const BWORK = new Uint8Array( n );
	const result = dgges( 'compute-vectors', 'compute-vectors', 'sort', noop, n, A, 1, n, 0, B, 1, n, 0, sdim, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VSL, 1, n, 0, VSR, 1, n, 0, WORK, 1, 0, BWORK, 1, 0 );
	assert.equal( result, 0, 'info' );
	assert.equal( sdim[ 0 ], 0, 'sdim' );
});

test( 'dgges: sort=sort, partial selection by positive real eigvals', function t() {
	const sdim = new Int32Array( 1 );
	const n = 3;
	const A = new Float64Array( [ -1, 0, 0, 0, 2, 0, 0, 0, 3 ] );
	const B = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
	const ALPHAR = new Float64Array( n );
	const ALPHAI = new Float64Array( n );
	const BETA = new Float64Array( n );
	const VSL = new Float64Array( n * n );
	const VSR = new Float64Array( n * n );
	const WORK = new Float64Array( Math.max( 8 * n, ( 6 * n ) + 16 ) );
	const BWORK = new Uint8Array( n );
	const result = dgges( 'compute-vectors', 'compute-vectors', 'sort', selectPositiveReal, n, A, 1, n, 0, B, 1, n, 0, sdim, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VSL, 1, n, 0, VSR, 1, n, 0, WORK, 1, 0, BWORK, 1, 0 );
	assert.equal( result, 0, 'info' );

	// Eigenvalues: -1, 2, 3 → 2 selected (positive real)
	assert.equal( sdim[ 0 ], 2, 'sdim' );
});

test( 'dgges: sort=sort, beta selection', function t() {
	const sdim = new Int32Array( 1 );
	const n = 2;
	const A = new Float64Array( [ 1, 0, 0, 2 ] );
	const B = new Float64Array( [ 1, 0, 0, 1 ] );
	const ALPHAR = new Float64Array( n );
	const ALPHAI = new Float64Array( n );
	const BETA = new Float64Array( n );
	const VSL = new Float64Array( n * n );
	const VSR = new Float64Array( n * n );
	const WORK = new Float64Array( Math.max( 8 * n, ( 6 * n ) + 16 ) );
	const BWORK = new Uint8Array( n );
	const result = dgges( 'compute-vectors', 'compute-vectors', 'sort', selectLargeBeta, n, A, 1, n, 0, B, 1, n, 0, sdim, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VSL, 1, n, 0, VSR, 1, n, 0, WORK, 1, 0, BWORK, 1, 0 );
	assert.equal( result, 0, 'info' );
	assert.equal( sdim[ 0 ], 2, 'sdim' );
});

test( 'dgges: jobvsl=V jobvsr=N (left-only)', function t() {
	const sdim = new Int32Array( 1 );
	const n = 2;
	const A = new Float64Array( [ 2, 0, 0, 3 ] );
	const B = new Float64Array( [ 1, 0, 0, 1 ] );
	const ALPHAR = new Float64Array( n );
	const ALPHAI = new Float64Array( n );
	const BETA = new Float64Array( n );
	const VSL = new Float64Array( n * n );
	const VSR = new Float64Array( 1 );
	const WORK = new Float64Array( Math.max( 8 * n, ( 6 * n ) + 16 ) );
	const BWORK = new Uint8Array( n );
	const result = dgges( 'compute-vectors', 'no-vectors', 'none', noop, n, A, 1, n, 0, B, 1, n, 0, sdim, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VSL, 1, n, 0, VSR, 1, 1, 0, WORK, 1, 0, BWORK, 1, 0 );
	assert.equal( result, 0, 'info' );
});

test( 'dgges: jobvsl=N jobvsr=V (right-only)', function t() {
	const sdim = new Int32Array( 1 );
	const n = 2;
	const A = new Float64Array( [ 2, 0, 0, 3 ] );
	const B = new Float64Array( [ 1, 0, 0, 1 ] );
	const ALPHAR = new Float64Array( n );
	const ALPHAI = new Float64Array( n );
	const BETA = new Float64Array( n );
	const VSL = new Float64Array( 1 );
	const VSR = new Float64Array( n * n );
	const WORK = new Float64Array( Math.max( 8 * n, ( 6 * n ) + 16 ) );
	const BWORK = new Uint8Array( n );
	const result = dgges( 'no-vectors', 'compute-vectors', 'none', noop, n, A, 1, n, 0, B, 1, n, 0, sdim, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VSL, 1, 1, 0, VSR, 1, n, 0, WORK, 1, 0, BWORK, 1, 0 );
	assert.equal( result, 0, 'info' );
});

test( 'dgges: tiny-norm matrix triggers A-scaling (ilascl)', function t() {
	const sdim = new Int32Array( 1 );
	const n = 2;
	const s = 1e-200;
	const A = new Float64Array( [ 2 * s, 0, 0, 3 * s ] );
	const B = new Float64Array( [ 1, 0, 0, 1 ] );
	const ALPHAR = new Float64Array( n );
	const ALPHAI = new Float64Array( n );
	const BETA = new Float64Array( n );
	const VSL = new Float64Array( n * n );
	const VSR = new Float64Array( n * n );
	const WORK = new Float64Array( Math.max( 8 * n, ( 6 * n ) + 16 ) );
	const BWORK = new Uint8Array( n );
	const result = dgges( 'compute-vectors', 'compute-vectors', 'none', noop, n, A, 1, n, 0, B, 1, n, 0, sdim, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VSL, 1, n, 0, VSR, 1, n, 0, WORK, 1, 0, BWORK, 1, 0 );
	assert.equal( result, 0, 'info' );

	// The Schur form S is returned at the input's scale (the scaling is undone):
	assertSchurScale( A, s );
});

test( 'dgges: huge-norm matrix triggers A-scaling (down)', function t() {
	const sdim = new Int32Array( 1 );
	const n = 2;
	const s = 1e200;
	const A = new Float64Array( [ 2 * s, 0, 0, 3 * s ] );
	const B = new Float64Array( [ 1, 0, 0, 1 ] );
	const ALPHAR = new Float64Array( n );
	const ALPHAI = new Float64Array( n );
	const BETA = new Float64Array( n );
	const VSL = new Float64Array( n * n );
	const VSR = new Float64Array( n * n );
	const WORK = new Float64Array( Math.max( 8 * n, ( 6 * n ) + 16 ) );
	const BWORK = new Uint8Array( n );
	const result = dgges( 'compute-vectors', 'compute-vectors', 'none', noop, n, A, 1, n, 0, B, 1, n, 0, sdim, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VSL, 1, n, 0, VSR, 1, n, 0, WORK, 1, 0, BWORK, 1, 0 );
	assert.equal( result, 0, 'info' );

	// The Schur form S is returned at the input's scale (the scaling is undone):
	assertSchurScale( A, s );
});

test( 'dgges: tiny-norm B triggers B-scaling (ilbscl)', function t() {
	const sdim = new Int32Array( 1 );
	const n = 2;
	const s = 1e-200;
	const A = new Float64Array( [ 1, 0, 0, 2 ] );
	const B = new Float64Array( [ s, 0, 0, s ] );
	const ALPHAR = new Float64Array( n );
	const ALPHAI = new Float64Array( n );
	const BETA = new Float64Array( n );
	const VSL = new Float64Array( n * n );
	const VSR = new Float64Array( n * n );
	const WORK = new Float64Array( Math.max( 8 * n, ( 6 * n ) + 16 ) );
	const BWORK = new Uint8Array( n );
	const result = dgges( 'compute-vectors', 'compute-vectors', 'none', noop, n, A, 1, n, 0, B, 1, n, 0, sdim, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VSL, 1, n, 0, VSR, 1, n, 0, WORK, 1, 0, BWORK, 1, 0 );
	assert.equal( result, 0, 'info' );
});

test( 'dgges: huge-norm B triggers B-scaling (down)', function t() {
	const sdim = new Int32Array( 1 );
	const n = 2;
	const s = 1e200;
	const A = new Float64Array( [ 1, 0, 0, 2 ] );
	const B = new Float64Array( [ s, 0, 0, s ] );
	const ALPHAR = new Float64Array( n );
	const ALPHAI = new Float64Array( n );
	const BETA = new Float64Array( n );
	const VSL = new Float64Array( n * n );
	const VSR = new Float64Array( n * n );
	const WORK = new Float64Array( Math.max( 8 * n, ( 6 * n ) + 16 ) );
	const BWORK = new Uint8Array( n );
	const result = dgges( 'compute-vectors', 'compute-vectors', 'none', noop, n, A, 1, n, 0, B, 1, n, 0, sdim, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VSL, 1, n, 0, VSR, 1, n, 0, WORK, 1, 0, BWORK, 1, 0 );
	assert.equal( result, 0, 'info' );
});

test( 'dgges: 4x4 with sort=sort and complex pairs (selectAll)', function t() {
	const sdim = new Int32Array( 1 );
	const n = 4;

	// Block-diagonal with 2 complex-pair 2x2 blocks
	const A = new Float64Array( [ 0, 1, -1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, -2, 0 ] );
	const B = new Float64Array( [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ] );
	const ALPHAR = new Float64Array( n );
	const ALPHAI = new Float64Array( n );
	const BETA = new Float64Array( n );
	const VSL = new Float64Array( n * n );
	const VSR = new Float64Array( n * n );
	const WORK = new Float64Array( Math.max( 8 * n, ( 6 * n ) + 16 ) );
	const BWORK = new Uint8Array( n );
	const result = dgges( 'compute-vectors', 'compute-vectors', 'sort', selectAll, n, A, 1, n, 0, B, 1, n, 0, sdim, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VSL, 1, n, 0, VSR, 1, n, 0, WORK, 1, 0, BWORK, 1, 0 );
	assert.equal( result, 0, 'info' );
	assert.equal( sdim[ 0 ], 4, 'all selected (sdim=4)' );
});

test( 'dgges: sort=sort with tiny-norm A (ilascl + wantst)', function t() {
	const sdim = new Int32Array( 1 );
	const n = 2;
	const s = 1e-200;
	const A = new Float64Array( [ 2 * s, 0, 0, 3 * s ] );
	const B = new Float64Array( [ 1, 0, 0, 1 ] );
	const ALPHAR = new Float64Array( n );
	const ALPHAI = new Float64Array( n );
	const BETA = new Float64Array( n );
	const VSL = new Float64Array( n * n );
	const VSR = new Float64Array( n * n );
	const WORK = new Float64Array( Math.max( 8 * n, ( 6 * n ) + 16 ) );
	const BWORK = new Uint8Array( n );
	const result = dgges( 'compute-vectors', 'compute-vectors', 'sort', selectAll, n, A, 1, n, 0, B, 1, n, 0, sdim, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VSL, 1, n, 0, VSR, 1, n, 0, WORK, 1, 0, BWORK, 1, 0 );
	assert.equal( result, 0, 'info' );
	assert.equal( sdim[ 0 ], 2, 'sdim' );
});

test( 'dgges: sort=sort with tiny-norm B (ilbscl + wantst)', function t() {
	const sdim = new Int32Array( 1 );
	const n = 2;
	const s = 1e-200;
	const A = new Float64Array( [ 1, 0, 0, 2 ] );
	const B = new Float64Array( [ s, 0, 0, s ] );
	const ALPHAR = new Float64Array( n );
	const ALPHAI = new Float64Array( n );
	const BETA = new Float64Array( n );
	const VSL = new Float64Array( n * n );
	const VSR = new Float64Array( n * n );
	const WORK = new Float64Array( Math.max( 8 * n, ( 6 * n ) + 16 ) );
	const BWORK = new Uint8Array( n );
	const result = dgges( 'compute-vectors', 'compute-vectors', 'sort', selectAll, n, A, 1, n, 0, B, 1, n, 0, sdim, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VSL, 1, n, 0, VSR, 1, n, 0, WORK, 1, 0, BWORK, 1, 0 );
	assert.equal( result, 0, 'info' );
	assert.equal( sdim[ 0 ], 2, 'sdim' );
});

test( 'dgges: scaled A with complex eigenvalue pair (ilascl + complex)', function t() {
	const sdim = new Int32Array( 1 );
	const n = 2;
	const s = 1e-200;

	// rotation: complex conjugate pair
	const A = new Float64Array( [ 0, s, -s, 0 ] );
	const B = new Float64Array( [ 1, 0, 0, 1 ] );
	const ALPHAR = new Float64Array( n );
	const ALPHAI = new Float64Array( n );
	const BETA = new Float64Array( n );
	const VSL = new Float64Array( n * n );
	const VSR = new Float64Array( n * n );
	const WORK = new Float64Array( Math.max( 8 * n, ( 6 * n ) + 16 ) );
	const BWORK = new Uint8Array( n );
	const result = dgges( 'compute-vectors', 'compute-vectors', 'sort', selectAll, n, A, 1, n, 0, B, 1, n, 0, sdim, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VSL, 1, n, 0, VSR, 1, n, 0, WORK, 1, 0, BWORK, 1, 0 );
	assert.equal( result, 0, 'info' );
	assert.equal( sdim[ 0 ], 2, 'sdim' );
});

test( 'dgges: scaled B with complex eigenvalue pair (ilbscl + complex)', function t() {
	const sdim = new Int32Array( 1 );
	const n = 2;
	const s = 1e-200;
	const A = new Float64Array( [ 0, 1, -1, 0 ] );
	const B = new Float64Array( [ s, 0, 0, s ] );
	const ALPHAR = new Float64Array( n );
	const ALPHAI = new Float64Array( n );
	const BETA = new Float64Array( n );
	const VSL = new Float64Array( n * n );
	const VSR = new Float64Array( n * n );
	const WORK = new Float64Array( Math.max( 8 * n, ( 6 * n ) + 16 ) );
	const BWORK = new Uint8Array( n );
	const result = dgges( 'compute-vectors', 'compute-vectors', 'sort', selectAll, n, A, 1, n, 0, B, 1, n, 0, sdim, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VSL, 1, n, 0, VSR, 1, n, 0, WORK, 1, 0, BWORK, 1, 0 );
	assert.equal( result, 0, 'info' );
	assert.equal( sdim[ 0 ], 2, 'sdim' );
});

test( 'dgges: 3x3 with sort=sort and only first selected', function t() {
	const sdim = new Int32Array( 1 );
	const n = 3;
	const A = new Float64Array( [ 5, 0, 0, 0, 1, 0, 0, 0, 0.1 ] );
	const B = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
	const ALPHAR = new Float64Array( n );
	const ALPHAI = new Float64Array( n );
	const BETA = new Float64Array( n );
	const VSL = new Float64Array( n * n );
	const VSR = new Float64Array( n * n );
	const WORK = new Float64Array( Math.max( 8 * n, ( 6 * n ) + 16 ) );
	const BWORK = new Uint8Array( n );
	function selectBig( ar, ai, b ) { // eslint-disable-line no-unused-vars
		return Math.abs( ar ) > 3.0;
	}
	const result = dgges( 'compute-vectors', 'compute-vectors', 'sort', selectBig, n, A, 1, n, 0, B, 1, n, 0, sdim, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VSL, 1, n, 0, VSR, 1, n, 0, WORK, 1, 0, BWORK, 1, 0 );
	assert.equal( result, 0, 'info' );
	assert.equal( sdim[ 0 ], 1, 'one selected' );
});
