/* eslint-disable no-restricted-syntax, max-len, max-statements-per-line, camelcase, vars-on-top */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgerqf from './../lib/ndarray.js';


// FIXTURES //

import fix3x4 from './fixtures/3x4.json' with { type: 'json' };
import fix4x3 from './fixtures/4x3.json' with { type: 'json' };
import fix3x3 from './fixtures/3x3.json' with { type: 'json' };
import fix1x1 from './fixtures/1x1.json' with { type: 'json' };
import fixMZero from './fixtures/m_zero.json' with { type: 'json' };
import fixNZero from './fixtures/n_zero.json' with { type: 'json' };
import fix2x5 from './fixtures/2x5.json' with { type: 'json' };


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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
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
* Runs zgerqf on a packed complex column-major matrix.
*
* @private
* @param {number} M - rows
* @param {number} N - cols
* @param {Array} aFlat - interleaved re/im column-major entries (length 2*M*N)
* @returns {Object} result with A, TAU, info
*/
function runZgerqf( M, N, aFlat ) {
	let i;

	const WORK = new Complex128Array( Math.max( 1, M * 32 ) );
	const TAU = new Complex128Array( Math.max( 1, Math.min( M, N ) ) );
	const A = new Complex128Array( Math.max( 1, M * N ) );
	const Av = reinterpret( A, 0 );

	// Copy input into A
	for ( i = 0; i < aFlat.length; i++ ) {
		Av[ i ] = aFlat[ i ];
	}

	const info = zgerqf( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );

	return {
		'A': reinterpret( A, 0 ).subarray( 0, 2 * M * N ),
		'TAU': reinterpret( TAU, 0 ).subarray( 0, 2 * Math.min( M, N ) ),
		'info': info
	};
}


// TESTS //

test( 'zgerqf: 3x4 (M < N)', function t() {

	const tc = fix3x4;

	// Column-major interleaved re/im: each column has M=3 complex entries
	const aFlat = [
		2,
		1,
		1,
		0,
		3,
		-1,
		1,
		2,
		4,
		1,
		2,
		0,
		3,
		0,
		2,
		-1,
		5,
		2,
		1,
		1,
		3,
		0,
		2,
		-2
	];
	const res = runZgerqf( 3, 4, aFlat );
	assert.equal( res.info, tc.info );
	assertArrayClose( res.A, tc.a, 1e-14, 'a' );
	assertArrayClose( res.TAU, tc.tau, 1e-14, 'tau' );
});

test( 'zgerqf: 4x3 (M > N)', function t() {

	const tc = fix4x3;

	// Column-major interleaved re/im: each column has M=4 complex entries
	const aFlat = [
		2,
		1,
		1,
		-1,
		3,
		0,
		1,
		2,
		1,
		0,
		4,
		1,
		2,
		-1,
		3,
		0,
		3,
		1,
		2,
		0,
		5,
		-2,
		1,
		1
	];
	const res = runZgerqf( 4, 3, aFlat );
	assert.equal( res.info, tc.info );
	assertArrayClose( res.A, tc.a, 1e-14, 'a' );
	assertArrayClose( res.TAU, tc.tau, 1e-14, 'tau' );
});

test( 'zgerqf: 3x3 (square)', function t() {

	const tc = fix3x3;

	// Column-major interleaved re/im: each column has M=3 complex entries
	const aFlat = [
		4,
		1,
		1,
		0,
		2,
		-1,
		1,
		-1,
		3,
		2,
		1,
		0,
		2,
		0,
		1,
		1,
		5,
		-2
	];
	const res = runZgerqf( 3, 3, aFlat );
	assert.equal( res.info, tc.info );
	assertArrayClose( res.A, tc.a, 1e-14, 'a' );
	assertArrayClose( res.TAU, tc.tau, 1e-14, 'tau' );
});

test( 'zgerqf: 1x1', function t() {

	const tc = fix1x1;
	const aFlat = [ 5, 3 ];
	const res = runZgerqf( 1, 1, aFlat );
	assert.equal( res.info, tc.info );
	assertArrayClose( res.A, tc.a, 1e-14, 'a' );
	assertArrayClose( res.TAU, tc.tau, 1e-14, 'tau' );
});

