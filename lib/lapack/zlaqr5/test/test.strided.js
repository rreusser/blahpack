/* eslint-disable no-restricted-syntax, max-len, max-statements, max-lines-per-function, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqr5 from './../lib/strided.js';

// FIXTURES //

import _6x6_2shifts from './fixtures/6x6_2shifts.json' with { type: 'json' };
import _8x8_4shifts from './fixtures/8x8_4shifts.json' with { type: 'json' };
import _10x10_6shifts from './fixtures/10x10_6shifts.json' with { type: 'json' };
import _8x8_4shifts_no_z from './fixtures/8x8_4shifts_no_z.json' with { type: 'json' };
import _6x6_partial_sweep from './fixtures/6x6_partial_sweep.json' with { type: 'json' };

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

function getFlat( m, N ) {
	return Array.from( reinterpret( m.data, 0 ) );
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


// TESTS //

test( 'zlaqr5: main export is a function', function t() {
	assert.strictEqual( typeof zlaqr5, 'function' );
});

test( 'zlaqr5: 6x6 with 2 shifts', function t() {
	const tc = _6x6_2shifts;
	const n = 6;
	const nshfts = 2;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const Vm = makeMatrix( 3 ); // V is 3 x nshfts/2
	const S = new Complex128Array( nshfts );
	let i;

	// Build H
	mset( Hm, n, 0, 0, 5.0, 1.0 );
	mset( Hm, n, 0, 1, 2.0, -0.5 );
	mset( Hm, n, 0, 2, 1.0, 0.0 );
	mset( Hm, n, 0, 3, 0.5, 0.2 );
	mset( Hm, n, 0, 4, 0.25, 0.0 );
	mset( Hm, n, 0, 5, 0.1, -0.1 );
	mset( Hm, n, 1, 0, 1.0, 0.0 );
	mset( Hm, n, 1, 1, 4.0, -1.0 );
	mset( Hm, n, 1, 2, 1.5, 0.5 );
	mset( Hm, n, 1, 3, 0.5, 0.0 );
	mset( Hm, n, 1, 4, 0.3, 0.1 );
	mset( Hm, n, 1, 5, 0.15, 0.0 );
	mset( Hm, n, 2, 1, 0.8, 0.2 );
	mset( Hm, n, 2, 2, 3.0, 0.5 );
	mset( Hm, n, 2, 3, 1.0, -0.5 );
	mset( Hm, n, 2, 4, 0.5, 0.0 );
	mset( Hm, n, 2, 5, 0.25, 0.1 );
	mset( Hm, n, 3, 2, 0.6, -0.1 );
	mset( Hm, n, 3, 3, 2.5, -0.5 );
	mset( Hm, n, 3, 4, 1.0, 0.5 );
	mset( Hm, n, 3, 5, 0.5, 0.0 );
	mset( Hm, n, 4, 3, 0.4, 0.15 );
	mset( Hm, n, 4, 4, 2.0, 0.0 );
	mset( Hm, n, 4, 5, 1.0, -0.5 );
	mset( Hm, n, 5, 4, 0.3, -0.1 );
	mset( Hm, n, 5, 5, 1.5, 1.0 );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	const Sv = reinterpret( S, 0 );
	Sv[ 0 ] = 3.0; Sv[ 1 ] = 1.0;
	Sv[ 2 ] = 2.0; Sv[ 3 ] = -0.5;

	const nu = 2 * nshfts + 1;
	const Um = { data: new Complex128Array( nu * nu ), s1: 1, s2: nu, offset: 0 };
	const WVm = { data: new Complex128Array( n * nu ), s1: 1, s2: n, offset: 0 };
	const WHm = { data: new Complex128Array( nu * n ), s1: 1, s2: nu, offset: 0 };

	zlaqr5( true, true, 0, n, 1, n, nshfts,
		S, 1, 0,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		Um.data, Um.s1, Um.s2, Um.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		n,
		WHm.data, WHm.s1, WHm.s2, WHm.offset
	);

	assertArrayClose( getFlat( Hm, n ), tc.H, 1e-12, 'H' );
	assertArrayClose( getFlat( Zm, n ), tc.Z, 1e-12, 'Z' );
});

test( 'zlaqr5: 8x8 with 4 shifts', function t() {
	const tc = _8x8_4shifts;
	const n = 8;
	const nshfts = 4;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const Vm = makeMatrix( 3 );
	const S = new Complex128Array( nshfts );
	let i;

	mset( Hm, n, 0, 0, 8.0, 0.5 );
	mset( Hm, n, 0, 1, 1.0, -0.5 );
	mset( Hm, n, 0, 2, 0.5, 0.0 );
	mset( Hm, n, 0, 3, 0.25, 0.1 );
	mset( Hm, n, 1, 0, 1.0, 0.0 );
	mset( Hm, n, 1, 1, 7.0, -0.5 );
	mset( Hm, n, 1, 2, 1.0, 0.5 );
	mset( Hm, n, 1, 3, 0.5, 0.0 );
	mset( Hm, n, 1, 4, 0.25, 0.0 );
	mset( Hm, n, 2, 1, 0.8, 0.1 );
	mset( Hm, n, 2, 2, 6.0, 1.0 );
	mset( Hm, n, 2, 3, 1.0, -0.3 );
	mset( Hm, n, 2, 4, 0.5, 0.0 );
	mset( Hm, n, 2, 5, 0.2, 0.0 );
	mset( Hm, n, 3, 2, 0.7, -0.2 );
	mset( Hm, n, 3, 3, 5.0, -1.0 );
	mset( Hm, n, 3, 4, 1.0, 0.5 );
	mset( Hm, n, 3, 5, 0.4, 0.0 );
	mset( Hm, n, 3, 6, 0.1, 0.0 );
	mset( Hm, n, 4, 3, 0.6, 0.1 );
	mset( Hm, n, 4, 4, 4.0, 0.0 );
	mset( Hm, n, 4, 5, 1.0, -0.5 );
	mset( Hm, n, 4, 6, 0.3, 0.0 );
	mset( Hm, n, 4, 7, 0.1, 0.0 );
	mset( Hm, n, 5, 4, 0.5, -0.1 );
	mset( Hm, n, 5, 5, 3.0, 0.5 );
	mset( Hm, n, 5, 6, 1.0, 0.5 );
	mset( Hm, n, 5, 7, 0.2, 0.0 );
	mset( Hm, n, 6, 5, 0.4, 0.05 );
	mset( Hm, n, 6, 6, 2.0, -0.5 );
	mset( Hm, n, 6, 7, 1.0, -0.5 );
	mset( Hm, n, 7, 6, 0.3, -0.1 );
	mset( Hm, n, 7, 7, 1.0, 1.0 );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	const Sv = reinterpret( S, 0 );
	Sv[ 0 ] = 4.5; Sv[ 1 ] = 0.5;
	Sv[ 2 ] = 3.5; Sv[ 3 ] = -0.5;
	Sv[ 4 ] = 2.5; Sv[ 5 ] = 1.0;
	Sv[ 6 ] = 1.5; Sv[ 7 ] = -1.0;

	const nu = 2 * nshfts + 1;
	const Um = { data: new Complex128Array( nu * nu ), s1: 1, s2: nu, offset: 0 };
	const WVm = { data: new Complex128Array( n * nu ), s1: 1, s2: n, offset: 0 };
	const WHm = { data: new Complex128Array( nu * n ), s1: 1, s2: nu, offset: 0 };

	zlaqr5( true, true, 0, n, 1, n, nshfts,
		S, 1, 0,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		Um.data, Um.s1, Um.s2, Um.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		n,
		WHm.data, WHm.s1, WHm.s2, WHm.offset
	);

	assertArrayClose( getFlat( Hm, n ), tc.H, 1e-12, 'H' );
	assertArrayClose( getFlat( Zm, n ), tc.Z, 1e-12, 'Z' );
});

test( 'zlaqr5: 10x10 with 6 shifts', function t() {
	const tc = _10x10_6shifts;
	const n = 10;
	const nshfts = 6;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const Vm = makeMatrix( 3 );
	const S = new Complex128Array( nshfts );
	let i, j;

	for ( i = 0; i < n; i++ ) {
		mset( Hm, n, i, i, ( n - i ) * 3.0, ( i + 1 ) * 0.1 );
		if ( i < n - 1 ) {
			mset( Hm, n, i + 1, i, 0.5, 0.1 * Math.pow( -1, i + 1 ) );
		}
		for ( j = i + 1; j < Math.min( i + 3, n ); j++ ) {
			mset( Hm, n, i, j, 0.3 / ( j - i ), 0.05 * Math.pow( -1, j + 1 ) );
		}
	}

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	const Sv = reinterpret( S, 0 );
	Sv[ 0 ] = 5.0; Sv[ 1 ] = 0.3;
	Sv[ 2 ] = 4.0; Sv[ 3 ] = -0.2;
	Sv[ 4 ] = 3.0; Sv[ 5 ] = 0.5;
	Sv[ 6 ] = 2.0; Sv[ 7 ] = -0.4;
	Sv[ 8 ] = 1.5; Sv[ 9 ] = 0.1;
	Sv[ 10 ] = 1.0; Sv[ 11 ] = -0.3;

	const nu = 2 * nshfts + 1;
	const Um = { data: new Complex128Array( nu * nu ), s1: 1, s2: nu, offset: 0 };
	const WVm = { data: new Complex128Array( n * nu ), s1: 1, s2: n, offset: 0 };
	const WHm = { data: new Complex128Array( nu * n ), s1: 1, s2: nu, offset: 0 };

	zlaqr5( true, true, 0, n, 1, n, nshfts,
		S, 1, 0,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		Um.data, Um.s1, Um.s2, Um.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		n,
		WHm.data, WHm.s1, WHm.s2, WHm.offset
	);

	assertArrayClose( getFlat( Hm, n ), tc.H, 1e-10, 'H' );
	assertArrayClose( getFlat( Zm, n ), tc.Z, 1e-10, 'Z' );
});

test( 'zlaqr5: 8x8 with 4 shifts, no Z (wantz=false)', function t() {
	const tc = _8x8_4shifts_no_z;
	const n = 8;
	const nshfts = 4;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const Vm = makeMatrix( 3 );
	const S = new Complex128Array( nshfts );

	mset( Hm, n, 0, 0, 8.0, 0.5 );
	mset( Hm, n, 0, 1, 1.0, -0.5 );
	mset( Hm, n, 0, 2, 0.5, 0.0 );
	mset( Hm, n, 0, 3, 0.25, 0.1 );
	mset( Hm, n, 1, 0, 1.0, 0.0 );
	mset( Hm, n, 1, 1, 7.0, -0.5 );
	mset( Hm, n, 1, 2, 1.0, 0.5 );
	mset( Hm, n, 1, 3, 0.5, 0.0 );
	mset( Hm, n, 1, 4, 0.25, 0.0 );
	mset( Hm, n, 2, 1, 0.8, 0.1 );
	mset( Hm, n, 2, 2, 6.0, 1.0 );
	mset( Hm, n, 2, 3, 1.0, -0.3 );
	mset( Hm, n, 2, 4, 0.5, 0.0 );
	mset( Hm, n, 2, 5, 0.2, 0.0 );
	mset( Hm, n, 3, 2, 0.7, -0.2 );
	mset( Hm, n, 3, 3, 5.0, -1.0 );
	mset( Hm, n, 3, 4, 1.0, 0.5 );
	mset( Hm, n, 3, 5, 0.4, 0.0 );
	mset( Hm, n, 3, 6, 0.1, 0.0 );
	mset( Hm, n, 4, 3, 0.6, 0.1 );
	mset( Hm, n, 4, 4, 4.0, 0.0 );
	mset( Hm, n, 4, 5, 1.0, -0.5 );
	mset( Hm, n, 4, 6, 0.3, 0.0 );
	mset( Hm, n, 4, 7, 0.1, 0.0 );
	mset( Hm, n, 5, 4, 0.5, -0.1 );
	mset( Hm, n, 5, 5, 3.0, 0.5 );
	mset( Hm, n, 5, 6, 1.0, 0.5 );
	mset( Hm, n, 5, 7, 0.2, 0.0 );
	mset( Hm, n, 6, 5, 0.4, 0.05 );
	mset( Hm, n, 6, 6, 2.0, -0.5 );
	mset( Hm, n, 6, 7, 1.0, -0.5 );
	mset( Hm, n, 7, 6, 0.3, -0.1 );
	mset( Hm, n, 7, 7, 1.0, 1.0 );

	const Sv = reinterpret( S, 0 );
	Sv[ 0 ] = 4.5; Sv[ 1 ] = 0.5;
	Sv[ 2 ] = 3.5; Sv[ 3 ] = -0.5;
	Sv[ 4 ] = 2.5; Sv[ 5 ] = 1.0;
	Sv[ 6 ] = 1.5; Sv[ 7 ] = -1.0;

	const nu = 2 * nshfts + 1;
	const Um = { data: new Complex128Array( nu * nu ), s1: 1, s2: nu, offset: 0 };
	const WVm = { data: new Complex128Array( n * nu ), s1: 1, s2: n, offset: 0 };
	const WHm = { data: new Complex128Array( nu * n ), s1: 1, s2: nu, offset: 0 };

	zlaqr5( true, false, 0, n, 1, n, nshfts,
		S, 1, 0,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		Um.data, Um.s1, Um.s2, Um.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		n,
		WHm.data, WHm.s1, WHm.s2, WHm.offset
	);

	assertArrayClose( getFlat( Hm, n ), tc.H, 1e-12, 'H' );
});

test( 'zlaqr5: quick return for nshfts < 2', function t() {
	const n = 4;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const S = new Complex128Array( 1 );
	const Vm = makeMatrix( 3 );
	const Um = makeMatrix( 3 );
	const WVm = { data: new Complex128Array( n * 3 ), s1: 1, s2: n, offset: 0 };
	const WHm = { data: new Complex128Array( 3 * n ), s1: 1, s2: 3, offset: 0 };

	mset( Hm, n, 0, 0, 10.0, 0.0 );

	zlaqr5( true, true, 0, n, 1, n, 1,
		S, 1, 0,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		Um.data, Um.s1, Um.s2, Um.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		n,
		WHm.data, WHm.s1, WHm.s2, WHm.offset
	);

	const Hv = reinterpret( Hm.data, 0 );
	assert.equal( Hv[ 0 ], 10.0, 'H unchanged after quick return' );
});

test( 'zlaqr5: quick return for ktop >= kbot', function t() {
	const n = 4;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const S = new Complex128Array( 2 );
	const Vm = makeMatrix( 3 );
	const Um = makeMatrix( 5 );
	const WVm = { data: new Complex128Array( n * 5 ), s1: 1, s2: n, offset: 0 };
	const WHm = { data: new Complex128Array( 5 * n ), s1: 1, s2: 5, offset: 0 };

	mset( Hm, n, 0, 0, 10.0, 0.0 );

	zlaqr5( true, true, 0, n, 3, 3, 2,
		S, 1, 0,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		Um.data, Um.s1, Um.s2, Um.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		n,
		WHm.data, WHm.s1, WHm.s2, WHm.offset
	);

	const Hv = reinterpret( Hm.data, 0 );
	assert.equal( Hv[ 0 ], 10.0, 'H unchanged after quick return' );
});

test( 'zlaqr5: 8x8 with 4 shifts kacc22=1 (accum=true, U accumulator)', function t() {
	const n = 8;
	const nshfts = 4;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const Vm = makeMatrix( 3 );
	const S = new Complex128Array( nshfts );
	let i;

	mset( Hm, n, 0, 0, 8.0, 0.5 );
	mset( Hm, n, 0, 1, 1.0, -0.5 );
	mset( Hm, n, 0, 2, 0.5, 0.0 );
	mset( Hm, n, 0, 3, 0.25, 0.1 );
	mset( Hm, n, 1, 0, 1.0, 0.0 );
	mset( Hm, n, 1, 1, 7.0, -0.5 );
	mset( Hm, n, 1, 2, 1.0, 0.5 );
	mset( Hm, n, 1, 3, 0.5, 0.0 );
	mset( Hm, n, 1, 4, 0.25, 0.0 );
	mset( Hm, n, 2, 1, 0.8, 0.1 );
	mset( Hm, n, 2, 2, 6.0, 1.0 );
	mset( Hm, n, 2, 3, 1.0, -0.3 );
	mset( Hm, n, 2, 4, 0.5, 0.0 );
	mset( Hm, n, 2, 5, 0.2, 0.0 );
	mset( Hm, n, 3, 2, 0.7, -0.2 );
	mset( Hm, n, 3, 3, 5.0, -1.0 );
	mset( Hm, n, 3, 4, 1.0, 0.5 );
	mset( Hm, n, 3, 5, 0.4, 0.0 );
	mset( Hm, n, 3, 6, 0.1, 0.0 );
	mset( Hm, n, 4, 3, 0.6, 0.1 );
	mset( Hm, n, 4, 4, 4.0, 0.0 );
	mset( Hm, n, 4, 5, 1.0, -0.5 );
	mset( Hm, n, 4, 6, 0.3, 0.0 );
	mset( Hm, n, 4, 7, 0.1, 0.0 );
	mset( Hm, n, 5, 4, 0.5, -0.1 );
	mset( Hm, n, 5, 5, 3.0, 0.5 );
	mset( Hm, n, 5, 6, 1.0, 0.5 );
	mset( Hm, n, 5, 7, 0.2, 0.0 );
	mset( Hm, n, 6, 5, 0.4, 0.05 );
	mset( Hm, n, 6, 6, 2.0, -0.5 );
	mset( Hm, n, 6, 7, 1.0, -0.5 );
	mset( Hm, n, 7, 6, 0.3, -0.1 );
	mset( Hm, n, 7, 7, 1.0, 1.0 );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	const Sv = reinterpret( S, 0 );
	Sv[ 0 ] = 4.5; Sv[ 1 ] = 0.5;
	Sv[ 2 ] = 3.5; Sv[ 3 ] = -0.5;
	Sv[ 4 ] = 2.5; Sv[ 5 ] = 1.0;
	Sv[ 6 ] = 1.5; Sv[ 7 ] = -1.0;

	const nu = 2 * nshfts + 1;
	const Um = { data: new Complex128Array( nu * nu ), s1: 1, s2: nu, offset: 0 };
	const WVm = { data: new Complex128Array( n * nu ), s1: 1, s2: n, offset: 0 };
	const WHm = { data: new Complex128Array( nu * n ), s1: 1, s2: nu, offset: 0 };

	const Hbefore = getFlat( Hm, n ).slice();

	zlaqr5( true, true, 1, n, 1, n, nshfts,
		S, 1, 0,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		Um.data, Um.s1, Um.s2, Um.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		n,
		WHm.data, WHm.s1, WHm.s2, WHm.offset
	);

	// H must change (sweep applied)
	const Hv = getFlat( Hm, n );
	let changed = false;
	for ( i = 0; i < Hv.length; i++ ) {
		if ( Math.abs( Hv[ i ] - Hbefore[ i ] ) > 1e-12 ) {
			changed = true;
			break;
		}
	}
	assert.ok( changed, 'H modified by sweep' );
});

test( 'zlaqr5: 8x8 with 4 shifts kacc22=2 (accum + 2x2 block updates)', function t() {
	const n = 8;
	const nshfts = 4;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const Vm = makeMatrix( 3 );
	const S = new Complex128Array( nshfts );
	let i;

	mset( Hm, n, 0, 0, 8.0, 0.5 );
	mset( Hm, n, 0, 1, 1.0, -0.5 );
	mset( Hm, n, 1, 0, 1.0, 0.0 );
	mset( Hm, n, 1, 1, 7.0, -0.5 );
	mset( Hm, n, 1, 2, 1.0, 0.5 );
	mset( Hm, n, 2, 1, 0.8, 0.1 );
	mset( Hm, n, 2, 2, 6.0, 1.0 );
	mset( Hm, n, 2, 3, 1.0, -0.3 );
	mset( Hm, n, 3, 2, 0.7, -0.2 );
	mset( Hm, n, 3, 3, 5.0, -1.0 );
	mset( Hm, n, 3, 4, 1.0, 0.5 );
	mset( Hm, n, 4, 3, 0.6, 0.1 );
	mset( Hm, n, 4, 4, 4.0, 0.0 );
	mset( Hm, n, 4, 5, 1.0, -0.5 );
	mset( Hm, n, 5, 4, 0.5, -0.1 );
	mset( Hm, n, 5, 5, 3.0, 0.5 );
	mset( Hm, n, 5, 6, 1.0, 0.5 );
	mset( Hm, n, 6, 5, 0.4, 0.05 );
	mset( Hm, n, 6, 6, 2.0, -0.5 );
	mset( Hm, n, 6, 7, 1.0, -0.5 );
	mset( Hm, n, 7, 6, 0.3, -0.1 );
	mset( Hm, n, 7, 7, 1.0, 1.0 );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	const Sv = reinterpret( S, 0 );
	Sv[ 0 ] = 4.5; Sv[ 1 ] = 0.5;
	Sv[ 2 ] = 3.5; Sv[ 3 ] = -0.5;
	Sv[ 4 ] = 2.5; Sv[ 5 ] = 1.0;
	Sv[ 6 ] = 1.5; Sv[ 7 ] = -1.0;

	const nu = 2 * nshfts + 1;
	const Um = { data: new Complex128Array( nu * nu ), s1: 1, s2: nu, offset: 0 };
	const WVm = { data: new Complex128Array( n * nu ), s1: 1, s2: n, offset: 0 };
	const WHm = { data: new Complex128Array( nu * n ), s1: 1, s2: nu, offset: 0 };

	zlaqr5( true, true, 2, n, 1, n, nshfts,
		S, 1, 0,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		Um.data, Um.s1, Um.s2, Um.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		n,
		WHm.data, WHm.s1, WHm.s2, WHm.offset
	);
	// kacc22=2 should still produce a result without errors
	assert.ok( true, 'completed without error' );
});

test( 'zlaqr5: 8x8 kacc22=1 wantt=false (jbot=kbot path)', function t() {
	const n = 8;
	const nshfts = 4;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const Vm = makeMatrix( 3 );
	const S = new Complex128Array( nshfts );
	let i;

	mset( Hm, n, 0, 0, 8.0, 0.5 );
	mset( Hm, n, 1, 0, 1.0, 0.0 );
	mset( Hm, n, 1, 1, 7.0, -0.5 );
	mset( Hm, n, 2, 1, 0.8, 0.1 );
	mset( Hm, n, 2, 2, 6.0, 1.0 );
	mset( Hm, n, 3, 2, 0.7, -0.2 );
	mset( Hm, n, 3, 3, 5.0, -1.0 );
	mset( Hm, n, 4, 3, 0.6, 0.1 );
	mset( Hm, n, 4, 4, 4.0, 0.0 );
	mset( Hm, n, 5, 4, 0.5, -0.1 );
	mset( Hm, n, 5, 5, 3.0, 0.5 );
	mset( Hm, n, 6, 5, 0.4, 0.05 );
	mset( Hm, n, 6, 6, 2.0, -0.5 );
	mset( Hm, n, 7, 6, 0.3, -0.1 );
	mset( Hm, n, 7, 7, 1.0, 1.0 );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	const Sv = reinterpret( S, 0 );
	Sv[ 0 ] = 4.5; Sv[ 1 ] = 0.5;
	Sv[ 2 ] = 3.5; Sv[ 3 ] = -0.5;
	Sv[ 4 ] = 2.5; Sv[ 5 ] = 1.0;
	Sv[ 6 ] = 1.5; Sv[ 7 ] = -1.0;

	const nu = 2 * nshfts + 1;
	const Um = { data: new Complex128Array( nu * nu ), s1: 1, s2: nu, offset: 0 };
	const WVm = { data: new Complex128Array( n * nu ), s1: 1, s2: n, offset: 0 };
	const WHm = { data: new Complex128Array( nu * n ), s1: 1, s2: nu, offset: 0 };

	// wantt=false, kacc22=1
	zlaqr5( false, true, 1, n, 1, n, nshfts,
		S, 1, 0,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		Um.data, Um.s1, Um.s2, Um.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		n,
		WHm.data, WHm.s1, WHm.s2, WHm.offset
	);
	assert.ok( true, 'completed' );
});

test( 'zlaqr5: 6x6 kacc22=0 wantt=false (jbot=kbot path no accum)', function t() {
	const n = 6;
	const nshfts = 2;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const Vm = makeMatrix( 3 );
	const S = new Complex128Array( nshfts );
	let i;

	mset( Hm, n, 0, 0, 5.0, 1.0 );
	mset( Hm, n, 1, 0, 1.0, 0.0 );
	mset( Hm, n, 1, 1, 4.0, -1.0 );
	mset( Hm, n, 2, 1, 0.8, 0.2 );
	mset( Hm, n, 2, 2, 3.0, 0.5 );
	mset( Hm, n, 3, 2, 0.6, -0.1 );
	mset( Hm, n, 3, 3, 2.5, -0.5 );
	mset( Hm, n, 4, 3, 0.4, 0.15 );
	mset( Hm, n, 4, 4, 2.0, 0.0 );
	mset( Hm, n, 5, 4, 0.3, -0.1 );
	mset( Hm, n, 5, 5, 1.5, 1.0 );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	const Sv = reinterpret( S, 0 );
	Sv[ 0 ] = 3.0; Sv[ 1 ] = 1.0;
	Sv[ 2 ] = 2.0; Sv[ 3 ] = -0.5;

	const nu = 2 * nshfts + 1;
	const Um = { data: new Complex128Array( nu * nu ), s1: 1, s2: nu, offset: 0 };
	const WVm = { data: new Complex128Array( n * nu ), s1: 1, s2: n, offset: 0 };
	const WHm = { data: new Complex128Array( nu * n ), s1: 1, s2: nu, offset: 0 };

	zlaqr5( false, true, 0, n, 1, n, nshfts,
		S, 1, 0,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		Um.data, Um.s1, Um.s2, Um.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		n,
		WHm.data, WHm.s1, WHm.s2, WHm.offset
	);
	assert.ok( true, 'completed' );
});

test( 'zlaqr5: 6x6 nshfts=2, ktop=2, kbot=6 partial sweep', function t() {
	// Tests partial sweep with subrange [ktop, kbot]
	const n = 6;
	const nshfts = 2;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const Vm = makeMatrix( 3 );
	const S = new Complex128Array( nshfts );
	let i;

	mset( Hm, n, 0, 0, 10.0, 0.0 );
	mset( Hm, n, 1, 1, 4.0, 0.5 );
	mset( Hm, n, 2, 1, 1.0, 0.0 );
	mset( Hm, n, 2, 2, 3.5, 0.0 );
	mset( Hm, n, 3, 2, 0.5, 0.0 );
	mset( Hm, n, 3, 3, 3.0, 0.0 );
	mset( Hm, n, 4, 3, 0.4, 0.0 );
	mset( Hm, n, 4, 4, 2.5, 0.0 );
	mset( Hm, n, 5, 4, 0.3, 0.0 );
	mset( Hm, n, 5, 5, 2.0, 0.0 );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	const Sv = reinterpret( S, 0 );
	Sv[ 0 ] = 3.0; Sv[ 1 ] = 0.0;
	Sv[ 2 ] = 2.5; Sv[ 3 ] = 0.0;

	const nu = 2 * nshfts + 1;
	const Um = { data: new Complex128Array( nu * nu ), s1: 1, s2: nu, offset: 0 };
	const WVm = { data: new Complex128Array( n * nu ), s1: 1, s2: n, offset: 0 };
	const WHm = { data: new Complex128Array( nu * n ), s1: 1, s2: nu, offset: 0 };

	zlaqr5( true, true, 0, n, 2, 6, nshfts,
		S, 1, 0,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		Um.data, Um.s1, Um.s2, Um.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		n,
		WHm.data, WHm.s1, WHm.s2, WHm.offset
	);
	assert.ok( true, 'completed' );
});

test( 'zlaqr5: throws RangeError for negative N', function t() {
	const S = new Complex128Array( 2 );
	const Hm = makeMatrix( 1 );
	const Zm = makeMatrix( 1 );
	const Vm = makeMatrix( 3 );
	const Um = makeMatrix( 5 );
	const WVm = { data: new Complex128Array( 5 ), s1: 1, s2: 1, offset: 0 };
	const WHm = { data: new Complex128Array( 5 ), s1: 1, s2: 5, offset: 0 };
	assert.throws( function throws() {
		zlaqr5( true, true, 0, -1, 1, 1, 2,
			S, 1, 0,
			Hm.data, Hm.s1, Hm.s2, Hm.offset,
			1, 1,
			Zm.data, Zm.s1, Zm.s2, Zm.offset,
			Vm.data, Vm.s1, Vm.s2, Vm.offset,
			Um.data, Um.s1, Um.s2, Um.offset,
			1,
			WVm.data, WVm.s1, WVm.s2, WVm.offset,
			1,
			WHm.data, WHm.s1, WHm.s2, WHm.offset
		);
	}, RangeError );
});

test( 'zlaqr5: 6x6 partial sweep (ktop=2, kbot=5)', function t() {
	const tc = _6x6_partial_sweep;
	const n = 6;
	const nshfts = 2;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const Vm = makeMatrix( 3 );
	const S = new Complex128Array( nshfts );
	let i;

	mset( Hm, n, 0, 0, 10.0, 0.0 );
	mset( Hm, n, 0, 1, 1.0, 0.5 );
	mset( Hm, n, 0, 2, 0.5, 0.0 );
	mset( Hm, n, 1, 1, 5.0, 1.0 );
	mset( Hm, n, 1, 2, 2.0, -0.5 );
	mset( Hm, n, 1, 3, 1.0, 0.0 );
	mset( Hm, n, 1, 4, 0.5, 0.2 );
	mset( Hm, n, 2, 1, 1.0, 0.0 );
	mset( Hm, n, 2, 2, 4.0, -1.0 );
	mset( Hm, n, 2, 3, 1.5, 0.5 );
	mset( Hm, n, 2, 4, 0.5, 0.0 );
	mset( Hm, n, 3, 2, 0.8, 0.2 );
	mset( Hm, n, 3, 3, 3.0, 0.5 );
	mset( Hm, n, 3, 4, 1.0, -0.5 );
	mset( Hm, n, 4, 3, 0.6, -0.1 );
	mset( Hm, n, 4, 4, 2.0, 0.0 );
	mset( Hm, n, 4, 5, 0.5, 0.5 );
	mset( Hm, n, 5, 5, -1.0, 2.0 );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	const Sv = reinterpret( S, 0 );
	Sv[ 0 ] = 3.0; Sv[ 1 ] = 0.5;
	Sv[ 2 ] = 2.5; Sv[ 3 ] = -0.5;

	const nu = 2 * nshfts + 1;
	const Um = { data: new Complex128Array( nu * nu ), s1: 1, s2: nu, offset: 0 };
	const WVm = { data: new Complex128Array( n * nu ), s1: 1, s2: n, offset: 0 };
	const WHm = { data: new Complex128Array( nu * n ), s1: 1, s2: nu, offset: 0 };

	zlaqr5( true, true, 0, n, 2, 5, nshfts,
		S, 1, 0,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		Um.data, Um.s1, Um.s2, Um.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		n,
		WHm.data, WHm.s1, WHm.s2, WHm.offset
	);

	assertArrayClose( getFlat( Hm, n ), tc.H, 1e-12, 'H' );
	assertArrayClose( getFlat( Zm, n ), tc.Z, 1e-12, 'Z' );
});

/**
* Runs a zlaqr5 sweep over rows/columns ktop:kbot (1-based) with Z = I accumulated over 1:N.
*
* @private
* @param {integer} kacc22 - accumulation mode
* @param {PositiveInteger} N - order
* @param {integer} ktop - first row of the active block
* @param {integer} kbot - last row of the active block
* @param {Array<number>} shifts - interleaved shifts
* @param {Complex128Array} H0 - matrix (not modified)
* @returns {Object} H and Z after the sweep
*/
function sweep( kacc22, N, ktop, kbot, shifts, H0 ) {
	const ns = shifts.length / 2;
	const nu = ( 2 * ns ) + 1;
	const H = new Complex128Array( reinterpret( H0, 0 ) );
	const Z = eyeC( N );
	zlaqr5( true, true, kacc22, N, ktop, kbot, ns, new Complex128Array( shifts ), 1, 0, H, 1, N, 0, 1, N, Z, 1, N, 0, new Complex128Array( 3 * ns ), 1, 3, 0, new Complex128Array( nu * nu ), 1, nu, 0, N, new Complex128Array( N * nu ), 1, N, 0, N, new Complex128Array( nu * N ), 1, nu, 0 );
	return {
		'H': H,
		'Z': Z
	};
}

