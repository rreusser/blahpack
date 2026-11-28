/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarfx from './../lib/strided.js';

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
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Extract MxN column-major flat array from C.
*/
function extractMatrix( C, M, N ) {
	const out = [];
	let i;
	for ( i = 0; i < M * N; i++ ) {
		out.push( C[ i ] );
	}
	return out;
}

// TESTS //

test( 'dlarfx: left M=2 N=3', function t() {

	const M = 2;
	const N = 3;
	const v = new Float64Array([ 1.0, 0.5 ]);
	const tau = 1.6;
	const C = new Float64Array([ 1, 4, 2, 5, 3, 6 ]);
	const WORK = new Float64Array( N );
	const tc = left_m_2_n_3;
	dlarfx( 'left', M, N, v, 1, 0, tau, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'dlarfx: right M=3 N=2', function t() {

	const M = 3;
	const N = 2;
	const v = new Float64Array([ 1.0, 0.5 ]);
	const tau = 1.6;
	const C = new Float64Array([ 1, 3, 5, 2, 4, 6 ]);
	const WORK = new Float64Array( M );
	const tc = right_m_3_n_2;
	dlarfx( 'right', M, N, v, 1, 0, tau, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'dlarfx: tau=0 does nothing', function t() {

	const tc = tau_0;
	const M = 2;
	const N = 2;
	const v = new Float64Array([ 1.0, 0.5 ]);
	const C = new Float64Array([ 1, 3, 2, 4 ]);
	const WORK = new Float64Array( N );
	dlarfx( 'left', M, N, v, 1, 0, 0.0, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-14, 'C' );
});

test( 'dlarfx: left M=3 N=2', function t() {

	const M = 3;
	const N = 2;
	const v = new Float64Array([ 1.0, 0.3, -0.5 ]);
	const tau = 1.2;
	const C = new Float64Array([ 2, 3, 5, 1, 4, 6 ]);
	const WORK = new Float64Array( N );
	const tc = left_m_3_n_2;
	dlarfx( 'left', M, N, v, 1, 0, tau, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'dlarfx: right M=2 N=3', function t() {

	const M = 2;
	const N = 3;
	const v = new Float64Array([ 1.0, 0.3, -0.5 ]);
	const tau = 1.2;
	const C = new Float64Array([ 2, 4, 1, 5, 3, 6 ]);
	const WORK = new Float64Array( M );
	const tc = right_m_2_n_3;
	dlarfx( 'right', M, N, v, 1, 0, tau, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'dlarfx: left M=5 N=3', function t() {
	let i, j;

	const M = 5;
	const N = 3;
	const v = new Float64Array([ 1.0, 0.2, -0.3, 0.4, -0.1 ]);
	const tau = 1.5;
	const C = new Float64Array( M * N );
	const tc = left_m_5_n_3;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			C[ i + j*M ] = ( i + 1 ) + j * 5;
		}
	}
	const WORK = new Float64Array( N );
	dlarfx( 'left', M, N, v, 1, 0, tau, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'dlarfx: left M=10 N=4', function t() {
	let i, j;

	const M = 10;
	const N = 4;
	const v = new Float64Array( M );
	const tc = left_m_10_n_4;
	for ( i = 0; i < M; i++ ) {
		v[ i ] = 0.1 * ( i + 1 );
	}
	v[ 0 ] = 1.0;
	const tau = 1.8;
	const C = new Float64Array( M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			C[ i + j*M ] = ( i + 1 ) + 0.5 * ( j + 1 );
		}
	}
	const WORK = new Float64Array( N );
	dlarfx( 'left', M, N, v, 1, 0, tau, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'dlarfx: right M=4 N=10', function t() {
	let i, j;

	const M = 4;
	const N = 10;
	const v = new Float64Array( N );
	const tc = right_m_4_n_10;
	for ( i = 0; i < N; i++ ) {
		v[ i ] = 0.1 * ( i + 1 );
	}
	v[ 0 ] = 1.0;
	const tau = 1.8;
	const C = new Float64Array( M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			C[ i + j*M ] = ( i + 1 ) + 0.5 * ( j + 1 );
		}
	}
	const WORK = new Float64Array( M );
	dlarfx( 'right', M, N, v, 1, 0, tau, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'dlarfx: left M=4 N=2', function t() {
	let i, j;

	const M = 4;
	const N = 2;
	const v = new Float64Array([ 1.0, 0.3, -0.4, 0.2 ]);
	const tau = 1.4;
	const C = new Float64Array( M * N );
	const tc = left_m_4_n_2;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			C[ i + j*M ] = ( i + 1 ) + j * 4;
		}
	}
	const WORK = new Float64Array( N );
	dlarfx( 'left', M, N, v, 1, 0, tau, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'dlarfx: left M=6 N=3', function t() {
	let i, j;

	const M = 6;
	const N = 3;
	const v = new Float64Array([ 1.0, 0.2, -0.3, 0.4, -0.1, 0.5 ]);
	const tau = 1.3;
	const C = new Float64Array( M * N );
	const tc = left_m_6_n_3;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			C[ i + j*M ] = ( i + 1 ) + j * 6;
		}
	}
	const WORK = new Float64Array( N );
	dlarfx( 'left', M, N, v, 1, 0, tau, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'dlarfx: left M=7 N=2', function t() {
	let i, j;

	const M = 7;
	const N = 2;
	const v = new Float64Array([ 1.0, 0.2, -0.3, 0.4, -0.1, 0.5, -0.2 ]);
	const tau = 1.1;
	const C = new Float64Array( M * N );
	const tc = left_m_7_n_2;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			C[ i + j*M ] = ( i + 1 ) + j * 7;
		}
	}
	const WORK = new Float64Array( N );
	dlarfx( 'left', M, N, v, 1, 0, tau, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'dlarfx: left M=8 N=2', function t() {
	let i, j;

	const M = 8;
	const N = 2;
	const v = new Float64Array([ 1.0, 0.1, -0.2, 0.3, -0.4, 0.15, -0.25, 0.35 ]);
	const tau = 1.6;
	const C = new Float64Array( M * N );
	const tc = left_m_8_n_2;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			C[ i + j*M ] = ( i + 1 ) + j * 8;
		}
	}
	const WORK = new Float64Array( N );
	dlarfx( 'left', M, N, v, 1, 0, tau, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'dlarfx: left M=9 N=2', function t() {
	let i, j;

	const M = 9;
	const N = 2;
	const v = new Float64Array([ 1.0, 0.1, -0.2, 0.3, -0.4, 0.15, -0.25, 0.35, -0.05 ]);
	const tau = 1.7;
	const C = new Float64Array( M * N );
	const tc = left_m_9_n_2;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			C[ i + j*M ] = ( i + 1 ) + j * 9;
		}
	}
	const WORK = new Float64Array( N );
	dlarfx( 'left', M, N, v, 1, 0, tau, C, 1, M, 0, WORK, 1, 0 );
	assertArrayClose( extractMatrix( C, M, N ), tc.C, 1e-12, 'C' );
});

// The general path (reflector order > 10) uses WORK: H*C must equal the dense
// (I - tau*v*v^T)*C, and a WORK shorter than N must throw.
test( 'dlarfx: left M=12 N=3 (general path, order > 10) matches the dense product', function t() {
	const M = 12;
	const N = 3;
	const tau = 0.37;
	const v = new Float64Array( M );
	const C = new Float64Array( M * N );
	const Hc = new Float64Array( M * N );
	let i;
	let j;
	let k;
	let s;
	for ( i = 0; i < M; i++ ) {
		v[ i ] = ( i === 0 ) ? 1.0 : Math.sin( i + 0.5 );
		for ( j = 0; j < N; j++ ) {
			C[ i + ( j * M ) ] = Math.cos( ( 3 * i ) + j );
		}
	}
	for ( j = 0; j < N; j++ ) {
		s = 0.0;
		for ( k = 0; k < M; k++ ) {
			s += v[ k ] * C[ k + ( j * M ) ];
		}
		for ( i = 0; i < M; i++ ) {
			Hc[ i + ( j * M ) ] = C[ i + ( j * M ) ] - ( tau * v[ i ] * s );
		}
	}
	dlarfx( 'left', M, N, v, 1, 0, tau, C, 1, M, 0, new Float64Array( N ), 1, 0 );
	for ( i = 0; i < M * N; i++ ) {
		assert.ok( Math.abs( C[ i ] - Hc[ i ] ) <= 1e-14, 'element ' + i );
	}
});

test( 'dlarfx: general path throws a RangeError for a WORK shorter than N', function t() {
	const v = new Float64Array( 12 ).fill( 0.5 );
	const C = new Float64Array( 36 );
	assert.throws( function bad() {
		dlarfx( 'left', 12, 3, v, 1, 0, 0.5, C, 1, 12, 0, new Float64Array( 2 ), 1, 0 );
	}, RangeError );
});

test( 'dlarfx: right M=3 N=12 (general path) matches the dense product C*(I - tau*v*v^T)', function t() {
	const M = 3;
	const N = 12;
	const tau = 0.41;
	const v = new Float64Array( N );
	const C = new Float64Array( M * N );
	const Ch = new Float64Array( M * N );
	let i;
	let j;
	let s;
	for ( j = 0; j < N; j++ ) {
		v[ j ] = ( j === 0 ) ? 1.0 : Math.cos( j + 0.25 );
		for ( i = 0; i < M; i++ ) {
			C[ i + ( j * M ) ] = Math.sin( ( 2 * j ) + i );
		}
	}
	for ( i = 0; i < M; i++ ) {
		s = 0.0;
		for ( j = 0; j < N; j++ ) {
			s += C[ i + ( j * M ) ] * v[ j ];
		}
		for ( j = 0; j < N; j++ ) {
			Ch[ i + ( j * M ) ] = C[ i + ( j * M ) ] - ( tau * s * v[ j ] );
		}
	}
	dlarfx( 'right', M, N, v, 1, 0, tau, C, 1, M, 0, new Float64Array( M ), 1, 0 );
	for ( i = 0; i < M * N; i++ ) {
		assert.ok( Math.abs( C[ i ] - Ch[ i ] ) <= 1e-14, 'element ' + i );
	}
});

test( 'dlarfx: general path throws a RangeError when WORK is null', function t() {
	const v = new Float64Array( 12 ).fill( 0.5 );
	const C = new Float64Array( 36 );
	assert.throws( function bad() {
		dlarfx( 'right', 3, 12, v, 1, 0, 0.5, C, 1, 3, 0, null, 1, 0 );
	}, RangeError );
});
