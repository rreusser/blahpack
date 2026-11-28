/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrevc3 from './../lib/ndarray.js';
import dtrevc from './../../dtrevc/lib/ndarray.js';

// FIXTURES //

import right_all_4x4 from './fixtures/right_all_4x4.json' with { type: 'json' };
import left_all_4x4 from './fixtures/left_all_4x4.json' with { type: 'json' };
import both_all_4x4 from './fixtures/both_all_4x4.json' with { type: 'json' };
import right_selected_4x4 from './fixtures/right_selected_4x4.json' with { type: 'json' };
import right_selected_second_of_pair_4x4 from './fixtures/right_selected_second_of_pair_4x4.json' with { type: 'json' };
import right_backtransform_4x4 from './fixtures/right_backtransform_4x4.json' with { type: 'json' };
import right_all_real_4x4 from './fixtures/right_all_real_4x4.json' with { type: 'json' };
import right_n_1 from './fixtures/right_n_1.json' with { type: 'json' };
import left_selected_complex_4x4 from './fixtures/left_selected_complex_4x4.json' with { type: 'json' };
import left_backtransform_4x4 from './fixtures/left_backtransform_4x4.json' with { type: 'json' };
import right_all_6x6_mixed from './fixtures/right_all_6x6_mixed.json' with { type: 'json' };
import left_all_6x6_mixed from './fixtures/left_all_6x6_mixed.json' with { type: 'json' };
import both_backtransform_6x6 from './fixtures/both_backtransform_6x6.json' with { type: 'json' };
import right_selected_real_6x6 from './fixtures/right_selected_real_6x6.json' with { type: 'json' };
import left_selected_complex_first_6x6 from './fixtures/left_selected_complex_first_6x6.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' ); // eslint-disable-line max-len
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Build the 4x4 quasi-triangular test matrix T.
* T = [ 1   0.5  0.2  0.1  ]
*     [ 0   2    0.3  0.15 ]
*     [ 0   0    3   -0.5  ]
*     [ 0   0    0.8  3    ]
*/
function buildT4() {
	const N = 4;
	const T = new Float64Array( N * N );
	T[ 0 + 0*N ] = 1.0; T[ 0 + 1*N ] = 0.5; T[ 0 + 2*N ] = 0.2; T[ 0 + 3*N ] = 0.1;
	T[ 1 + 1*N ] = 2.0; T[ 1 + 2*N ] = 0.3; T[ 1 + 3*N ] = 0.15;
	T[ 2 + 2*N ] = 3.0; T[ 2 + 3*N ] = -0.5;
	T[ 3 + 2*N ] = 0.8; T[ 3 + 3*N ] = 3.0;
	return T;
}

/**
* Build the 6x6 quasi-triangular test matrix T.
* 2x2 block at (0,0)-(1,1): eigenvalues ~ 1 +/- 0.6i
* Real eigenvalue at (2,2): 4.0
* Real eigenvalue at (3,3): 5.0
* 2x2 block at (4,4)-(5,5): eigenvalues ~ 7 +/- 0.5i
*/
function buildT6() {
	const N = 6;
	const T = new Float64Array( N * N );

	// 2x2 block at (0,0)-(1,1)
	T[ 0 + 0*N ] = 1.0; T[ 0 + 1*N ] = 0.6;
	T[ 1 + 0*N ] = -0.6; T[ 1 + 1*N ] = 1.0;

	// Upper part from rows 0-1
	T[ 0 + 2*N ] = 0.2; T[ 0 + 3*N ] = 0.1; T[ 0 + 4*N ] = 0.3; T[ 0 + 5*N ] = 0.05; // eslint-disable-line max-len
	T[ 1 + 2*N ] = 0.15; T[ 1 + 3*N ] = 0.08; T[ 1 + 4*N ] = 0.12; T[ 1 + 5*N ] = 0.04; // eslint-disable-line max-len

	// Real eigenvalue at (2,2)
	T[ 2 + 2*N ] = 4.0;
	T[ 2 + 3*N ] = 0.5; T[ 2 + 4*N ] = 0.2; T[ 2 + 5*N ] = 0.1;

	// Real eigenvalue at (3,3)
	T[ 3 + 3*N ] = 5.0;
	T[ 3 + 4*N ] = 0.3; T[ 3 + 5*N ] = 0.15;

	// 2x2 block at (4,4)-(5,5)
	T[ 4 + 4*N ] = 7.0; T[ 4 + 5*N ] = 0.5;
	T[ 5 + 4*N ] = -0.5; T[ 5 + 5*N ] = 7.0;
	return T;
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dtrevc3: right eigenvectors, all, 4x4', function t() {
	const m = new Int32Array( 1 );

	const tc = right_all_4x4;
	const N = 4;
	const T = buildT4();
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	const SELECT = new Uint8Array( N );
	const WORK = new Float64Array( 3 * N );
	const info = dtrevc3( 'right', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
});

