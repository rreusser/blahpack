// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhseqr from './../lib/ndarray.js';

// FIXTURES //

import n_eq_0 from './fixtures/n_eq_0.json' with { type: 'json' };
import n_eq_1_eig_n from './fixtures/n_eq_1_eig_n.json' with { type: 'json' };
import n_eq_1_schur_i from './fixtures/n_eq_1_schur_i.json' with { type: 'json' };
import _4x4_eig_n from './fixtures/4x4_eig_n.json' with { type: 'json' };
import _4x4_schur_i from './fixtures/4x4_schur_i.json' with { type: 'json' };
import _4x4_schur_v from './fixtures/4x4_schur_v.json' with { type: 'json' };
import _6x6_schur_i from './fixtures/6x6_schur_i.json' with { type: 'json' };
import _6x6_eig_n from './fixtures/6x6_eig_n.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function makeMatrix( N ) {
	return {
		data: new Complex128Array( N * N ),
		s1: 1,
		s2: N,
		offset: 0
	};
}

function mset( m, N, i, j, re, im ) {
	const mv = reinterpret( m.data, 0 );
	const idx = ( m.offset + i * m.s1 + j * m.s2 ) * 2;
	mv[ idx ] = re;
	mv[ idx + 1 ] = im;
}

function getFlat( m ) {
	return Array.from( reinterpret( m.data, 0 ) );
}

/**
* Verify that H is upper triangular (all subdiagonal entries are zero).
* For Schur form, only H(i+1,i) needs to be zero for all i.
*/
function assertUpperTriangular( Hm, n, tol, msg ) {
	const Hv = reinterpret( Hm.data, 0 );
	let i, j, idx, re, im;
	for ( j = 0; j < n; j++ ) {
		for ( i = j + 2; i < n; i++ ) {
			idx = ( Hm.offset + i * Hm.s1 + j * Hm.s2 ) * 2;
			re = Hv[ idx ];
			im = Hv[ idx + 1 ];
			assert.ok( Math.abs( re ) + Math.abs( im ) <= tol,
				msg + ': H(' + ( i + 1 ) + ',' + ( j + 1 ) + ') = (' + re + ',' + im + ') should be zero' );
		}
	}
}

/**
* Verify that eigenvalues match (sorted by real part, then imaginary).
*/
function assertEigenvaluesMatch( actual, expected, tol, msg ) {
	const act = [];
	const exp = [];
	let i;
	for ( i = 0; i < actual.length; i += 2 ) {
		act.push( [ actual[ i ], actual[ i + 1 ] ] );
		exp.push( [ expected[ i ], expected[ i + 1 ] ] );
	}
	function cmp( a, b ) {
		if ( Math.abs( a[ 0 ] - b[ 0 ] ) > 1e-8 ) { return a[ 0 ] - b[ 0 ]; }
		return a[ 1 ] - b[ 1 ];
	}
	act.sort( cmp );
	exp.sort( cmp );
	for ( i = 0; i < act.length; i++ ) {
		assertClose( act[ i ][ 0 ], exp[ i ][ 0 ], tol, msg + '[' + i + '].re' );
		assertClose( act[ i ][ 1 ], exp[ i ][ 1 ], tol, msg + '[' + i + '].im' );
	}
}

function buildHess4( Hm ) {
	const n = 4;
	mset( Hm, n, 0, 0, 4.0, 1.0 );
	mset( Hm, n, 0, 1, 2.0, -1.0 );
	mset( Hm, n, 0, 2, 1.0, 0.5 );
	mset( Hm, n, 0, 3, 0.5, 0.0 );
	mset( Hm, n, 1, 0, 1.0, 0.0 );
	mset( Hm, n, 1, 1, 3.0, -0.5 );
	mset( Hm, n, 1, 2, 1.5, 1.0 );
	mset( Hm, n, 1, 3, 1.0, -0.5 );
	mset( Hm, n, 2, 1, 0.5, 0.25 );
	mset( Hm, n, 2, 2, 2.0, 0.0 );
	mset( Hm, n, 2, 3, 2.0, 1.0 );
	mset( Hm, n, 3, 2, 0.25, -0.1 );
	mset( Hm, n, 3, 3, 1.0, 0.5 );
}