/**
* Asserts that a sweep is a unitary similarity that leaves H upper Hessenberg (exact zeros below the subdiagonal).
*
* @private
* @param {Complex128Array} H0 - matrix before the sweep
* @param {Object} out - sweep result
* @param {PositiveInteger} N - order
* @param {string} msg - message prefix
*/
function assertSweep( H0, out, N, msg ) {
	const h = reinterpret( out.H, 0 );
	let i;
	let j;
	assertSimilarC( H0, out.H, out.Z, N, msg );
	for ( j = 0; j < N; j++ ) {
		for ( i = j + 2; i < N; i++ ) {
			assert.ok( h[ 2 * ( i + ( j * N ) ) ] === 0.0 && h[ ( 2 * ( i + ( j * N ) ) ) + 1 ] === 0.0, msg + ': H(' + ( i + 1 ) + ',' + ( j + 1 ) + ') = 0' );
		}
	}
}

test( 'zlaqr5: zero shifts on a cyclic permutation keep the zero diagonal (tst1 === 0) without false deflation', function t() {
	const N = 8;
	let kacc22;
	let out;
	let ns;
	let h;
	let i;
	for ( ns = 2; ns <= 4; ns += 2 ) {
		for ( kacc22 = 0; kacc22 <= 2; kacc22++ ) {
			out = sweep( kacc22, N, 1, N, new Array( 2 * ns ).fill( 0.0 ), cyclicC( N ) );
			assertSweep( cyclicC( N ), out, N, 'ns=' + ns + ' kacc22=' + kacc22 );
			h = reinterpret( out.H, 0 );
			for ( i = 1; i < N; i++ ) {
				assert.strictEqual( Math.hypot( h[ 2 * ( i + ( ( i - 1 ) * N ) ) ], h[ ( 2 * ( i + ( ( i - 1 ) * N ) ) ) + 1 ] ), 1.0, 'ns=' + ns + ' kacc22=' + kacc22 + ': |H(' + ( i + 1 ) + ',' + i + ')| = 1' );
			}
		}
	}
});