test( 'dtrevc3: left eigenvectors, all, 4x4', function t() {
	const m = new Int32Array( 1 );

	const tc = left_all_4x4;
	const N = 4;
	const T = buildT4();
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	const SELECT = new Uint8Array( N );
	const WORK = new Float64Array( 3 * N );
	const info = dtrevc3( 'left', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VL ), tc.VL, 1e-12, 'VL' );
});

test( 'dtrevc3: both eigenvectors, all, 4x4', function t() {
	const m = new Int32Array( 1 );

	const tc = both_all_4x4;
	const N = 4;
	const T = buildT4();
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	const SELECT = new Uint8Array( N );
	const WORK = new Float64Array( 3 * N );
	const info = dtrevc3( 'both', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
	assertArrayClose( toArray( VL ), tc.VL, 1e-12, 'VL' );
});

test( 'dtrevc3: right eigenvectors, selected, 4x4', function t() {
	const m = new Int32Array( 1 );

	const tc = right_selected_4x4;
	const N = 4;
	const T = buildT4();
	const VL = new Float64Array( N * N );
	const SELECT = new Uint8Array( N );
	const M_out = tc.M;
	const VR = new Float64Array( N * M_out );
	SELECT[ 0 ] = 1;
	SELECT[ 1 ] = 0;
	SELECT[ 2 ] = 1;
	SELECT[ 3 ] = 1;
	const WORK = new Float64Array( 3 * N );
	const info = dtrevc3( 'right', 'selected', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
});

test( 'dtrevc3: right selected, only the second column of a complex pair', function t() {
	// Fortran counts the pair (M = 3) and standardizes SELECT onto its first column.
	const m = new Int32Array( 1 );
	const tc = right_selected_second_of_pair_4x4;
	const N = 4;
	const T = buildT4();
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * tc.M );
	const SELECT = new Uint8Array( [ 1, 0, 0, 1 ] );
	const WORK = new Float64Array( 3 * N );
	const info = dtrevc3( 'right', 'selected', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.deepStrictEqual( Array.from( SELECT ), tc.SELECT, 'SELECT' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
});

test( 'dtrevc3: right backtransform, 4x4', function t() {
	const m = new Int32Array( 1 );
	let i;

	const tc = right_backtransform_4x4;
	const N = 4;
	const T = buildT4();
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		VR[ i + i*N ] = 1.0;
	}
	const SELECT = new Uint8Array( N );
	const WORK = new Float64Array( 3 * N );
	const info = dtrevc3( 'right', 'backtransform', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
});

test( 'dtrevc3: right all real eigenvalues, 4x4', function t() {
	const m = new Int32Array( 1 );

	const tc = right_all_real_4x4;
	const N = 4;
	const T = new Float64Array( N * N );
	T[ 0 + 0*N ] = 5.0;
	T[ 0 + 1*N ] = 1.0;
	T[ 0 + 2*N ] = 0.5;
	T[ 0 + 3*N ] = 0.2;
	T[ 1 + 1*N ] = 3.0;
	T[ 1 + 2*N ] = 0.8;
	T[ 1 + 3*N ] = 0.3;
	T[ 2 + 2*N ] = 1.0;
	T[ 2 + 3*N ] = 0.6;
	T[ 3 + 3*N ] = -1.0;
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	const SELECT = new Uint8Array( N );
	const WORK = new Float64Array( 3 * N );
	const info = dtrevc3( 'right', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
});

test( 'dtrevc3: right N=1', function t() {
	const m = new Int32Array( 1 );

	const N = 1;
	const T = new Float64Array([ 7.0 ]);
	const VL = new Float64Array( 1 );
	const VR = new Float64Array( 1 );
	const SELECT = new Uint8Array( 1 );
	const WORK = new Float64Array( 3 );
	const info = dtrevc3( 'right', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, 1, m, WORK, 1, 0 ); // eslint-disable-line max-len
	const tc = right_n_1;
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
});

test( 'dtrevc3: left selected complex 4x4', function t() {
	const m = new Int32Array( 1 );

	const tc = left_selected_complex_4x4;
	const N = 4;
	const T = buildT4();
	const VR = new Float64Array( N * N );
	const SELECT = new Uint8Array( N );
	const M_out = tc.M;
	const VL = new Float64Array( N * M_out );
	SELECT[ 0 ] = 0;
	SELECT[ 1 ] = 0;
	SELECT[ 2 ] = 1;
	SELECT[ 3 ] = 1;
	const WORK = new Float64Array( 3 * N );
	const info = dtrevc3( 'left', 'selected', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VL ), tc.VL, 1e-12, 'VL' );
});

test( 'dtrevc3: left backtransform, 4x4', function t() {
	const m = new Int32Array( 1 );
	let i;

	const tc = left_backtransform_4x4;
	const N = 4;
	const T = buildT4();
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		VL[ i + i*N ] = 1.0;
	}
	const SELECT = new Uint8Array( N );
	const WORK = new Float64Array( 3 * N );
	const info = dtrevc3( 'left', 'backtransform', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VL ), tc.VL, 1e-12, 'VL' );
});

test( 'dtrevc3: right all 6x6 mixed', function t() {
	const m = new Int32Array( 1 );

	const tc = right_all_6x6_mixed;
	const N = 6;
	const T = buildT6();
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	const SELECT = new Uint8Array( N );
	const WORK = new Float64Array( 3 * N );
	const info = dtrevc3( 'right', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
});

test( 'dtrevc3: left all 6x6 mixed', function t() {
	const m = new Int32Array( 1 );

	const tc = left_all_6x6_mixed;
	const N = 6;
	const T = buildT6();
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	const SELECT = new Uint8Array( N );
	const WORK = new Float64Array( 3 * N );
	const info = dtrevc3( 'left', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VL ), tc.VL, 1e-12, 'VL' );
});

test( 'dtrevc3: both backtransform 6x6', function t() {
	const m = new Int32Array( 1 );
	let i;

	const tc = both_backtransform_6x6;
	const N = 6;
	const T = buildT6();
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		VR[ i + i*N ] = 1.0;
		VL[ i + i*N ] = 1.0;
	}
	const SELECT = new Uint8Array( N );
	const WORK = new Float64Array( 3 * N );
	const info = dtrevc3( 'both', 'backtransform', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
	assertArrayClose( toArray( VL ), tc.VL, 1e-12, 'VL' );
});

test( 'dtrevc3: right selected real 6x6', function t() {
	const m = new Int32Array( 1 );

	const tc = right_selected_real_6x6;
	const N = 6;
	const T = buildT6();
	const VL = new Float64Array( N * N );
	const SELECT = new Uint8Array( N );
	const M_out = tc.M;
	const VR = new Float64Array( N * M_out );
	SELECT[ 2 ] = 1;
	SELECT[ 3 ] = 1;
	const WORK = new Float64Array( 3 * N );
	const info = dtrevc3( 'right', 'selected', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
});

test( 'dtrevc3: left selected complex first 6x6', function t() {
	const m = new Int32Array( 1 );

	const tc = left_selected_complex_first_6x6;
	const N = 6;
	const T = buildT6();
	const VR = new Float64Array( N * N );
	const SELECT = new Uint8Array( N );
	const M_out = tc.M;
	const VL = new Float64Array( N * M_out );
	SELECT[ 0 ] = 1;
	SELECT[ 1 ] = 1;
	const WORK = new Float64Array( 3 * N );
	const info = dtrevc3( 'left', 'selected', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VL ), tc.VL, 1e-12, 'VL' );
});


// PROPERTY TESTS (badly scaled and defective T) //

/**
* Builds an N-by-N quasi-triangular matrix (column-major) whose strict upper triangle outside the diagonal blocks is `upper`, with the given diagonal blocks.
*
* Each block is `[ d ]` (1x1) or `[ d, b, c ]` (2x2 in standard form `[ d b; c d ]`, `b*c < 0`).
*
* @private
* @param {Array} blocks - diagonal blocks
* @param {number} upper - value of the strict upper triangle
* @returns {Object} `{ N, T }`
*/
function buildQuasiTriangular( blocks, upper ) {
	let N = 0;
	let i, j, k, b;
	for ( k = 0; k < blocks.length; k++ ) {
		N += ( blocks[ k ].length === 1 ) ? 1 : 2;
	}
	const T = new Float64Array( N * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < j; i++ ) {
			T[ i + ( j * N ) ] = upper;
		}
	}
	i = 0;
	for ( k = 0; k < blocks.length; k++ ) {
		b = blocks[ k ];
		T[ i + ( i * N ) ] = b[ 0 ];
		if ( b.length === 1 ) {
			i += 1;
		} else {
			T[ i + ( ( i + 1 ) * N ) ] = b[ 1 ];
			T[ i + 1 + ( i * N ) ] = b[ 2 ];
			T[ i + 1 + ( ( i + 1 ) * N ) ] = b[ 0 ];
			i += 2;
		}
	}
	return {
		'N': N,
		'T': T
	};
}

