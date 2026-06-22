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

var LDA = 8; // Matches Fortran MAXMN

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
	var i;
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
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'zgeqp3: 4x3 matrix', function t() {
	var RWORK;
	var JPVT;
	var WORK;
	var info;
	var TAU;
	var tc;
	var Av;
	var A;

	tc = rect_4x3;
	A = new Complex128Array( LDA * LDA );
	Av = reinterpret( A, 0 );
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
	JPVT = new Int32Array( 3 );
	TAU = new Complex128Array( 3 );
	WORK = new Complex128Array( 200 );
	RWORK = new Float64Array( 2 * LDA );
	info = zgeqp3( 4, 3, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, 200, RWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( toArray( Av.subarray( 0, tc.a.length ) ), tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( reinterpret( TAU, 0 ) ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'zgeqp3: 3x4 matrix', function t() {
	var RWORK;
	var JPVT;
	var WORK;
	var info;
	var TAU;
	var tc;
	var Av;
	var A;

	tc = rect_3x4;
	A = new Complex128Array( LDA * LDA );
	Av = reinterpret( A, 0 );
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
	JPVT = new Int32Array( 4 );
	TAU = new Complex128Array( 3 );
	WORK = new Complex128Array( 200 );
	RWORK = new Float64Array( 2 * LDA );
	info = zgeqp3( 3, 4, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, 200, RWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( toArray( Av.subarray( 0, tc.a.length ) ), tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( reinterpret( TAU, 0 ) ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'zgeqp3: rank-deficient 3x3', function t() {
	var RWORK;
	var JPVT;
	var WORK;
	var info;
	var TAU;
	var Av;
	var A;

	A = new Complex128Array( LDA * LDA );
	Av = reinterpret( A, 0 );
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
	JPVT = new Int32Array( 3 );
	TAU = new Complex128Array( 3 );
	WORK = new Complex128Array( 200 );
	RWORK = new Float64Array( 2 * LDA );
	info = zgeqp3( 3, 3, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, 200, RWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( info, 0, 1e-14, 'info' );
	assert.equal( JPVT[ 0 ], 3, 'first pivot is column 3' );
	assertClose( Av[ 0 ], -5.2915026221291805, 1e-10, 'R(0,0)' );
	assertClose( Math.abs( Av[ 2 * LDA + 2 ] ), 0.0, 1e-10, '|R(1,1)|~0' );
	assertClose( Math.abs( Av[ 4 * LDA + 4 ] ), 0.0, 1e-10, '|R(2,2)|~0' );
});

test( 'zgeqp3: N=0 quick return', function t() {
	var RWORK;
	var JPVT;
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = n_zero;
	A = new Complex128Array( 10 );
	JPVT = new Int32Array( 1 );
	TAU = new Complex128Array( 1 );
	WORK = new Complex128Array( 10 );
	RWORK = new Float64Array( 10 );
	info = zgeqp3( 3, 0, A, 1, 3, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, 10, RWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( info, tc.info, 1e-14, 'info' );
});

test( 'zgeqp3: M=0 quick return', function t() {
	var RWORK;
	var JPVT;
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = m_zero;
	A = new Complex128Array( 10 );
	JPVT = new Int32Array( 3 );
	TAU = new Complex128Array( 1 );
	WORK = new Complex128Array( 10 );
	RWORK = new Float64Array( 10 );
	info = zgeqp3( 0, 3, A, 1, 1, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, 10, RWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( info, tc.info, 1e-14, 'info' );
});

test( 'zgeqp3: 1x1 matrix', function t() {
	var RWORK;
	var JPVT;
	var WORK;
	var info;
	var TAU;
	var tc;
	var Av;
	var A;

	tc = one_by_one;
	A = new Complex128Array( LDA * LDA );
	Av = reinterpret( A, 0 );
	Av[0] = 3;
	Av[1] = 4;
	JPVT = new Int32Array( [ 0 ] );
	TAU = new Complex128Array( 1 );
	WORK = new Complex128Array( 200 );
	RWORK = new Float64Array( 2 * LDA );
	info = zgeqp3( 1, 1, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, 200, RWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( toArray( Av.subarray( 0, tc.a.length ) ), tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( reinterpret( TAU, 0 ) ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'zgeqp3: fixed column', function t() {
	var RWORK;
	var JPVT;
	var WORK;
	var info;
	var TAU;
	var tc;
	var Av;
	var A;

	tc = fixed_col;
	A = new Complex128Array( LDA * LDA );
	Av = reinterpret( A, 0 );
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
	JPVT = new Int32Array( [ 1, 0, 0 ] );
	TAU = new Complex128Array( 3 );
	WORK = new Complex128Array( 200 );
	RWORK = new Float64Array( 2 * LDA );
	info = zgeqp3( 3, 3, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, 200, RWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( toArray( Av.subarray( 0, tc.a.length ) ), tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( reinterpret( TAU, 0 ) ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'zgeqp3: fixed column with swap (JPVT[2]=1)', function t() {
	var r00mag;
	var RWORK;
	var JPVT;
	var WORK;
	var info;
	var TAU;
	var Av;
	var A;

	A = new Complex128Array( LDA * LDA );
	Av = reinterpret( A, 0 );
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
	JPVT = new Int32Array( [ 0, 0, 1 ] );
	TAU = new Complex128Array( 3 );
	WORK = new Complex128Array( 200 );
	RWORK = new Float64Array( 2 * LDA );
	info = zgeqp3( 4, 3, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, 200, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.equal( JPVT[0], 3, 'fixed column 3 is first' );
	r00mag = Math.sqrt( Av[0] * Av[0] + Av[1] * Av[1] );
	assert.ok( r00mag > 0.1, 'R(0,0) magnitude is non-trivial: ' + r00mag );
});

test( 'zgeqp3: two fixed columns', function t() {
	var RWORK;
	var JPVT;
	var WORK;
	var info;
	var TAU;
	var Av;
	var A;

	A = new Complex128Array( LDA * LDA );
	Av = reinterpret( A, 0 );
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
	JPVT = new Int32Array( [ 1, 0, 1 ] );
	TAU = new Complex128Array( 3 );
	WORK = new Complex128Array( 200 );
	RWORK = new Float64Array( 2 * LDA );
	info = zgeqp3( 4, 3, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, 200, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.ok( JPVT[0] === 1 || JPVT[0] === 3, 'first pivot is a fixed column: ' + JPVT[0] ); // eslint-disable-line max-len
	assert.ok( JPVT[1] === 1 || JPVT[1] === 3, 'second pivot is a fixed column: ' + JPVT[1] ); // eslint-disable-line max-len
	assert.notEqual( JPVT[0], JPVT[1], 'first two pivots are different' );
});

test( 'zgeqp3: large matrix 35x36 (blocked zlaqps path, sminmn > 32)', function t() { // eslint-disable-line max-len
	var prevMag;
	var RWORK;
	var minmn;
	var BLDA;
	var JPVT;
	var WORK;
	var info;
	var perm;
	var TAU;
	var mag;
	var Av;
	var re;
	var im;
	var M;
	var N;
	var A;
	var i;
	var j;

	BLDA = 40;
	M = 35;
	N = 36;
	A = new Complex128Array( BLDA * N );
	Av = reinterpret( A, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Av[ 2 * ( i + j * BLDA ) ] = ( ( ( i + 1 ) * ( j + 1 ) + 3 ) % 7 ) - 3.0;
			Av[ 2 * ( i + j * BLDA ) + 1 ] = ( ( ( i + 1 ) + ( j + 1 ) ) % 5 ) - 2.0;
		}
	}
	JPVT = new Int32Array( N );
	TAU = new Complex128Array( Math.min( M, N ) );
	WORK = new Complex128Array( 10000 );
	RWORK = new Float64Array( 2 * N );
	info = zgeqp3( M, N, A, 1, BLDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, 10000, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	prevMag = Infinity;
	minmn = Math.min( M, N );
	for ( i = 0; i < minmn; i++ ) {
		re = Av[ 2 * ( i + i * BLDA ) ];
		im = Av[ 2 * ( i + i * BLDA ) + 1 ];
		mag = Math.sqrt( re * re + im * im );
		assert.ok( mag <= prevMag + 1e-10, 'R diagonal magnitude decreasing at ' + i + ': ' + mag + ' <= ' + prevMag ); // eslint-disable-line max-len
		prevMag = mag;
	}
	perm = toArray( JPVT ).sort( function cmp( a, b ) { return a - b; } );
	for ( i = 0; i < N; i++ ) {
		assert.equal( perm[ i ], i + 1, 'JPVT is valid permutation at ' + i );
	}
});

test( 'zgeqp3: wide matrix 8x36 (blocked zlaqps path)', function t() {
	var prevMag;
	var RWORK;
	var BLDA;
	var JPVT;
	var WORK;
	var info;
	var perm;
	var TAU;
	var mag;
	var Av;
	var re;
	var im;
	var M;
	var N;
	var A;
	var i;
	var j;

	BLDA = 40;
	M = 8;
	N = 36;
	A = new Complex128Array( BLDA * N );
	Av = reinterpret( A, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Av[ 2 * ( i + j * BLDA ) ] = ( ( ( i + 1 ) * ( j + 1 ) + 3 ) % 7 ) - 3.0;
			Av[ 2 * ( i + j * BLDA ) + 1 ] = ( ( ( i + 1 ) + ( j + 1 ) ) % 5 ) - 2.0;
		}
	}
	JPVT = new Int32Array( N );
	TAU = new Complex128Array( M );
	WORK = new Complex128Array( 10000 );
	RWORK = new Float64Array( 2 * BLDA );
	info = zgeqp3( M, N, A, 1, BLDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, 10000, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	prevMag = Infinity;
	for ( i = 0; i < M; i++ ) {
		re = Av[ 2 * ( i + i * BLDA ) ];
		im = Av[ 2 * ( i + i * BLDA ) + 1 ];
		mag = Math.sqrt( re * re + im * im );
		assert.ok( mag <= prevMag + 1e-10, 'R diagonal magnitude decreasing at ' + i + ': ' + mag + ' <= ' + prevMag ); // eslint-disable-line max-len
		prevMag = mag;
	}
	perm = toArray( JPVT ).sort( function cmp( a, b ) { return a - b; } );
	for ( i = 0; i < N; i++ ) {
		assert.equal( perm[ i ], i + 1, 'JPVT is valid permutation at ' + i );
	}
});
