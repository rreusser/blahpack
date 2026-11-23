/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqr2 from './../lib/dlaqr2.js';
import _6x6_with_deflation from './fixtures/6x6_with_deflation.json' with { type: 'json' };


// TESTS //

test( 'dlaqr2 is a function', function t() {
	assert.strictEqual( typeof dlaqr2, 'function', 'is a function' );
});

test( 'dlaqr2 has expected arity', function t() {
	assert.strictEqual( dlaqr2.length, 28, 'has expected arity' );
});

test( 'dlaqr2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const ns = new Int32Array( 1 );
		const nd = new Int32Array( 1 );
		dlaqr2( 'column-major', 2, 2, -1, 2, 2, 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, ns, nd, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

// FUNCTIONS //

/**
* Returns an N-by-N upper Hessenberg matrix (column-major) with pseudo-random entries.
*
* @private
* @param {PositiveInteger} N - order
* @returns {Float64Array} matrix
*/
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
* Calls the dlaqr2 wrapper (column-major, full window) and returns the outputs.
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
	dlaqr2( 'column-major', true, true, N, 1, N, nw, H, N, 1, N, Z, N, ns, nd, SR, 1, SI, 1, new Float64Array( N * N ), N, N, new Float64Array( N * N ), N, N, new Float64Array( N * N ), N, WORK ); // eslint-disable-line max-len
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


// TESTS //

test( 'dlaqr2 allocates enough workspace when WORK is null (reflect-back path needs 2*JW)', function t() {
	const tc = _6x6_with_deflation;
	const H0 = new Float64Array( [ 10.0, 2.0, 0.0, 0.0, 0.0, 0.0, 1.0, 8.0, 1.5, 0.0, 0.0, 0.0, 0.5, 0.8, 6.0, 1.0, 0.0, 0.0, 0.1, 0.2, 0.7, 4.0, 1e-14, 0.0, 0.2, 0.1, 0.3, 0.9, 3.0, 1e-15, 0.3, 0.4, 0.2, 0.1, 0.6, 1.0 ] ); // eslint-disable-line max-len
	const expected = run( H0, 6, 3, new Float64Array( 1000 ) );
	const actual = run( H0, 6, 3, null );
	assertSame( actual, expected, 6 );

	// NS > 1 with a deflation (NS < JW) and S != 0 takes the DLARFG/DLARF/DGEHRD path (dlaqr2.f:600-622), which uses WORK( JW+1: ):
	assert.strictEqual( actual.ns, tc.ns, 'ns' );
	assert.strictEqual( actual.nd, tc.nd, 'nd' );
});

test( 'dlaqr2 allocates enough workspace when WORK is null (blocked dgehrd/dormhr for a large window)', function t() {
	const N = 50;
	const nw = 40;
	const H0 = hessenberg( N );
	const expected = run( H0, N, nw, new Float64Array( 10 * N * N ) );
	const actual = run( H0, N, nw, null );

	// The window must be wide enough (NS > 33) for DGEHRD/DORMQR to use their blocked code:
	assert.ok( expected.ns > 33, 'ns > 33 (got ' + expected.ns + ')' );
	assertSame( actual, expected, N );
});
