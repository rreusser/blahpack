/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaein from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'dlaein.jsonl' ), 'utf8' ).trim().split( '\n' );
const fixture = lines.map( function parse( line ) { return JSON.parse( line ); } );


// CONSTANTS //

const UNFL = 2.2250738585072014e-308;
const ULP = 1.1102230246251565e-16;


// FUNCTIONS //

function findCase( name ) {
	return fixture.find( function find( t ) { return t.name === name; } );
}

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function dlanhsInf( n, H, sh1, sh2, oH ) {
	let s, i, j, imax;
	let vmax = 0.0;
	for ( i = 0; i < n; i++ ) {
		s = 0.0;
		imax = i - 1;
		if ( imax < 0 ) {
			imax = 0;
		}
		for ( j = imax; j < n; j++ ) {
			s += Math.abs( H[ oH + ( i * sh1 ) + ( j * sh2 ) ] );
		}
		if ( s > vmax ) {
			vmax = s;
		}
	}
	return vmax;
}

function machineConsts( n, hnorm ) {
	const smlnum = UNFL * ( n / ULP );
	const bignum = ( 1.0 - ULP ) / smlnum;
	let eps3 = hnorm * ULP;
	if ( eps3 < smlnum ) {
		eps3 = smlnum;
	}
	return { 'eps3': eps3, 'smlnum': smlnum, 'bignum': bignum };
}

// Run with offsets: pack H into buffer starting at offsetH with given strides.
function run( rightv, noinit, n, Hdata, wr, wi, vrInit, viInit, useOffsets ) {
	const ldh = n;
	const ldb = n + 1;
	let oH, oVR, oVI, oB, oWK, H, VR, VI, B, WORK, sh1, sh2, sb1, sb2, sVR, sVI;
	let sWK, i, j;

	if ( useOffsets ) {
		// Offset storage with stride-2 vectors and column-major matrices.
		oH = 3;
		oVR = 2;
		oVI = 2;
		oB = 5;
		oWK = 1;
		sh1 = 1;
		sh2 = ldh;
		sb1 = 1;
		sb2 = ldb;
		sVR = 2;
		sVI = 2;
		sWK = 1;
		H = new Float64Array( oH + ( ldh * n ) );
		VR = new Float64Array( oVR + ( sVR * n ) );
		VI = new Float64Array( oVI + ( sVI * n ) );
		B = new Float64Array( oB + ( ldb * n ) );
		WORK = new Float64Array( oWK + ( sWK * n ) );
	} else {
		// Row-major layout via base strides.
		oH = 0;
		oVR = 0;
		oVI = 0;
		oB = 0;
		oWK = 0;
		sh1 = ldh;
		sh2 = 1;
		sb1 = n; // B is (n+1)-by-n: row-major row stride is the column count
		sb2 = 1;
		sVR = 1;
		sVI = 1;
		sWK = 1;
		H = new Float64Array( ldh * n );
		VR = new Float64Array( n );
		VI = new Float64Array( n );
		B = new Float64Array( ldb * n );
		WORK = new Float64Array( n );
	}

	for ( i = 0; i < n; i++ ) {
		for ( j = 0; j < n; j++ ) {
			H[ oH + ( i * sh1 ) + ( j * sh2 ) ] = Hdata[ i ][ j ];
		}
	}

	if ( vrInit ) {
		for ( i = 0; i < n; i++ ) {
			VR[ oVR + ( i * sVR ) ] = vrInit[ i ];
		}
	}
	if ( viInit ) {
		for ( i = 0; i < n; i++ ) {
			VI[ oVI + ( i * sVI ) ] = viInit[ i ];
		}
	}

	const hnorm = dlanhsInf( n, H, sh1, sh2, oH );
	const consts = machineConsts( n, hnorm );

	const info = dlaein(
		rightv, noinit, n,
		H, sh1, sh2, oH,
		wr, wi,
		VR, sVR, oVR,
		VI, sVI, oVI,
		B, sb1, sb2, oB,
		WORK, sWK, oWK,
		consts.eps3, consts.smlnum, consts.bignum
	);

	// Extract VR/VI at their strides/offsets.
	const vrOut = new Float64Array( n );
	const viOut = new Float64Array( n );
	for ( i = 0; i < n; i++ ) {
		vrOut[ i ] = VR[ oVR + ( i * sVR ) ];
		viOut[ i ] = VI[ oVI + ( i * sVI ) ];
	}
	return { 'info': info, 'vr': vrOut, 'vi': viOut };
}


// DATA //

const H4 = [
	[ 4.0, 3.0, 2.0, 1.0 ],
	[ 1.0, 4.0, 3.0, 2.0 ],
	[ 0.0, 1.0, 4.0, 3.0 ],
	[ 0.0, 0.0, 1.0, 4.0 ]
];
const Hone = [ [ 3.5 ] ];
const Hc4 = [
	[ 0.0, -1.0, 2.0, 1.0 ],
	[ 1.0, 0.0, 1.0, 2.0 ],
	[ 0.0, 1.0, 0.0, -1.0 ],
	[ 0.0, 0.0, 1.0, 0.0 ]
];
const H3c = [
	[ 1.0, -2.0, 0.5 ],
	[ 2.0, 1.0, 0.25 ],
	[ 0.0, 0.0, 3.0 ]
];


// TESTS //

test( 'ndarray export is a function', function t() {
	assert.strictEqual( typeof dlaein, 'function' );
});

