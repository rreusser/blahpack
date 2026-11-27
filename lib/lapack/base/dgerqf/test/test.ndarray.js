/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgerqf from './../lib/ndarray.js';

// FIXTURES //

import _3x4 from './fixtures/3x4.json' with { type: 'json' };
import _4x3 from './fixtures/4x3.json' with { type: 'json' };
import _3x3 from './fixtures/3x3.json' with { type: 'json' };
import _1x1 from './fixtures/1x1.json' with { type: 'json' };
import _2x5 from './fixtures/2x5.json' with { type: 'json' };

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
* ExtractMatrix.
*
* @private
* @param {*} A - A
* @param {*} LDA - LDA
* @param {*} M - M
* @param {*} N - N
* @returns {*} result
*/
function extractMatrix( A, LDA, M, N ) {
	const out = [];
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( A[ j * LDA + i ] );
		}
	}
	return out;
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

test( 'dgerqf: 3x4 (M < N)', function t() {

	const tc = _3x4;
	const A = new Float64Array( 6 * 4 );
	A[ 0 * 6 + 0 ] = 2.0;
	A[ 1 * 6 + 0 ] = 1.0;
	A[ 2 * 6 + 0 ] = 3.0;
	A[ 3 * 6 + 0 ] = 1.0;
	A[ 0 * 6 + 1 ] = 1.0;
	A[ 1 * 6 + 1 ] = 4.0;
	A[ 2 * 6 + 1 ] = 2.0;
	A[ 3 * 6 + 1 ] = 3.0;
	A[ 0 * 6 + 2 ] = 3.0;
	A[ 1 * 6 + 2 ] = 2.0;
	A[ 2 * 6 + 2 ] = 5.0;
	A[ 3 * 6 + 2 ] = 2.0;
	const TAU = new Float64Array( 3 );
	const WORK = new Float64Array( 600 );
	const info = dgerqf( 3, 4, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( extractMatrix( A, 6, 3, 4 ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-14, 'TAU' );
});

test( 'dgerqf: 4x3 (M > N)', function t() {

	const tc = _4x3;
	const A = new Float64Array( 6 * 3 );
	A[ 0 * 6 + 0 ] = 2.0;
	A[ 1 * 6 + 0 ] = 1.0;
	A[ 2 * 6 + 0 ] = 3.0;
	A[ 0 * 6 + 1 ] = 1.0;
	A[ 1 * 6 + 1 ] = 4.0;
	A[ 2 * 6 + 1 ] = 2.0;
	A[ 0 * 6 + 2 ] = 3.0;
	A[ 1 * 6 + 2 ] = 2.0;
	A[ 2 * 6 + 2 ] = 5.0;
	A[ 0 * 6 + 3 ] = 1.0;
	A[ 1 * 6 + 3 ] = 3.0;
	A[ 2 * 6 + 3 ] = 1.0;
	const TAU = new Float64Array( 3 );
	const WORK = new Float64Array( 600 );
	const info = dgerqf( 4, 3, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( extractMatrix( A, 6, 4, 3 ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-14, 'TAU' );
});

test( 'dgerqf: 3x3 (square)', function t() {

	const tc = _3x3;
	const A = new Float64Array( 6 * 3 );
	A[ 0 * 6 + 0 ] = 4.0;
	A[ 1 * 6 + 0 ] = 1.0;
	A[ 2 * 6 + 0 ] = 2.0;
	A[ 0 * 6 + 1 ] = 1.0;
	A[ 1 * 6 + 1 ] = 3.0;
	A[ 2 * 6 + 1 ] = 1.0;
	A[ 0 * 6 + 2 ] = 2.0;
	A[ 1 * 6 + 2 ] = 1.0;
	A[ 2 * 6 + 2 ] = 5.0;
	const TAU = new Float64Array( 3 );
	const WORK = new Float64Array( 600 );
	const info = dgerqf( 3, 3, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( extractMatrix( A, 6, 3, 3 ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-14, 'TAU' );
});

test( 'dgerqf: 1x1', function t() {

	const tc = _1x1;
	const A = new Float64Array( 6 );
	A[ 0 ] = 7.0;
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( 600 );
	const info = dgerqf( 1, 1, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( extractMatrix( A, 6, 1, 1 ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-14, 'TAU' );
});

test( 'dgerqf: M=0 (quick return)', function t() {

	const A = new Float64Array( 1 );
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dgerqf( 0, 3, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dgerqf: N=0 (quick return)', function t() {

	const A = new Float64Array( 1 );
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dgerqf( 3, 0, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dgerqf: 2x5 (wide)', function t() {

	const tc = _2x5;
	const A = new Float64Array( 6 * 5 );
	A[ 0 * 6 + 0 ] = 1.0;
	A[ 1 * 6 + 0 ] = 2.0;
	A[ 2 * 6 + 0 ] = 3.0;
	A[ 3 * 6 + 0 ] = 4.0;
	A[ 4 * 6 + 0 ] = 5.0;
	A[ 0 * 6 + 1 ] = 6.0;
	A[ 1 * 6 + 1 ] = 7.0;
	A[ 2 * 6 + 1 ] = 8.0;
	A[ 3 * 6 + 1 ] = 9.0;
	A[ 4 * 6 + 1 ] = 10.0;
	const TAU = new Float64Array( 2 );
	const WORK = new Float64Array( 600 );
	const info = dgerqf( 2, 5, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( extractMatrix( A, 6, 2, 5 ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-14, 'TAU' );
});

test( 'dgerqf: 40x40 (blocked path, verify R is upper triangular)', function t() { // eslint-disable-line max-len
	let tauNonZero, i, j;

	const N = 40;
	const A = new Float64Array( N * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			A[ j * N + i ] = ( ( i + 1 ) * 7 + ( j + 1 ) * 13 ) % 97 / 97.0;
		}
	}
	const TAU = new Float64Array( N );
	const WORK = new Float64Array( N * 64 );
	const info = dgerqf( N, N, A, 1, N, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	tauNonZero = 0;
	for ( i = 0; i < N; i++ ) {
		if ( TAU[ i ] !== 0.0 ) {
			tauNonZero += 1;
		}
	}
	assert.ok( tauNonZero > 0, 'TAU should have nonzero entries' );
});

test( 'dgerqf: 40x35 (M > N, blocked path)', function t() {
	let tauNonZero, i, j;

	const M = 40;
	const N = 35;
	const A = new Float64Array( M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ j * M + i ] = ( ( i + 1 ) * 11 + ( j + 1 ) * 7 ) % 101 / 101.0;
		}
	}
	const TAU = new Float64Array( N );
	const WORK = new Float64Array( M * 64 );
	const info = dgerqf( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	tauNonZero = 0;
	for ( i = 0; i < N; i++ ) {
		if ( TAU[ i ] !== 0.0 ) {
			tauNonZero += 1;
		}
	}
	assert.ok( tauNonZero > 0, 'TAU should have nonzero entries' );
});


// WORKSPACE ADAPTATION (ticket 0100) //

/**
* Factors a deterministic 140-by-150 matrix with a WORK of `lwork` elements (from offset 3) and returns the factored A and TAU (as real views).
*
* @private
* @param {NonNegativeInteger} lwork - workspace length
* @returns {Object} factored `A` and `TAU`
*/
function factorWithWork( lwork ) {
	const M = 140;
	const N = 150;
	const A = new Float64Array( M * N );
	let i;
	for ( i = 0; i < M * N; i++ ) {
		A[ i ] = Math.sin( ( 0.37 * i ) + 1.0 ) + ( ( i % ( M + 1 ) === 0 ) ? 4.0 : 0.0 );
	}
	const TAU = new Float64Array( 140 );
	const WORK = new Float64Array( lwork + 3 );
	const info = dgerqf( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 3 );
	assert.strictEqual( info, 0 );
	return {
		'A': A,
		'TAU': TAU
	};
}

/**
* Asserts that two arrays agree to a normwise relative tolerance.
*
* @private
* @param {Collection} actual - actual values
* @param {Collection} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - message
*/
function assertNormClose( actual, expected, tol, msg ) {
	let scale = 0.0;
	let diff = 0.0;
	let i;
	assert.strictEqual( actual.length, expected.length, msg + ' length' );
	for ( i = 0; i < expected.length; i++ ) {
		scale = Math.max( scale, Math.abs( expected[ i ] ) );
		diff = Math.max( diff, Math.abs( actual[ i ] - expected[ i ] ) );
	}
	assert.ok( diff <= tol * scale, msg + ': max difference ' + diff + ' exceeds ' + tol + ' * ' + scale );
}

test( 'dgerqf: WORK of the reference minimum max(1,M) (unblocked fallback) matches the optimum M*NB, 140x150', function t() {
	const opt = factorWithWork( 140 * 32 );
	const out = factorWithWork( 140 );
	assertNormClose( out.A, opt.A, 1e-12, 'A' );
	assertNormClose( out.TAU, opt.TAU, 1e-12, 'TAU' );
});

test( 'dgerqf: WORK of 8*M (shrunk block size NB = 8) matches the optimum M*NB, 140x150', function t() {
	const opt = factorWithWork( 140 * 32 );
	const out = factorWithWork( 140 * 8 );
	assertNormClose( out.A, opt.A, 1e-12, 'A' );
	assertNormClose( out.TAU, opt.TAU, 1e-12, 'TAU' );
});

test( 'dgerqf: throws RangeError when WORK is one element below max(1,M), 140x150', function t() {
	assert.throws( function throws() {
		dgerqf( 140, 150, new Float64Array( 21000 ), 1, 140, 0, new Float64Array( 140 ), 1, 0, new Float64Array( 140 ), 1, 1 );
	}, RangeError );
});


// CROSSOVER (ticket 0049) //

test( 'dgerqf: below the crossover NX = ILAENV(3) = 128 the unblocked code runs at the optimal WORK, leaving WORK past M untouched, 100x110', function t() {
	const M = 100;
	const N = 110;
	const A = new Float64Array( M * N );
	const TAU = new Float64Array( 100 );
	const WORK = new Float64Array( M * 32 );
	let i;
	const Av = A;
	for ( i = 0; i < Av.length; i++ ) {
		Av[ i ] = Math.sin( ( 0.37 * i ) + 1.0 ) + ( ( i % ( 1 * ( M + 1 ) ) === 0 ) ? 4.0 : 0.0 );
	}
	const Wv = WORK;
	for ( i = 0; i < Wv.length; i++ ) {
		Wv[ i ] = NaN;
	}
	const info = dgerqf( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
	for ( i = 0; i < Av.length; i++ ) {
		assert.ok( Number.isFinite( Av[ i ] ), 'A[' + i + '] is finite' );
	}

	// The reference's unblocked dgerq2 uses only WORK(1:M); the blocked path would write T and the update workspace past it:
	for ( i = 1 * M; i < Wv.length; i++ ) {
		assert.ok( Number.isNaN( Wv[ i ] ), 'WORK[' + i + '] untouched (NaN)' );
	}
});
