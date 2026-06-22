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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
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
	var mv = reinterpret( m.data, 0 );
	var idx = ( m.offset + i * m.s1 + j * m.s2 ) * 2;
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
	var Hv = reinterpret( Hm.data, 0 );
	var i;
	var j;
	var idx;
	var re;
	var im;
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
	var act = [];
	var exp = [];
	var i;
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
	var n = 4;
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
	var n = 6;
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
	var tc = n_eq_0;
	var H = new Complex128Array( 0 );
	var Z = new Complex128Array( 0 );
	var W = new Complex128Array( 0 );
	var WORK = new Complex128Array( 1 );

	var info = zhseqr( 'eigenvalues', 'none', 0, 1, 0,
		H, 1, 0, 0,
		W, 1, 0,
		Z, 1, 0, 0,
		WORK, 1, 0, 1
	);
	assert.equal( info, tc.info );
});

test( 'zhseqr: N=1, JOB=E, COMPZ=N', function t() {
	var tc = n_eq_1_eig_n;
	var n = 1;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var W = new Complex128Array( n );
	var WORK = new Complex128Array( 1 );

	mset( Hm, n, 0, 0, 7.0, -3.0 );

	var info = zhseqr( 'eigenvalues', 'none', n, 1, 1,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0, 1
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-13, 'w' );
});

test( 'zhseqr: N=1, JOB=S, COMPZ=I', function t() {
	var tc = n_eq_1_schur_i;
	var n = 1;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var W = new Complex128Array( n );
	var WORK = new Complex128Array( 1 );

	mset( Hm, n, 0, 0, 7.0, -3.0 );

	var info = zhseqr( 'schur', 'initialize', n, 1, 1,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0, 1
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-13, 'w' );
	assertArrayClose( getFlat( Hm ), tc.H, 1e-13, 'H' );
	assertArrayClose( getFlat( Zm ), tc.Z, 1e-13, 'Z' );
});

test( 'zhseqr: 4x4, JOB=E, COMPZ=N', function t() {
	var tc = _4x4_eig_n;
	var n = 4;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var W = new Complex128Array( n );
	var WORK = new Complex128Array( n * n );

	buildHess4( Hm );

	var info = zhseqr( 'eigenvalues', 'none', n, 1, 4,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0, n * n
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-10, 'w' );
});

test( 'zhseqr: 4x4, JOB=S, COMPZ=I', function t() {
	var tc = _4x4_schur_i;
	var n = 4;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var W = new Complex128Array( n );
	var WORK = new Complex128Array( n * n );

	buildHess4( Hm );

	var info = zhseqr( 'schur', 'initialize', n, 1, 4,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0, n * n
	);
	assert.equal( info, tc.info );
	assertEigenvaluesMatch( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-10, 'w' );
	assertUpperTriangular( Hm, n, 1e-10, 'H' );
});

test( 'zhseqr: 4x4, JOB=S, COMPZ=V', function t() {
	var tc = _4x4_schur_v;
	var n = 4;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var W = new Complex128Array( n );
	var WORK = new Complex128Array( n * n );
	var i;

	buildHess4( Hm );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	var info = zhseqr( 'schur', 'update', n, 1, 4,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0, n * n
	);
	assert.equal( info, tc.info );
	assertEigenvaluesMatch( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-10, 'w' );
	assertUpperTriangular( Hm, n, 1e-10, 'H' );
});

test( 'zhseqr: 6x6, JOB=S, COMPZ=I', function t() {
	var tc = _6x6_schur_i;
	var n = 6;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var W = new Complex128Array( n );
	var WORK = new Complex128Array( n * n );

	buildHess6( Hm );

	var info = zhseqr( 'schur', 'initialize', n, 1, 6,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0, n * n
	);
	assert.equal( info, tc.info );
	assertEigenvaluesMatch( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-10, 'w' );
	assertUpperTriangular( Hm, n, 1e-10, 'H' );
});

test( 'zhseqr: 6x6, JOB=E, COMPZ=N', function t() {
	var tc = _6x6_eig_n;
	var n = 6;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var W = new Complex128Array( n );
	var WORK = new Complex128Array( n * n );

	buildHess6( Hm );

	var info = zhseqr( 'eigenvalues', 'none', n, 1, 6,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0, n * n
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-10, 'w' );
});
