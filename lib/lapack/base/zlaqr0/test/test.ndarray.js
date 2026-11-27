/* eslint-disable no-restricted-syntax, max-len, max-statements, max-lines-per-function, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqr0 from './../lib/ndarray.js';
import zlahqr from './../../zlahqr/lib/base.js';
import ilaenv from './../../ilaenv/lib/base.js';
import zhseqr from './../../zhseqr/lib/ndarray.js';
import { importWithConstants, importWithDependencies } from './../../../../../test/harness/constants.js';
import zlaqr4 from './../../zlaqr4/lib/ndarray.js';

// FIXTURES //

import n_eq_0 from './fixtures/n_eq_0.json' with { type: 'json' };
import n_eq_1 from './fixtures/n_eq_1.json' with { type: 'json' };
import _6x6_schur_with_z from './fixtures/6x6_schur_with_z.json' with { type: 'json' };
import _6x6_eig_only from './fixtures/6x6_eig_only.json' with { type: 'json' };
import _15x15_multishift from './fixtures/15x15_multishift.json' with { type: 'json' };
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
* Returns a pseudo-random complex upper Hessenberg matrix (column-major).
*
* @private
* @param {PositiveInteger} N - order
* @param {PositiveInteger} seed - generator seed
* @returns {Complex128Array} matrix
*/
function randomHessenbergC( N, seed ) {
	const H = new Complex128Array( N * N );
	const v = reinterpret( H, 0 );
	let s = seed;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= Math.min( j + 1, N - 1 ); i++ ) {
			s = ( s * 16807 ) % 2147483647;
			v[ 2 * ( i + ( j * N ) ) ] = ( s / 2147483647 ) - 0.5;
			s = ( s * 16807 ) % 2147483647;
			v[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = ( s / 2147483647 ) - 0.5;
		}
	}
	return H;
}

/**
* Returns the N-by-N complex identity matrix.
*
* @private
* @param {PositiveInteger} N - order
* @returns {Complex128Array} matrix
*/
function eyeC( N ) {
	const Z = new Complex128Array( N * N );
	const v = reinterpret( Z, 0 );
	let i;
	for ( i = 0; i < N; i++ ) {
		v[ 2 * ( i + ( i * N ) ) ] = 1.0;
	}
	return Z;
}

/**
* Returns the N-by-N cyclic permutation matrix as a complex matrix (eigenvalues: the N-th roots of unity).
*
* @private
* @param {PositiveInteger} N - order
* @returns {Complex128Array} matrix
*/
function cyclicC( N ) {
	const H = new Complex128Array( N * N );
	const v = reinterpret( H, 0 );
	let i;
	for ( i = 1; i < N; i++ ) {
		v[ 2 * ( i + ( ( i - 1 ) * N ) ) ] = 1.0;
	}
	v[ 2 * ( N - 1 ) * N ] = 1.0;
	return H;
}

/**
* Returns the Frobenius norm of an interleaved complex array.
*
* @private
* @param {Float64Array} v - interleaved real/imaginary parts
* @returns {number} norm
*/
function frobC( v ) {
	let s = 0.0;
	let i;
	for ( i = 0; i < v.length; i++ ) {
		s += v[ i ] * v[ i ];
	}
	return Math.sqrt( s );
}

/**
* Returns `A^H * B` for N-by-N interleaved column-major complex matrices.
*
* @private
* @param {Float64Array} a - interleaved A
* @param {Float64Array} b - interleaved B
* @param {PositiveInteger} N - order
* @returns {Float64Array} interleaved product
*/
function conjTransMul( a, b, N ) {
	const out = new Float64Array( 2 * N * N );
	let ar;
	let ai;
	let br;
	let bi;
	let sr;
	let si;
	let i;
	let j;
	let k;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			sr = 0.0;
			si = 0.0;
			for ( k = 0; k < N; k++ ) {
				ar = a[ 2 * ( k + ( i * N ) ) ];
				ai = -a[ ( 2 * ( k + ( i * N ) ) ) + 1 ];
				br = b[ 2 * ( k + ( j * N ) ) ];
				bi = b[ ( 2 * ( k + ( j * N ) ) ) + 1 ];
				sr += ( ar * br ) - ( ai * bi );
				si += ( ar * bi ) + ( ai * br );
			}
			out[ 2 * ( i + ( j * N ) ) ] = sr;
			out[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = si;
		}
	}
	return out;
}

