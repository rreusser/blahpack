/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-params, max-lines, max-statements, max-lines-per-function */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztgsen from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'ztgsen.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
const fixture = lines.map( function parse( line ) { return JSON.parse( line ); } );


// FUNCTIONS //

function findCase( name ) {
	let i;
	for ( i = 0; i < fixture.length; i++ ) {
		if ( fixture[ i ].name === name ) {
			return fixture[ i ];
		}
	}
	return null;
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

function makeAB4() {
	const A = new Complex128Array( 16 );
	const B = new Complex128Array( 16 );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	const N = 4;

	Av[ 0 ] = 1.0; Av[ 1 ] = 0.5;
	Av[ 2 * N ] = 0.3; Av[ ( 2 * N ) + 1 ] = 0.1;
	Av[ 2 * ( N + 1 ) ] = 2.0; Av[ ( 2 * ( N + 1 ) ) + 1 ] = -0.3;
	Av[ 2 * ( 2 * N ) ] = 0.1; Av[ ( 2 * ( 2 * N ) ) + 1 ] = -0.1;
	Av[ 2 * ( ( 2 * N ) + 1 ) ] = 0.4; Av[ ( 2 * ( ( 2 * N ) + 1 ) ) + 1 ] = 0.3;
	Av[ 2 * ( ( 2 * N ) + 2 ) ] = 3.0; Av[ ( 2 * ( ( 2 * N ) + 2 ) ) + 1 ] = 1.0;
	Av[ 2 * ( 3 * N ) ] = 0.05; Av[ ( 2 * ( 3 * N ) ) + 1 ] = 0.02;
	Av[ 2 * ( ( 3 * N ) + 1 ) ] = 0.2; Av[ ( 2 * ( ( 3 * N ) + 1 ) ) + 1 ] = -0.1;
	Av[ 2 * ( ( 3 * N ) + 2 ) ] = 0.6; Av[ ( 2 * ( ( 3 * N ) + 2 ) ) + 1 ] = 0.1;
	Av[ 2 * ( ( 3 * N ) + 3 ) ] = 4.0; Av[ ( 2 * ( ( 3 * N ) + 3 ) ) + 1 ] = 0.8;

	Bv[ 0 ] = 1.0; Bv[ 1 ] = 0.2;
	Bv[ 2 * N ] = 0.1; Bv[ ( 2 * N ) + 1 ] = 0.1;
	Bv[ 2 * ( N + 1 ) ] = 2.0; Bv[ ( 2 * ( N + 1 ) ) + 1 ] = -0.1;
	Bv[ 2 * ( 2 * N ) ] = 0.05; Bv[ ( 2 * ( 2 * N ) ) + 1 ] = 0.0;
	Bv[ 2 * ( ( 2 * N ) + 1 ) ] = 0.15; Bv[ ( 2 * ( ( 2 * N ) + 1 ) ) + 1 ] = -0.05;
	Bv[ 2 * ( ( 2 * N ) + 2 ) ] = 1.5; Bv[ ( 2 * ( ( 2 * N ) + 2 ) ) + 1 ] = 0.3;
	Bv[ 2 * ( 3 * N ) ] = 0.02; Bv[ ( 2 * ( 3 * N ) ) + 1 ] = -0.01;
	Bv[ 2 * ( ( 3 * N ) + 1 ) ] = 0.08; Bv[ ( 2 * ( ( 3 * N ) + 1 ) ) + 1 ] = 0.03;
	Bv[ 2 * ( ( 3 * N ) + 2 ) ] = 0.12; Bv[ ( 2 * ( ( 3 * N ) + 2 ) ) + 1 ] = 0.04;
	Bv[ 2 * ( ( 3 * N ) + 3 ) ] = 3.0; Bv[ ( 2 * ( ( 3 * N ) + 3 ) ) + 1 ] = 0.0;

	return { 'A': A, 'B': B };
}

function eye( N ) {
	const M = new Complex128Array( N * N );
	const Mv = reinterpret( M, 0 );
	let i;
	for ( i = 0; i < N; i++ ) {
		Mv[ 2 * ( ( i * N ) + i ) ] = 1.0;
	}
	return M;
}

function makeAB3() {
	const A = new Complex128Array( 9 );
	const B = new Complex128Array( 9 );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	Av[ 0 ] = 2.0; Av[ 1 ] = 1.0;
	Av[ 6 ] = 0.5; Av[ 7 ] = -0.2;
	Av[ 8 ] = 4.0; Av[ 9 ] = 0.0;
	Av[ 12 ] = 0.3; Av[ 13 ] = 0.1;
	Av[ 14 ] = 0.7; Av[ 15 ] = -0.3;
	Av[ 16 ] = 6.0; Av[ 17 ] = -1.0;
	Bv[ 0 ] = 1.0; Bv[ 1 ] = 0.0;
	Bv[ 6 ] = 0.1; Bv[ 7 ] = 0.05;
	Bv[ 8 ] = 1.0; Bv[ 9 ] = 0.0;
	Bv[ 14 ] = 0.2; Bv[ 15 ] = -0.1;
	Bv[ 16 ] = 1.0; Bv[ 17 ] = 0.0;
	return { 'A': A, 'B': B };
}


// TESTS //

test( 'ztgsen: main export is a function', function t() {
	assert.strictEqual( typeof ztgsen, 'function', 'is a function' );
});

test( 'ztgsen: ijob=0 select=[T,F,T,F] N=4 (full reorder)', function t() {
	const m = new Int32Array( 1 );
	const pl = new Float64Array( 1 );
	const pr = new Float64Array( 1 );
	const tol = 1e-9;
	const tc = findCase( 'ijob=0 select=[T,F,T,F] wantq=T wantz=T N=4' );
	const ab = makeAB4();
	const Q = eye( 4 );
	const Z = eye( 4 );
	const ALPHA = new Complex128Array( 4 );
	const BETA = new Complex128Array( 4 );
	const DIF = new Float64Array( 2 );
	const SEL = new Uint8Array( [ 1, 0, 1, 0 ] );
	const WK = new Complex128Array( 64 );
	const IWK = new Int32Array( 64 );
	m[ 0 ] = 0;
	pl[ 0 ] = 1.0;
	pr[ 0 ] = 1.0;
	const r = ztgsen( 0, true, true, SEL, 1, 0, 4, ab.A, 1, 4, 0, ab.B, 1, 4, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 4, 0, Z, 1, 4, 0, m, pl, pr, DIF, 1, 0, WK, 1, 0, IWK, 1, 0 );
	assert.equal( r, tc.info, 'info' );
	assert.equal( m[ 0 ], tc.M, 'M' );
	assertArrayClose( Array.from( reinterpret( ab.A, 0 ) ), tc.A, tol, 'A' );
	assertArrayClose( Array.from( reinterpret( ab.B, 0 ) ), tc.B, tol, 'B' );
	assertArrayClose( Array.from( reinterpret( Q, 0 ) ), tc.Q, tol, 'Q' );
	assertArrayClose( Array.from( reinterpret( Z, 0 ) ), tc.Z, tol, 'Z' );
	assertArrayClose( Array.from( reinterpret( ALPHA, 0 ) ), tc.ALPHA, tol, 'ALPHA' );
	assertArrayClose( Array.from( reinterpret( BETA, 0 ) ), tc.BETA, tol, 'BETA' );
});

test( 'ztgsen: ijob=0 select=[T,T,T] N=3 (M=N quick return)', function t() {
	const m = new Int32Array( 1 );
	const pl = new Float64Array( 1 );
	const pr = new Float64Array( 1 );
	const tol = 1e-9;
	const tc = findCase( 'ijob=0 select=[T,T,T] wantq=T wantz=T N=3' );
	const ab = makeAB3();
	const Q = eye( 3 );
	const Z = eye( 3 );
	const ALPHA = new Complex128Array( 3 );
	const BETA = new Complex128Array( 3 );
	const DIF = new Float64Array( 2 );
	const SEL = new Uint8Array( [ 1, 1, 1 ] );
	const WK = new Complex128Array( 64 );
	const IWK = new Int32Array( 64 );
	m[ 0 ] = 0;
	pl[ 0 ] = 1.0;
	pr[ 0 ] = 1.0;
	const r = ztgsen( 0, true, true, SEL, 1, 0, 3, ab.A, 1, 3, 0, ab.B, 1, 3, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 3, 0, Z, 1, 3, 0, m, pl, pr, DIF, 1, 0, WK, 1, 0, IWK, 1, 0 );
	assert.equal( r, 0, 'info' );
	assert.equal( m[ 0 ], 3, 'M' );
	assertArrayClose( Array.from( reinterpret( ALPHA, 0 ) ), tc.ALPHA, tol, 'ALPHA' );
	assertArrayClose( Array.from( reinterpret( BETA, 0 ) ), tc.BETA, tol, 'BETA' );
});

test( 'ztgsen: ijob=0 select=[F,F,F] N=3 (M=0 quick return)', function t() {
	const m = new Int32Array( 1 );
	const pl = new Float64Array( 1 );
	const pr = new Float64Array( 1 );
	const tol = 1e-9;
	const tc = findCase( 'ijob=0 select=[F,F,F] wantq=T wantz=T N=3' );
	const ab = makeAB3();
	const Q = eye( 3 );
	const Z = eye( 3 );
	const ALPHA = new Complex128Array( 3 );
	const BETA = new Complex128Array( 3 );
	const DIF = new Float64Array( 2 );
	const SEL = new Uint8Array( [ 0, 0, 0 ] );
	const WK = new Complex128Array( 64 );
	const IWK = new Int32Array( 64 );
	m[ 0 ] = 0;
	pl[ 0 ] = 1.0;
	pr[ 0 ] = 1.0;
	const r = ztgsen( 0, true, true, SEL, 1, 0, 3, ab.A, 1, 3, 0, ab.B, 1, 3, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 3, 0, Z, 1, 3, 0, m, pl, pr, DIF, 1, 0, WK, 1, 0, IWK, 1, 0 );
	assert.equal( r, 0, 'info' );
	assert.equal( m[ 0 ], 0, 'M' );
	assertArrayClose( Array.from( reinterpret( ALPHA, 0 ) ), tc.ALPHA, tol, 'ALPHA' );
	assertArrayClose( Array.from( reinterpret( BETA, 0 ) ), tc.BETA, tol, 'BETA' );
});

test( 'ztgsen: ijob=0 select=[F,T,F,T] wantq=F wantz=F N=4', function t() {
	const m = new Int32Array( 1 );
	const pl = new Float64Array( 1 );
	const pr = new Float64Array( 1 );
	const tol = 1e-9;
	const tc = findCase( 'ijob=0 select=[F,T,F,T] wantq=F wantz=F N=4' );
	const ab = makeAB4();
	const Q = new Complex128Array( 16 );
	const Z = new Complex128Array( 16 );
	const ALPHA = new Complex128Array( 4 );
	const BETA = new Complex128Array( 4 );
	const DIF = new Float64Array( 2 );
	const SEL = new Uint8Array( [ 0, 1, 0, 1 ] );
	const WK = new Complex128Array( 64 );
	const IWK = new Int32Array( 64 );
	m[ 0 ] = 0;
	pl[ 0 ] = 1.0;
	pr[ 0 ] = 1.0;
	const r = ztgsen( 0, false, false, SEL, 1, 0, 4, ab.A, 1, 4, 0, ab.B, 1, 4, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 4, 0, Z, 1, 4, 0, m, pl, pr, DIF, 1, 0, WK, 1, 0, IWK, 1, 0 );
	assert.equal( r, tc.info, 'info' );
	assert.equal( m[ 0 ], tc.M, 'M' );
	assertArrayClose( Array.from( reinterpret( ab.A, 0 ) ), tc.A, tol, 'A' );
	assertArrayClose( Array.from( reinterpret( ab.B, 0 ) ), tc.B, tol, 'B' );
	assertArrayClose( Array.from( reinterpret( ALPHA, 0 ) ), tc.ALPHA, tol, 'ALPHA' );
	assertArrayClose( Array.from( reinterpret( BETA, 0 ) ), tc.BETA, tol, 'BETA' );
});

test( 'ztgsen: ijob=1 (PL/PR direct)', function t() {
	const m = new Int32Array( 1 );
	const pl = new Float64Array( 1 );
	const pr = new Float64Array( 1 );
	const tol = 1e-9;
	const tc = findCase( 'ijob=1 select=[T,F,T,F] wantq=T wantz=T N=4' );
	const ab = makeAB4();
	const Q = eye( 4 );
	const Z = eye( 4 );
	const ALPHA = new Complex128Array( 4 );
	const BETA = new Complex128Array( 4 );
	const DIF = new Float64Array( 2 );
	const SEL = new Uint8Array( [ 1, 0, 1, 0 ] );
	const WK = new Complex128Array( 256 );
	const IWK = new Int32Array( 256 );
	m[ 0 ] = 0;
	pl[ 0 ] = 1.0;
	pr[ 0 ] = 1.0;
	const r = ztgsen( 1, true, true, SEL, 1, 0, 4, ab.A, 1, 4, 0, ab.B, 1, 4, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 4, 0, Z, 1, 4, 0, m, pl, pr, DIF, 1, 0, WK, 1, 0, IWK, 1, 0 );
	assert.equal( r, 0, 'info' );
	assert.equal( m[ 0 ], 2, 'M' );
	assertClose( pl[ 0 ], tc.PL, tol, 'PL' );
	assertClose( pr[ 0 ], tc.PR, tol, 'PR' );
});

test( 'ztgsen: ijob=2 (DIF direct, partial select)', function t() {
	const m = new Int32Array( 1 );
	const pl = new Float64Array( 1 );
	const pr = new Float64Array( 1 );
	const tol = 1e-9;
	const tc = findCase( 'ijob=2 select=[T,F,T,F] wantq=T wantz=T N=4' );
	const ab = makeAB4();
	const Q = eye( 4 );
	const Z = eye( 4 );
	const ALPHA = new Complex128Array( 4 );
	const BETA = new Complex128Array( 4 );
	const DIF = new Float64Array( 2 );
	const SEL = new Uint8Array( [ 1, 0, 1, 0 ] );
	const WK = new Complex128Array( 256 );
	const IWK = new Int32Array( 256 );
	m[ 0 ] = 0;
	pl[ 0 ] = 1.0;
	pr[ 0 ] = 1.0;
	const r = ztgsen( 2, true, true, SEL, 1, 0, 4, ab.A, 1, 4, 0, ab.B, 1, 4, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 4, 0, Z, 1, 4, 0, m, pl, pr, DIF, 1, 0, WK, 1, 0, IWK, 1, 0 );
	assert.equal( r, 0, 'info' );
	assert.equal( m[ 0 ], 2, 'M' );
	assertClose( DIF[ 0 ], tc.DIF[ 0 ], tol, 'DIF[0]' );
	assertClose( DIF[ 1 ], tc.DIF[ 1 ], tol, 'DIF[1]' );
});

test( 'ztgsen: WORK and IWORK at exactly the reference minimum (NaN-poisoned) match an ample workspace; one less throws', function t() {
	// M = 2 of N = 4 selected (counted from SELECT; M itself is an output), so
	// M*(N-M) = 4. IJOB 1, 2, 4: WORK 2*M*(N-M)+1 = 9 (the reference's 8 plus
	// the 1 its ZTGSYL checks for), IWORK N+2 = 6. IJOB 3, 5: WORK
	// 4*M*(N-M) = 16, IWORK max(2*M*(N-M), N+2) = 8. IJOB 0: 1 and 1.
	const SEL = new Uint8Array( [ 1, 0, 1, 0 ] );
	const sizes = [ [ 0, 1, 1 ], [ 1, 9, 6 ], [ 2, 9, 6 ], [ 3, 16, 8 ], [ 4, 9, 6 ], [ 5, 16, 8 ] ];
	let ijob, lw, liw, ref, got, k;
	function call( job, lwork, liwork ) {
		const ab = makeAB4();
		const out = {
			'A': ab.A,
			'B': ab.B,
			'Q': eye( 4 ),
			'Z': eye( 4 ),
			'ALPHA': new Complex128Array( 4 ),
			'BETA': new Complex128Array( 4 ),
			'M': new Int32Array( 1 ),
			'pl': new Float64Array( 1 ),
			'pr': new Float64Array( 1 ),
			'DIF': new Float64Array( 2 )
		};
		const WK = new Complex128Array( lwork );
		reinterpret( WK, 0 ).fill( NaN );
		const IWK = new Int32Array( liwork ).fill( -999 );
		out.info = ztgsen( job, true, true, SEL, 1, 0, 4, out.A, 1, 4, 0, out.B, 1, 4, 0, out.ALPHA, 1, 0, out.BETA, 1, 0, out.Q, 1, 4, 0, out.Z, 1, 4, 0, out.M, out.pl, out.pr, out.DIF, 1, 0, WK, 1, 0, IWK, 1, 0 );
		return out;
	}
	for ( k = 0; k < sizes.length; k++ ) {
		ijob = sizes[ k ][ 0 ];
		lw = sizes[ k ][ 1 ];
		liw = sizes[ k ][ 2 ];
		assert.throws( function small() {
			call( ijob, lw - 1, liw );
		}, RangeError, 'ijob=' + ijob + ': WORK of ' + ( lw - 1 ) );
		assert.throws( function smallI() {
			call( ijob, lw, liw - 1 );
		}, RangeError, 'ijob=' + ijob + ': IWORK of ' + ( liw - 1 ) );
		ref = call( ijob, 256, 256 );
		got = call( ijob, lw, liw );
		assert.equal( got.info, ref.info, 'ijob=' + ijob + ': info' );
		assert.equal( got.M[ 0 ], ref.M[ 0 ], 'ijob=' + ijob + ': M' );
		assert.deepEqual( reinterpret( got.A, 0 ), reinterpret( ref.A, 0 ), 'ijob=' + ijob + ': A' );
		assert.deepEqual( reinterpret( got.B, 0 ), reinterpret( ref.B, 0 ), 'ijob=' + ijob + ': B' );
		assert.deepEqual( reinterpret( got.Q, 0 ), reinterpret( ref.Q, 0 ), 'ijob=' + ijob + ': Q' );
		assert.deepEqual( reinterpret( got.Z, 0 ), reinterpret( ref.Z, 0 ), 'ijob=' + ijob + ': Z' );
		assert.deepEqual( got.pl, ref.pl, 'ijob=' + ijob + ': pl' );
		assert.deepEqual( got.pr, ref.pr, 'ijob=' + ijob + ': pr' );
		assert.deepEqual( got.DIF, ref.DIF, 'ijob=' + ijob + ': DIF' );
		assert.ok( !Number.isNaN( got.DIF[ 0 ] ) && !Number.isNaN( got.pl[ 0 ] ), 'ijob=' + ijob + ': finite' );
	}
});

test( 'ztgsen: with nothing selected the reference still requires WORK >= 1 and IWORK >= N+2 (IJOB 1)', function t() {
	const SEL = new Uint8Array( 4 );
	function call( lwork, liwork ) {
		const ab = makeAB4();
		return ztgsen( 1, true, true, SEL, 1, 0, 4, ab.A, 1, 4, 0, ab.B, 1, 4, 0, new Complex128Array( 4 ), 1, 0, new Complex128Array( 4 ), 1, 0, eye( 4 ), 1, 4, 0, eye( 4 ), 1, 4, 0, new Int32Array( 1 ), new Float64Array( 1 ), new Float64Array( 1 ), new Float64Array( 2 ), 1, 0, new Complex128Array( lwork ), 1, 0, new Int32Array( liwork ), 1, 0 );
	}
	assert.throws( function small() {
		call( 1, 5 );
	}, RangeError );
	assert.throws( function smallW() {
		call( 0, 6 );
	}, RangeError );
	assert.equal( call( 1, 6 ), 0, 'at the minimum' );
});

test( 'ztgsen: ijob=3 (DIF estimated)', function t() {
	const m = new Int32Array( 1 );
	const pl = new Float64Array( 1 );
	const pr = new Float64Array( 1 );
	const tol = 1e-9;
	const tc = findCase( 'ijob=3 select=[T,F,T,F] wantq=T wantz=T N=4' );
	const ab = makeAB4();
	const Q = eye( 4 );
	const Z = eye( 4 );
	const ALPHA = new Complex128Array( 4 );
	const BETA = new Complex128Array( 4 );
	const DIF = new Float64Array( 2 );
	const SEL = new Uint8Array( [ 1, 0, 1, 0 ] );
	const WK = new Complex128Array( 256 );
	const IWK = new Int32Array( 256 );
	m[ 0 ] = 0;
	pl[ 0 ] = 1.0;
	pr[ 0 ] = 1.0;
	const r = ztgsen( 3, true, true, SEL, 1, 0, 4, ab.A, 1, 4, 0, ab.B, 1, 4, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 4, 0, Z, 1, 4, 0, m, pl, pr, DIF, 1, 0, WK, 1, 0, IWK, 1, 0 );
	assert.equal( r, 0, 'info' );
	assert.equal( m[ 0 ], 2, 'M' );
	assertClose( DIF[ 0 ], tc.DIF[ 0 ], tol, 'DIF[0]' );
	assertClose( DIF[ 1 ], tc.DIF[ 1 ], tol, 'DIF[1]' );
});

test( 'ztgsen: ijob=4 (PL/PR + DIF direct)', function t() {
	const m = new Int32Array( 1 );
	const pl = new Float64Array( 1 );
	const pr = new Float64Array( 1 );
	const tol = 1e-9;
	const tc = findCase( 'ijob=4 select=[T,F,T,F] wantq=T wantz=T N=4' );
	const ab = makeAB4();
	const Q = eye( 4 );
	const Z = eye( 4 );
	const ALPHA = new Complex128Array( 4 );
	const BETA = new Complex128Array( 4 );
	const DIF = new Float64Array( 2 );
	const SEL = new Uint8Array( [ 1, 0, 1, 0 ] );
	const WK = new Complex128Array( 256 );
	const IWK = new Int32Array( 256 );
	m[ 0 ] = 0;
	pl[ 0 ] = 1.0;
	pr[ 0 ] = 1.0;
	const r = ztgsen( 4, true, true, SEL, 1, 0, 4, ab.A, 1, 4, 0, ab.B, 1, 4, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 4, 0, Z, 1, 4, 0, m, pl, pr, DIF, 1, 0, WK, 1, 0, IWK, 1, 0 );
	assert.equal( r, 0, 'info' );
	assert.equal( m[ 0 ], 2, 'M' );
	assertClose( pl[ 0 ], tc.PL, tol, 'PL' );
	assertClose( pr[ 0 ], tc.PR, tol, 'PR' );
	assertClose( DIF[ 0 ], tc.DIF[ 0 ], tol, 'DIF[0]' );
	assertClose( DIF[ 1 ], tc.DIF[ 1 ], tol, 'DIF[1]' );
});

test( 'ztgsen: ijob=5 (PL/PR + DIF estimated)', function t() {
	const m = new Int32Array( 1 );
	const pl = new Float64Array( 1 );
	const pr = new Float64Array( 1 );
	const tol = 1e-9;
	const tc = findCase( 'ijob=5 select=[T,F,T,F] wantq=T wantz=T N=4' );
	const ab = makeAB4();
	const Q = eye( 4 );
	const Z = eye( 4 );
	const ALPHA = new Complex128Array( 4 );
	const BETA = new Complex128Array( 4 );
	const DIF = new Float64Array( 2 );
	const SEL = new Uint8Array( [ 1, 0, 1, 0 ] );
	const WK = new Complex128Array( 256 );
	const IWK = new Int32Array( 256 );
	m[ 0 ] = 0;
	pl[ 0 ] = 1.0;
	pr[ 0 ] = 1.0;
	const r = ztgsen( 5, true, true, SEL, 1, 0, 4, ab.A, 1, 4, 0, ab.B, 1, 4, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 4, 0, Z, 1, 4, 0, m, pl, pr, DIF, 1, 0, WK, 1, 0, IWK, 1, 0 );
	assert.equal( r, 0, 'info' );
	assert.equal( m[ 0 ], 2, 'M' );
	assertClose( pl[ 0 ], tc.PL, tol, 'PL' );
	assertClose( pr[ 0 ], tc.PR, tol, 'PR' );
	assertClose( DIF[ 0 ], tc.DIF[ 0 ], tol, 'DIF[0]' );
	assertClose( DIF[ 1 ], tc.DIF[ 1 ], tol, 'DIF[1]' );
});

test( 'ztgsen: ijob=2 all-selected (M=N path with DIF)', function t() {
	const m = new Int32Array( 1 );
	const pl = new Float64Array( 1 );
	const pr = new Float64Array( 1 );
	const tol = 1e-9;
	const tc = findCase( 'ijob=2 select=[T,T,T] wantq=T wantz=T N=3 allsel' );
	const ab = makeAB3();
	const Q = eye( 3 );
	const Z = eye( 3 );
	const ALPHA = new Complex128Array( 3 );
	const BETA = new Complex128Array( 3 );
	const DIF = new Float64Array( 2 );
	const SEL = new Uint8Array( [ 1, 1, 1 ] );
	const WK = new Complex128Array( 64 );
	const IWK = new Int32Array( 64 );
	m[ 0 ] = 0;
	pl[ 0 ] = 1.0;
	pr[ 0 ] = 1.0;
	const r = ztgsen( 2, true, true, SEL, 1, 0, 3, ab.A, 1, 3, 0, ab.B, 1, 3, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 3, 0, Z, 1, 3, 0, m, pl, pr, DIF, 1, 0, WK, 1, 0, IWK, 1, 0 );
	assert.equal( r, 0, 'info' );
	assert.equal( m[ 0 ], 3, 'M' );
	assertClose( DIF[ 0 ], tc.DIF[ 0 ], tol, 'DIF[0]' );
	assertClose( DIF[ 1 ], tc.DIF[ 1 ], tol, 'DIF[1]' );
});

test( 'ztgsen: ijob=1 none-selected (M=0 path with PL/PR)', function t() {
	const m = new Int32Array( 1 );
	const pl = new Float64Array( 1 );
	const pr = new Float64Array( 1 );
	const tol = 1e-9;
	const tc = findCase( 'ijob=1 select=[F,F,F] wantq=T wantz=T N=3 nonesel' );
	const ab = makeAB3();
	const Q = eye( 3 );
	const Z = eye( 3 );
	const ALPHA = new Complex128Array( 3 );
	const BETA = new Complex128Array( 3 );
	const DIF = new Float64Array( 2 );
	const SEL = new Uint8Array( [ 0, 0, 0 ] );
	const WK = new Complex128Array( 64 );
	const IWK = new Int32Array( 64 );
	m[ 0 ] = 0;
	pl[ 0 ] = 1.0;
	pr[ 0 ] = 1.0;
	const r = ztgsen( 1, true, true, SEL, 1, 0, 3, ab.A, 1, 3, 0, ab.B, 1, 3, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 3, 0, Z, 1, 3, 0, m, pl, pr, DIF, 1, 0, WK, 1, 0, IWK, 1, 0 );
	assert.equal( r, 0, 'info' );
	assert.equal( m[ 0 ], 0, 'M' );
	assertClose( pl[ 0 ], tc.PL, tol, 'PL' );
	assertClose( pr[ 0 ], tc.PR, tol, 'PR' );
});

test( 'ztgsen: N=1 trivial', function t() {
	const m = new Int32Array( 1 );
	const pl = new Float64Array( 1 );
	const pr = new Float64Array( 1 );
	const tol = 1e-9;
	const tc = findCase( 'ijob=0 N=1 select=[T]' );
	const A = new Complex128Array( 1 );
	const B = new Complex128Array( 1 );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	Av[ 0 ] = 5.0; Av[ 1 ] = 3.0;
	Bv[ 0 ] = 2.0; Bv[ 1 ] = 1.0;
	const Q = eye( 1 );
	const Z = eye( 1 );
	const ALPHA = new Complex128Array( 1 );
	const BETA = new Complex128Array( 1 );
	const DIF = new Float64Array( 2 );
	const SEL = new Uint8Array( [ 1 ] );
	const WK = new Complex128Array( 4 );
	const IWK = new Int32Array( 4 );
	m[ 0 ] = 0;
	pl[ 0 ] = 1.0;
	pr[ 0 ] = 1.0;
	const r = ztgsen( 0, true, true, SEL, 1, 0, 1, A, 1, 1, 0, B, 1, 1, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 1, 0, Z, 1, 1, 0, m, pl, pr, DIF, 1, 0, WK, 1, 0, IWK, 1, 0 );
	assert.equal( r, 0, 'info' );
	assert.equal( m[ 0 ], 1, 'M' );
	assertArrayClose( Array.from( reinterpret( ALPHA, 0 ) ), tc.ALPHA, tol, 'ALPHA' );
	assertArrayClose( Array.from( reinterpret( BETA, 0 ) ), tc.BETA, tol, 'BETA' );
});

test( 'ztgsen: N=0 (degenerate)', function t() {
	const m = new Int32Array( 1 );
	const pl = new Float64Array( 1 );
	const pr = new Float64Array( 1 );
	const Q = new Complex128Array( 1 );
	const Z = new Complex128Array( 1 );
	const ALPHA = new Complex128Array( 1 );
	const BETA = new Complex128Array( 1 );
	const DIF = new Float64Array( 2 );
	const SEL = new Uint8Array( 0 );
	const WK = new Complex128Array( 1 );
	const IWK = new Int32Array( 1 );
	const A = new Complex128Array( 0 );
	const B = new Complex128Array( 0 );
	m[ 0 ] = 0;
	pl[ 0 ] = 1.0;
	pr[ 0 ] = 1.0;
	const r = ztgsen( 0, true, true, SEL, 1, 0, 0, A, 1, 1, 0, B, 1, 1, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 1, 0, Z, 1, 1, 0, m, pl, pr, DIF, 1, 0, WK, 1, 0, IWK, 1, 0 );
	assert.equal( r, 0, 'info' );
	assert.equal( m[ 0 ], 0, 'M' );
});

test( 'ztgsen: ijob=3 DIF(2) uses the scale from its own ztgsyl solves (near-underflow pencil)', function t() {
	// Two metamorphic properties of the Difl estimate DIF(2), checked on a pencil scaled by s=2^-968 so that ztgsyl's overflow guard returns SCALE < 1:
	//   (a) homogeneity: DIF(2) of (s*A, s*B) equals s times DIF(2) of (A, B);
	//   (b) block swap: DIF(2) of the pencil with diagonal blocks (A11, A22) equals DIF(1) of the pencil with (A22, A11). The B diagonal blocks are equal because the reference transposed Difl solve passes B11, B22 in the DIF(1) order.
	// DIF(2) = SCALE / estimate must use the SCALE of the last DIF(2) solve, not the one left over from the DIF(1) loop.
	const s = Math.pow( 2.0, -968 );
	const A11 = [ [ 1.0, 0.0 ], [ 0.5, 0.5 ], [ 2.0, 0.0 ] ];
	const A22 = [ [ 4.0, 1.0 ], [ 0.25, 0.0 ], [ -1.0, 2.0 ] ];
	const Bd = [ [ 1.0, 0.0 ], [ 0.5, 0.25 ], [ 1.0, 0.0 ] ];
	const base = difs( A11, A22, 1.0 );
	const P = difs( A11, A22, s );
	const swapped = difs( A22, A11, s );
	assertClose( P[ 1 ] / s, base[ 1 ], 1e-12, 'DIF(2) homogeneity' );
	assertClose( P[ 1 ] / s, swapped[ 0 ] / s, 1e-12, 'DIF(2) equals DIF(1) of block-swapped pencil' );

	function difs( D1, D2, scl ) {
		const M = new Int32Array( 1 );
		const N = 4;
		const A = new Complex128Array( N * N );
		const B = new Complex128Array( N * N );
		const Av = reinterpret( A, 0 );
		const Bv = reinterpret( B, 0 );
		const DIF = new Float64Array( 2 );
		let r;
		put( Av, 0, D1 );
		put( Av, 2, D2 );
		put( Bv, 0, Bd );
		put( Bv, 2, Bd );
		r = ztgsen( 3, false, false, new Uint8Array( [ 1, 1, 0, 0 ] ), 1, 0, N, A, 1, N, 0, B, 1, N, 0, new Complex128Array( N ), 1, 0, new Complex128Array( N ), 1, 0, new Complex128Array( N * N ), 1, N, 0, new Complex128Array( N * N ), 1, N, 0, M, new Float64Array( 1 ), new Float64Array( 1 ), DIF, 1, 0, new Complex128Array( 64 ), 1, 0, new Int32Array( 64 ), 1, 0 );
		assert.equal( r, 0, 'info' );
		assert.equal( M[ 0 ], 2, 'M' );
		return DIF;

		// Writes an upper-triangular 2x2 block [d00, d01; 0, d11] at diagonal offset o (column-major, N=4):
		function put( v, o, D ) {
			v[ 2 * ( o + ( o * N ) ) ] = D[ 0 ][ 0 ] * scl;
			v[ ( 2 * ( o + ( o * N ) ) ) + 1 ] = D[ 0 ][ 1 ] * scl;
			v[ 2 * ( o + ( ( o + 1 ) * N ) ) ] = D[ 1 ][ 0 ] * scl;
			v[ ( 2 * ( o + ( ( o + 1 ) * N ) ) ) + 1 ] = D[ 1 ][ 1 ] * scl;
			v[ 2 * ( o + 1 + ( ( o + 1 ) * N ) ) ] = D[ 2 ][ 0 ] * scl;
			v[ ( 2 * ( o + 1 + ( ( o + 1 ) * N ) ) ) + 1 ] = D[ 2 ][ 1 ] * scl;
		}
	}
});

test( 'ztgsen: a subnormal B(k,k) is below SAFMIN and is set to zero, not normalized (ticket 0089)', function t() {
	// Reference (ZTGSEN label 60 loop): DSCALE = ABS(B(K,K)); IF( DSCALE.GT.SAFMIN ) normalize B(K,K) to DSCALE and scale row K of A (and column K of Q) by its phase, ELSE B(K,K) = 0. SAFMIN = DLAMCH('S') = 2^-1022 = 2.2250738585072014e-308, so B(2,2) = -1e-310 (subnormal) takes the ELSE branch: BETA(2) = 0, ALPHA(2) = A(2,2) unchanged, Q(:,2) unchanged. With SAFMIN = 0 it would instead give BETA(2) = 1e-310, ALPHA(2) = -A(2,2), Q(:,2) = -e2.
	const m = new Int32Array( 1 );
	const pl = new Float64Array( 1 );
	const pr = new Float64Array( 1 );
	const A = new Complex128Array( 4 );
	const B = new Complex128Array( 4 );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	Av[ 0 ] = 1.0; Av[ 1 ] = 0.0;
	Av[ 4 ] = 0.5; Av[ 5 ] = 0.25;
	Av[ 6 ] = 3.0; Av[ 7 ] = 2.0;
	Bv[ 0 ] = 2.0; Bv[ 1 ] = 0.0;
	Bv[ 4 ] = 0.1; Bv[ 5 ] = 0.0;
	Bv[ 6 ] = -1e-310; Bv[ 7 ] = 0.0;
	const Q = eye( 2 );
	const Z = eye( 2 );
	const ALPHA = new Complex128Array( 2 );
	const BETA = new Complex128Array( 2 );
	const DIF = new Float64Array( 2 );
	const SEL = new Uint8Array( [ 1, 0 ] );
	const WK = new Complex128Array( 16 );
	const IWK = new Int32Array( 16 );
	const r = ztgsen( 0, true, true, SEL, 1, 0, 2, A, 1, 2, 0, B, 1, 2, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 2, 0, Z, 1, 2, 0, m, pl, pr, DIF, 1, 0, WK, 1, 0, IWK, 1, 0 );
	assert.equal( r, 0, 'info' );
	assert.equal( m[ 0 ], 1, 'M' );
	assert.deepEqual( Array.from( reinterpret( BETA, 0 ) ), [ 2.0, 0.0, 0.0, 0.0 ], 'BETA' );
	assert.deepEqual( Array.from( reinterpret( ALPHA, 0 ) ), [ 1.0, 0.0, 3.0, 2.0 ], 'ALPHA' );
	assert.deepEqual( Array.from( reinterpret( B, 0 ) ).slice( 6 ), [ 0.0, 0.0 ], 'B(2,2)' );
	assert.deepEqual( Array.from( reinterpret( Q, 0 ) ), [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ], 'Q' );
});
