/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorgtr from './../lib/ndarray.js';
import dsytrd from '../../dsytrd/lib/base.js';

// FIXTURES //

import uplo_u_4x4 from './fixtures/uplo_u_4x4.json' with { type: 'json' };
import uplo_l_4x4 from './fixtures/uplo_l_4x4.json' with { type: 'json' };
import n1_uplo_u from './fixtures/n1_uplo_u.json' with { type: 'json' };
import n1_uplo_l from './fixtures/n1_uplo_l.json' with { type: 'json' };
import uplo_u_3x3 from './fixtures/uplo_u_3x3.json' with { type: 'json' };
import uplo_l_3x3 from './fixtures/uplo_l_3x3.json' with { type: 'json' };

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
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
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
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Helper: performs dsytrd then dorgtr and returns the Q matrix (column-major flat).
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - matrix order
* @param {Float64Array} Asym - symmetric matrix (column-major, N*N)
* @returns {Object} { Q, D, E, TAU, info }
*/
function dsytrdThenDorgtr( uplo, N, Asym ) {
	let WORK = new Float64Array( 256 );
	const TAU = new Float64Array( Math.max( N - 1, 1 ) );
	const D = new Float64Array( N );
	const E = new Float64Array( Math.max( N - 1, 1 ) );
	const A = new Float64Array( Asym );
	let i;

	// Call dsytrd to reduce to tridiagonal form
	dsytrd(uplo, N, A, 1, N, 0, D, 1, 0, E, 1, 0, TAU, 1, 0 );

	// Copy A to Q (A now contains reflectors)
	const Q = new Float64Array( A );

	// Allocate fresh WORK for dorgtr
	WORK = new Float64Array( 256 );

	// Call dorgtr to generate Q
	const info = dorgtr(uplo, N, Q, 1, N, 0, TAU, 1, 0, WORK, 1, 0 );

	return {
		'Q': Q,
		'D': D,
		'E': E,
		'TAU': TAU,
		'info': info
	};
}

/**
* Extract a flat column-major subarray as a regular Array.
*/
function toArray( arr, offset, len ) {
	const result = [];
	let i;
	for ( i = 0; i < len; i++ ) {
		result.push( arr[ offset + i ] );
	}
	return result;
}

// TESTS //

test( 'dorgtr: uplo_U_4x4', function t() {

	const tc = uplo_u_4x4;
	const N = 4;
	const A = new Float64Array([
		4,
		1,
		-2,
		2,
		1,
		2,
		0,
		1,
		-2,
		0,
		3,
		-2,
		2,
		1,
		-2,
		-1
	]);
	const result = dsytrdThenDorgtr( 'upper', N, A );
	assert.equal( result.info, 0, 'info' );
	assertArrayClose( toArray( result.Q, 0, N * N ), tc.Q, 1e-13, 'Q' );
});

test( 'dorgtr: uplo_L_4x4', function t() {

	const tc = uplo_l_4x4;
	const N = 4;
	const A = new Float64Array([
		4,
		1,
		-2,
		2,
		1,
		2,
		0,
		1,
		-2,
		0,
		3,
		-2,
		2,
		1,
		-2,
		-1
	]);
	const result = dsytrdThenDorgtr( 'lower', N, A );
	assert.equal( result.info, 0, 'info' );
	assertArrayClose( toArray( result.Q, 0, N * N ), tc.Q, 1e-13, 'Q' );
});

test( 'dorgtr: N1_uplo_U', function t() {

	const tc = n1_uplo_u;
	const N = 1;
	const A = new Float64Array([ 5.0 ]);
	const result = dsytrdThenDorgtr( 'upper', N, A );
	assert.equal( result.info, 0, 'info' );
	assertArrayClose( toArray( result.Q, 0, 1 ), tc.Q, 1e-14, 'Q' );
});

test( 'dorgtr: N1_uplo_L', function t() {

	const tc = n1_uplo_l;
	const N = 1;
	const A = new Float64Array([ 5.0 ]);
	const result = dsytrdThenDorgtr( 'lower', N, A );
	assert.equal( result.info, 0, 'info' );
	assertArrayClose( toArray( result.Q, 0, 1 ), tc.Q, 1e-14, 'Q' );
});