/**
* Returns `A * B` for N-by-N interleaved column-major complex matrices.
*
* @private
* @param {Float64Array} a - interleaved A
* @param {Float64Array} b - interleaved B
* @param {PositiveInteger} N - order
* @returns {Float64Array} interleaved product
*/
function mulC( a, b, N ) {
	const out = new Float64Array( 2 * N * N );
	let ar;
	let ai;
	let br;
	let bi;
	let sr;
	let si;
	let i;
	let j;
	let k;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			sr = 0.0;
			si = 0.0;
			for ( k = 0; k < N; k++ ) {
				ar = a[ 2 * ( i + ( k * N ) ) ];
				ai = a[ ( 2 * ( i + ( k * N ) ) ) + 1 ];
				br = b[ 2 * ( k + ( j * N ) ) ];
				bi = b[ ( 2 * ( k + ( j * N ) ) ) + 1 ];
				sr += ( ar * br ) - ( ai * bi );
				si += ( ar * bi ) + ( ai * br );
			}
			out[ 2 * ( i + ( j * N ) ) ] = sr;
			out[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = si;
		}
	}
	return out;
}

/**
* Asserts that `Z` is unitary and `Z^H * H0 * Z` equals the upper Hessenberg part `T` of `H` within `1e-12 * N * ||H0||`.
*
* @private
* @param {Complex128Array} H0 - original matrix
* @param {Complex128Array} H - matrix on exit
* @param {Complex128Array} Z - unitary factor on exit (Z = I on entry)
* @param {PositiveInteger} N - order
* @param {string} msg - message prefix
* @returns {Float64Array} interleaved T
*/
function assertSimilarC( H0, H, Z, N, msg ) {
	const tol = 1e-12 * N;
	const z = reinterpret( Z, 0 );
	const T = new Float64Array( reinterpret( H, 0 ) );
	const ZhZ = conjTransMul( z, z, N );
	let R;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j + 2; i < N; i++ ) {
			T[ 2 * ( i + ( j * N ) ) ] = 0.0;
			T[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = 0.0;
		}
	}
	for ( i = 0; i < N; i++ ) {
		ZhZ[ 2 * ( i + ( i * N ) ) ] -= 1.0;
	}
	assert.ok( frobC( ZhZ ) <= tol, msg + ': ||Z^H*Z - I|| = ' + frobC( ZhZ ) );
	R = conjTransMul( z, mulC( reinterpret( H0, 0 ), z, N ), N );
	for ( i = 0; i < R.length; i++ ) {
		R[ i ] -= T[ i ];
	}
	assert.ok( frobC( R ) <= tol * Math.max( frobC( reinterpret( H0, 0 ) ), 1.0 ), msg + ': ||Z^H*H0*Z - T|| = ' + frobC( R ) );
	return T;
}

/**
* Returns the eigenvalues in `w` (indices `from` to `to - 1`) as a list of [re, im] pairs.
*
* @private
* @param {Complex128Array} w - eigenvalues
* @param {NonNegativeInteger} from - first index
* @param {NonNegativeInteger} to - one past the last index
* @returns {Array<Array<number>>} pairs
*/
function pairsC( w, from, to ) {
	const v = reinterpret( w, 0 );
	const out = [];
	let i;
	for ( i = from; i < to; i++ ) {
		out.push( [ v[ 2 * i ], v[ ( 2 * i ) + 1 ] ] );
	}
	return out;
}

/**
* Asserts that two lists of complex numbers are equal as multisets, within a tolerance.
*
* @private
* @param {Array<Array<number>>} actual - list of [re, im] pairs
* @param {Array<Array<number>>} expected - list of [re, im] pairs
* @param {number} tol - absolute tolerance
* @param {string} msg - message prefix
*/
function assertSameEigenvalues( actual, expected, tol, msg ) {
	const used = [];
	let best;
	let bd;
	let d;
	let i;
	let j;
	assert.strictEqual( actual.length, expected.length, msg + ': count' );
	for ( i = 0; i < expected.length; i++ ) {
		best = -1;
		bd = Infinity;
		for ( j = 0; j < actual.length; j++ ) {
			d = Math.hypot( actual[ j ][ 0 ] - expected[ i ][ 0 ], actual[ j ][ 1 ] - expected[ i ][ 1 ] );
			if ( !used[ j ] && d < bd ) {
				bd = d;
				best = j;
			}
		}
		assert.ok( bd <= tol, msg + ': eigenvalue ' + expected[ i ] + ' unmatched (distance ' + bd + ')' );
		used[ best ] = true;
	}
}