function buildHess6( Hm ) {
	const n = 6;
	mset( Hm, n, 0, 0, 6.0, 1.0 );
	mset( Hm, n, 0, 1, 1.0, -0.5 );
	mset( Hm, n, 0, 2, 0.5, 0.0 );
	mset( Hm, n, 0, 3, 0.25, 0.1 );
	mset( Hm, n, 0, 4, 0.1, 0.0 );
	mset( Hm, n, 0, 5, 0.05, -0.05 );
	mset( Hm, n, 1, 0, 1.0, 0.0 );
	mset( Hm, n, 1, 1, 5.0, -1.0 );
	mset( Hm, n, 1, 2, 1.0, 0.5 );
	mset( Hm, n, 1, 3, 0.5, 0.0 );
	mset( Hm, n, 1, 4, 0.25, -0.1 );
	mset( Hm, n, 1, 5, 0.1, 0.0 );
	mset( Hm, n, 2, 1, 0.8, 0.2 );
	mset( Hm, n, 2, 2, 4.0, 0.5 );
	mset( Hm, n, 2, 3, 1.0, -0.5 );
	mset( Hm, n, 2, 4, 0.5, 0.0 );
	mset( Hm, n, 2, 5, 0.25, 0.1 );
	mset( Hm, n, 3, 2, 0.6, -0.1 );
	mset( Hm, n, 3, 3, 3.0, -0.5 );
	mset( Hm, n, 3, 4, 1.0, 0.5 );
	mset( Hm, n, 3, 5, 0.5, 0.0 );
	mset( Hm, n, 4, 3, 0.4, 0.15 );
	mset( Hm, n, 4, 4, 2.0, 0.0 );
	mset( Hm, n, 4, 5, 1.0, -0.5 );
	mset( Hm, n, 5, 4, 0.2, -0.1 );
	mset( Hm, n, 5, 5, 1.0, 1.0 );
}

// TESTS //

test( 'zhseqr: main export is a function', function t() {
	assert.strictEqual( typeof zhseqr, 'function' );
});

test( 'zhseqr: n_eq_0', function t() {
	const tc = n_eq_0;
	const H = new Complex128Array( 0 );
	const Z = new Complex128Array( 0 );
	const W = new Complex128Array( 0 );
	const WORK = new Complex128Array( 1 );

	const info = zhseqr( 'eigenvalues', 'none', 0, 1, 0,
		H, 1, 0, 0,
		W, 1, 0,
		Z, 1, 0, 0,
		WORK, 1, 0
	);
	assert.equal( info, tc.info );
});

test( 'zhseqr: N=1, JOB=E, COMPZ=N', function t() {
	const tc = n_eq_1_eig_n;
	const n = 1;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( 1 );

	mset( Hm, n, 0, 0, 7.0, -3.0 );

	const info = zhseqr( 'eigenvalues', 'none', n, 1, 1,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-13, 'w' );
});

test( 'zhseqr: N=1, JOB=S, COMPZ=I', function t() {
	const tc = n_eq_1_schur_i;
	const n = 1;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( 1 );

	mset( Hm, n, 0, 0, 7.0, -3.0 );

	const info = zhseqr( 'schur', 'initialize', n, 1, 1,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-13, 'w' );
	assertArrayClose( getFlat( Hm ), tc.H, 1e-13, 'H' );
	assertArrayClose( getFlat( Zm ), tc.Z, 1e-13, 'Z' );
});

test( 'zhseqr: 4x4, JOB=E, COMPZ=N', function t() {
	const tc = _4x4_eig_n;
	const n = 4;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );

	buildHess4( Hm );

	const info = zhseqr( 'eigenvalues', 'none', n, 1, 4,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-10, 'w' );
});

test( 'zhseqr: 4x4, JOB=S, COMPZ=I', function t() {
	const tc = _4x4_schur_i;
	const n = 4;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );

	buildHess4( Hm );

	const info = zhseqr( 'schur', 'initialize', n, 1, 4,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertEigenvaluesMatch( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-10, 'w' );
	assertUpperTriangular( Hm, n, 1e-10, 'H' );
});

test( 'zhseqr: 4x4, JOB=S, COMPZ=V', function t() {
	const tc = _4x4_schur_v;
	const n = 4;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );
	let i;

	buildHess4( Hm );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	const info = zhseqr( 'schur', 'update', n, 1, 4,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertEigenvaluesMatch( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-10, 'w' );
	assertUpperTriangular( Hm, n, 1e-10, 'H' );
});

test( 'zhseqr: 6x6, JOB=S, COMPZ=I', function t() {
	const tc = _6x6_schur_i;
	const n = 6;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );

	buildHess6( Hm );

	const info = zhseqr( 'schur', 'initialize', n, 1, 6,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertEigenvaluesMatch( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-10, 'w' );
	assertUpperTriangular( Hm, n, 1e-10, 'H' );
});

test( 'zhseqr: 6x6, JOB=E, COMPZ=N', function t() {
	const tc = _6x6_eig_n;
	const n = 6;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );

	buildHess6( Hm );

	const info = zhseqr( 'eigenvalues', 'none', n, 1, 6,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-10, 'w' );
});