test( 'zlaqr5: negligible subdiagonals are set to zero during the sweep (vigilant deflation, 2x2 and 3x3 bulges)', function t() {
	const N = 8;
	const shifts = [ 0.1, 0.2, -0.3, 0.1, 0.2, 0.2, 0.3, -0.1 ];
	let kacc22;
	let zeros;
	let out;
	let H0;
	let ns;
	let h;
	let v;
	let i;
	for ( kacc22 = 0; kacc22 <= 2; kacc22 += 2 ) {
		for ( ns = 2; ns <= 4; ns += 2 ) {
			H0 = randomHessenbergC( N, 9 );
			v = reinterpret( H0, 0 );
			for ( i = 1; i < N; i++ ) {
				v[ 2 * ( i + ( ( i - 1 ) * N ) ) ] = 1e-17;
				v[ ( 2 * ( i + ( ( i - 1 ) * N ) ) ) + 1 ] = 0.0;
			}
			out = sweep( kacc22, N, 1, N, shifts.slice( 0, 2 * ns ), H0 );
			assertSweep( H0, out, N, 'ns=' + ns + ' kacc22=' + kacc22 );
			h = reinterpret( out.H, 0 );
			zeros = 0;
			for ( i = 1; i < N; i++ ) {
				if ( h[ 2 * ( i + ( ( i - 1 ) * N ) ) ] === 0.0 && h[ ( 2 * ( i + ( ( i - 1 ) * N ) ) ) + 1 ] === 0.0 ) {
					zeros += 1;
				}
			}
			assert.ok( zeros > 0, 'ns=' + ns + ' kacc22=' + kacc22 + ': some subdiagonal deflated' );
		}
	}
});