/**
* Asserts that `T` is upper triangular (exact zeros on the subdiagonal) and that `w` holds its diagonal.
*
* @private
* @param {Float64Array} T - interleaved Schur form (zeros below the subdiagonal)
* @param {PositiveInteger} N - order
* @param {Complex128Array} w - eigenvalues
* @param {string} msg - message prefix
*/
function assertComplexSchur( T, N, w, msg ) {
	const wv = reinterpret( w, 0 );
	let tol;
	let i;
	for ( i = 1; i < N; i++ ) {
		assert.ok( T[ 2 * ( i + ( ( i - 1 ) * N ) ) ] === 0.0 && T[ ( 2 * ( i + ( ( i - 1 ) * N ) ) ) + 1 ] === 0.0, msg + ': T(' + ( i + 1 ) + ',' + i + ') = 0' );
	}
	for ( i = 0; i < N; i++ ) {
		tol = 1e-13 * Math.max( Math.hypot( T[ 2 * ( i + ( i * N ) ) ], T[ ( 2 * ( i + ( i * N ) ) ) + 1 ] ), 1.0 );
		assert.ok( Math.hypot( wv[ 2 * i ] - T[ 2 * ( i + ( i * N ) ) ], wv[ ( 2 * i ) + 1 ] - T[ ( 2 * ( i + ( i * N ) ) ) + 1 ] ) <= tol, msg + ': w[' + i + '] = T(' + ( i + 1 ) + ',' + ( i + 1 ) + ')' );
	}
}

/**
* Runs the routine on a copy of `H0` over the full range with `Z = I`.
*
* @private
* @param {Function} fcn - implementation
* @param {boolean} wantt - compute the Schur form
* @param {boolean} wantz - compute the Schur vectors
* @param {Complex128Array} H0 - input matrix (not modified)
* @param {PositiveInteger} N - order
* @returns {Object} results
*/
function runC( fcn, wantt, wantz, H0, N ) {
	const H = new Complex128Array( reinterpret( H0, 0 ) );
	const Z = eyeC( N );
	const w = new Complex128Array( N );
	const info = fcn( wantt, wantz, N, 1, N, H, 1, N, 0, w, 1, 0, 1, N, Z, 1, N, 0, new Complex128Array( 3 * N * N ), 1, 0 );
	return {
		'info': info,
		'H': H,
		'Z': Z,
		'w': w
	};
}

/**
* Asserts a complete Schur decomposition of `H0` and that an eigenvalue-only run returns the same spectrum.
*
* @private
* @param {Function} fcn - implementation
* @param {Complex128Array} H0 - input matrix
* @param {PositiveInteger} N - order
* @param {string} msg - message prefix
* @returns {Object} results of the full run
*/
function assertFullSchur( fcn, H0, N, msg ) {
	const full = runC( fcn, true, true, H0, N );
	assert.strictEqual( full.info, 0, msg + ': info' );
	const T = assertSimilarC( H0, full.H, full.Z, N, msg );
	assertComplexSchur( T, N, full.w, msg );
	const eig = runC( fcn, false, false, H0, N );
	assert.strictEqual( eig.info, 0, msg + ': info (eigenvalues only)' );
	assertSameEigenvalues( pairsC( eig.w, 0, N ), pairsC( full.w, 0, N ), 1e-10, msg + ': eigenvalues only vs Schur' );
	return full;
}

