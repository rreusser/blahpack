

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgebrd from './../lib/ndarray.js';

// FIXTURES //

import upper_4x3 from './fixtures/upper_4x3.json' with { type: 'json' };
import lower_3x4 from './fixtures/lower_3x4.json' with { type: 'json' };
import square_6x6 from './fixtures/square_6x6.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import one_by_one from './fixtures/one_by_one.json' with { type: 'json' };
import upper_35x33 from './fixtures/upper_35x33.json' with { type: 'json' };
import lower_33x35 from './fixtures/lower_33x35.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Generates a diagonally dominant complex matrix.
* A(i,j) = (delta_ij * (i+j+10) + sin(i+2*j), cos(2*i+j))
* Matches the Fortran test (1-based i,j in Fortran = 0-based i,j + 1 here).
*
* @param {number} M - rows
* @param {number} N - columns
* @returns {Complex128Array} complex array, column-major
*/
function makeBigMatrix( M, N ) {
	const A = new Complex128Array( M * N );
	const Av = reinterpret( A, 0 );
	let i, j, idx, fi, fj;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			fi = i + 1; // 1-based
			fj = j + 1;
			idx = 2 * ( j * M + i );
			if ( i === j ) {
				Av[ idx ] = ( fi + fj + 10 ) + Math.sin( fi + 2 * fj );
				Av[ idx + 1 ] = Math.cos( 2 * fi + fj );
			} else {
				Av[ idx ] = Math.sin( fi + 2 * fj );
				Av[ idx + 1 ] = Math.cos( 2 * fi + fj );
			}
		}
	}
	return A;
}

// TESTS //

test( 'zgebrd: upper_4x3 (M > N, upper bidiagonal)', function t() {
	const tc = upper_4x3;

	const A = new Complex128Array([
		1, 2, 3, 4, 5, 6, 7, 8,
		9, 1, 2, 3, 4, 5, 6, 7,
		8, 9, 1, 2, 3, 4, 5, 6
	]);
	const d = new Float64Array( 3 );
	const e = new Float64Array( 2 );
	const TAUQ = new Complex128Array( 3 );
	const TAUP = new Complex128Array( 3 );
	const WORK = new Complex128Array( 100 );

	const info = zgebrd( 4, 3, A, 1, 4, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.a, 1e-14, 'a' );
	assertArrayClose( Array.from( d ), tc.d, 1e-14, 'd' );
	assertArrayClose( Array.from( e ), tc.e, 1e-14, 'e' );
	assertArrayClose( Array.from( reinterpret( TAUQ, 0 ) ), tc.tauq, 1e-14, 'tauq' );
	assertArrayClose( Array.from( reinterpret( TAUP, 0 ) ), tc.taup, 1e-14, 'taup' );
});

test( 'zgebrd: lower_3x4 (M < N, lower bidiagonal)', function t() {
	const tc = lower_3x4;

	const A = new Complex128Array([
		1, 2, 3, 4, 5, 6,
		7, 8, 9, 1, 2, 3,
		4, 5, 6, 7, 8, 9,
		1, 2, 3, 4, 5, 6
	]);
	const d = new Float64Array( 3 );
	const e = new Float64Array( 2 );
	const TAUQ = new Complex128Array( 3 );
	const TAUP = new Complex128Array( 3 );
	const WORK = new Complex128Array( 100 );

	const info = zgebrd( 3, 4, A, 1, 3, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.a, 1e-14, 'a' );
	assertArrayClose( Array.from( d ), tc.d, 1e-14, 'd' );
	assertArrayClose( Array.from( e ), tc.e, 1e-14, 'e' );
	assertArrayClose( Array.from( reinterpret( TAUQ, 0 ) ), tc.tauq, 1e-14, 'tauq' );
	assertArrayClose( Array.from( reinterpret( TAUP, 0 ) ), tc.taup, 1e-14, 'taup' );
});

test( 'zgebrd: square_6x6', function t() {
	const tc = square_6x6;

	const A = new Complex128Array([
		5, 1, 0, 2, 1, -1, 0, 0, 3, 0, 0, 1,
		2, 0, 6, -1, 0, 3, 1, 0, 0, 0, 4, 2,
		0, 1, 1, 0, 7, 0, 0, -2, 2, 1, 0, 0,
		3, 0, 0, 1, 0, -1, 8, 0, 1, 0, 0, 3,
		1, -1, 0, 0, 2, 0, 0, 1, 9, 0, 1, -2,
		0, 2, 1, -1, 0, 0, 3, 0, 0, 1, 10, 0
	]);
	const d = new Float64Array( 6 );
	const e = new Float64Array( 5 );
	const TAUQ = new Complex128Array( 6 );
	const TAUP = new Complex128Array( 6 );
	const WORK = new Complex128Array( 400 );

	const info = zgebrd( 6, 6, A, 1, 6, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.a, 1e-13, 'a' );
	assertArrayClose( Array.from( d ), tc.d, 1e-13, 'd' );
	assertArrayClose( Array.from( e ), tc.e, 1e-13, 'e' );
	assertArrayClose( Array.from( reinterpret( TAUQ, 0 ) ), tc.tauq, 1e-13, 'tauq' );
	assertArrayClose( Array.from( reinterpret( TAUP, 0 ) ), tc.taup, 1e-13, 'taup' );
});