// Regression: the large-N path (N > NMIN=75) dispatches to zlaqr0/zlaqr3.
// A triangular matrix (zero subdiagonal) is already in Schur form, so its
// eigenvalues are exactly its diagonal. This exercises the aggressive
// early-deflation window whose top 1x1 block (ktop===kbot===ilo===1) once read
// an out-of-bounds subdiagonal and produced info=1 / NaN. See
// test/harness/LEARNINGS.md (2026-07-19 zlaqr3 spike-read fix).
test( 'zhseqr: large-N (N=90) upper-triangular exercises zlaqr0 deflation path', function t() {
	const n = 90;
	const H = new Complex128Array( n * n );
	const Hv = reinterpret( H, 0 );
	const diag = [];

	// Column-major strictly-upper-triangular (subdiagonal all zero); fill with a
	// deterministic pattern and record the diagonal (the true spectrum).
	let seed = 1;
	function rnd() {
		seed = ( ( seed * 1103515245 ) + 12345 ) & 0x7fffffff;
		return ( ( seed / 0x7fffffff ) * 2.0 ) - 1.0;
	}
	for ( let j = 0; j < n; j++ ) {
		for ( let i = 0; i <= j; i++ ) {
			const re = rnd();
			const im = rnd();
			Hv[ ( i + ( j * n ) ) * 2 ] = re;
			Hv[ ( i + ( j * n ) ) * 2 + 1 ] = im;
			if ( i === j ) {
				diag.push( [ re, im ] );
			}
		}
	}

	const W = new Complex128Array( n );
	const Z = new Complex128Array( n * n );
	const WORK = new Complex128Array( n );
	const info = zhseqr( 'eigenvalues', 'none', n, 1, n,
		H, 1, n, 0,
		W, 1, 0,
		Z, 1, n, 0,
		WORK, 1, 0
	);
	assert.equal( info, 0, 'info === 0 (converged)' );

	// Eigenvalues (any order) must match the diagonal. Sort both by (re, im).
	const Wv = reinterpret( W, 0 );
	const got = [];
	for ( let i = 0; i < n; i++ ) {
		assert.ok( Number.isFinite( Wv[ i * 2 ] ) && Number.isFinite( Wv[ ( i * 2 ) + 1 ] ), 'finite eigenvalue' );
		got.push( [ Wv[ i * 2 ], Wv[ ( i * 2 ) + 1 ] ] );
	}
	function cmp( a, b ) {
		return ( a[ 0 ] - b[ 0 ] ) || ( a[ 1 ] - b[ 1 ] );
	}
	got.sort( cmp );
	diag.sort( cmp );
	for ( let i = 0; i < n; i++ ) {
		assert.ok( Math.hypot( got[ i ][ 0 ] - diag[ i ][ 0 ], got[ i ][ 1 ] - diag[ i ][ 1 ] ) < 1e-12, 'eigenvalue matches diagonal' );
	}
});

/**
* Builds an N-by-N column-major complex Hessenberg matrix whose leading 3-by-3 block contains a NaN (so `zlahqr` cannot converge on it) and whose trailing block is decoupled (`H(4,3) = 0`).
*
* For N = 5 the trailing 2-by-2 block is `[[4,1],[-2,4]]` (eigenvalues `4 +/- i*sqrt(2)`); otherwise it is `tri(1,4,1)` of order N-3 (eigenvalues `4 + 2*cos(k*pi/(N-2))`).
*
* @private
* @param {integer} n - order
* @returns {Object} matrix descriptor
*/
function nanLeadingBlock( n ) {
	const Hm = makeMatrix( n );
	let i;
	let j;

	mset( Hm, n, 0, 0, 1.0, 0.0 );
	mset( Hm, n, 1, 0, NaN, 0.0 );
	mset( Hm, n, 0, 1, 2.0, 0.0 );
	mset( Hm, n, 1, 1, 3.0, 0.0 );
	mset( Hm, n, 2, 1, 1.0, 0.0 );
	mset( Hm, n, 0, 2, 1.0, 0.0 );
	mset( Hm, n, 1, 2, 1.0, 0.0 );
	mset( Hm, n, 2, 2, 2.0, 0.0 );
	for ( j = 3; j < n; j++ ) {
		for ( i = 0; i < 3; i++ ) {
			mset( Hm, n, i, j, 1.0, 0.0 );
		}
	}
	if ( n === 5 ) {
		mset( Hm, n, 3, 3, 4.0, 0.0 );
		mset( Hm, n, 3, 4, 1.0, 0.0 );
		mset( Hm, n, 4, 3, -2.0, 0.0 );
		mset( Hm, n, 4, 4, 4.0, 0.0 );
		return Hm;
	}
	for ( i = 3; i < n; i++ ) {
		mset( Hm, n, i, i, 4.0, 0.0 );
		if ( i < n - 1 ) {
			mset( Hm, n, i, i + 1, 1.0, 0.0 );
			mset( Hm, n, i + 1, i, 1.0, 0.0 );
		}
	}
	return Hm;
}