/**
* Returns an N-by-N orthogonal Householder reflector `I - 2vv^T/(v^Tv)` (column-major).
*
* @private
* @param {NonNegativeInteger} N - order
* @returns {Float64Array} Q
*/
function householder( N ) {
	const Q = new Float64Array( N * N );
	const v = [];
	let vv = 0.0;
	let i, j;
	for ( i = 0; i < N; i++ ) {
		v.push( 1.0 + ( 0.37 * i ) - ( 0.05 * i * i ) );
		vv += v[ i ] * v[ i ];
	}
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			Q[ i + ( j * N ) ] = ( ( i === j ) ? 1.0 : 0.0 ) - ( 2.0 * v[ i ] * v[ j ] / vv );
		}
	}
	return Q;
}

/**
* Returns `A = Q*T*Q^T` (column-major, N-by-N).
*
* @private
* @param {NonNegativeInteger} N - order
* @param {Float64Array} Q - orthogonal matrix
* @param {Float64Array} T - quasi-triangular matrix
* @returns {Float64Array} A
*/
function similarity( N, Q, T ) {
	const W = new Float64Array( N * N );
	const A = new Float64Array( N * N );
	let i, j, k;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			for ( k = 0; k < N; k++ ) {
				W[ i + ( j * N ) ] += Q[ i + ( k * N ) ] * T[ k + ( j * N ) ];
			}
		}
	}
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			for ( k = 0; k < N; k++ ) {
				A[ i + ( j * N ) ] += W[ i + ( k * N ) ] * Q[ j + ( k * N ) ];
			}
		}
	}
	return A;
}

