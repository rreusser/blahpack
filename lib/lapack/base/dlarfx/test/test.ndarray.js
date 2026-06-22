/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarfx from './../lib/ndarray.js';

// FIXTURES //

import left_m_2_n_3 from './fixtures/left_m_2_n_3.json' with { type: 'json' };
import right_m_3_n_2 from './fixtures/right_m_3_n_2.json' with { type: 'json' };
import tau_0 from './fixtures/tau_0.json' with { type: 'json' };
import left_m_3_n_2 from './fixtures/left_m_3_n_2.json' with { type: 'json' };
import right_m_2_n_3 from './fixtures/right_m_2_n_3.json' with { type: 'json' };
import left_m_5_n_3 from './fixtures/left_m_5_n_3.json' with { type: 'json' };
import left_m_10_n_4 from './fixtures/left_m_10_n_4.json' with { type: 'json' };
import right_m_4_n_10 from './fixtures/right_m_4_n_10.json' with { type: 'json' };
import left_m_4_n_2 from './fixtures/left_m_4_n_2.json' with { type: 'json' };
import left_m_6_n_3 from './fixtures/left_m_6_n_3.json' with { type: 'json' };
import left_m_7_n_2 from './fixtures/left_m_7_n_2.json' with { type: 'json' };
import left_m_8_n_2 from './fixtures/left_m_8_n_2.json' with { type: 'json' };
import left_m_9_n_2 from './fixtures/left_m_9_n_2.json' with { type: 'json' };

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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Build an MxN column-major matrix from flat column-major data.
* The JS routine uses strideC1=1, strideC2=M for column-major.
*/
function buildMatrix( M, N, values ) {
	var C = new Float64Array( M * N );
	var i;
	for ( i = 0; i < values.length && i < M * N; i++ ) {
		C[ i ] = values[ i ];
	}
	return C;
}

/**
* Extract MxN column-major flat array from C.
*/
function extractMatrix( C, M, N ) {
	var out = [];
	var i;
	for ( i = 0; i < M * N; i++ ) {
		out.push( C[ i ] );
	}
	return out;
}

// TESTS //