test( 'dorgtr: N0_uplo_U', function t() {

	const WORK = new Float64Array( 256 );
	const TAU = new Float64Array( 1 );
	const A = new Float64Array( 1 );
	const info = dorgtr('upper', 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dorgtr: N0_uplo_L', function t() {

	const WORK = new Float64Array( 256 );
	const TAU = new Float64Array( 1 );
	const A = new Float64Array( 1 );
	const info = dorgtr('lower', 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dorgtr: uplo_U_3x3', function t() {

	const tc = uplo_u_3x3;
	const N = 3;
	const A = new Float64Array([
		2,
		1,
		3,
		1,
		5,
		-1,
		3,
		-1,
		4
	]);
	const result = dsytrdThenDorgtr( 'upper', N, A );
	assert.equal( result.info, 0, 'info' );
	assertArrayClose( toArray( result.Q, 0, N * N ), tc.Q, 1e-13, 'Q' );
});

test( 'dorgtr: uplo_L_3x3', function t() {

	const tc = uplo_l_3x3;
	const N = 3;
	const A = new Float64Array([
		2,
		1,
		3,
		1,
		5,
		-1,
		3,
		-1,
		4
	]);
	const result = dsytrdThenDorgtr( 'lower', N, A );
	assert.equal( result.info, 0, 'info' );
	assertArrayClose( toArray( result.Q, 0, N * N ), tc.Q, 1e-13, 'Q' );
});

test( 'dorgtr: Q is orthogonal (uplo_U_4x4)', function t() {
	let sum, i, j, k;

	const N = 4;
	const A = new Float64Array([
		4,
		1,
		-2,
		2,
		1,
		2,
		0,
		1,
		-2,
		0,
		3,
		-2,
		2,
		1,
		-2,
		-1
	]);
	const result = dsytrdThenDorgtr( 'upper', N, A );
	const Q = result.Q;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sum = 0.0;
			for ( k = 0; k < N; k++ ) {
				sum += Q[ k + i * N ] * Q[ k + j * N ]; // Q^T * Q, column-major
			}
			if ( i === j ) {
				assertClose( sum, 1.0, 1e-13, 'QTQ[' + i + ',' + j + ']' );
			} else {
				assertClose( sum, 0.0, 1e-13, 'QTQ[' + i + ',' + j + ']' );
			}
		}
	}
});

test( 'dorgtr: Q is orthogonal (uplo_L_4x4)', function t() {
	let sum, i, j, k;

	const N = 4;
	const A = new Float64Array([
		4,
		1,
		-2,
		2,
		1,
		2,
		0,
		1,
		-2,
		0,
		3,
		-2,
		2,
		1,
		-2,
		-1
	]);
	const result = dsytrdThenDorgtr( 'lower', N, A );
	const Q = result.Q;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sum = 0.0;
			for ( k = 0; k < N; k++ ) {
				sum += Q[ k + i * N ] * Q[ k + j * N ];
			}
			if ( i === j ) {
				assertClose( sum, 1.0, 1e-13, 'QTQ[' + i + ',' + j + ']' );
			} else {
				assertClose( sum, 0.0, 1e-13, 'QTQ[' + i + ',' + j + ']' );
			}
		}
	}
});

test( 'dorgtr: Q^T*A*Q is tridiagonal (uplo_U_4x4)', function t() {
	let i, j, k, l;

	const N = 4;
	const Aorig = new Float64Array([
		4,
		1,
		-2,
		2,
		1,
		2,
		0,
		1,
		-2,
		0,
		3,
		-2,
		2,
		1,
		-2,
		-1
	]);
	const result = dsytrdThenDorgtr( 'upper', N, Aorig );
	const Q = result.Q;
	const tmp = new Float64Array( N * N );
	const QTAQ = new Float64Array( N * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			var s = 0.0;
			for ( k = 0; k < N; k++ ) {
				s += Aorig[ i + k * N ] * Q[ k + j * N ];
			}
			tmp[ i + j * N ] = s;
		}
	}
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			s = 0.0;
			for ( k = 0; k < N; k++ ) {
				s += Q[ k + i * N ] * tmp[ k + j * N ];
			}
			QTAQ[ i + j * N ] = s;
		}
	}
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			if ( Math.abs( i - j ) > 1 ) {
				assertClose( QTAQ[ i + j * N ], 0.0, 1e-13, 'QTAQ[' + i + ',' + j + '] should be zero' ); // eslint-disable-line max-len
			}
		}
	}
	for ( i = 0; i < N; i++ ) {
		assertClose( QTAQ[ i + i * N ], result.D[ i ], 1e-13, 'diagonal[' + i + ']' );
	}
	for ( i = 0; i < N - 1; i++ ) {
		assertClose( QTAQ[ i + ( i + 1 ) * N ], result.E[ i ], 1e-13, 'superdiag[' + i + ']' ); // eslint-disable-line max-len
		assertClose( QTAQ[ ( i + 1 ) + i * N ], result.E[ i ], 1e-13, 'subdiag[' + i + ']' ); // eslint-disable-line max-len
	}
});