/**
* Asserts that each column (or column pair) of V is an eigenvector of `A` (right: `A*x = lambda*x`; left: `y^H*A = lambda*y^H`, i.e. `A^T*y = conj(lambda)*y`), where the eigenvalues are read from the diagonal blocks of T.
*
* @private
* @param {string} side - 'right' or 'left'
* @param {NonNegativeInteger} N - order
* @param {Float64Array} A - matrix the vectors belong to
* @param {Float64Array} T - quasi-triangular matrix giving the eigenvalues
* @param {Float64Array} V - eigenvectors (N-by-N, column-major)
* @param {string} msg - message
*/
function assertEigenvectors( side, N, A, T, V, msg ) {
	let anrm = 0.0;
	let xr, xi, wr, wi, ar, ai, res, xnrm, lam, i, k, l;
	for ( i = 0; i < N * N; i++ ) {
		anrm = Math.max( anrm, Math.abs( A[ i ] ) );
	}

	// a(i,l) for the right side, a(l,i) (transpose) for the left side:
	function a( r, c ) {
		return ( side === 'right' ) ? A[ r + ( c * N ) ] : A[ c + ( r * N ) ];
	}
	k = 0;
	while ( k < N ) {
		wr = T[ k + ( k * N ) ];
		if ( k < N - 1 && T[ k + 1 + ( k * N ) ] !== 0.0 ) {
			wi = Math.sqrt( Math.abs( T[ k + ( ( k + 1 ) * N ) ] ) ) * Math.sqrt( Math.abs( T[ k + 1 + ( k * N ) ] ) ); // eslint-disable-line max-len
			if ( side === 'left' ) {
				wi = -wi;
			}
			xnrm = 0.0;
			for ( i = 0; i < N; i++ ) {
				xnrm = Math.max( xnrm, Math.abs( V[ i + ( k * N ) ] ) + Math.abs( V[ i + ( ( k + 1 ) * N ) ] ) ); // eslint-disable-line max-len
			}
			assert.ok( xnrm > 0.0 && Number.isFinite( xnrm ), msg + ': column pair ' + k + ' is nonzero and finite' ); // eslint-disable-line max-len
			lam = Math.abs( wr ) + Math.abs( wi );
			for ( i = 0; i < N; i++ ) {
				ar = 0.0;
				ai = 0.0;
				for ( l = 0; l < N; l++ ) {
					xr = V[ l + ( k * N ) ];
					xi = V[ l + ( ( k + 1 ) * N ) ];
					ar += a( i, l ) * xr;
					ai += a( i, l ) * xi;
				}
				xr = V[ i + ( k * N ) ];
				xi = V[ i + ( ( k + 1 ) * N ) ];
				res = Math.abs( ar - ( ( wr * xr ) - ( wi * xi ) ) ) + Math.abs( ai - ( ( wi * xr ) + ( wr * xi ) ) ); // eslint-disable-line max-len
				assert.ok( res <= 1e-13 * N * ( anrm + lam ) * xnrm, msg + ': pair ' + k + ' row ' + i + ' residual ' + res ); // eslint-disable-line max-len
			}
			k += 2;
		} else {
			xnrm = 0.0;
			for ( i = 0; i < N; i++ ) {
				xnrm = Math.max( xnrm, Math.abs( V[ i + ( k * N ) ] ) );
			}
			assert.ok( xnrm > 0.0 && Number.isFinite( xnrm ), msg + ': column ' + k + ' is nonzero and finite' ); // eslint-disable-line max-len
			for ( i = 0; i < N; i++ ) {
				ar = 0.0;
				for ( l = 0; l < N; l++ ) {
					ar += a( i, l ) * V[ l + ( k * N ) ];
				}
				res = Math.abs( ar - ( wr * V[ i + ( k * N ) ] ) );
				assert.ok( res <= 1e-13 * N * ( anrm + Math.abs( wr ) ) * xnrm, msg + ': column ' + k + ' row ' + i + ' residual ' + res ); // eslint-disable-line max-len
			}
			k += 1;
		}
	}
}