/**
* Returns ILAENV's values, except a deflation window (ISPEC 13) of 4.
*
* At N = 100 the reference's IPARMQ gives NS = NWR = 10, so a full window returns more than NS/2 shifts; the reference reaches its trailing-submatrix shifts only once a stalled iteration has shrunk the window. A window of 4 returns at most NS/2 = 5 shifts from the start.
*
* @private
* @param {integer} ispec - parameter to return
* @param {string} name - name of the calling routine
* @param {string} opts - options of the calling routine
* @param {integer} n1 - first problem dimension
* @param {integer} n2 - second problem dimension
* @param {integer} n3 - third problem dimension
* @param {integer} n4 - fourth problem dimension
* @returns {integer} parameter value
*/
function smallWindow( ispec, name, opts, n1, n2, n3, n4 ) {
	if ( ispec === 13 ) {
		return 4;
	}
	return ilaenv( ispec, name, opts, n1, n2, n3, n4 );
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
* Runs `zlaqr0` on the fixture matrix of order `N`.
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
		info = fcn( true, true, N, 1, N, H, 1, N, 0, w, 1, 0, 1, N, Z, 1, N, 0, new Complex128Array( 20000 ), 1, 0 );
	} else {
		info = fcn( false, false, N, 1, N, H, 1, N, 0, w, 1, 0, 1, N, Z, 1, N, 0, new Complex128Array( 20000 ), 1, 0 );
	}
	return {
		'info': info,
		'H': reinterpret( H, 0 ),
		'Z': zv,
		'w': reinterpret( w, 0 )
	};
}


// TESTS //

test( 'zlaqr0: main export is a function', function t() {
	assert.strictEqual( typeof zlaqr0, 'function' );
});

test( 'zlaqr0: n_eq_0', function t() {
	const tc = n_eq_0;
	const H = new Complex128Array( 0 );
	const Z = new Complex128Array( 0 );
	const W = new Complex128Array( 0 );
	const WORK = new Complex128Array( 1 );

	const info = zlaqr0( true, false, 0, 1, 0,
		H, 1, 0, 0,
		W, 1, 0,
		1, 0,
		Z, 1, 0, 0,
		WORK, 1, 0
	);
	assert.equal( info, tc.info );
});

test( 'zlaqr0: n_eq_1', function t() {
	const tc = n_eq_1;
	const n = 1;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( 1 );

	mset( Hm, n, 0, 0, 5.0, -3.0 );
	mset( Zm, n, 0, 0, 1.0, 0.0 );

	const info = zlaqr0( true, true, n, 1, 1,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, 1,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-13, 'w' );
});

test( 'zlaqr0: 6x6 Schur form with Z', function t() {
	const tc = _6x6_schur_with_z;
	const n = 6;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );
	let i;

	buildHess6( Hm );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	const info = zlaqr0( true, true, n, 1, 6,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, 6,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertEigenvaluesMatch( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-10, 'w' );
	assertUpperTriangular( Hm, n, 1e-10, 'H' );
});

test( 'zlaqr0: 6x6 eigenvalues only', function t() {
	const tc = _6x6_eig_only;
	const n = 6;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );

	buildHess6( Hm );

	const info = zlaqr0( false, false, n, 1, 6,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, 6,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-10, 'w' );
});

test( 'zlaqr0: 15x15 multishift', function t() {
	const tc = _15x15_multishift;
	const n = 15;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );
	let i, j;

	for ( i = 0; i < n; i++ ) {
		mset( Hm, n, i, i, (n - i) * 1.0, (i + 1) * 0.1 );
		for ( j = i + 1; j < Math.min( i + 4, n ); j++ ) {
			mset( Hm, n, i, j, 0.5 / (j - i), 0.1 * Math.pow( -1, j + 1 ) );
		}
		if ( i < n - 1 ) {
			mset( Hm, n, i + 1, i, 0.3 + 0.1 * (i + 1), 0.05 * Math.pow( -1, i + 1 ) );
		}
	}

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	const info = zlaqr0( true, true, n, 1, 15,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, 15,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertEigenvaluesMatch( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-8, 'w' );
	assertUpperTriangular( Hm, n, 1e-10, 'H' );
});

