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
import _40x40_random_schur from './fixtures/40x40_random_schur.json' with { type: 'json' };
import _100x100_random_eig from './fixtures/100x100_random_eig.json' with { type: 'json' };

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

/**
* Returns the N-by-N random complex upper Hessenberg matrix of the Fortran fixtures `40x40_random_schur` and `100x100_random_eig` (an LCG modulo 2^31, real then imaginary part of each entry, column by column).
*
* @private
* @param {PositiveInteger} N - order
* @returns {Complex128Array} matrix
*/
function lcgHessenbergC( N ) {
	const H = new Complex128Array( N * N );
	const v = reinterpret( H, 0 );
	let s = 1;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= Math.min( j + 1, N - 1 ); i++ ) {
			s = ( Math.imul( s, 1103515245 ) + 12345 ) & 0x7fffffff; // exact mod 2^31, as the fixture's INTEGER*8 LCG
			v[ 2 * ( i + ( j * N ) ) ] = ( s / 2147483648 ) - 0.5;
			s = ( Math.imul( s, 1103515245 ) + 12345 ) & 0x7fffffff;
			v[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = ( s / 2147483648 ) - 0.5;
		}
	}
	return H;
}

/**
* Runs `zhseqr` on the fixture matrix of order `N`.
*
* @private
* @param {Function} fcn - implementation
* @param {boolean} full - whether to compute the Schur form and vectors
* @param {PositiveInteger} N - order
* @returns {Object} results
*/
function runLcg( fcn, full, N ) {
	const H = lcgHessenbergC( N );
	const Z = new Complex128Array( N * N );
	const zv = reinterpret( Z, 0 );
	const w = new Complex128Array( N );
	let info;
	let i;
	for ( i = 0; i < N; i++ ) {
		zv[ 2 * ( i + ( i * N ) ) ] = 1.0;
	}
	if ( full ) {
		info = fcn( 'schur', 'initialize', N, 1, N, H, 1, N, 0, w, 1, 0, Z, 1, N, 0, new Complex128Array( 20000 ), 1, 0 );
	} else {
		info = fcn( 'eigenvalues', 'none', N, 1, N, H, 1, N, 0, w, 1, 0, Z, 1, N, 0, new Complex128Array( 20000 ), 1, 0 );
	}
	return {
		'info': info,
		'H': reinterpret( H, 0 ),
		'Z': zv,
		'w': reinterpret( w, 0 )
	};
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

test( 'zhseqr: the reference minimum max(1,N) suffices where zlaqr0\'s AED window passes 32 (its callees adapt, ticket 0100)', function t() {
	function run( N, WORK ) {
		const H = new Complex128Array( N * N );
		const Z = new Complex128Array( N * N );
		const w = new Complex128Array( N );
		const hv = reinterpret( H, 0 );
		const zv = reinterpret( Z, 0 );
		const wv = reinterpret( w, 0 );
		const re = [];
		const im = [];
		let info;
		let i;
		for ( i = 1; i < N; i++ ) {
			hv[ 2 * ( i + ( ( i - 1 ) * N ) ) ] = 1.0;
		}
		hv[ 2 * ( N - 1 ) * N ] = 1.0;
		for ( i = 0; i < N; i++ ) {
			zv[ 2 * ( i + ( i * N ) ) ] = 1.0;
		}
		info = zhseqr( 'schur', 'update', N, 1, N, H, 1, N, 0, w, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
		for ( i = 0; i < N; i++ ) {
			re.push( wv[ 2 * i ] );
			im.push( wv[ ( 2 * i ) + 1 ] );
		}
		return {
			'N': N,
			'info': info,
			're': re,
			'im': im,
			'out': [].concat( Array.from( wv ), Array.from( hv ), Array.from( zv ) )
		};
	}
	function checkRoots( r, msg ) {
		// The cyclic shift's eigenvalues are the N-th roots of unity, each once:
		const seen = new Uint8Array( r.N );
		let k;
		let i;
		assert.equal( r.info, 0, msg + ': info' );
		for ( i = 0; i < r.N; i++ ) {
			k = ( ( Math.round( Math.atan2( r.im[ i ], r.re[ i ] ) * r.N / ( 2.0 * Math.PI ) ) % r.N ) + r.N ) % r.N;
			assert.ok( Math.abs( r.re[ i ] - Math.cos( 2.0 * Math.PI * k / r.N ) ) <= 1e-10 && Math.abs( r.im[ i ] - Math.sin( 2.0 * Math.PI * k / r.N ) ) <= 1e-10, msg + ': eigenvalue ' + i + ' = ' + r.re[ i ] + ' + ' + r.im[ i ] + 'i' );
			assert.equal( seen[ k ], 0, msg + ': root ' + k + ' found twice' );
			seen[ k ] = 1;
		}
	}

	// Cyclic shift of order 120: AED stalls and the window grows past 32 with more than 32 undeflated shifts, where the JS callees used to block whatever WORK they got (ticket 0096). With the reference's minimum max(1,N) they now shrink NB or go unblocked:
	checkRoots( run( 120, new Complex128Array( 120 ) ), 'max(1,N)' ); // on the old code this threw (minimum 33*floor((N-1)/3) + 2080)

	// One below the reference's minimum throws:
	assert.throws( function throws() {
		run( 120, new Complex128Array( 119 ) );
	}, /WORK array must have at least 120 elements/ );

	assert.throws( function throws() {
		zhseqr( 'eigenvalues', 'none', 4, 1, 4, new Complex128Array( 16 ), 1, 4, 0, new Complex128Array( 4 ), 1, 0, new Complex128Array( 1 ), 1, 1, 0, null, 1, 0 );
	}, /at least 4 elements from offset 0. Provided length: 0/ );

	// A narrow active block:
	assert.equal( zhseqr( 'eigenvalues', 'none', 120, 1, 30, new Complex128Array( 120 * 120 ), 1, 120, 0, new Complex128Array( 120 ), 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 120 ), 1, 0 ), 0 );
});

test( 'zhseqr: the eigenvalues come in the reference\'s order where NWR, NSR and KACC22 are IPARMQ\'s (ticket 0049)', function t() {
	// With the old fixed NWR = 5 and NSR = 14, ZHSEQR (through ZLAQR0 at N = 100, past NMIN = 75) deflated in another order (and used KACC22 = 2 at N = 100, where IPARMQ's NS = 10 gives 0):
	let out;
	let i;
	out = runLcg( zhseqr, false, 100 );
	assert.strictEqual( out.info, _100x100_random_eig.info, 'info' );
	for ( i = 0; i < out.w.length; i++ ) {
		assert.ok( Math.abs( out.w[ i ] - _100x100_random_eig.w[ i ] ) <= 1e-12, 'N = 100: w[' + i + '] = ' + out.w[ i ] + ', reference ' + _100x100_random_eig.w[ i ] );
	}
	out = runLcg( zhseqr, true, 40 );
	assert.strictEqual( out.info, _40x40_random_schur.info, 'info' );
	for ( i = 0; i < out.w.length; i++ ) {
		assert.ok( Math.abs( out.w[ i ] - _40x40_random_schur.w[ i ] ) <= 1e-12, 'N = 40: w[' + i + '] = ' + out.w[ i ] + ', reference ' + _40x40_random_schur.w[ i ] );
	}
});

test( 'zhseqr: the Schur form and vectors equal the reference\'s up to the phases of Z\'s columns (ticket 0049)', function t() {
	// A complex Schur form with a given eigenvalue order is unique up to Z -> Z*D, T -> D^H*T*D for a diagonal unitary D, and the phases of subdiagonals deflated at rounding level are rounding noise, so compare |T(i,j)|, |Z(i,j)| and |Z(:,j)^H * Zref(:,j)| = 1:
	const tc = _40x40_random_schur;
	const N = 40;
	const out = runLcg( zhseqr, true, N );
	let re;
	let im;
	let i;
	let j;
	let k;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			k = 2 * ( i + ( j * N ) );
			assert.ok( Math.abs( Math.hypot( out.H[ k ], out.H[ k + 1 ] ) - Math.hypot( tc.H[ k ], tc.H[ k + 1 ] ) ) <= 1e-12, '|T(' + i + ',' + j + ')|' );
		}
		re = 0.0;
		im = 0.0;
		for ( i = 0; i < N; i++ ) {
			k = 2 * ( i + ( j * N ) );
			assert.ok( Math.abs( Math.hypot( out.Z[ k ], out.Z[ k + 1 ] ) - Math.hypot( tc.Z[ k ], tc.Z[ k + 1 ] ) ) <= 1e-12, '|Z(' + i + ',' + j + ')|' );
			re += ( out.Z[ k ] * tc.Z[ k ] ) + ( out.Z[ k + 1 ] * tc.Z[ k + 1 ] );
			im += ( out.Z[ k ] * tc.Z[ k + 1 ] ) - ( out.Z[ k + 1 ] * tc.Z[ k ] );
		}
		assert.ok( Math.abs( Math.hypot( re, im ) - 1.0 ) <= 1e-12, 'column ' + j + ' of Z vs the reference' );
	}
});