test( 'zhseqr: zlahqr non-convergence falls back to zlaqr0 on an embedded NL-by-NL matrix (N < NL)', function t() {
	const n = 5;
	const Hm = nanLeadingBlock( n );
	const W = new Complex128Array( n );
	const Z = new Complex128Array( n * n );
	const WORK = new Complex128Array( n );

	const info = zhseqr( 'schur', 'initialize', n, 1, n, Hm.data, Hm.s1, Hm.s2, Hm.offset, W, 1, 0, Z, 1, n, 0, WORK, 1, 0 );

	// Reference LAPACK 3.12.0 returns INFO = 3: the NaN-contaminated leading 3-by-3 block cannot converge.
	assert.equal( info, 3, 'info' );

	// Eigenvalues INFO+1:IHI (the decoupled trailing block) were successfully computed:
	const Wv = reinterpret( W, 0 );
	assertEigenvaluesMatch( Array.from( Wv.slice( 6 ) ), [ 4.0, Math.SQRT2, 4.0, -Math.SQRT2 ], 1e-14, 'w' );

	// Entries below the first subdiagonal are cleaned up on exit:
	assertUpperTriangular( Hm, n, 0.0, 'H' );
});

test( 'zhseqr: zlahqr non-convergence falls back to zlaqr0 with the caller workspace (NL <= N <= NMIN)', function t() {
	const n = 50;
	const Hm = nanLeadingBlock( n );
	const W = new Complex128Array( n );
	const Z = new Complex128Array( n * n );
	const WORK = new Complex128Array( n * n );
	const expected = [];
	let k;

	const info = zhseqr( 'eigenvalues', 'none', n, 1, n, Hm.data, Hm.s1, Hm.s2, Hm.offset, W, 1, 0, Z, 1, n, 0, WORK, 1, 0 );

	// Reference LAPACK 3.12.0 returns INFO = 3:
	assert.equal( info, 3, 'info' );

	// Converged eigenvalues are those of tri(1,4,1) of order N-3 (real):
	for ( k = 1; k <= n - 3; k++ ) {
		expected.push( 4.0 + ( 2.0 * Math.cos( k * Math.PI / ( n - 2 ) ) ), 0.0 );
	}
	assertEigenvaluesMatch( Array.from( reinterpret( W, 0 ).slice( 6 ) ), expected, 1e-12, 'w' );
});

