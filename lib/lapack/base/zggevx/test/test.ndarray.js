/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-params, max-statements, max-lines, max-lines-per-function */

// MODULES //

import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zggevx from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'zggevx.jsonl' ), 'utf8' ).trim().split( '\n' );
const fixture = lines.map( function parse( line ) { return JSON.parse( line ); } );

const A3 = [
	2.0, 1.0, 1.0, -1.0, 0.5, 0.5,
	1.0, 0.5, 3.0, 0.0, 0.5, -0.5,
	0.5, -0.5, 1.0, 1.0, 4.0, -1.0
];
const B3 = [
	3.0, 0.0, 0.5, -0.5, 0.0, 0.5,
	1.0, 0.5, 2.0, 1.0, 0.5, 0.0,
	0.5, 0.5, 1.0, 0.0, 1.0, 0.5
];


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

function mkMat( arr ) {
	return new Complex128Array( new Float64Array( arr ) );
}

function extractCol( V, N, col ) {
	const out = [];
	const v = reinterpret( V, 0 );
	let i;
	for ( i = 0; i < N; i++ ) {
		out.push( v[ 2 * ( ( col * N ) + i ) ] );
		out.push( v[ ( 2 * ( ( col * N ) + i ) ) + 1 ] );
	}
	return out;
}