test( 'zlaqr0: 16x16 multishift eigenvalues with Z (property-based)', function t() {
	const n = 16;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );
	let i;

	// Build simple upper Hessenberg with well-separated real diagonal
	for ( i = 0; i < n; i++ ) {
		mset( Hm, n, i, i, ( n - i ) * 10.0, 0.0 );
		if ( i < n - 1 ) {
			mset( Hm, n, i + 1, i, 1.0, 0.0 );
		}
	}

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	// Use wantt=false, wantz=true to exercise multishift deflation+Z update path
	const info = zlaqr0( false, true, n, 1, n,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);

	assert.equal( info, 0, 'convergence (info=0)' );

	// Eigenvalues should have reasonable magnitudes and not be NaN
	const Wv = reinterpret( W, 0 );
	for ( i = 0; i < n; i++ ) {
		assert.ok( !Number.isNaN( Wv[ 2 * i ] ) && !Number.isNaN( Wv[ 2 * i + 1 ] ),
			'eigenvalue ' + i + ' is not NaN' );
		assert.ok( Math.abs( Wv[ 2 * i ] ) + Math.abs( Wv[ 2 * i + 1 ] ) < 1e6,
			'eigenvalue ' + i + ' has reasonable magnitude' );
	}
});

test( 'zlaqr0: 16x16 eigenvalues only (property-based)', function t() {
	const n = 16;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );
	let i;

	// Build simple upper Hessenberg
	for ( i = 0; i < n; i++ ) {
		mset( Hm, n, i, i, ( n - i ) * 10.0, 0.0 );
		if ( i < n - 1 ) {
			mset( Hm, n, i + 1, i, 1.0, 0.0 );
		}
	}

	const info = zlaqr0( false, false, n, 1, n,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);

	assert.equal( info, 0, 'convergence (info=0)' );

	// All eigenvalues should be finite
	const Wv = reinterpret( W, 0 );
	for ( i = 0; i < n; i++ ) {
		assert.ok( Number.isFinite( Wv[ 2 * i ] ) && Number.isFinite( Wv[ 2 * i + 1 ] ),
			'eigenvalue ' + i + ' is finite' );
	}
});

test( 'zlaqr0: 20x20 diagonal Hessenberg (path coverage)', function t() {
	const n = 20;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );
	let i;

	// Pure diagonal — exercises trivial deflation paths and exceptional shifts.
	// Algorithm may exit with info > 0; we just verify it returns.
	for ( i = 0; i < n; i++ ) {
		mset( Hm, n, i, i, ( i + 1 ) * 1.0, ( i + 1 ) * 0.1 );
	}
	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	const info = zlaqr0( true, true, n, 1, n,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	assert.ok( info >= 0, 'returns non-negative info' );
});

test( 'zlaqr0: 20x20 nearly-diagonal Hessenberg (small subdiag)', function t() {
	const n = 20;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );
	let i;

	for ( i = 0; i < n; i++ ) {
		mset( Hm, n, i, i, ( i + 1 ) * 1.0, ( i + 1 ) * 0.1 );
		if ( i < n - 1 ) {
			mset( Hm, n, i + 1, i, 0.01, 0.0 );
		}
	}
	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	const info = zlaqr0( true, true, n, 1, n,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	assert.equal( info, 0, 'convergence (info=0)' );
});

test( 'zlaqr0: 25x25 multishift with subdiagonal entries', function t() {
	const n = 25;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );
	let i;

	for ( i = 0; i < n; i++ ) {
		mset( Hm, n, i, i, ( n - i ) * 5.0 + 0.1 * i, ( i + 1 ) * 0.05 );
		if ( i < n - 1 ) {
			mset( Hm, n, i + 1, i, 0.5 + 0.1 * ( i % 3 ), 0.0 );
		}
		// Add some upper triangular entries
		if ( i + 1 < n ) {
			mset( Hm, n, i, i + 1, 0.3, 0.05 );
		}
		if ( i + 2 < n ) {
			mset( Hm, n, i, i + 2, 0.1, 0.0 );
		}
	}
	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	const info = zlaqr0( true, true, n, 1, n,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	assert.equal( info, 0, 'convergence' );
	const Wv = reinterpret( W, 0 );
	for ( i = 0; i < n; i++ ) {
		assert.ok( !Number.isNaN( Wv[ 2 * i ] ) && !Number.isNaN( Wv[ 2 * i + 1 ] ) );
	}
});

test( 'zlaqr0: 16x16 with ilo>1 and ihi<n (subblock)', function t() {
	const n = 16;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );
	let i;

	for ( i = 0; i < n; i++ ) {
		mset( Hm, n, i, i, ( n - i ) * 5.0, ( i + 1 ) * 0.1 );
		if ( i < n - 1 ) {
			mset( Hm, n, i + 1, i, 1.0, 0.0 );
		}
	}
	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	// Process subblock [3, 14] (1-based)
	const info = zlaqr0( true, true, n, 3, 14,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		3, 14,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	assert.equal( info, 0, 'subblock processed' );
});

