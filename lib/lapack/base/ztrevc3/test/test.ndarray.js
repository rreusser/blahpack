/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztrevc3 from './../lib/ndarray.js';

// FIXTURES //

import right_all_n1 from './fixtures/right_all_n1.json' with { type: 'json' };
import right_all_3x3 from './fixtures/right_all_3x3.json' with { type: 'json' };
import left_all_3x3 from './fixtures/left_all_3x3.json' with { type: 'json' };
import both_all_3x3 from './fixtures/both_all_3x3.json' with { type: 'json' };
import right_all_diag from './fixtures/right_all_diag.json' with { type: 'json' };
import right_all_4x4 from './fixtures/right_all_4x4.json' with { type: 'json' };
import right_backtransform_3x3 from './fixtures/right_backtransform_3x3.json' with { type: 'json' };
import left_backtransform_3x3 from './fixtures/left_backtransform_3x3.json' with { type: 'json' };

function assertClose( actual, expected, tol, msg ) {
	const diff = Math.abs( actual - expected );
	const denom = Math.max( Math.abs( expected ), 1.0 );
	const relErr = diff / denom;
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.strictEqual( actual.length >= expected.length, true, msg + ' length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// HELPERS //

function makeMatrix( vals, N ) {
	const buf = new Complex128Array( N * N );
	const v = reinterpret( buf, 0 );
	let i;
	for ( i = 0; i < vals.length; i++ ) {
		v[ i ] = vals[ i ];
	}
	return buf;
}

// TESTS //

test( 'ztrevc3 is a function', function t() {
	assert.strictEqual( typeof ztrevc3, 'function' );
});

test( 'ztrevc3: N=1 right eigenvectors', function t() {
	const m = new Int32Array( 1 );
	const tc = right_all_n1;
	const T = makeMatrix( [ 5.0, -3.0 ], 1 );
	const VR = new Complex128Array( 1 );
	const VL = new Complex128Array( 1 );
	const WORK = new Complex128Array( 3 );
	const RWORK = new Float64Array( 1 );
	const SELECT = new Uint8Array( 1 );
	const vrv = reinterpret( VR, 0 );

	const info = ztrevc3( 'right', 'all', SELECT, 1, 0, 1, T, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, 1, m, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( vrv, tc.VR, 1e-14, 'VR' );
});

test( 'ztrevc3: right eigenvectors, all, 3x3', function t() {
	const m = new Int32Array( 1 );
	const tc = right_all_3x3;
	const N = 3;
	const T = makeMatrix( [
		1.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		0.5, 0.0,  2.0, -1.0, 0.0, 0.0,
		0.0, 0.3,  0.2, 0.1,  3.0, 0.0
	], N );
	const VR = new Complex128Array( N * N );
	const VL = new Complex128Array( N * N );
	const WORK = new Complex128Array( 3 * N );
	const RWORK = new Float64Array( N );
	const SELECT = new Uint8Array( N );
	const vrv = reinterpret( VR, 0 );

	const info = ztrevc3( 'right', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( vrv, tc.VR, 1e-13, 'VR' );
});

test( 'ztrevc3: left eigenvectors, all, 3x3', function t() {
	const m = new Int32Array( 1 );
	const tc = left_all_3x3;
	const N = 3;
	const T = makeMatrix( [
		1.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		0.5, 0.0,  2.0, -1.0, 0.0, 0.0,
		0.0, 0.3,  0.2, 0.1,  3.0, 0.0
	], N );
	const VR = new Complex128Array( N * N );
	const VL = new Complex128Array( N * N );
	const WORK = new Complex128Array( 3 * N );
	const RWORK = new Float64Array( N );
	const SELECT = new Uint8Array( N );
	const vlv = reinterpret( VL, 0 );

	const info = ztrevc3( 'left', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( vlv, tc.VL, 1e-13, 'VL' );
});

test( 'ztrevc3: both eigenvectors, all, 3x3', function t() {
	const m = new Int32Array( 1 );
	const tc = both_all_3x3;
	const N = 3;
	const T = makeMatrix( [
		1.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		0.5, 0.0,  2.0, -1.0, 0.0, 0.0,
		0.0, 0.3,  0.2, 0.1,  3.0, 0.0
	], N );
	const VR = new Complex128Array( N * N );
	const VL = new Complex128Array( N * N );
	const WORK = new Complex128Array( 3 * N );
	const RWORK = new Float64Array( N );
	const SELECT = new Uint8Array( N );
	const vrv = reinterpret( VR, 0 );
	const vlv = reinterpret( VL, 0 );

	const info = ztrevc3( 'both', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( vrv, tc.VR, 1e-13, 'VR' );
	assertArrayClose( vlv, tc.VL, 1e-13, 'VL' );
});

test( 'ztrevc3: right eigenvectors, diagonal matrix', function t() {
	const m = new Int32Array( 1 );
	const tc = right_all_diag;
	const N = 3;
	const T = makeMatrix( [
		2.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		0.0, 0.0,  3.0, -2.0, 0.0, 0.0,
		0.0, 0.0,  0.0, 0.0,  1.0, 0.0
	], N );
	const VR = new Complex128Array( N * N );
	const VL = new Complex128Array( N * N );
	const WORK = new Complex128Array( 3 * N );
	const RWORK = new Float64Array( N );
	const SELECT = new Uint8Array( N );
	const vrv = reinterpret( VR, 0 );

	const info = ztrevc3( 'right', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.strictEqual( info, tc.INFO );
	// For diagonal matrix, eigenvectors should be identity columns
	// VR is NxN col-major complex: VR(i,j) = vrv[(j*N+i)*2], vrv[(j*N+i)*2+1]
	assertClose( vrv[ 0 ], 1.0, 1e-14, 'VR(0,0) re' );
	assertClose( vrv[ 1 ], 0.0, 1e-14, 'VR(0,0) im' );
	assertClose( vrv[ 8 ], 1.0, 1e-14, 'VR(1,1) re' );
	assertClose( vrv[ 9 ], 0.0, 1e-14, 'VR(1,1) im' );
});

test( 'ztrevc3: right eigenvectors, 4x4', function t() {
	const m = new Int32Array( 1 );
	const tc = right_all_4x4;
	const N = 4;
	const T = makeMatrix( [
		1.0, 0.0,   0.0, 0.0,   0.0, 0.0,   0.0, 0.0,
		0.5, 0.2,   2.0, 1.0,   0.0, 0.0,   0.0, 0.0,
		0.1, 0.0,   0.3, -0.1,  3.0, -1.0,  0.0, 0.0,
		0.0, 0.3,   0.0, 0.0,   0.4, 0.2,   4.0, 0.0
	], N );
	const VR = new Complex128Array( N * N );
	const VL = new Complex128Array( N * N );
	const WORK = new Complex128Array( 3 * N );
	const RWORK = new Float64Array( N );
	const SELECT = new Uint8Array( N );
	const vrv = reinterpret( VR, 0 );

	const info = ztrevc3( 'right', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( vrv, tc.VR, 1e-12, 'VR' );
});

test( 'ztrevc3: right backtransform with identity, 3x3', function t() {
	const m = new Int32Array( 1 );
	const tc = right_backtransform_3x3;
	const N = 3;
	const T = makeMatrix( [
		1.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		0.5, 0.0,  2.0, -1.0, 0.0, 0.0,
		0.0, 0.3,  0.2, 0.1,  3.0, 0.0
	], N );
	// VR = identity
	const VR = makeMatrix( [
		1.0, 0.0,  0.0, 0.0,  0.0, 0.0,
		0.0, 0.0,  1.0, 0.0,  0.0, 0.0,
		0.0, 0.0,  0.0, 0.0,  1.0, 0.0
	], N );
	const VL = new Complex128Array( N * N );
	const WORK = new Complex128Array( 3 * N );
	const RWORK = new Float64Array( N );
	const SELECT = new Uint8Array( N );
	const vrv = reinterpret( VR, 0 );

	const info = ztrevc3( 'right', 'backtransform', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( vrv, tc.VR, 1e-13, 'VR' );
});

test( 'ztrevc3: left backtransform with identity, 3x3', function t() {
	const m = new Int32Array( 1 );
	const tc = left_backtransform_3x3;
	const N = 3;
	const T = makeMatrix( [
		1.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		0.5, 0.0,  2.0, -1.0, 0.0, 0.0,
		0.0, 0.3,  0.2, 0.1,  3.0, 0.0
	], N );
	// VL = identity
	const VL = makeMatrix( [
		1.0, 0.0,  0.0, 0.0,  0.0, 0.0,
		0.0, 0.0,  1.0, 0.0,  0.0, 0.0,
		0.0, 0.0,  0.0, 0.0,  1.0, 0.0
	], N );
	const VR = new Complex128Array( N * N );
	const WORK = new Complex128Array( 3 * N );
	const RWORK = new Float64Array( N );
	const SELECT = new Uint8Array( N );
	const vlv = reinterpret( VL, 0 );

	const info = ztrevc3( 'left', 'backtransform', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( vlv, tc.VL, 1e-13, 'VL' );
});

test( 'ztrevc3: N=0 returns immediately', function t() {
	const m = new Int32Array( 1 );
	const T = new Complex128Array( 1 );
	const VR = new Complex128Array( 1 );
	const VL = new Complex128Array( 1 );
	const WORK = new Complex128Array( 3 );
	const RWORK = new Float64Array( 1 );
	const SELECT = new Uint8Array( 1 );

	const info = ztrevc3( 'right', 'all', SELECT, 1, 0, 0, T, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, 0, m, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, 0 );
});

/**
* Returns a deterministic generator of values in [-1,1).
*
* @private
* @param {integer} seed - seed
* @returns {Function} generator
*/
function lcg( seed ) {
	let s = seed;
	return function rand() {
		s = ( ( s * 1103515245 ) + 12345 ) % 2147483648;
		return ( s / 1073741824 ) - 1.0;
	};
}

/**
* Back-transforms the eigenvectors of a deterministic upper triangular matrix with a NaN-poisoned WORK of `lwork` elements.
*
* @private
* @param {string} side - side
* @param {string} howmny - howmny
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} lwork - workspace length
* @returns {Object} `VL`, `VR` and `WORK` (interleaved views)
*/
function run( side, howmny, N, lwork ) {
	const rand = lcg( 7 );
	const T = new Complex128Array( N * N );
	const tv = reinterpret( T, 0 );
	const VL = new Complex128Array( N * N );
	const VR = new Complex128Array( N * N );
	const vl = reinterpret( VL, 0 );
	const vr = reinterpret( VR, 0 );
	const WORK = new Complex128Array( lwork );
	const wv = reinterpret( WORK, 0 );
	const m = new Int32Array( 1 );
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			tv[ 2 * ( i + ( j * N ) ) ] = ( ( i === j ) ? 3.0 : 1.0 ) * rand();
			tv[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = rand();
		}
	}
	for ( i = 0; i < 2 * N * N; i++ ) {
		vl[ i ] = rand();
		vr[ i ] = vl[ i ];
	}
	wv.fill( NaN );
	const t0 = new Float64Array( tv );
	const info = ztrevc3( side, howmny, new Uint8Array( N ), 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0, new Float64Array( N ), 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( m[ 0 ], N, 'M' );
	assert.deepStrictEqual( Array.from( tv ), Array.from( t0 ), 'T is restored' );
	return {
		'VL': vl,
		'VR': vr,
		'WORK': wv
	};
}

test( 'ztrevc3: at N=70 the blocked back-transformation (NB = 8, 20, 64, 128) matches the minimum WORK (2*N, NB = 1)', function t() {
	const N = 70;
	[ 'right', 'left', 'both' ].forEach( function eachSide( side ) {
		const expected = run( side, 'backtransform', N, 2 * N );
		[ N + ( 2 * N * 8 ), N + ( 2 * N * 20 ), N + ( 2 * N * 64 ), N + ( 2 * N * 200 ) ].forEach( function eachLwork( lwork ) {
			const out = run( side, 'backtransform', N, lwork );
			[ 'VL', 'VR' ].forEach( function eachMatrix( name ) {
				let vmax = 0.0;
				let i;
				for ( i = 0; i < 2 * N * N; i++ ) {
					vmax = Math.max( vmax, Math.abs( expected[ name ][ i ] ) );
				}
				for ( i = 0; i < 2 * N * N; i++ ) {
					assert.ok( Math.abs( out[ name ][ i ] - expected[ name ][ i ] ) <= 1e-13 * vmax, side + ' LWORK=' + lwork + ' ' + name + '[' + i + ']: expected ' + expected[ name ][ i ] + ', got ' + out[ name ][ i ] );
				}
			});
		});
	});
});

test( 'ztrevc3: the back-transformation is blocked exactly when WORK has at least N + 2*N*8 elements, as in the reference', function t() {
	const N = 12;
	const lwork = N + ( 2 * N * 8 );
	let out;
	let i;

	// Blocked: the reference zeroes WORK's N-by-(1+2*NB) matrix and uses it all.
	out = run( 'both', 'backtransform', N, lwork );
	for ( i = 0; i < 2 * lwork; i++ ) {
		assert.ok( !isNaN( out.WORK[ i ] ), 'blocked: WORK[' + i + '] is used' );
	}

	// One element short: NB = 1, which uses only the first 2*N elements.
	out = run( 'both', 'backtransform', N, lwork - 1 );
	for ( i = 4 * N; i < 2 * ( lwork - 1 ); i++ ) {
		assert.ok( isNaN( out.WORK[ i ] ), 'NB = 1: WORK[' + i + '] is untouched' );
	}

	// Without back-transformation, no blocking whatever the length.
	out = run( 'both', 'all', N, lwork );
	for ( i = 4 * N; i < 2 * lwork; i++ ) {
		assert.ok( isNaN( out.WORK[ i ] ), 'all: WORK[' + i + '] is untouched' );
	}
});

test( 'ztrevc3: WORK one element below the minimum (2*N) throws; N = 0 needs no WORK', function t() {
	const N = 4;
	const m = new Int32Array( 1 );
	assert.throws( function throws() {
		ztrevc3( 'right', 'all', new Uint8Array( N ), 1, 0, N, new Complex128Array( N * N ), 1, N, 0, new Complex128Array( N * N ), 1, N, 0, new Complex128Array( N * N ), 1, N, 0, N, m, new Complex128Array( ( 2 * N ) + 1 ), 1, 2, new Float64Array( N ), 1, 0 );
	}, RangeError );
	assert.throws( function throws() {
		ztrevc3( 'right', 'all', new Uint8Array( N ), 1, 0, N, new Complex128Array( N * N ), 1, N, 0, new Complex128Array( N * N ), 1, N, 0, new Complex128Array( N * N ), 1, N, 0, N, m, null, 1, 0, new Float64Array( N ), 1, 0 );
	}, RangeError );
	assert.equal( ztrevc3( 'right', 'all', new Uint8Array( 1 ), 1, 0, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, 0, m, new Complex128Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0 ), 0, 'N = 0' );
	assert.equal( m[ 0 ], 0, 'M = 0' );
});