function toArr( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

function runCase( tc, balanc, jobvl, jobvr, sense, N, A, B ) {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const bbnrm = new Float64Array( 1 );
	const ALPHA = new Complex128Array( N );
	const BETA = new Complex128Array( N );
	const VL = new Complex128Array( Math.max( 1, N * N ) );
	const VR = new Complex128Array( Math.max( 1, N * N ) );
	const LSCALE = new Float64Array( Math.max( 1, N ) );
	const RSCALE = new Float64Array( Math.max( 1, N ) );
	const RCONDE = new Float64Array( Math.max( 1, N ) );
	const RCONDV = new Float64Array( Math.max( 1, N ) );
	const r = {
		'info': zggevx( balanc, jobvl, jobvr, sense, N, A, 1, Math.max( 1, N ), 0, B, 1, Math.max( 1, N ), 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, Math.max( 1, N ), 0, VR, 1, Math.max( 1, N ), 0, ilo, ihi, LSCALE, 1, 0, RSCALE, 1, 0, abnrm, bbnrm, RCONDE, 1, 0, RCONDV, 1, 0, new Complex128Array( ( 2 * N * N ) + ( 40 * N ) + 1056 ), 1, 0, new Float64Array( Math.max( 1, 6 * N ) ), 1, 0, new Int32Array( N + 6 ), 1, 0, new Uint8Array( Math.max( 1, N ) ), 1, 0 ),
		'ilo': ilo[ 0 ],
		'ihi': ihi[ 0 ],
		'abnrm': abnrm[ 0 ],
		'bbnrm': bbnrm[ 0 ]
	};
	return {
		'r': r,
		'VL': VL,
		'VR': VR,
		'ALPHA': ALPHA,
		'BETA': BETA,
		'LSCALE': LSCALE,
		'RSCALE': RSCALE,
		'RCONDE': RCONDE,
		'RCONDV': RCONDV
	};
}


// TESTS //

test( 'zggevx: main export is a function', function t() {
	assert.strictEqual( typeof zggevx, 'function', 'is a function' );
});

test( 'zggevx: n_eq_0', function t() {
	const tc = findCase( 'n_eq_0' );
	const A = new Complex128Array( 1 );
	const B = new Complex128Array( 1 );
	const out = runCase( tc, 'none', 'no-vectors', 'no-vectors', 'none', 0, A, B );
	assert.equal( out.r.info, tc.info, 'info' );
});

test( 'zggevx: n_eq_1 compute-vectors', function t() {
	const tol = 1e-9;
	const tc = findCase( 'n_eq_1' );
	const A = mkMat( [ 3.0, 1.0 ] );
	const B = mkMat( [ 2.0, 0.5 ] );
	const out = runCase( tc, 'none', 'compute-vectors', 'compute-vectors', 'none', 1, A, B );
	assert.equal( out.r.info, tc.info, 'info' );
	assert.equal( out.r.ilo, tc.ilo, 'ilo' );
	assert.equal( out.r.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArr( reinterpret( out.ALPHA, 0 ) ), tc.alpha, tol, 'alpha' );
	assertArrayClose( toArr( reinterpret( out.BETA, 0 ) ), tc.beta, tol, 'beta' );
	assertArrayClose( toArr( reinterpret( out.VL, 0 ) ), tc.VL, tol, 'VL' );
	assertArrayClose( toArr( reinterpret( out.VR, 0 ) ), tc.VR, tol, 'VR' );
});

test( 'zggevx: balanc=none compute both 3x3', function t() {
	const tol = 1e-9;
	const tc = findCase( 'balN_both_3x3' );
	const out = runCase( tc, 'none', 'compute-vectors', 'compute-vectors', 'none', 3, mkMat( A3 ), mkMat( B3 ) );
	assert.equal( out.r.info, tc.info, 'info' );
	assert.equal( out.r.ilo, tc.ilo, 'ilo' );
	assert.equal( out.r.ihi, tc.ihi, 'ihi' );
	assertClose( out.r.abnrm, tc.abnrm, tol, 'abnrm' );
	assertClose( out.r.bbnrm, tc.bbnrm, tol, 'bbnrm' );
	assertArrayClose( toArr( reinterpret( out.ALPHA, 0 ) ), tc.alpha, tol, 'alpha' );
	assertArrayClose( toArr( reinterpret( out.BETA, 0 ) ), tc.beta, tol, 'beta' );
	assertArrayClose( extractCol( out.VL, 3, 0 ), tc.VL_col1, tol, 'VL_col1' );
	assertArrayClose( extractCol( out.VR, 3, 0 ), tc.VR_col1, tol, 'VR_col1' );
});

test( 'zggevx: balanc=permute eigvals only 3x3', function t() {
	const tol = 1e-9;
	const tc = findCase( 'balP_eigonly_3x3' );
	const out = runCase( tc, 'permute', 'no-vectors', 'no-vectors', 'none', 3, mkMat( A3 ), mkMat( B3 ) );
	assert.equal( out.r.info, tc.info, 'info' );
	assert.equal( out.r.ilo, tc.ilo, 'ilo' );
	assert.equal( out.r.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArr( reinterpret( out.ALPHA, 0 ) ), tc.alpha, tol, 'alpha' );
	assertArrayClose( toArr( reinterpret( out.BETA, 0 ) ), tc.beta, tol, 'beta' );
});

test( 'zggevx: balanc=both compute both 2x2 diag', function t() {
	const tol = 1e-9;
	const tc = findCase( 'balB_diag_2x2' );
	const A = mkMat( [ 4.0, 0.0, 0.0, 0.0, 0.0, 0.0, 6.0, 0.0 ] );
	const B = mkMat( [ 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 3.0, 0.0 ] );
	const out = runCase( tc, 'both', 'compute-vectors', 'compute-vectors', 'none', 2, A, B );
	assert.equal( out.r.info, tc.info, 'info' );
	assertArrayClose( toArr( reinterpret( out.ALPHA, 0 ) ), tc.alpha, tol, 'alpha' );
	assertArrayClose( toArr( reinterpret( out.BETA, 0 ) ), tc.beta, tol, 'beta' );
	assertArrayClose( extractCol( out.VL, 2, 0 ), tc.VL_col1, tol, 'VL_col1' );
	assertArrayClose( extractCol( out.VR, 2, 1 ), tc.VR_col2, tol, 'VR_col2' );
});

test( 'zggevx: balanc=scale right-only 3x3', function t() {
	const tol = 1e-9;
	const tc = findCase( 'balS_right_3x3' );
	const out = runCase( tc, 'scale', 'no-vectors', 'compute-vectors', 'none', 3, mkMat( A3 ), mkMat( B3 ) );
	assert.equal( out.r.info, tc.info, 'info' );
	assertArrayClose( toArr( reinterpret( out.ALPHA, 0 ) ), tc.alpha, tol, 'alpha' );
	assertArrayClose( extractCol( out.VR, 3, 0 ), tc.VR_col1, tol, 'VR_col1' );
});

test( 'zggevx: sense=eigenvalues 3x3', function t() {
	const tol = 1e-8;
	const tc = findCase( 'sense_E_3x3' );
	const out = runCase( tc, 'both', 'compute-vectors', 'compute-vectors', 'eigenvalues', 3, mkMat( A3 ), mkMat( B3 ) );
	assert.equal( out.r.info, tc.info, 'info' );
	if ( tc.rconde ) {
		assertArrayClose( toArr( out.RCONDE ), tc.rconde, tol, 'rconde' );
	}
});

test( 'zggevx: sense=right-vectors 3x3', function t() {
	const tol = 1e-8;
	const tc = findCase( 'sense_V_3x3' );
	const out = runCase( tc, 'both', 'compute-vectors', 'compute-vectors', 'right-vectors', 3, mkMat( A3 ), mkMat( B3 ) );
	assert.equal( out.r.info, tc.info, 'info' );
	if ( tc.rcondv ) {
		assertArrayClose( toArr( out.RCONDV ), tc.rcondv, tol, 'rcondv' );
	}
});

test( 'zggevx: sense=both 3x3', function t() {
	const tol = 1e-8;
	const tc = findCase( 'sense_B_3x3' );
	const out = runCase( tc, 'both', 'compute-vectors', 'compute-vectors', 'both', 3, mkMat( A3 ), mkMat( B3 ) );
	assert.equal( out.r.info, tc.info, 'info' );
	if ( tc.rconde ) {
		assertArrayClose( toArr( out.RCONDE ), tc.rconde, tol, 'rconde' );
	}
	if ( tc.rcondv ) {
		assertArrayClose( toArr( out.RCONDV ), tc.rcondv, tol, 'rcondv' );
	}
});

test( 'zggevx: tiny inputs trigger ilascl/ilbscl scaling', function t() {
	const A = mkMat( [ 1e-200, 0.0, 0.0, 0.0, 0.0, 0.0, 2e-200, 0.0 ] );
	const B = mkMat( [ 3e-200, 0.0, 0.0, 0.0, 0.0, 0.0, 4e-200, 0.0 ] );
	const out = runCase({ 'info': 0 }, 'none', 'compute-vectors', 'compute-vectors', 'none', 2, A, B );
	assert.equal( out.r.info, 0, 'info' );
});

test( 'zggevx: huge inputs trigger ilascl/ilbscl scaling (high)', function t() {
	const A = mkMat( [ 1e200, 0.0, 0.0, 0.0, 0.0, 0.0, 2e200, 0.0 ] );
	const B = mkMat( [ 3e200, 0.0, 0.0, 0.0, 0.0, 0.0, 4e200, 0.0 ] );
	const out = runCase({ 'info': 0 }, 'none', 'compute-vectors', 'compute-vectors', 'none', 2, A, B );
	assert.equal( out.r.info, 0, 'info' );
});

test( 'zggevx: rejects invalid balanc with TypeError', function t() {
	assert.throws( function bad() {
		runCase({ 'info': 0 }, 'bogus', 'no-vectors', 'no-vectors', 'none', 2, mkMat( [ 1, 0, 0, 0, 0, 0, 1, 0 ] ), mkMat( [ 1, 0, 0, 0, 0, 0, 1, 0 ] ) );
	}, TypeError );
});

test( 'zggevx: rejects invalid jobvl with TypeError', function t() {
	assert.throws( function bad() {
		runCase({ 'info': 0 }, 'none', 'bogus', 'no-vectors', 'none', 2, mkMat( [ 1, 0, 0, 0, 0, 0, 1, 0 ] ), mkMat( [ 1, 0, 0, 0, 0, 0, 1, 0 ] ) );
	}, TypeError );
});

test( 'zggevx: rejects invalid jobvr with TypeError', function t() {
	assert.throws( function bad() {
		runCase({ 'info': 0 }, 'none', 'no-vectors', 'bogus', 'none', 2, mkMat( [ 1, 0, 0, 0, 0, 0, 1, 0 ] ), mkMat( [ 1, 0, 0, 0, 0, 0, 1, 0 ] ) );
	}, TypeError );
});

test( 'zggevx: rejects invalid sense with TypeError', function t() {
	assert.throws( function bad() {
		runCase({ 'info': 0 }, 'none', 'no-vectors', 'no-vectors', 'bogus', 2, mkMat( [ 1, 0, 0, 0, 0, 0, 1, 0 ] ), mkMat( [ 1, 0, 0, 0, 0, 0, 1, 0 ] ) );
	}, TypeError );
});

test( 'zggevx: results are bit-identical for any WORK/RWORK/IWORK/BWORK offset (caller-owned workspace)', function t() {
	const N = 4;
	const SENSES = [ 'none', 'eigenvalues', 'right-vectors', 'both' ];
	const PAD = 5;
	let si;
	function make( seed ) {
		const out = [];
		let x = seed;
		let i;
		for ( i = 0; i < 2 * N * N; i++ ) {
			x = ( ( x * 1103515245 ) + 12345 ) % 2147483648;
			out.push( ( x / 2147483648 ) - 0.5 );
		}
		return out;
	}
	function run( sense, off ) {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		const bbnrm = new Float64Array( 1 );
		const A = mkMat( make( 7 ) );
		const B = mkMat( make( 11 ) );
		const ALPHA = new Complex128Array( N );
		const BETA = new Complex128Array( N );
		const VL = new Complex128Array( N * N );
		const VR = new Complex128Array( N * N );
		const LSCALE = new Float64Array( N );
		const RSCALE = new Float64Array( N );
		const RCONDE = new Float64Array( N );
		const RCONDV = new Float64Array( N );
		const W = new Complex128Array( off + ( 2 * N * N ) + ( 40 * N ) + 1056 );
		const RW = new Float64Array( off + ( 6 * N ) );
		const IW = new Int32Array( off + N + 6 );
		const BW = new Uint8Array( off + N );
		const r = zggevx( 'both', 'compute-vectors', 'compute-vectors', sense, N, A, 1, N, 0, B, 1, N, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, N, 0, VR, 1, N, 0, ilo, ihi, LSCALE, 1, 0, RSCALE, 1, 0, abnrm, bbnrm, RCONDE, 1, 0, RCONDV, 1, 0, W, 1, off, RW, 1, off, IW, 1, off, BW, 1, off );
		return [ r, abnrm[ 0 ], bbnrm[ 0 ] ].concat( toArr( reinterpret( ALPHA, 0 ) ), toArr( reinterpret( BETA, 0 ) ), toArr( reinterpret( VL, 0 ) ), toArr( reinterpret( VR, 0 ) ), toArr( RCONDE ), toArr( RCONDV ) );
	}
	for ( si = 0; si < SENSES.length; si++ ) {
		assert.deepStrictEqual( run( SENSES[ si ], PAD ), run( SENSES[ si ], 0 ), 'sense=' + SENSES[ si ] );
	}
});

test( 'zggevx: N=33 (> NB=32) right eigenvectors satisfy beta*A*v = alpha*B*v with the minimum WORK; one element less throws RangeError', function t() {
	const N = 33;
	const minWork = N + ( N * 32 ) + ( 33 * 32 );
	let maxRes;
	let scale;
	let res;
	let ar;
	let ai;
	let br;
	let bi;
	let xr;
	let xi;
	let i;
	let j;
	let k;
	function make( seed ) {
		const out = [];
		let x = seed;
		let n;
		for ( n = 0; n < 2 * N * N; n++ ) {
			x = ( ( x * 1103515245 ) + 12345 ) % 2147483648;
			out.push( ( x / 2147483648 ) - 0.5 );
		}
		return out;
	}
	function call( lwork ) {
		return zggevx( 'none', 'no-vectors', 'compute-vectors', 'none', N, mkMat( make( 3 ) ), 1, N, 0, mkMat( make( 5 ) ), 1, N, 0, ALPHA, 1, 0, BETA, 1, 0, new Complex128Array( 1 ), 1, 1, 0, VR, 1, N, 0, new Int32Array( 1 ), new Int32Array( 1 ), new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Complex128Array( lwork ), 1, 0, new Float64Array( 2 * N ), 1, 0, new Int32Array( 1 ), 1, 0, new Uint8Array( 1 ), 1, 0 );
	}
	const ALPHA = new Complex128Array( N );
	const BETA = new Complex128Array( N );
	const VR = new Complex128Array( N * N );
	assert.throws( function bad() {
		call( minWork - 1 );
	}, RangeError );
	assert.equal( call( minWork ), 0, 'info' );
	const a = make( 3 );
	const b = make( 5 );
	const al = reinterpret( ALPHA, 0 );
	const be = reinterpret( BETA, 0 );
	const v = reinterpret( VR, 0 );
	maxRes = 0.0;
	for ( j = 0; j < N; j++ ) {
		scale = 0.0;
		for ( i = 0; i < N; i++ ) {
			// r_i = beta_j * (A v_j)_i - alpha_j * (B v_j)_i
			ar = 0.0;
			ai = 0.0;
			br = 0.0;
			bi = 0.0;
			for ( k = 0; k < N; k++ ) {
				xr = v[ 2 * ( ( j * N ) + k ) ];
				xi = v[ ( 2 * ( ( j * N ) + k ) ) + 1 ];
				ar += ( a[ 2 * ( ( k * N ) + i ) ] * xr ) - ( a[ ( 2 * ( ( k * N ) + i ) ) + 1 ] * xi );
				ai += ( a[ 2 * ( ( k * N ) + i ) ] * xi ) + ( a[ ( 2 * ( ( k * N ) + i ) ) + 1 ] * xr );
				br += ( b[ 2 * ( ( k * N ) + i ) ] * xr ) - ( b[ ( 2 * ( ( k * N ) + i ) ) + 1 ] * xi );
				bi += ( b[ 2 * ( ( k * N ) + i ) ] * xi ) + ( b[ ( 2 * ( ( k * N ) + i ) ) + 1 ] * xr );
			}
			res = Math.hypot( ( be[ 2 * j ] * ar ) - ( be[ ( 2 * j ) + 1 ] * ai ) - ( ( al[ 2 * j ] * br ) - ( al[ ( 2 * j ) + 1 ] * bi ) ), ( be[ 2 * j ] * ai ) + ( be[ ( 2 * j ) + 1 ] * ar ) - ( ( al[ 2 * j ] * bi ) + ( al[ ( 2 * j ) + 1 ] * br ) ) );
			maxRes = Math.max( maxRes, res / ( Math.hypot( be[ 2 * j ], be[ ( 2 * j ) + 1 ] ) + Math.hypot( al[ 2 * j ], al[ ( 2 * j ) + 1 ] ) ) );
			scale = Math.max( scale, Math.hypot( v[ 2 * ( ( j * N ) + i ) ], v[ ( 2 * ( ( j * N ) + i ) ) + 1 ] ) );
		}
		// Eigenvectors are normalized so that the largest component has |re|+|im| = 1:
		assert.ok( scale > 0.5 && scale <= 1.0 + 1e-14, 'eigenvector ' + j + ' normalized' );
	}
	assert.ok( maxRes < N * 1e-13, 'max relative residual ' + maxRes );
});