test( 'dorgtr: Q^T*A*Q is tridiagonal (uplo_L_4x4)', function t() {
	let i, j, k, s;

	const N = 4;
	const Aorig = new Float64Array([
		4,
		1,
		-2,
		2,
		1,
		2,
		0,
		1,
		-2,
		0,
		3,
		-2,
		2,
		1,
		-2,
		-1
	]);
	const result = dsytrdThenDorgtr( 'lower', N, Aorig );
	const Q = result.Q;
	const tmp = new Float64Array( N * N );
	const QTAQ = new Float64Array( N * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			s = 0.0;
			for ( k = 0; k < N; k++ ) {
				s += Aorig[ i + k * N ] * Q[ k + j * N ];
			}
			tmp[ i + j * N ] = s;
		}
	}
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			s = 0.0;
			for ( k = 0; k < N; k++ ) {
				s += Q[ k + i * N ] * tmp[ k + j * N ];
			}
			QTAQ[ i + j * N ] = s;
		}
	}
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			if ( Math.abs( i - j ) > 1 ) {
				assertClose( QTAQ[ i + j * N ], 0.0, 1e-13, 'QTAQ[' + i + ',' + j + '] should be zero' ); // eslint-disable-line max-len
			}
		}
	}
	for ( i = 0; i < N; i++ ) {
		assertClose( QTAQ[ i + i * N ], result.D[ i ], 1e-13, 'diagonal[' + i + ']' );
	}
	for ( i = 0; i < N - 1; i++ ) {
		assertClose( QTAQ[ i + ( i + 1 ) * N ], result.E[ i ], 1e-13, 'superdiag[' + i + ']' ); // eslint-disable-line max-len
		assertClose( QTAQ[ ( i + 1 ) + i * N ], result.E[ i ], 1e-13, 'subdiag[' + i + ']' ); // eslint-disable-line max-len
	}
});

test( 'dorgtr: N=2 edge case (uplo_U)', function t() {
	let WORK, sum, i, j, k;

	const N = 2;
	const A = new Float64Array([
		3,
		1,
		1,
		5
	]);
	WORK = new Float64Array( 256 );
	const TAU = new Float64Array( 1 );
	const D = new Float64Array( 2 );
	const E = new Float64Array( 1 );
	dsytrd('upper', N, A, 1, N, 0, D, 1, 0, E, 1, 0, TAU, 1, 0 );
	const Q = new Float64Array( A );
	WORK = new Float64Array( 256 );
	const info = dorgtr('upper', N, Q, 1, N, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sum = 0.0;
			for ( k = 0; k < N; k++ ) {
				sum += Q[ k + i * N ] * Q[ k + j * N ];
			}
			if ( i === j ) {
				assertClose( sum, 1.0, 1e-14, 'QTQ[' + i + ',' + j + ']' );
			} else {
				assertClose( sum, 0.0, 1e-14, 'QTQ[' + i + ',' + j + ']' );
			}
		}
	}
});

test( 'dorgtr: N=2 edge case (uplo_L)', function t() {
	let WORK, sum, i, j, k;

	const N = 2;
	const A = new Float64Array([
		3,
		1,
		1,
		5
	]);
	WORK = new Float64Array( 256 );
	const TAU = new Float64Array( 1 );
	const D = new Float64Array( 2 );
	const E = new Float64Array( 1 );
	dsytrd('lower', N, A, 1, N, 0, D, 1, 0, E, 1, 0, TAU, 1, 0 );
	const Q = new Float64Array( A );
	WORK = new Float64Array( 256 );
	const info = dorgtr('lower', N, Q, 1, N, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sum = 0.0;
			for ( k = 0; k < N; k++ ) {
				sum += Q[ k + i * N ] * Q[ k + j * N ];
			}
			if ( i === j ) {
				assertClose( sum, 1.0, 1e-14, 'QTQ[' + i + ',' + j + ']' );
			} else {
				assertClose( sum, 0.0, 1e-14, 'QTQ[' + i + ',' + j + ']' );
			}
		}
	}
});