test( 'zgebrd: m_zero (quick return)', function t() {
	const tc = m_zero;
	const A = new Complex128Array( 1 );
	const d = new Float64Array( 1 );
	const e = new Float64Array( 1 );
	const TAUQ = new Complex128Array( 1 );
	const TAUP = new Complex128Array( 1 );
	const WORK = new Complex128Array( 5 );

	const info = zgebrd( 0, 3, A, 1, 1, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
});

test( 'zgebrd: n_zero (quick return)', function t() {
	const tc = n_zero;
	const A = new Complex128Array( 1 );
	const d = new Float64Array( 1 );
	const e = new Float64Array( 1 );
	const TAUQ = new Complex128Array( 1 );
	const TAUP = new Complex128Array( 1 );
	const WORK = new Complex128Array( 5 );

	const info = zgebrd( 3, 0, A, 1, 3, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
});

test( 'zgebrd: one_by_one', function t() {
	const tc = one_by_one;

	const A = new Complex128Array([ 5, 3 ]);
	const d = new Float64Array( 1 );
	const e = new Float64Array( 1 );
	const TAUQ = new Complex128Array( 1 );
	const TAUP = new Complex128Array( 1 );
	const WORK = new Complex128Array( 5 );

	const info = zgebrd( 1, 1, A, 1, 1, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.a, 1e-14, 'a' );
	assertArrayClose( Array.from( d ), tc.d, 1e-14, 'd' );
	assertArrayClose( Array.from( reinterpret( TAUQ, 0 ) ), tc.tauq, 1e-14, 'tauq' );
	assertArrayClose( Array.from( reinterpret( TAUP, 0 ) ), tc.taup, 1e-14, 'taup' );
});

test( 'zgebrd: upper_35x33 (blocked, M > N, small lwork)', function t() {
	const tc = upper_35x33;

	const A = makeBigMatrix( 35, 33 );
	const d = new Float64Array( 33 );
	const e = new Float64Array( 32 );
	const TAUQ = new Complex128Array( 33 );
	const TAUP = new Complex128Array( 33 );

	const smallLwork = ( 35 + 33 ) * 2;
	const WORK = new Complex128Array( smallLwork );

	const info = zgebrd( 35, 33, A, 1, 35, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( d ), tc.d, 1e-10, 'd' );
	assertArrayClose( Array.from( e ), tc.e, 1e-10, 'e' );
});

test( 'zgebrd: upper_35x33 (blocked, M > N, tiny lwork)', function t() {
	const tc = upper_35x33;

	const A = makeBigMatrix( 35, 33 );
	const d = new Float64Array( 33 );
	const e = new Float64Array( 32 );
	const TAUQ = new Complex128Array( 33 );
	const TAUP = new Complex128Array( 33 );

	const tinyLwork = 35;
	const WORK = new Complex128Array( tinyLwork );

	const info = zgebrd( 35, 33, A, 1, 35, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( d ), tc.d, 1e-10, 'd' );
	assertArrayClose( Array.from( e ), tc.e, 1e-10, 'e' );
});

test( 'zgebrd: upper_35x33 (blocked, M > N)', function t() {
	const tc = upper_35x33;

	const A = makeBigMatrix( 35, 33 );
	const d = new Float64Array( 33 );
	const e = new Float64Array( 32 );
	const TAUQ = new Complex128Array( 33 );
	const TAUP = new Complex128Array( 33 );
	const WORK = new Complex128Array( ( 35 + 33 ) * 32 );

	const info = zgebrd( 35, 33, A, 1, 35, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( d ), tc.d, 1e-12, 'd' );
	assertArrayClose( Array.from( e ), tc.e, 1e-12, 'e' );
	assertArrayClose( Array.from( reinterpret( TAUQ, 0 ) ), tc.tauq, 1e-12, 'tauq' );
	assertArrayClose( Array.from( reinterpret( TAUP, 0 ) ), tc.taup, 1e-12, 'taup' );
});

test( 'zgebrd: lower_33x35 (blocked, M < N)', function t() {
	const tc = lower_33x35;

	const A = makeBigMatrix( 33, 35 );
	const d = new Float64Array( 33 );
	const e = new Float64Array( 32 );
	const TAUQ = new Complex128Array( 33 );
	const TAUP = new Complex128Array( 33 );
	const WORK = new Complex128Array( ( 33 + 35 ) * 32 );

	const info = zgebrd( 33, 35, A, 1, 33, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( d ), tc.d, 1e-12, 'd' );
	assertArrayClose( Array.from( e ), tc.e, 1e-12, 'e' );
	assertArrayClose( Array.from( reinterpret( TAUQ, 0 ) ), tc.tauq, 1e-12, 'tauq' );
	assertArrayClose( Array.from( reinterpret( TAUP, 0 ) ), tc.taup, 1e-12, 'taup' );
});
