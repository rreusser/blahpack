/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqr3 from './../lib/dlaqr3.js';


// TESTS //

test( 'dlaqr3 is a function', function t() {
	assert.strictEqual( typeof dlaqr3, 'function', 'is a function' );
});

test( 'dlaqr3 has expected arity', function t() {
	assert.strictEqual( dlaqr3.length, 28, 'has expected arity' );
});

test( 'dlaqr3 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const ns = new Int32Array( 1 );
		const nd = new Int32Array( 1 );
		dlaqr3( 'column-major', 2, 2, -1, 2, 2, 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, ns, nd, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

// Ticket 0072: like dlaqr2 (shared implementation), WORK = null must cover the
// blocked dgehrd/dormhr the JS uses for a wide window (NS > 33).
function hessenberg( N ) {
	const H = new Float64Array( N * N );
	let seed = 1;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= Math.min( j + 1, N - 1 ); i++ ) {
			seed = ( ( seed * 1103515245 ) + 12345 ) % 2147483648;
			H[ i + ( j * N ) ] = ( seed / 2147483648 ) - 0.5;
		}
	}
	return H;
}

/**
* Calls the dlaqr3 wrapper (column-major, full window) and returns the outputs.
*
* @private
* @param {Float64Array} H0 - input Hessenberg matrix
* @param {PositiveInteger} N - order
* @param {PositiveInteger} nw - deflation window size
* @param {(Float64Array|null)} WORK - workspace
* @returns {Object} outputs
*/
function run( H0, N, nw, WORK ) {
	const H = new Float64Array( H0 );
	const Z = new Float64Array( N * N );
	const SR = new Float64Array( N );
	const SI = new Float64Array( N );
	const ns = new Int32Array( 1 );
	const nd = new Int32Array( 1 );
	let i;
	for ( i = 0; i < N; i++ ) {
		Z[ i + ( i * N ) ] = 1.0;
	}
	dlaqr3( 'column-major', true, true, N, 1, N, nw, H, N, 1, N, Z, N, ns, nd, SR, 1, SI, 1, new Float64Array( N * N ), N, N, new Float64Array( N * N ), N, N, new Float64Array( N * N ), N, WORK ); // eslint-disable-line max-len
	return {
		'ns': ns[ 0 ],
		'nd': nd[ 0 ],
		'H': H,
		'Z': Z,
		'SR': SR,
		'SI': SI
	};
}

/**
* Asserts that two sets of outputs are identical.
*
* @private
* @param {Object} actual - actual outputs
* @param {Object} expected - expected outputs
* @param {PositiveInteger} N - order
*/
function assertSame( actual, expected, N ) {
	let i;
	assert.strictEqual( actual.ns, expected.ns, 'ns' );
	assert.strictEqual( actual.nd, expected.nd, 'nd' );
	for ( i = 0; i < N * N; i++ ) {
		assert.strictEqual( actual.H[ i ], expected.H[ i ], 'H[' + i + ']' );
		assert.strictEqual( actual.Z[ i ], expected.Z[ i ], 'Z[' + i + ']' );
	}
	for ( i = 0; i < N; i++ ) {
		assert.strictEqual( actual.SR[ i ], expected.SR[ i ], 'SR[' + i + ']' );
		assert.strictEqual( actual.SI[ i ], expected.SI[ i ], 'SI[' + i + ']' );
	}
}

test( 'dlaqr3 allocates enough workspace when WORK is null (blocked dgehrd/dormhr for a large window)', function t() {
	const N = 50;
	const nw = 40;
	const H0 = hessenberg( N );
	const expected = run( H0, N, nw, new Float64Array( 10 * N * N ) );
	const actual = run( H0, N, nw, null );

	// The window must be wide enough (NS > 33) for DGEHRD/DORMQR to use their blocked code:
	assert.ok( expected.ns > 33, 'ns > 33 (got ' + expected.ns + ')' );
	assertSame( actual, expected, N );
});