test( 'zlaqr0: 30x30 stress (deflation cycles)', function t() {
	const n = 30;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );
	let i;

	// Build Hessenberg with mixed scales to encourage multi-cycle deflation
	for ( i = 0; i < n; i++ ) {
		mset( Hm, n, i, i, 10.0 + Math.cos( i * 0.7 ), 0.5 * Math.sin( i * 0.7 ) );
		if ( i < n - 1 ) {
			mset( Hm, n, i + 1, i, 0.8 + 0.2 * Math.sin( i ), 0.0 );
		}
		if ( i + 1 < n ) {
			mset( Hm, n, i, i + 1, 0.4 + 0.1 * Math.cos( i ), 0.0 );
		}
		if ( i + 2 < n ) {
			mset( Hm, n, i, i + 2, 0.2, 0.0 );
		}
	}
	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	const info = zlaqr0( false, true, n, 1, n,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	assert.ok( info >= 0, 'returns non-negative info' );
	const Wv = reinterpret( W, 0 );
	for ( i = 0; i < n; i++ ) {
		assert.ok( !Number.isNaN( Wv[ 2 * i ] ) && !Number.isNaN( Wv[ 2 * i + 1 ] ) );
	}
});

test( 'zlaqr0: 18x18 with split subdiagonal (multiple deflation pieces)', function t() {
	const n = 18;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );
	let i;

	for ( i = 0; i < n; i++ ) {
		mset( Hm, n, i, i, 10.0 - i * 0.5, 0.0 );
		if ( i < n - 1 ) {
			// Zero out one subdiagonal element to create a split
			if ( i === 8 ) {
				mset( Hm, n, i + 1, i, 0.0, 0.0 );
			} else {
				mset( Hm, n, i + 1, i, 0.6, 0.0 );
			}
		}
	}
	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	const info = zlaqr0( true, true, n, 1, n,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	assert.equal( info, 0, 'split block processed' );
});

test( 'zlaqr0: throws RangeError for negative N', function t() {
	const H = new Complex128Array( 1 );
	const W = new Complex128Array( 1 );
	const Z = new Complex128Array( 1 );
	const WORK = new Complex128Array( 1 );
	assert.throws( function throws() {
		zlaqr0( true, true, -1, 1, 0, H, 1, 1, 0, W, 1, 0, 1, 0, Z, 1, 1, 0, WORK, 1, 0 );
	}, RangeError );
});

test( 'zlaqr0: matches zlaqr4 bit for bit while every deflation window is at most NMIN (two-shift special case)', function t() {
	// The reference ZLAQR0 and ZLAQR4 are the same algorithm apart from the AED routine (ZLAQR3 vs ZLAQR2), which coincide whenever the deflation window never exceeds the ZLAQR3 recursion crossover NMIN = 75; the ILAENV parameters are identical. With N=24, NWMAX = (N-1)/3 = 7, so both calls must agree exactly. This pins the shift-selection code, including the `KBOT-KS+1 .EQ. 2` special case, which must leave the shifts untouched whenever more than two shifts are in use.
	const n = 24;
	const W0 = new Complex128Array( n );
	const W4 = new Complex128Array( n );
	let info0;
	let info4;
	let i;
	let j;

	function build() {
		const Hm = makeMatrix( n );
		for ( j = 0; j < n; j++ ) {
			for ( i = 0; i <= Math.min( n - 1, j + 1 ); i++ ) {
				mset( Hm, n, i, j, Math.sin( ( ( i + 1 ) * ( i + 1 ) * 0.37 ) + ( ( j + 1 ) * 1.31 ) ), Math.cos( ( ( i + 1 ) * 0.91 ) + ( ( j + 1 ) * ( j + 1 ) * 0.23 ) ) );
			}
		}
		return Hm;
	}

	function eye() {
		const Zm = makeMatrix( n );
		for ( i = 0; i < n; i++ ) {
			mset( Zm, n, i, i, 1.0, 0.0 );
		}
		return Zm;
	}

	const H0 = build();
	const Z0 = eye();
	info0 = zlaqr0( true, true, n, 1, n, H0.data, H0.s1, H0.s2, H0.offset, W0, 1, 0, 1, n, Z0.data, Z0.s1, Z0.s2, Z0.offset, new Complex128Array( n * n ), 1, 0 );
	const H4 = build();
	const Z4 = eye();
	info4 = zlaqr4( true, true, n, 1, n, H4.data, H4.s1, H4.s2, H4.offset, W4, 1, 0, 1, n, Z4.data, Z4.s1, Z4.s2, Z4.offset, new Complex128Array( n * n ), 1, 0 );
	assert.equal( info0, 0, 'info (zlaqr0)' );
	assert.equal( info4, 0, 'info (zlaqr4)' );
	assert.deepStrictEqual( Array.from( reinterpret( W0, 0 ) ), Array.from( reinterpret( W4, 0 ) ), 'W' );
	assert.deepStrictEqual( getFlat( H0 ), getFlat( H4 ), 'H' );
	assert.deepStrictEqual( getFlat( Z0 ), getFlat( Z4 ), 'Z' );
});