test( 'zlaqr5: a 2x2 active block (ktop = kbot - 1) is swept by a single 2x2 reflector', function t() {
	// The active block is decoupled: H(3,2) = H(5,4) = 0
	const N = 6;
	const H0 = randomHessenbergC( N, 5 );
	const h0 = reinterpret( H0, 0 );
	h0[ 2 * ( 2 + N ) ] = 0.0;
	h0[ ( 2 * ( 2 + N ) ) + 1 ] = 0.0;
	h0[ 2 * ( 4 + ( 3 * N ) ) ] = 0.0;
	h0[ ( 2 * ( 4 + ( 3 * N ) ) ) + 1 ] = 0.0;
	const out = sweep( 0, N, 3, 4, [ 0.1, 0.2, -0.3, 0.1 ], H0 );
	const h = reinterpret( out.H, 0 );
	let i;
	assertSweep( H0, out, N, '2x2 block' );

	// The sweep touches rows/columns 3:4 only: H(1:2,1:2) and H(5:6,5:6) are unchanged
	for ( i = 0; i < 2; i++ ) {
		assert.strictEqual( h[ 2 * ( i + ( i * N ) ) ], h0[ 2 * ( i + ( i * N ) ) ], 'H(' + ( i + 1 ) + ',' + ( i + 1 ) + ')' );
		assert.strictEqual( h[ 2 * ( ( i + 4 ) + ( ( i + 4 ) * N ) ) ], h0[ 2 * ( ( i + 4 ) + ( ( i + 4 ) * N ) ) ], 'H(' + ( i + 5 ) + ',' + ( i + 5 ) + ')' );
	}
});