/**
* Computes all left and right eigenvectors of T (or of `A = Q*T*Q^T` with back-transformation), checks them by the eigen-equation, and checks that the unblocked `dtrevc` gives the same vectors.
*
* @private
* @param {Array} blocks - diagonal blocks of T
* @param {number} upper - strict upper triangle value
* @param {string} howmny - 'all' or 'backtransform'
* @param {string} msg - message
*/
function checkAllVectors( blocks, upper, howmny, msg ) {
	const built = buildQuasiTriangular( blocks, upper );
	const N = built.N;
	const T = built.T;
	const Q = householder( N );
	const VL = ( howmny === 'backtransform' ) ? new Float64Array( Q ) : new Float64Array( N * N ); // eslint-disable-line max-len
	const VR = ( howmny === 'backtransform' ) ? new Float64Array( Q ) : new Float64Array( N * N ); // eslint-disable-line max-len
	const VL2 = new Float64Array( VL );
	const VR2 = new Float64Array( VR );
	const m = new Int32Array( 1 );
	const m2 = new Int32Array( 1 );
	const SELECT = new Uint8Array( N );
	const A = ( howmny === 'backtransform' ) ? similarity( N, Q, T ) : T;
	let info;
	let i;

	info = dtrevc3( 'both', howmny, SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, new Float64Array( 3 * N ), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, msg + ': info' );
	assert.strictEqual( m[ 0 ], N, msg + ': M' );
	assertEigenvectors( 'right', N, A, T, VR, msg + ' right' );
	assertEigenvectors( 'left', N, A, T, VL, msg + ' left' );

	info = dtrevc( 'both', howmny, SELECT, 1, 0, N, T, 1, N, 0, VL2, 1, N, 0, VR2, 1, N, 0, N, m2, new Float64Array( 3 * N ), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, msg + ': dtrevc info' );
	assert.strictEqual( m2[ 0 ], N, msg + ': dtrevc M' );
	for ( i = 0; i < N * N; i++ ) {
		assertClose( VR[ i ], VR2[ i ], 1e-13, msg + ': VR matches dtrevc [' + i + ']' );
		assertClose( VL[ i ], VL2[ i ], 1e-13, msg + ': VL matches dtrevc [' + i + ']' );
	}
}