test( 'zlaqr0: 100x100 random Hessenberg (NSR = 14, KACC22 = 2, shifts from the trailing submatrix) yields a Schur form', function t() {
	const N = 100;
	assertFullSchur( zlaqr0, randomHessenbergC( N, 3 ), N, '100x100' );
});

test( 'zlaqr0: iteration limit returns INFO = KBOT with H unitarily similar to the input (KEXSH = 0, cyclic permutation)', async function t() {
	// KEXSH = 0 turns exceptional shifts off (`ndfl % 0` is never 0) and sets ITMAX = 30*NH. Zero shifts leave a permutation matrix fixed, so nothing deflates; the deflation window shrinks to two (the two-shift rule runs) and the loop ends at ITMAX with INFO = KBOT = N. Per the reference contract for INFO > 0, Z^H*H0*Z = H on exit and the unconverged eigenvalues are those of H(ILO:INFO,ILO:INFO).
	const mod = await importWithConstants( new URL( './../lib/base.js', import.meta.url ), {
		'KEXSH': 0
	});
	const N = 20;
	const H0 = cyclicC( N );
	const out = runC( mod.default, true, true, H0, N );
	assert.strictEqual( out.info, N, 'info' );
	const T = assertSimilarC( H0, out.H, out.Z, N, 'iteration limit' );
	const w = new Complex128Array( N );
	const info = zhseqr( 'eigenvalues', 'none', N, 1, N, new Complex128Array( T ), 1, N, 0, w, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( N * N ), 1, 0 );
	assert.strictEqual( info, 0, 'zhseqr info' );
	const roots = [];
	let k;
	for ( k = 0; k < N; k++ ) {
		roots.push( [ Math.cos( 2.0 * Math.PI * k / N ), Math.sin( 2.0 * Math.PI * k / N ) ] );
	}
	assertSameEigenvalues( pairsC( w, 0, N ), roots, 1e-10, 'eigenvalues' );
});

test( 'zlaqr0: when ZLAHQR converges none of the trailing submatrix, the two shifts come from the bottom 2x2 block', async function t() {
	// ZLAHQR returning INFO = NS (no eigenvalue of the NS-by-NS copy converged) is the reference's KS >= KBOT fallback: the shifts are the eigenvalues of H(KBOT-1:KBOT,KBOT-1:KBOT).
	let calls = 0;
	const mod = await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../ilaenv/lib/base.js': smallWindow,
		'../../zlahqr/lib/base.js': function failAll( wantt, wantz, n ) {
			calls += 1;
			return n;
		}
	});
	const N = 100;
	const H0 = randomHessenbergC( N, 3 );
	const full = assertFullSchur( mod.default, H0, N, 'zlahqr fails' );
	assert.ok( calls > 0, 'trailing-submatrix path taken' );
	const ref = runC( zlaqr0, false, false, H0, N );
	assertSameEigenvalues( pairsC( full.w, 0, N ), pairsC( ref.w, 0, N ), 1e-10, 'eigenvalues vs unmodified routine' );
});

