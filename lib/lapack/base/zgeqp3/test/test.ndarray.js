/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zgeqp3 from './../lib/ndarray.js';

// FIXTURES //

import rect_4x3 from './fixtures/rect_4x3.json' with { type: 'json' };
import rect_3x4 from './fixtures/rect_3x4.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import one_by_one from './fixtures/one_by_one.json' with { type: 'json' };
import fixed_col from './fixtures/fixed_col.json' with { type: 'json' };

// VARIABLES //

const LDA = 8; // Matches Fortran MAXMN

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

test( 'zgeqp3: 4x3 matrix', function t() {

	const tc = rect_4x3;
	const A = new Complex128Array( LDA * LDA );
	const Av = reinterpret( A, 0 );
	Av[0]=1;
	Av[1]=0;
	Av[2]=2;
	Av[3]=1;
	Av[4]=0;
	Av[5]=0;
	Av[6]=1;
	Av[7]=1;
	Av[2*LDA]=0;
	Av[2*LDA+1]=2;
	Av[2*LDA+2]=1;
	Av[2*LDA+3]=0;
	Av[2*LDA+4]=3;
	Av[2*LDA+5]=1;
	Av[2*LDA+6]=2;
	Av[2*LDA+7]=0;
	Av[4*LDA]=3;
	Av[4*LDA+1]=1;
	Av[4*LDA+2]=0;
	Av[4*LDA+3]=0;
	Av[4*LDA+4]=1;
	Av[4*LDA+5]=0;
	Av[4*LDA+6]=2;
	Av[4*LDA+7]=1;
	const JPVT = new Int32Array( 3 );
	const TAU = new Complex128Array( 3 );
	const WORK = new Complex128Array( 200 );
	const RWORK = new Float64Array( 2 * LDA );
	const info = zgeqp3( 4, 3, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( toArray( Av.subarray( 0, tc.a.length ) ), tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( reinterpret( TAU, 0 ) ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'zgeqp3: 3x4 matrix', function t() {

	const tc = rect_3x4;
	const A = new Complex128Array( LDA * LDA );
	const Av = reinterpret( A, 0 );
	Av[0]=1;
	Av[1]=0;
	Av[2]=0;
	Av[3]=1;
	Av[4]=2;
	Av[5]=0;
	Av[2*LDA]=3;
	Av[2*LDA+1]=1;
	Av[2*LDA+2]=1;
	Av[2*LDA+3]=0;
	Av[2*LDA+4]=0;
	Av[2*LDA+5]=1;
	Av[4*LDA]=0;
	Av[4*LDA+1]=2;
	Av[4*LDA+2]=2;
	Av[4*LDA+3]=1;
	Av[4*LDA+4]=1;
	Av[4*LDA+5]=0;
	Av[6*LDA]=1;
	Av[6*LDA+1]=1;
	Av[6*LDA+2]=0;
	Av[6*LDA+3]=0;
	Av[6*LDA+4]=3;
	Av[6*LDA+5]=0;
	const JPVT = new Int32Array( 4 );
	const TAU = new Complex128Array( 3 );
	const WORK = new Complex128Array( 200 );
	const RWORK = new Float64Array( 2 * LDA );
	const info = zgeqp3( 3, 4, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( toArray( Av.subarray( 0, tc.a.length ) ), tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( reinterpret( TAU, 0 ) ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'zgeqp3: rank-deficient 3x3', function t() {

	const A = new Complex128Array( LDA * LDA );
	const Av = reinterpret( A, 0 );
	Av[0]=1;
	Av[1]=0;
	Av[2]=2;
	Av[3]=0;
	Av[4]=3;
	Av[5]=0;
	Av[2*LDA]=0;
	Av[2*LDA+1]=1;
	Av[2*LDA+2]=0;
	Av[2*LDA+3]=2;
	Av[2*LDA+4]=0;
	Av[2*LDA+5]=3;
	Av[4*LDA]=1;
	Av[4*LDA+1]=1;
	Av[4*LDA+2]=2;
	Av[4*LDA+3]=2;
	Av[4*LDA+4]=3;
	Av[4*LDA+5]=3;
	const JPVT = new Int32Array( 3 );
	const TAU = new Complex128Array( 3 );
	const WORK = new Complex128Array( 200 );
	const RWORK = new Float64Array( 2 * LDA );
	const info = zgeqp3( 3, 3, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( info, 0, 1e-14, 'info' );
	assert.equal( JPVT[ 0 ], 3, 'first pivot is column 3' );
	assertClose( Av[ 0 ], -5.2915026221291805, 1e-10, 'R(0,0)' );
	assertClose( Math.abs( Av[ 2 * LDA + 2 ] ), 0.0, 1e-10, '|R(1,1)|~0' );
	assertClose( Math.abs( Av[ 4 * LDA + 4 ] ), 0.0, 1e-10, '|R(2,2)|~0' );
});

test( 'zgeqp3: N=0 quick return', function t() {

	const tc = n_zero;
	const A = new Complex128Array( 10 );
	const JPVT = new Int32Array( 1 );
	const TAU = new Complex128Array( 1 );
	const WORK = new Complex128Array( 10 );
	const RWORK = new Float64Array( 10 );
	const info = zgeqp3( 3, 0, A, 1, 3, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( info, tc.info, 1e-14, 'info' );
});

test( 'zgeqp3: M=0 quick return', function t() {

	const tc = m_zero;
	const A = new Complex128Array( 10 );
	const JPVT = new Int32Array( 3 );
	const TAU = new Complex128Array( 1 );
	const WORK = new Complex128Array( 10 );
	const RWORK = new Float64Array( 10 );
	const info = zgeqp3( 0, 3, A, 1, 1, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( info, tc.info, 1e-14, 'info' );
});

test( 'zgeqp3: 1x1 matrix', function t() {

	const tc = one_by_one;
	const A = new Complex128Array( LDA * LDA );
	const Av = reinterpret( A, 0 );
	Av[0] = 3;
	Av[1] = 4;
	const JPVT = new Int32Array( [ 0 ] );
	const TAU = new Complex128Array( 1 );
	const WORK = new Complex128Array( 200 );
	const RWORK = new Float64Array( 2 * LDA );
	const info = zgeqp3( 1, 1, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( toArray( Av.subarray( 0, tc.a.length ) ), tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( reinterpret( TAU, 0 ) ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'zgeqp3: fixed column', function t() {

	const tc = fixed_col;
	const A = new Complex128Array( LDA * LDA );
	const Av = reinterpret( A, 0 );
	Av[0]=1;
	Av[1]=0;
	Av[2]=0;
	Av[3]=0;
	Av[4]=0;
	Av[5]=0;
	Av[2*LDA]=0;
	Av[2*LDA+1]=0;
	Av[2*LDA+2]=3;
	Av[2*LDA+3]=0;
	Av[2*LDA+4]=4;
	Av[2*LDA+5]=0;
	Av[4*LDA]=0;
	Av[4*LDA+1]=0;
	Av[4*LDA+2]=1;
	Av[4*LDA+3]=1;
	Av[4*LDA+4]=2;
	Av[4*LDA+5]=0;
	const JPVT = new Int32Array( [ 1, 0, 0 ] );
	const TAU = new Complex128Array( 3 );
	const WORK = new Complex128Array( 200 );
	const RWORK = new Float64Array( 2 * LDA );
	const info = zgeqp3( 3, 3, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( toArray( Av.subarray( 0, tc.a.length ) ), tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( reinterpret( TAU, 0 ) ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'zgeqp3: fixed column with swap (JPVT[2]=1)', function t() {

	const A = new Complex128Array( LDA * LDA );
	const Av = reinterpret( A, 0 );
	Av[0]=1;
	Av[1]=0;
	Av[2]=2;
	Av[3]=0;
	Av[4]=0;
	Av[5]=0;
	Av[6]=1;
	Av[7]=0;
	Av[2*LDA]=3;
	Av[2*LDA+1]=0;
	Av[2*LDA+2]=0;
	Av[2*LDA+3]=1;
	Av[2*LDA+4]=2;
	Av[2*LDA+5]=0;
	Av[2*LDA+6]=1;
	Av[2*LDA+7]=1;
	Av[4*LDA]=0;
	Av[4*LDA+1]=1;
	Av[4*LDA+2]=1;
	Av[4*LDA+3]=0;
	Av[4*LDA+4]=3;
	Av[4*LDA+5]=0;
	Av[4*LDA+6]=2;
	Av[4*LDA+7]=0;
	const JPVT = new Int32Array( [ 0, 0, 1 ] );
	const TAU = new Complex128Array( 3 );
	const WORK = new Complex128Array( 200 );
	const RWORK = new Float64Array( 2 * LDA );
	const info = zgeqp3( 4, 3, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.equal( JPVT[0], 3, 'fixed column 3 is first' );
	const r00mag = Math.sqrt( Av[0] * Av[0] + Av[1] * Av[1] );
	assert.ok( r00mag > 0.1, 'R(0,0) magnitude is non-trivial: ' + r00mag );
});

test( 'zgeqp3: two fixed columns', function t() {

	const A = new Complex128Array( LDA * LDA );
	const Av = reinterpret( A, 0 );
	Av[0]=1;
	Av[1]=0;
	Av[2]=2;
	Av[3]=0;
	Av[4]=0;
	Av[5]=0;
	Av[6]=1;
	Av[7]=0;
	Av[2*LDA]=3;
	Av[2*LDA+1]=0;
	Av[2*LDA+2]=0;
	Av[2*LDA+3]=1;
	Av[2*LDA+4]=2;
	Av[2*LDA+5]=0;
	Av[2*LDA+6]=1;
	Av[2*LDA+7]=1;
	Av[4*LDA]=0;
	Av[4*LDA+1]=1;
	Av[4*LDA+2]=1;
	Av[4*LDA+3]=0;
	Av[4*LDA+4]=3;
	Av[4*LDA+5]=0;
	Av[4*LDA+6]=2;
	Av[4*LDA+7]=0;
	const JPVT = new Int32Array( [ 1, 0, 1 ] );
	const TAU = new Complex128Array( 3 );
	const WORK = new Complex128Array( 200 );
	const RWORK = new Float64Array( 2 * LDA );
	const info = zgeqp3( 4, 3, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.ok( JPVT[0] === 1 || JPVT[0] === 3, 'first pivot is a fixed column: ' + JPVT[0] ); // eslint-disable-line max-len
	assert.ok( JPVT[1] === 1 || JPVT[1] === 3, 'second pivot is a fixed column: ' + JPVT[1] ); // eslint-disable-line max-len
	assert.notEqual( JPVT[0], JPVT[1], 'first two pivots are different' );
});

test( 'zgeqp3: large matrix 35x36 (blocked zlaqps path, sminmn > 32)', function t() { // eslint-disable-line max-len
	let prevMag, mag, re, im, i, j;

	const BLDA = 40;
	const M = 35;
	const N = 36;
	const A = new Complex128Array( BLDA * N );
	const Av = reinterpret( A, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Av[ 2 * ( i + j * BLDA ) ] = ( ( ( i + 1 ) * ( j + 1 ) + 3 ) % 7 ) - 3.0;
			Av[ 2 * ( i + j * BLDA ) + 1 ] = ( ( ( i + 1 ) + ( j + 1 ) ) % 5 ) - 2.0;
		}
	}
	const JPVT = new Int32Array( N );
	const TAU = new Complex128Array( Math.min( M, N ) );
	const WORK = new Complex128Array( 10000 );
	const RWORK = new Float64Array( 2 * N );
	const info = zgeqp3( M, N, A, 1, BLDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	prevMag = Infinity;
	const minmn = Math.min( M, N );
	for ( i = 0; i < minmn; i++ ) {
		re = Av[ 2 * ( i + i * BLDA ) ];
		im = Av[ 2 * ( i + i * BLDA ) + 1 ];
		mag = Math.sqrt( re * re + im * im );
		assert.ok( mag <= prevMag + 1e-10, 'R diagonal magnitude decreasing at ' + i + ': ' + mag + ' <= ' + prevMag ); // eslint-disable-line max-len
		prevMag = mag;
	}
	const perm = toArray( JPVT ).sort( function cmp( a, b ) { return a - b; } );
	for ( i = 0; i < N; i++ ) {
		assert.equal( perm[ i ], i + 1, 'JPVT is valid permutation at ' + i );
	}
});

test( 'zgeqp3: wide matrix 8x36 (blocked zlaqps path)', function t() {
	let prevMag, mag, re, im, i, j;

	const BLDA = 40;
	const M = 8;
	const N = 36;
	const A = new Complex128Array( BLDA * N );
	const Av = reinterpret( A, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Av[ 2 * ( i + j * BLDA ) ] = ( ( ( i + 1 ) * ( j + 1 ) + 3 ) % 7 ) - 3.0;
			Av[ 2 * ( i + j * BLDA ) + 1 ] = ( ( ( i + 1 ) + ( j + 1 ) ) % 5 ) - 2.0;
		}
	}
	const JPVT = new Int32Array( N );
	const TAU = new Complex128Array( M );
	const WORK = new Complex128Array( 10000 );
	const RWORK = new Float64Array( 2 * BLDA );
	const info = zgeqp3( M, N, A, 1, BLDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	prevMag = Infinity;
	for ( i = 0; i < M; i++ ) {
		re = Av[ 2 * ( i + i * BLDA ) ];
		im = Av[ 2 * ( i + i * BLDA ) + 1 ];
		mag = Math.sqrt( re * re + im * im );
		assert.ok( mag <= prevMag + 1e-10, 'R diagonal magnitude decreasing at ' + i + ': ' + mag + ' <= ' + prevMag ); // eslint-disable-line max-len
		prevMag = mag;
	}
	const perm = toArray( JPVT ).sort( function cmp( a, b ) { return a - b; } );
	for ( i = 0; i < N; i++ ) {
		assert.equal( perm[ i ], i + 1, 'JPVT is valid permutation at ' + i );
	}
});

test( 'zgeqp3: throws RangeError for missing or undersized workspaces', function t() {
	const A = new Complex128Array( 4 );
	const JPVT = new Int32Array( 2 );
	const TAU = new Complex128Array( 2 );
	assert.throws( function throws() {
		zgeqp3( 2, 2, A, 1, 2, 0, JPVT, 1, 0, TAU, 1, 0, new Complex128Array( 2 ), 1, 0, new Float64Array( 4 ), 1, 0 ); // eslint-disable-line max-len
	}, /WORK array must have at least 3 elements/ );
	assert.throws( function throws() {
		zgeqp3( 2, 2, A, 1, 2, 0, JPVT, 1, 0, TAU, 1, 0, new Complex128Array( 128 ), 1, 0, null, 1, 0 ); // eslint-disable-line max-len
	}, /RWORK array must have at least 4 elements/ );
	assert.throws( function throws() {
		zgeqp3( 2, 2, A, 1, 2, 0, JPVT, 1, 0, TAU, 1, 0, new Complex128Array( 128 ), 1, 0, new Float64Array( 4 ), 1, 1 ); // eslint-disable-line max-len
	}, /RWORK array must have at least 4 elements/ );
});

/**
* Fills an M-by-N complex column-major matrix with deterministic pseudo-random values.
*
* @private
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @returns {Float64Array} interleaved matrix
*/
function randomMatrix( M, N ) {
	const A = new Float64Array( 2 * M * N );
	let seed = 7;
	let i;
	for ( i = 0; i < 2 * M * N; i++ ) {
		seed = ( seed * 16807 ) % 2147483647;
		A[ i ] = ( seed / 2147483647 ) - 0.5;
	}
	return A;
}

/**
* Returns `max |A0*P - Q*R| / max |A0|` for a factorization computed by zgeqp3 (column-major, leading dimension M; H_t = I - tau_t v_t v_tᴴ).
*
* @private
* @param {Float64Array} A0 - original matrix (interleaved)
* @param {Float64Array} A - factored matrix (interleaved)
* @param {Int32Array} JPVT - pivots (1-based)
* @param {Float64Array} T - reflector scalars (interleaved)
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @returns {number} relative residual
*/
function residual( A0, A, JPVT, T, M, N ) {
	const K = Math.min( M, N );
	const QR = new Float64Array( 2 * M * N );
	let anrm = 0.0;
	let err = 0.0;
	let vr, vi, wr, wi, tr, ti, p, q, i, j, t;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= Math.min( j, M - 1 ); i++ ) {
			p = 2 * ( ( j * M ) + i );
			QR[ p ] = A[ p ];
			QR[ p + 1 ] = A[ p + 1 ];
		}
	}
	for ( t = K - 1; t >= 0; t-- ) {
		for ( j = 0; j < N; j++ ) {
			// w = v^H * QR(:,j), v(t) = 1
			p = 2 * ( ( j * M ) + t );
			wr = QR[ p ];
			wi = QR[ p + 1 ];
			for ( i = t + 1; i < M; i++ ) {
				q = 2 * ( ( t * M ) + i );
				p = 2 * ( ( j * M ) + i );
				vr = A[ q ];
				vi = A[ q + 1 ];
				wr += ( vr * QR[ p ] ) + ( vi * QR[ p + 1 ] );
				wi += ( vr * QR[ p + 1 ] ) - ( vi * QR[ p ] );
			}
			tr = ( T[ 2 * t ] * wr ) - ( T[ ( 2 * t ) + 1 ] * wi );
			ti = ( T[ 2 * t ] * wi ) + ( T[ ( 2 * t ) + 1 ] * wr );
			p = 2 * ( ( j * M ) + t );
			QR[ p ] -= tr;
			QR[ p + 1 ] -= ti;
			for ( i = t + 1; i < M; i++ ) {
				q = 2 * ( ( t * M ) + i );
				p = 2 * ( ( j * M ) + i );
				QR[ p ] -= ( A[ q ] * tr ) - ( A[ q + 1 ] * ti );
				QR[ p + 1 ] -= ( A[ q ] * ti ) + ( A[ q + 1 ] * tr );
			}
		}
	}
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			p = 2 * ( i + ( M * ( JPVT[ j ] - 1 ) ) );
			q = 2 * ( ( j * M ) + i );
			anrm = Math.max( anrm, Math.abs( A0[ p ] ), Math.abs( A0[ p + 1 ] ) );
			err = Math.max( err, Math.abs( A0[ p ] - QR[ q ] ), Math.abs( A0[ p + 1 ] - QR[ q + 1 ] ) ); // eslint-disable-line max-len
		}
	}
	return ( err === err ) ? err / anrm : Infinity;
}

/**
* Factors a deterministic 200x200 complex matrix with a workspace of the given length (the blocked part, `min(M,N) - NX` with NX = 128, spans several blocks).
*
* @private
* @param {NonNegativeInteger} lwork - workspace length (complex elements)
* @param {NonNegativeInteger} nfixed - number of leading columns to fix
* @returns {number} relative residual
*/
function run200( lwork, nfixed ) {
	const M = 200;
	const N = 200;
	const A0 = randomMatrix( M, N );
	const A = new Complex128Array( A0 );
	const JPVT = new Int32Array( N );
	const TAU = new Complex128Array( N );
	let i;
	for ( i = 0; i < nfixed; i++ ) {
		JPVT[ i ] = 1;
	}
	const info = zgeqp3( M, N, A, 1, M, 0, JPVT, 1, 0, TAU, 1, 0, new Complex128Array( lwork ), 1, 0, new Float64Array( 2 * N ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	return residual( A0, reinterpret( A, 0 ), JPVT, reinterpret( TAU, 0 ), M, N );
}

test( 'zgeqp3: 200x200 with WORK of the reference minimum N+1 (unblocked fallback) gives A*P = Q*R', function t() {
	const N = 200;
	const opt = run200( ( N + 1 ) * 32, 0 );
	const lo = run200( N + 1, 0 );
	assert.ok( opt < 1e-13, 'optimum residual ' + opt );
	assert.ok( lo < 1e-13, 'minimum residual ' + lo );
});

test( 'zgeqp3: 200x200 with WORK for a shrunk block size NB=8 gives A*P = Q*R', function t() {
	const N = 200;
	const mid = run200( ( N + 1 ) * 8, 0 );
	assert.ok( mid < 1e-13, 'residual ' + mid );
});

test( 'zgeqp3: 200x200 with 10 fixed columns and WORK of (SN+1)*NB gives A*P = Q*R', function t() {
	const res = run200( 191 * 32, 10 );
	assert.ok( res < 1e-13, 'residual ' + res );
});

test( 'zgeqp3: throws when WORK is one element below the minimum N+1', function t() {
	const N = 200;
	assert.throws( function throws() {
		zgeqp3( N, N, new Complex128Array( N * N ), 1, N, 0, new Int32Array( N ), 1, 0, new Complex128Array( N ), 1, 0, new Complex128Array( N ), 1, 0, new Float64Array( 2 * N ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
	assert.doesNotThrow( function noThrow() {
		zgeqp3( N, N, new Complex128Array( N * N ), 1, N, 0, new Int32Array( N ), 1, 0, new Complex128Array( N ), 1, 0, new Complex128Array( N + 1 ), 1, 0, new Float64Array( 2 * N ), 1, 0 ); // eslint-disable-line max-len
	} );
});

test( 'zgeqp3: throws for a null WORK or non-unit workspace strides', function t() {
	const A = new Complex128Array( 4 );
	const JPVT = new Int32Array( 2 );
	const TAU = new Complex128Array( 2 );
	assert.throws( function throws() {
		zgeqp3( 2, 2, A, 1, 2, 0, JPVT, 1, 0, TAU, 1, 0, null, 1, 0, new Float64Array( 4 ), 1, 0 ); // eslint-disable-line max-len
	}, /WORK array must have at least 3 elements/ );
	assert.throws( function throws() {
		zgeqp3( 2, 2, A, 1, 2, 0, JPVT, 1, 0, TAU, 1, 0, new Complex128Array( 8 ), 2, 0, new Float64Array( 4 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
	assert.throws( function throws() {
		zgeqp3( 2, 2, A, 1, 2, 0, JPVT, 1, 0, TAU, 1, 0, new Complex128Array( 8 ), 1, 0, new Float64Array( 8 ), 2, 0 ); // eslint-disable-line max-len
	}, RangeError );
});