test( 'dtrevc3: defective real T (nilpotent), all and backtransform: eigenvectors satisfy the eigen-equation despite overflow-guard rescaling', function t() {
	// T has a single eigenvalue 0 of multiplicity 5; each solve divides by the
	// perturbed pivot smin, so the right-hand side grows past the overflow
	// threshold and the solver rescales (dlaln2 scale < 1, and the column-norm
	// guard on xnorm). The last eigenvalue is real, so the left loop reaches
	// ki = N-1 as a 1x1 block.
	const blocks = [ [ 0.0 ], [ 0.0 ], [ 0.0 ], [ 0.0 ], [ 0.0 ] ];
	checkAllVectors( blocks, 1.0, 'all', 'nilpotent all' );
	checkAllVectors( blocks, 1.0, 'backtransform', 'nilpotent backtransform' );
});

test( 'dtrevc3: defective T with repeated tiny complex pairs and zero real eigenvalues, all and backtransform', function t() {
	const blocks = [ [ 0.0 ], [ 0.0, 1e-200, -1e-200 ], [ 0.0 ], [ 0.0, 1e-200, -1e-200 ], [ 0.0 ], [ 0.0, 1e-200, -1e-200 ], [ 0.0 ] ]; // eslint-disable-line max-len
	checkAllVectors( blocks, 1.0, 'all', 'tiny pairs all' );
	checkAllVectors( blocks, 1.0, 'backtransform', 'tiny pairs backtransform' );

	// Huge coupling: the column norms of T exceed the overflow guard thresholds.
	checkAllVectors( blocks, 1e150, 'all', 'tiny pairs, huge coupling' );
	checkAllVectors( [ [ 0.0 ], [ 0.0 ], [ 0.0, 1e-200, -1e-200 ], [ 0.0, 1e-200, -1e-200 ], [ 0.0 ], [ 0.0 ] ], 1e150, 'all', 'adjacent tiny pairs, huge coupling' ); // eslint-disable-line max-len
});