test( 'zhseqr: partial active block (ilo=2, ihi=3) reads off the outer eigenvalues from the diagonal', function t() {
	const n = 4;
	const Hm = makeMatrix( n );
	const W = new Complex128Array( n );
	const Z = new Complex128Array( n * n );
	const WORK = new Complex128Array( n );
	let disc;
	let tr;
	let dt;
	let sq;
	let r;

	buildHess4( Hm );

	// Decouple rows/columns 1 and 4 so that H(1,1) and H(4,4) are eigenvalues:
	mset( Hm, n, 1, 0, 0.0, 0.0 );
	mset( Hm, n, 3, 2, 0.0, 0.0 );

	const info = zhseqr( 'schur', 'initialize', n, 2, 3, Hm.data, Hm.s1, Hm.s2, Hm.offset, W, 1, 0, Z, 1, n, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );

	const Wv = reinterpret( W, 0 );
	assert.equal( Wv[ 0 ], 4.0, 'w[0].re = H(1,1)' );
	assert.equal( Wv[ 1 ], 1.0, 'w[0].im = H(1,1)' );
	assert.equal( Wv[ 6 ], 1.0, 'w[3].re = H(4,4)' );
	assert.equal( Wv[ 7 ], 0.5, 'w[3].im = H(4,4)' );

	// The middle eigenvalues are the roots of the 2-by-2 block [[3-0.5i, 1.5+i],[0.5+0.25i, 2]]:
	// lambda = ( tr +/- sqrt( tr^2 - 4*det ) ) / 2
	tr = [ 5.0, -0.5 ];
	dt = [ ( 3.0 * 2.0 ) - ( ( 1.5 * 0.5 ) - ( 1.0 * 0.25 ) ), ( -0.5 * 2.0 ) - ( ( 1.5 * 0.25 ) + ( 1.0 * 0.5 ) ) ];
	disc = [ ( ( tr[ 0 ] * tr[ 0 ] ) - ( tr[ 1 ] * tr[ 1 ] ) ) - ( 4.0 * dt[ 0 ] ), ( 2.0 * tr[ 0 ] * tr[ 1 ] ) - ( 4.0 * dt[ 1 ] ) ];
	r = Math.hypot( disc[ 0 ], disc[ 1 ] );
	sq = [ Math.sqrt( ( r + disc[ 0 ] ) / 2.0 ), Math.sign( disc[ 1 ] ) * Math.sqrt( ( r - disc[ 0 ] ) / 2.0 ) ];
	assertEigenvaluesMatch( Array.from( Wv.slice( 2, 6 ) ), [ ( tr[ 0 ] + sq[ 0 ] ) / 2.0, ( tr[ 1 ] + sq[ 1 ] ) / 2.0, ( tr[ 0 ] - sq[ 0 ] ) / 2.0, ( tr[ 1 ] - sq[ 1 ] ) / 2.0 ], 1e-13, 'w[1:3]' );

	// Schur form of the active block: H(3,2) is zero and the diagonal holds the eigenvalues.
	const Hv = reinterpret( Hm.data, 0 );
	assert.equal( Hv[ ( 2 + n ) * 2 ], 0.0, 'H(3,2).re' );
	assert.equal( Hv[ ( ( 2 + n ) * 2 ) + 1 ], 0.0, 'H(3,2).im' );
	assert.equal( Hv[ ( 1 + n ) * 2 ], Wv[ 2 ], 'H(2,2).re = w[1].re' );
	assert.equal( Hv[ ( ( 2 + ( 2 * n ) ) * 2 ) ], Wv[ 4 ], 'H(3,3).re = w[2].re' );
});

test( 'zhseqr: minimum WORK covers zlaqr0\'s blocked AED path (33*JW+2080 for a reachable window JW > 32, ticket 0096)', function t() {
	let r;
	function cyclic( N ) {
		// Cyclic shift: eigenvalues are the N-th roots of unity, so AED stalls and the window grows past 32 with many undeflated shifts.
		const H = new Complex128Array( N * N );
		const h = reinterpret( H, 0 );
		let i;
		for ( i = 1; i < N; i++ ) {
			h[ 2 * ( i + ( ( i - 1 ) * N ) ) ] = 1.0;
		}
		h[ 2 * ( N - 1 ) * N ] = 1.0;
		return H;
	}
	function run( N, lwork, zero ) {
		const H = ( zero ) ? new Complex128Array( N * N ) : cyclic( N );
		const Z = new Complex128Array( N * N );
		const W = new Complex128Array( N );
		const info = zhseqr( 'schur', 'initialize', N, 1, N, H, 1, N, 0, W, 1, 0, Z, 1, N, 0, new Complex128Array( lwork ), 1, 0 );
		return [ info, Array.from( reinterpret( W, 0 ) ), Array.from( reinterpret( H, 0 ) ), Array.from( reinterpret( Z, 0 ) ) ];
	}
	const N = 120; // N > NMIN = 75 hands WORK to zlaqr0, whose window reaches JW >= 34 with >= 34 undeflated shifts
	r = run( N, 3367 ); // 33*floor((N-1)/3) + 2080
	assert.equal( r[ 0 ], 0, 'info' );
	assert.ok( r[ 1 ].every( Number.isFinite ), 'finite eigenvalues' );
	assert.deepEqual( r, run( N, 100 * N ) );

	// (H = 0 below, so that on the old code the accepted call returns at once.)
	// The old minimum `max(1,N)` was accepted, overran WORK in zlaqr3 and returned info = 117 with NaN eigenvalues after ~90 s:
	assert.throws( function throws() {
		run( N, N, true );
	}, /WORK array must have at least 3367 elements/ );
	assert.throws( function throws() {
		run( N, 3366, true );
	}, RangeError );

	assert.throws( function throws() {
		zhseqr( 'eigenvalues', 'none', 4, 1, 4, new Complex128Array( 16 ), 1, 4, 0, new Complex128Array( 4 ), 1, 0, new Complex128Array( 1 ), 1, 1, 0, null, 1, 0 );
	}, /at least 4 elements from offset 0. Provided length: 0/ );

	// A narrow active block keeps the window small, so max(1,N) suffices there:
	assert.equal( zhseqr( 'eigenvalues', 'none', N, 1, 30, new Complex128Array( N * N ), 1, N, 0, new Complex128Array( N ), 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( N ), 1, 0 ), 0 );
});