test( 'zgerqf: M=0 (quick return)', function t() {

	const tc = fixMZero;
	const A = new Complex128Array( 1 );
	const TAU = new Complex128Array( 1 );
	const WORK = new Complex128Array( 1 );
	const info = zgerqf( 0, 3, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zgerqf: N=0 (quick return)', function t() {

	const tc = fixNZero;
	const A = new Complex128Array( 1 );
	const TAU = new Complex128Array( 1 );
	const WORK = new Complex128Array( 1 );
	const info = zgerqf( 3, 0, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zgerqf: 2x5 (wide)', function t() {

	const tc = fix2x5;
	const aFlat = [
		1,
		0,
		6,
		-1,
		2,
		1,
		7,
		0,
		3,
		-1,
		8,
		2,
		4,
		0,
		9,
		-1,
		5,
		1,
		10,
		0
	];
	const res = runZgerqf( 2, 5, aFlat );
	assert.equal( res.info, tc.info );
	assertArrayClose( res.A, tc.a, 1e-14, 'a' );
	assertArrayClose( res.TAU, tc.tau, 1e-14, 'tau' );
});

test( 'zgerqf: 40x40 (blocked path)', function t() {
	let tauNonZero, re, im, i, j;

	const N = 40;
	const aFlat = [];

	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			re = ( ( ( ( i + 1 ) * 7 ) + ( ( j + 1 ) * 13 ) ) % 97 ) / 97.0;
			im = ( ( ( ( i + 1 ) * 3 ) + ( ( j + 1 ) * 11 ) ) % 89 ) / 89.0;
			aFlat.push( re, im );
		}
	}
	const res = runZgerqf( N, N, aFlat );
	assert.equal( res.info, 0 );

	// Verify TAU has nonzero entries
	tauNonZero = 0;
	for ( i = 0; i < res.TAU.length; i += 2 ) {
		if ( res.TAU[ i ] !== 0.0 || res.TAU[ i + 1 ] !== 0.0 ) {
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
	const A = new Complex128Array( M * N );
	let i;
	const av = reinterpret( A, 0 );
	for ( i = 0; i < av.length; i++ ) {
		av[ i ] = Math.sin( ( 0.37 * i ) + 1.0 ) + ( ( i % ( 2 * ( M + 1 ) ) === 0 ) ? 4.0 : 0.0 );
	}
	const TAU = new Complex128Array( 140 );
	const WORK = new Complex128Array( lwork + 3 );
	const info = zgerqf( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 3 );
	assert.strictEqual( info, 0 );
	return {
		'A': reinterpret( A, 0 ),
		'TAU': reinterpret( TAU, 0 )
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

test( 'zgerqf: WORK of the reference minimum max(1,M) (unblocked fallback) matches the optimum M*NB, 140x150', function t() {
	const opt = factorWithWork( 140 * 32 );
	const out = factorWithWork( 140 );
	assertNormClose( out.A, opt.A, 1e-11, 'A' );
	assertNormClose( out.TAU, opt.TAU, 1e-11, 'TAU' );
});

test( 'zgerqf: WORK of 8*M (shrunk block size NB = 8) matches the optimum M*NB, 140x150', function t() {
	const opt = factorWithWork( 140 * 32 );
	const out = factorWithWork( 140 * 8 );
	assertNormClose( out.A, opt.A, 1e-11, 'A' );
	assertNormClose( out.TAU, opt.TAU, 1e-11, 'TAU' );
});

test( 'zgerqf: throws RangeError when WORK is one element below max(1,M), 140x150', function t() {
	assert.throws( function throws() {
		zgerqf( 140, 150, new Complex128Array( 21000 ), 1, 140, 0, new Complex128Array( 140 ), 1, 0, new Complex128Array( 140 ), 1, 1 );
	}, RangeError );
});


// CROSSOVER (ticket 0049) //

test( 'zgerqf: below the crossover NX = ILAENV(3) = 128 the unblocked code runs at the optimal WORK, leaving WORK past M untouched, 100x110', function t() {
	const M = 100;
	const N = 110;
	const A = new Complex128Array( M * N );
	const TAU = new Complex128Array( 100 );
	const WORK = new Complex128Array( M * 32 );
	let i;
	const Av = reinterpret( A, 0 );
	for ( i = 0; i < Av.length; i++ ) {
		Av[ i ] = Math.sin( ( 0.37 * i ) + 1.0 ) + ( ( i % ( 2 * ( M + 1 ) ) === 0 ) ? 4.0 : 0.0 );
	}
	const Wv = reinterpret( WORK, 0 );
	for ( i = 0; i < Wv.length; i++ ) {
		Wv[ i ] = NaN;
	}
	const info = zgerqf( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
	for ( i = 0; i < Av.length; i++ ) {
		assert.ok( Number.isFinite( Av[ i ] ), 'A[' + i + '] is finite' );
	}

	// The reference's unblocked zgerq2 uses only WORK(1:M); the blocked path would write T and the update workspace past it:
	for ( i = 2 * M; i < Wv.length; i++ ) {
		assert.ok( Number.isNaN( Wv[ i ] ), 'WORK[' + i + '] untouched (NaN)' );
	}
});