test( 'dtrevc3: well-conditioned T ending in a real eigenvalue, all and backtransform', function t() {
	const blocks = [ [ 1.0, 0.6, -0.6 ], [ 3.0 ], [ -2.0, 0.4, -0.9 ], [ 5.0 ] ];
	checkAllVectors( blocks, 0.3, 'all', 'mixed all' );
	checkAllVectors( blocks, 0.3, 'backtransform', 'mixed backtransform' );
});

test( 'dtrevc3: selected, last (real) eigenvalue only', function t() {
	const built = buildQuasiTriangular( [ [ 1.0, 0.6, -0.6 ], [ 3.0 ], [ 5.0 ] ], 0.3 ); // eslint-disable-line max-len
	const N = built.N;
	const T = built.T;
	const SELECT = new Uint8Array( N );
	const VL = new Float64Array( N );
	const VR = new Float64Array( N );
	const VA = new Float64Array( N * N );
	const VB = new Float64Array( N * N );
	const m = new Int32Array( 1 );
	SELECT[ N - 1 ] = 1;
	const info = dtrevc3( 'both', 'selected', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, 1, m, new Float64Array( 3 * N ), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info' );
	assert.strictEqual( m[ 0 ], 1, 'M' );

	// The selected vectors are the last columns of the full computation:
	dtrevc3( 'both', 'all', new Uint8Array( N ), 1, 0, N, T, 1, N, 0, VA, 1, N, 0, VB, 1, N, 0, N, new Int32Array( 1 ), new Float64Array( 3 * N ), 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( VR ), toArray( VB.subarray( ( N - 1 ) * N ) ), 1e-14, 'VR' ); // eslint-disable-line max-len
	assertArrayClose( toArray( VL ), toArray( VA.subarray( ( N - 1 ) * N ) ), 1e-14, 'VL' ); // eslint-disable-line max-len
	assert.strictEqual( VR[ N - 1 ], 1.0, 'VR normalized, last entry' );
	assert.strictEqual( VL[ N - 1 ], 1.0, 'VL normalized: only the last entry is nonzero' );
	assert.strictEqual( VL[ 0 ], 0.0, 'VL[0]' );
});

/**
* Returns a deterministic N-by-N upper quasi-triangular matrix in Schur canonical form (column-major), with a 2-by-2 block at every fifth column.
*
* @private
* @param {NonNegativeInteger} N - order
* @param {Function} rand - generator of values in [-1,1)
* @returns {Float64Array} matrix
*/
function schurMatrix( N, rand ) {
	const T = new Float64Array( N * N );
	let a;
	let i;
	let j = 0;
	while ( j < N ) {
		if ( j < N - 1 && j % 5 === 1 ) {
			a = 3.0 * rand();
			T[ j + ( j * N ) ] = a;
			T[ j + 1 + ( ( j + 1 ) * N ) ] = a;
			T[ j + ( ( j + 1 ) * N ) ] = 1.0 + Math.abs( rand() );
			T[ j + 1 + ( j * N ) ] = -( 0.5 + Math.abs( rand() ) );
			for ( i = 0; i < j; i++ ) {
				T[ i + ( j * N ) ] = rand();
				T[ i + ( ( j + 1 ) * N ) ] = rand();
			}
			j += 2;
		} else {
			T[ j + ( j * N ) ] = 3.0 * rand();
			for ( i = 0; i < j; i++ ) {
				T[ i + ( j * N ) ] = rand();
			}
			j += 1;
		}
	}
	return T;
}

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
* Back-transforms the eigenvectors of the test matrix with a NaN-poisoned WORK of `lwork` elements.
*
* @private
* @param {string} side - side
* @param {string} howmny - howmny
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} lwork - workspace length
* @returns {Object} `VL`, `VR` and `WORK`
*/
function run( side, howmny, N, lwork ) {
	const rand = lcg( 7 );
	const T = schurMatrix( N, rand );
	const Q = new Float64Array( N * N );
	let i;
	for ( i = 0; i < N * N; i++ ) {
		Q[ i ] = rand();
	}
	const VL = new Float64Array( Q );
	const VR = new Float64Array( Q );
	const WORK = new Float64Array( lwork ).fill( NaN );
	const m = new Int32Array( 1 );
	const info = dtrevc3( side, howmny, new Uint8Array( N ), 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( m[ 0 ], N, 'M' );
	return {
		'VL': VL,
		'VR': VR,
		'WORK': WORK
	};
}

test( 'dtrevc3: at N=70 the blocked back-transformation (NB = 8, 20, 64, 128) matches the minimum WORK (3*N, NB = 1)', function t() {
	const N = 70;
	[ 'right', 'left', 'both' ].forEach( function eachSide( side ) {
		const expected = run( side, 'backtransform', N, 3 * N );
		[ N + ( 2 * N * 8 ), N + ( 2 * N * 20 ), N + ( 2 * N * 64 ), N + ( 2 * N * 200 ) ].forEach( function eachLwork( lwork ) {
			const out = run( side, 'backtransform', N, lwork );
			[ 'VL', 'VR' ].forEach( function eachMatrix( name ) {
				let vmax = 0.0;
				let i;
				for ( i = 0; i < N * N; i++ ) {
					vmax = Math.max( vmax, Math.abs( expected[ name ][ i ] ) );
				}
				for ( i = 0; i < N * N; i++ ) {
					assert.ok( Math.abs( out[ name ][ i ] - expected[ name ][ i ] ) <= 1e-13 * vmax, side + ' LWORK=' + lwork + ' ' + name + '[' + i + ']: expected ' + expected[ name ][ i ] + ', got ' + out[ name ][ i ] );
				}
			});
		});
	});
});

test( 'dtrevc3: the back-transformation is blocked exactly when WORK has at least N + 2*N*8 elements, as in the reference', function t() {
	const N = 12;
	const lwork = N + ( 2 * N * 8 );
	let out;
	let i;

	// Blocked: the reference zeroes WORK's N-by-(1+2*NB) matrix and uses it all.
	out = run( 'both', 'backtransform', N, lwork );
	for ( i = 0; i < lwork; i++ ) {
		assert.ok( !isNaN( out.WORK[ i ] ), 'blocked: WORK[' + i + '] is used' );
	}

	// One element short: NB = 1, which uses only the first 3*N elements.
	out = run( 'both', 'backtransform', N, lwork - 1 );
	for ( i = 3 * N; i < lwork - 1; i++ ) {
		assert.ok( isNaN( out.WORK[ i ] ), 'NB = 1: WORK[' + i + '] is untouched' );
	}

	// Without back-transformation, no blocking whatever the length.
	out = run( 'both', 'all', N, lwork );
	for ( i = 3 * N; i < lwork; i++ ) {
		assert.ok( isNaN( out.WORK[ i ] ), 'all: WORK[' + i + '] is untouched' );
	}
});

test( 'dtrevc3: WORK one element below the minimum (3*N) throws; N = 0 needs no WORK', function t() {
	const N = 4;
	const m = new Int32Array( 1 );
	assert.throws( function throws() {
		dtrevc3( 'right', 'all', new Uint8Array( N ), 1, 0, N, new Float64Array( N * N ), 1, N, 0, new Float64Array( N * N ), 1, N, 0, new Float64Array( N * N ), 1, N, 0, N, m, new Float64Array( ( 3 * N ) + 1 ), 1, 2 );
	}, RangeError );
	assert.throws( function throws() {
		dtrevc3( 'right', 'all', new Uint8Array( N ), 1, 0, N, new Float64Array( N * N ), 1, N, 0, new Float64Array( N * N ), 1, N, 0, new Float64Array( N * N ), 1, N, 0, N, m, null, 1, 0 );
	}, RangeError );
	assert.equal( dtrevc3( 'right', 'all', new Uint8Array( 1 ), 1, 0, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, 0, m, new Float64Array( 0 ), 1, 0 ), 0, 'N = 0' );
	assert.equal( m[ 0 ], 0, 'M = 0' );
});