test( 'zlaqr0: when ZLAHQR converges only the last two eigenvalues of the trailing submatrix, the two-shift rule keeps the one nearest H(KBOT,KBOT)', async function t() {
	// ZLAHQR returning INFO = NS-2 leaves exactly two shifts (KBOT-KS+1 = 2); unlike shifts from the deflation window, these may have the second one nearer to H(KBOT,KBOT).
	let calls = 0;
	const mod = await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../ilaenv/lib/base.js': smallWindow,
		'../../zlahqr/lib/base.js': function lastTwo( wantt, wantz, n, ilo, ihi, H, sH1, sH2, oH, w, sw, ow, iloz, ihiz, Z, sZ1, sZ2, oZ ) {
			calls += 1;
			zlahqr( wantt, wantz, n, ilo, ihi, H, sH1, sH2, oH, w, sw, ow, iloz, ihiz, Z, sZ1, sZ2, oZ );
			return n - 2;
		}
	});
	const N = 100;
	const H0 = randomHessenbergC( N, 3 );
	const full = assertFullSchur( mod.default, H0, N, 'zlahqr converges two' );
	assert.ok( calls > 0, 'trailing-submatrix path taken' );
	const ref = runC( zlaqr0, false, false, H0, N );
	assertSameEigenvalues( pairsC( full.w, 0, N ), pairsC( ref.w, 0, N ), 1e-10, 'eigenvalues vs unmodified routine' );
});

test( 'zlaqr0: the reference\'s effective minimum 1 (not its documented max(1,N)) is accepted, and a few elements suffice where the AED window passes 32 (zlaqr3 and its callees adapt, tickets 0100, 0016)', function t() {
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
		info = zlaqr0( true, true, N, 1, N, H, 1, N, 0, w, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0 );
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

	// The reference documents max(1,N) but neither checks nor needs it: it caps the window at LWORK/2 and the shifts at 2*LWORK/3. At LWORK = 3 it converges (as the reference does); on the old code this threw (minimum max(1,N)):
	checkRoots( run( 120, new Complex128Array( 3 ) ), 'LWORK = 3' );

	// At LWORK = 1, the effective minimum, it is accepted; with no room for a window or shifts it makes no progress and returns INFO = N, as the reference does:
	assert.strictEqual( run( 120, new Complex128Array( 1 ) ).info, 120, 'LWORK = 1: info' );

	// Below it throws:
	assert.throws( function throws() {
		run( 120, new Complex128Array( 0 ) );
	}, /WORK array must have at least 1 elements/ );
});

test( 'zlaqr0: the eigenvalues come in the reference\'s order where NWR, NSR and KACC22 are IPARMQ\'s (ticket 0049)', function t() {
	// With the old fixed NWR = 5 and NSR = 14, ZLAQR0 deflated in another order (and used KACC22 = 2 at N = 100, where IPARMQ's NS = 10 gives 0):
	let out;
	let i;
	out = runLcg( zlaqr0, false, 100 );
	assert.strictEqual( out.info, _100x100_random_eig.info, 'info' );
	for ( i = 0; i < out.w.length; i++ ) {
		assert.ok( Math.abs( out.w[ i ] - _100x100_random_eig.w[ i ] ) <= 1e-12, 'N = 100: w[' + i + '] = ' + out.w[ i ] + ', reference ' + _100x100_random_eig.w[ i ] );
	}
	out = runLcg( zlaqr0, true, 40 );
	assert.strictEqual( out.info, _40x40_random_schur.info, 'info' );
	for ( i = 0; i < out.w.length; i++ ) {
		assert.ok( Math.abs( out.w[ i ] - _40x40_random_schur.w[ i ] ) <= 1e-12, 'N = 40: w[' + i + '] = ' + out.w[ i ] + ', reference ' + _40x40_random_schur.w[ i ] );
	}
});

test( 'zlaqr0: the Schur form and vectors equal the reference\'s up to the phases of Z\'s columns (ticket 0049)', function t() {
	// A complex Schur form with a given eigenvalue order is unique up to Z -> Z*D, T -> D^H*T*D for a diagonal unitary D, and the phases of subdiagonals deflated at rounding level are rounding noise, so compare |T(i,j)|, |Z(i,j)| and |Z(:,j)^H * Zref(:,j)| = 1:
	const tc = _40x40_random_schur;
	const N = 40;
	const out = runLcg( zlaqr0, true, N );
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