test( 'ndarray dlaein: right_real_noinit_4x4 (row-major, no offset)', function t() {
	const tc = findCase( 'right_real_noinit_4x4' );
	const r = run( true, true, 4, H4, 4.0, 0.0, null, null, false );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( Array.from( r.vr ), tc.vr, 1e-12, 'vr' );
});

test( 'ndarray dlaein: right_real_noinit_4x4 (offset, stride 2)', function t() {
	const tc = findCase( 'right_real_noinit_4x4' );
	const r = run( true, true, 4, H4, 4.0, 0.0, null, null, true );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( Array.from( r.vr ), tc.vr, 1e-12, 'vr' );
});

test( 'ndarray dlaein: left_real_noinit_4x4 (row-major)', function t() {
	const tc = findCase( 'left_real_noinit_4x4' );
	const r = run( false, true, 4, H4, 4.0, 0.0, null, null, false );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( Array.from( r.vr ), tc.vr, 1e-12, 'vr' );
});

test( 'ndarray dlaein: left_real_noinit_4x4 (offset, stride 2)', function t() {
	const tc = findCase( 'left_real_noinit_4x4' );
	const r = run( false, true, 4, H4, 4.0, 0.0, null, null, true );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( Array.from( r.vr ), tc.vr, 1e-12, 'vr' );
});

test( 'ndarray dlaein: n1', function t() {
	const tc = findCase( 'n1' );
	const r = run( true, true, 1, Hone, 3.5, 0.0, null, null, true );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( Array.from( r.vr ), tc.vr, 1e-12, 'vr' );
});

// Complex-eigenvalue path: fixtures from the reference (non-convergent shifts).

test( 'ndarray dlaein: right_complex_noinit_4x4 (fixture, info=1)', function t() {
	const tc = findCase( 'right_complex_noinit_4x4' );
	const r = run( true, true, 4, Hc4, 0.0, 1.5, null, null, true );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( Array.from( r.vr ), tc.vr, 1e-12, 'vr' );
	assertArrayClose( Array.from( r.vi ), tc.vi, 1e-12, 'vi' );
});

test( 'ndarray dlaein: left_complex_noinit_4x4 (fixture, info=1)', function t() {
	const tc = findCase( 'left_complex_noinit_4x4' );
	const r = run( false, true, 4, Hc4, 0.0, 1.5, null, null, false );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( Array.from( r.vr ), tc.vr, 1e-12, 'vr' );
	assertArrayClose( Array.from( r.vi ), tc.vi, 1e-12, 'vi' );
});

// Complex-eigenvalue path at an exact eigenvalue: inverse iteration must
// converge (info = 0). Checks the eigen-residual and the reference's final
// normalization (max_i |vr_i| + |vi_i| = 1). H3 has eigenvalues 1 +/- 2i and 3.

function complexResidual( rightv, H, wr, wi, vr, vi ) {
	let res = 0.0;
	let hn = 0.0;
	let ar, ai, i, j, h;
	for ( i = 0; i < H.length; i++ ) {
		ar = 0.0;
		ai = 0.0;
		for ( j = 0; j < H.length; j++ ) {
			// Right: (H v)_i; left: (H^T v)_i, i.e. v^H H = lambda v^H <=> H^T v = conj(lambda) v.
			h = ( rightv ) ? H[ i ][ j ] : H[ j ][ i ];
			ar += h * vr[ j ];
			ai += h * vi[ j ];
			hn = Math.max( hn, Math.abs( H[ i ][ j ] ) );
		}
		if ( rightv ) {
			ar -= ( wr * vr[ i ] ) - ( wi * vi[ i ] );
			ai -= ( wr * vi[ i ] ) + ( wi * vr[ i ] );
		} else {
			ar -= ( wr * vr[ i ] ) + ( wi * vi[ i ] );
			ai -= ( wr * vi[ i ] ) - ( wi * vr[ i ] );
		}
		res = Math.max( res, Math.abs( ar ) + Math.abs( ai ) );
	}
	return res / hn;
}

function assertComplexEigvec( rightv, noinit, wi, useOffsets ) {
	let mx = 0.0;
	let i;
	const r = run( rightv, noinit, 3, H3c, 1.0, wi, ( noinit ) ? null : [ 1.0, 0.5, 0.25 ], ( noinit ) ? null : [ 0.3, -0.2, 0.1 ], useOffsets );
	assert.equal( r.info, 0, 'info' );
	for ( i = 0; i < 3; i++ ) {
		mx = Math.max( mx, Math.abs( r.vr[ i ] ) + Math.abs( r.vi[ i ] ) );
	}
	assertClose( mx, 1.0, 1e-14, 'max-norm' );
	assert.ok( complexResidual( rightv, H3c, 1.0, wi, r.vr, r.vi ) < 1e-13, 'residual' );
}

test( 'ndarray dlaein: complex eigenvalue, right, noinit, converges', function t() {
	assertComplexEigvec( true, true, 2.0, false );
	assertComplexEigvec( true, true, -2.0, true );
});

test( 'ndarray dlaein: complex eigenvalue, left, noinit, converges', function t() {
	assertComplexEigvec( false, true, 2.0, true );
	assertComplexEigvec( false, true, -2.0, false );
});

test( 'ndarray dlaein: complex eigenvalue, supplied initial vector, converges', function t() {
	assertComplexEigvec( true, false, 2.0, false );
	assertComplexEigvec( false, false, 2.0, true );
});
