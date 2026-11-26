
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import dtgsen from './../lib/dtgsen.js';


// TESTS //

test( 'dtgsen is a function', function t() {
	assert.strictEqual( typeof dtgsen, 'function', 'is a function' );
});

test( 'dtgsen has expected arity', function t() {
	assert.strictEqual( dtgsen.length, 28, 'has expected arity' );
});

test( 'dtgsen throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtgsen( 'invalid', 2, 2, 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtgsen throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtgsen( 'row-major', 2, 2, 2, new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});


/**
* Runs dtgsen on a 14-by-14 upper triangular pair selecting every other eigenvalue (M = 7, so 2M(N-M) = 98 and 4M(N-M) = 196 exceed 4N+16 = 72).
*
* @private
* @param {integer} ijob - job selector
* @param {(Float64Array|null)} WORK - workspace
* @param {(Int32Array|null)} IWORK - integer workspace
* @returns {Object} results
*/
function run( ijob, WORK, IWORK ) {
	const N = 14;
	const A = new Float64Array( N * N );
	const B = new Float64Array( N * N );
	const Q = new Float64Array( N * N );
	const Z = new Float64Array( N * N );
	const SELECT = new Uint8Array( N );
	const ALPHAR = new Float64Array( N );
	const ALPHAI = new Float64Array( N );
	const BETA = new Float64Array( N );
	const DIF = new Float64Array( 2 );
	const pl = new Float64Array( 1 );
	const pr = new Float64Array( 1 );
	const M = new Int32Array( 1 );
	let info;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			A[ i + ( j * N ) ] = ( i === j ) ? j + 1 : 1.0 / ( i + j + 2 );
			B[ i + ( j * N ) ] = ( i === j ) ? 2.0 : 0.5 / ( i + j + 1 );
		}
		Q[ j + ( j * N ) ] = 1.0;
		Z[ j + ( j * N ) ] = 1.0;
		SELECT[ j ] = ( j % 2 === 1 ) ? 1 : 0;
	}
	info = dtgsen( 'column-major', ijob, true, true, SELECT, 1, N, A, N, B, N, ALPHAR, 1, ALPHAI, 1, BETA, 1, Q, N, Z, N, M, pl, pr, DIF, 1, WORK, IWORK );
	return {
		'info': info,
		'M': M[ 0 ],
		'A': A,
		'Q': Q,
		'DIF': DIF,
		'pl': pl[ 0 ]
	};
}

test( 'dtgsen: WORK = IWORK = null allocates the reference LWMIN/LIWMIN including the M(N-M) terms (ijob = 1..5)', function t() {
	let expected;
	let actual;
	let ijob;
	for ( ijob = 0; ijob <= 5; ijob++ ) {
		expected = run( ijob, new Float64Array( 4 * 7 * 7 ), new Int32Array( 2 * 7 * 7 ) );
		actual = run( ijob, null, null );
		assert.strictEqual( expected.info, 0, 'explicit info, ijob=' + ijob );
		assert.strictEqual( actual.M, 7, 'M' );
		assert.deepStrictEqual( actual, expected, 'matches an ample explicit workspace, ijob=' + ijob );
	}
});

test( 'dtgsen: an explicit WORK or IWORK below the reference minimum throws a RangeError (where the reference returns INFO -22, -24; CONVENTIONS W3, D5d)', function t() {
	assert.throws( () => run( 5, new Float64Array( 195 ), new Int32Array( 98 ) ), /WORK array must have at least 196 elements/, 'WORK' );
	assert.throws( () => run( 5, new Float64Array( 196 ), new Int32Array( 97 ) ), /IWORK array must have at least 98 elements/, 'IWORK' );
	// ijob = 1: LWMIN is 2M(N-M) = 98, but the DTGSYL call then gets LWORK - 98 and rejects less than 1, so the minimum is 99:
	assert.throws( () => run( 1, new Float64Array( 98 ), new Int32Array( 20 ) ), /WORK array must have at least 99 elements/, 'WORK' );
	assert.throws( () => run( 1, new Float64Array( 99 ), new Int32Array( 19 ) ), /IWORK array must have at least 20 elements/, 'IWORK' );
	assert.strictEqual( run( 5, new Float64Array( 196 ), new Int32Array( 98 ) ).info, 0, 'the minimum suffices' );
	assert.strictEqual( run( 1, new Float64Array( 99 ), new Int32Array( 20 ) ).info, 0, 'the minimum suffices' );
	assert.strictEqual( run( 0, new Float64Array( 72 ), new Int32Array( 1 ) ).info, 0, 'the minimum suffices' );
});