test( 'dlarfx: left M=2 N=3', function t() {
	var WORK;
	var tau;
	var tc;
	var M;
	var N;
	var v;
	var C;

	M = 2;
	N = 3;
	v = new Float64Array([ 1.0, 0.5 ]);
	tau = 1.6;
	C = new Float64Array([ 1, 4, 2, 5, 3, 6 ]);
	WORK = new Float64Array( N );
	tc = left_m_2_n_3;
	dlarfx( 'left', M, N, v, 1, 0, tau, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'dlarfx: right M=3 N=2', function t() {
	var WORK;
	var tau;
	var tc;
	var M;
	var N;
	var v;
	var C;

	M = 3;
	N = 2;
	v = new Float64Array([ 1.0, 0.5 ]);
	tau = 1.6;
	C = new Float64Array([ 1, 3, 5, 2, 4, 6 ]);
	WORK = new Float64Array( M );
	tc = right_m_3_n_2;
	dlarfx( 'right', M, N, v, 1, 0, tau, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'dlarfx: tau=0 does nothing', function t() {
	var WORK;
	var tc;
	var M;
	var N;
	var v;
	var C;

	tc = tau_0;
	M = 2;
	N = 2;
	v = new Float64Array([ 1.0, 0.5 ]);
	C = new Float64Array([ 1, 3, 2, 4 ]);
	WORK = new Float64Array( N );
	dlarfx( 'left', M, N, v, 1, 0, 0.0, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-14, 'C' );
});

test( 'dlarfx: left M=3 N=2', function t() {
	var WORK;
	var tau;
	var tc;
	var M;
	var N;
	var v;
	var C;

	M = 3;
	N = 2;
	v = new Float64Array([ 1.0, 0.3, -0.5 ]);
	tau = 1.2;
	C = new Float64Array([ 2, 3, 5, 1, 4, 6 ]);
	WORK = new Float64Array( N );
	tc = left_m_3_n_2;
	dlarfx( 'left', M, N, v, 1, 0, tau, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'dlarfx: right M=2 N=3', function t() {
	var WORK;
	var tau;
	var tc;
	var M;
	var N;
	var v;
	var C;

	M = 2;
	N = 3;
	v = new Float64Array([ 1.0, 0.3, -0.5 ]);
	tau = 1.2;
	C = new Float64Array([ 2, 4, 1, 5, 3, 6 ]);
	WORK = new Float64Array( M );
	tc = right_m_2_n_3;
	dlarfx( 'right', M, N, v, 1, 0, tau, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'dlarfx: left M=5 N=3', function t() {
	var WORK;
	var tau;
	var tc;
	var M;
	var N;
	var v;
	var C;
	var i;
	var j;

	M = 5;
	N = 3;
	v = new Float64Array([ 1.0, 0.2, -0.3, 0.4, -0.1 ]);
	tau = 1.5;
	C = new Float64Array( M * N );
	tc = left_m_5_n_3;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			C[ i + j*M ] = ( i + 1 ) + j * 5;
		}
	}
	WORK = new Float64Array( N );
	dlarfx( 'left', M, N, v, 1, 0, tau, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'dlarfx: left M=10 N=4', function t() {
	var WORK;
	var tau;
	var tc;
	var M;
	var N;
	var v;
	var i;
	var j;
	var C;

	M = 10;
	N = 4;
	v = new Float64Array( M );
	tc = left_m_10_n_4;
	for ( i = 0; i < M; i++ ) {
		v[ i ] = 0.1 * ( i + 1 );
	}
	v[ 0 ] = 1.0;
	tau = 1.8;
	C = new Float64Array( M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			C[ i + j*M ] = ( i + 1 ) + 0.5 * ( j + 1 );
		}
	}
	WORK = new Float64Array( N );
	dlarfx( 'left', M, N, v, 1, 0, tau, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'dlarfx: right M=4 N=10', function t() {
	var WORK;
	var tau;
	var tc;
	var M;
	var N;
	var v;
	var i;
	var j;
	var C;

	M = 4;
	N = 10;
	v = new Float64Array( N );
	tc = right_m_4_n_10;
	for ( i = 0; i < N; i++ ) {
		v[ i ] = 0.1 * ( i + 1 );
	}
	v[ 0 ] = 1.0;
	tau = 1.8;
	C = new Float64Array( M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			C[ i + j*M ] = ( i + 1 ) + 0.5 * ( j + 1 );
		}
	}
	WORK = new Float64Array( M );
	dlarfx( 'right', M, N, v, 1, 0, tau, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'dlarfx: left M=4 N=2', function t() {
	var WORK;
	var tau;
	var tc;
	var M;
	var N;
	var v;
	var C;
	var i;
	var j;

	M = 4;
	N = 2;
	v = new Float64Array([ 1.0, 0.3, -0.4, 0.2 ]);
	tau = 1.4;
	C = new Float64Array( M * N );
	tc = left_m_4_n_2;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			C[ i + j*M ] = ( i + 1 ) + j * 4;
		}
	}
	WORK = new Float64Array( N );
	dlarfx( 'left', M, N, v, 1, 0, tau, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'dlarfx: left M=6 N=3', function t() {
	var WORK;
	var tau;
	var tc;
	var M;
	var N;
	var v;
	var C;
	var i;
	var j;

	M = 6;
	N = 3;
	v = new Float64Array([ 1.0, 0.2, -0.3, 0.4, -0.1, 0.5 ]);
	tau = 1.3;
	C = new Float64Array( M * N );
	tc = left_m_6_n_3;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			C[ i + j*M ] = ( i + 1 ) + j * 6;
		}
	}
	WORK = new Float64Array( N );
	dlarfx( 'left', M, N, v, 1, 0, tau, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'dlarfx: left M=7 N=2', function t() {
	var WORK;
	var tau;
	var tc;
	var M;
	var N;
	var v;
	var C;
	var i;
	var j;

	M = 7;
	N = 2;
	v = new Float64Array([ 1.0, 0.2, -0.3, 0.4, -0.1, 0.5, -0.2 ]);
	tau = 1.1;
	C = new Float64Array( M * N );
	tc = left_m_7_n_2;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			C[ i + j*M ] = ( i + 1 ) + j * 7;
		}
	}
	WORK = new Float64Array( N );
	dlarfx( 'left', M, N, v, 1, 0, tau, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'dlarfx: left M=8 N=2', function t() {
	var WORK;
	var tau;
	var tc;
	var M;
	var N;
	var v;
	var C;
	var i;
	var j;

	M = 8;
	N = 2;
	v = new Float64Array([ 1.0, 0.1, -0.2, 0.3, -0.4, 0.15, -0.25, 0.35 ]);
	tau = 1.6;
	C = new Float64Array( M * N );
	tc = left_m_8_n_2;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			C[ i + j*M ] = ( i + 1 ) + j * 8;
		}
	}
	WORK = new Float64Array( N );
	dlarfx( 'left', M, N, v, 1, 0, tau, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'dlarfx: left M=9 N=2', function t() {
	var WORK;
	var tau;
	var tc;
	var M;
	var N;
	var v;
	var C;
	var i;
	var j;

	M = 9;
	N = 2;
	v = new Float64Array([ 1.0, 0.1, -0.2, 0.3, -0.4, 0.15, -0.25, 0.35, -0.05 ]);
	tau = 1.7;
	C = new Float64Array( M * N );
	tc = left_m_9_n_2;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			C[ i + j*M ] = ( i + 1 ) + j * 9;
		}
	}
	WORK = new Float64Array( N );
	dlarfx( 'left', M, N, v, 1, 0, tau, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-12, 'C' );
});
