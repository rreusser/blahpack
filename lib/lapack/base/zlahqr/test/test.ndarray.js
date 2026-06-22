// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlahqr from './../lib/ndarray.js';

// FIXTURES //

import n_eq_0 from './fixtures/n_eq_0.json' with { type: 'json' };
import n_eq_1 from './fixtures/n_eq_1.json' with { type: 'json' };
import _4x4_schur_with_z from './fixtures/4x4_schur_with_z.json' with { type: 'json' };
import _4x4_schur_no_z from './fixtures/4x4_schur_no_z.json' with { type: 'json' };
import _4x4_eig_only from './fixtures/4x4_eig_only.json' with { type: 'json' };
import already_triangular from './fixtures/already_triangular.json' with { type: 'json' };
import partial_active_block from './fixtures/partial_active_block.json' with { type: 'json' };
import _6x6_full from './fixtures/6x6_full.json' with { type: 'json' };

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
* Verify Z * T * Z^H = A_orig to machine precision.
*
* @private
* @param {Float64Array} Hv - interleaved T (Schur form)
* @param {Float64Array} Zv - interleaved Z (Schur vectors)
* @param {Float64Array} Aorig - interleaved original A
* @param {integer} n - matrix order
* @param {number} tol - tolerance
* @param {string} msg - assertion message prefix
*/
function assertSchurReconstruction( Hv, Zv, Aorig, n, tol, msg ) {
	var maxErr = 0;
	var sum;
	var orig;
	var err;
	var zikr;
	var ziki;
	var tklr;
	var tkli;
	var zjlr;
	var zjli;
	var pr;
	var pi;
	var i;
	var j;
	var k;
	var l;

	for ( i = 0; i < n; i++ ) {
		for ( j = 0; j < n; j++ ) {
			sum = [ 0.0, 0.0 ];
			for ( k = 0; k < n; k++ ) {
				for ( l = 0; l < n; l++ ) {
					// Z(i,k) * T(k,l) * conj(Z(j,l))
					zikr = Zv[ ( i + k * n ) * 2 ];
					ziki = Zv[ ( i + k * n ) * 2 + 1 ];
					tklr = Hv[ ( k + l * n ) * 2 ];
					tkli = Hv[ ( k + l * n ) * 2 + 1 ];
					// conj(Z(j,l))
					zjlr = Zv[ ( j + l * n ) * 2 ];
					zjli = -Zv[ ( j + l * n ) * 2 + 1 ];
					// Z(i,k) * T(k,l)
					pr = zikr * tklr - ziki * tkli;
					pi = zikr * tkli + ziki * tklr;
					// * conj(Z(j,l))
					sum[ 0 ] += pr * zjlr - pi * zjli;
					sum[ 1 ] += pr * zjli + pi * zjlr;
				}
			}
			orig = [ Aorig[ ( i + j * n ) * 2 ], Aorig[ ( i + j * n ) * 2 + 1 ] ];
			err = Math.sqrt( ( sum[ 0 ] - orig[ 0 ] ) * ( sum[ 0 ] - orig[ 0 ] ) + ( sum[ 1 ] - orig[ 1 ] ) * ( sum[ 1 ] - orig[ 1 ] ) );
			maxErr = Math.max( maxErr, err );
		}
	}
	assert.ok( maxErr <= tol, msg + ': max reconstruction error ' + maxErr.toExponential( 3 ) + ' exceeds tolerance ' + tol );
}

/**
* Verify that H is upper triangular (subdiag elements are real and zero below active block).
*
* @private
* @param {Float64Array} Hv - interleaved Schur form
* @param {integer} n - matrix order
* @param {number} tol - tolerance for zero checks
* @param {string} msg - assertion message prefix
*/
function assertUpperTriangular( Hv, n, tol, msg ) {
	var i;
	var j;
	var re;
	var im;
	for ( j = 0; j < n; j++ ) {
		for ( i = j + 2; i < n; i++ ) {
			re = Hv[ ( i + j * n ) * 2 ];
			im = Hv[ ( i + j * n ) * 2 + 1 ];
			assert.ok( Math.abs( re ) + Math.abs( im ) <= tol, msg + ': H(' + i + ',' + j + ') should be zero, got ' + re + '+' + im + 'i' );
		}
	}
}

// TESTS //

test( 'zlahqr: main export is a function', function t() {
	assert.strictEqual( typeof zlahqr, 'function' );
});

test( 'zlahqr: n_eq_0', function t() {
	var tc = n_eq_0;
	var H = new Complex128Array( 0 );
	var Z = new Complex128Array( 0 );
	var W = new Complex128Array( 0 );

	var info = zlahqr( true, false, 0, 1, 0,
		H, 1, 0, 0,
		W, 1, 0,
		1, 0,
		Z, 1, 0, 0
	);
	assert.equal( info, tc.info );
});