test( 'zlaqr5: bulge collapsing on a zero subdiagonal is replaced by a fresh bulge (negligible fill)', function t() {
	// H(3,2) = 0 and shifts summing to H(1,1)+H(2,2) make the first reflector act on rows 1:2 only, so the next bulge position looks collapsed and is reintroduced from the shifts.
	const N = 8;
	const H0 = randomHessenbergC( N, 7 );
	const v = reinterpret( H0, 0 );
	v[ 2 * ( 2 + N ) ] = 0.0;
	v[ ( 2 * ( 2 + N ) ) + 1 ] = 0.0;
	const ar = ( v[ 0 ] + v[ 2 * ( 1 + N ) ] ) / 2.0;
	const ai = ( v[ 1 ] + v[ ( 2 * ( 1 + N ) ) + 1 ] ) / 2.0;
	const out = sweep( 0, N, 1, N, [ ar + 0.3, ai, ar - 0.3, ai ], H0 );
	assertSweep( H0, out, N, 'collapsed bulge' );
});

test( 'zlaqr5: bulge collapsing by destructive underflow keeps the old reflector when a fresh one would cause fill', function t() {
	// H(4,3) is the smallest subnormal, so the delayed update of row 4 underflows to zero and the bulge looks collapsed while H(2,1), H(3,1) are O(1).
	const N = 6;
	const H0 = new Complex128Array( N * N );
	const v = reinterpret( H0, 0 );
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= Math.min( j + 1, N - 1 ); i++ ) {
			v[ 2 * ( i + ( j * N ) ) ] = 1.0 + ( ( ( 3 * i ) + ( 7 * j ) ) % 5 ) / 4.0;
			v[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = ( ( i + ( 2 * j ) ) % 3 ) / 4.0;
		}
	}
	v[ 2 * ( 3 + ( 2 * N ) ) ] = 5e-324;
	v[ ( 2 * ( 3 + ( 2 * N ) ) ) + 1 ] = 0.0;
	const out = sweep( 0, N, 1, N, [ 0.5, 0.25, 0.5, -0.25 ], H0 );
	assertSweep( H0, out, N, 'underflow collapse' );
});