test( 'zlahqr: n_eq_1', function t() {
	var tc = n_eq_1;
	var n = 1;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var W = new Complex128Array( n );

	mset( Hm, n, 0, 0, 3.0, 2.0 );
	mset( Zm, n, 0, 0, 1.0, 0.0 );

	var info = zlahqr( true, true, n, 1, 1,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, 1,
		Zm.data, Zm.s1, Zm.s2, Zm.offset
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-13, 'w' );
	assertArrayClose( getFlat( Hm ), tc.H, 1e-13, 'H' );
});

test( 'zlahqr: 4x4 Schur form with Z', function t() {
	var tc = _4x4_schur_with_z;
	var n = 4;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var W = new Complex128Array( n );
	var Aorig;
	var i;

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

	Aorig = new Float64Array( reinterpret( Hm.data, 0 ) );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	var info = zlahqr( true, true, n, 1, 4,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, 4,
		Zm.data, Zm.s1, Zm.s2, Zm.offset
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-12, 'w' );
	assertUpperTriangular( reinterpret( Hm.data, 0 ), n, 1e-12, 'H triangularity' );
	assertSchurReconstruction( reinterpret( Hm.data, 0 ), reinterpret( Zm.data, 0 ), Aorig, n, 1e-12, 'ZTZh=A' );
});

test( 'zlahqr: 4x4 Schur form, no Z', function t() {
	var tc = _4x4_schur_no_z;
	var n = 4;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var W = new Complex128Array( n );

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

	var info = zlahqr( true, false, n, 1, 4,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, 4,
		Zm.data, Zm.s1, Zm.s2, Zm.offset
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-12, 'w' );
	assertUpperTriangular( reinterpret( Hm.data, 0 ), n, 1e-12, 'H triangularity' );
});

test( 'zlahqr: 4x4 eigenvalues only', function t() {
	var tc = _4x4_eig_only;
	var n = 4;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var W = new Complex128Array( n );

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

	var info = zlahqr( false, false, n, 1, 4,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, 4,
		Zm.data, Zm.s1, Zm.s2, Zm.offset
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-12, 'w' );
});

test( 'zlahqr: already triangular', function t() {
	var tc = already_triangular;
	var n = 3;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var W = new Complex128Array( n );
	var i;

	mset( Hm, n, 0, 0, 5.0, 1.0 );
	mset( Hm, n, 0, 1, 2.0, 0.0 );
	mset( Hm, n, 0, 2, 1.0, -1.0 );
	mset( Hm, n, 1, 1, 3.0, -2.0 );
	mset( Hm, n, 1, 2, 0.5, 0.5 );
	mset( Hm, n, 2, 2, 1.0, 4.0 );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	var info = zlahqr( true, true, n, 1, 3,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, 3,
		Zm.data, Zm.s1, Zm.s2, Zm.offset
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-13, 'w' );
	assertArrayClose( getFlat( Hm ), tc.H, 1e-13, 'H' );
});

test( 'zlahqr: partial active block', function t() {
	var tc = partial_active_block;
	var n = 4;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var W = new Complex128Array( n );
	var Aorig;
	var i;

	mset( Hm, n, 0, 0, 10.0, 0.0 );
	mset( Hm, n, 0, 1, 1.0, 0.5 );
	mset( Hm, n, 0, 2, 0.5, -0.5 );
	mset( Hm, n, 0, 3, 0.25, 0.0 );
	mset( Hm, n, 1, 1, 4.0, 1.0 );
	mset( Hm, n, 1, 2, 2.0, -1.0 );
	mset( Hm, n, 1, 3, 1.0, 0.5 );
	mset( Hm, n, 2, 1, 1.0, 0.0 );
	mset( Hm, n, 2, 2, 3.0, -0.5 );
	mset( Hm, n, 2, 3, 1.5, 1.0 );
	mset( Hm, n, 3, 2, 0.5, 0.25 );
	mset( Hm, n, 3, 3, 2.0, 0.0 );

	Aorig = new Float64Array( reinterpret( Hm.data, 0 ) );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	var info = zlahqr( true, true, n, 2, 4,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, 4,
		Zm.data, Zm.s1, Zm.s2, Zm.offset
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-12, 'w' );
	assertUpperTriangular( reinterpret( Hm.data, 0 ), n, 1e-12, 'H triangularity' );
	assertSchurReconstruction( reinterpret( Hm.data, 0 ), reinterpret( Zm.data, 0 ), Aorig, n, 1e-12, 'ZTZh=A' );
});

test( 'zlahqr: 6x6 full', function t() {
	var tc = _6x6_full;
	var n = 6;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var W = new Complex128Array( n );
	var Aorig;
	var i;

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

	Aorig = new Float64Array( reinterpret( Hm.data, 0 ) );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	var info = zlahqr( true, true, n, 1, 6,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, 6,
		Zm.data, Zm.s1, Zm.s2, Zm.offset
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-10, 'w' );
	assertUpperTriangular( reinterpret( Hm.data, 0 ), n, 1e-10, 'H triangularity' );
	assertSchurReconstruction( reinterpret( Hm.data, 0 ), reinterpret( Zm.data, 0 ), Aorig, n, 1e-10, 'ZTZh=A' );
});
