/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlaqps from './../lib/zlaqps.js';


// TESTS //

test( 'zlaqps is a function', function t() {
	assert.strictEqual( typeof zlaqps, 'function', 'is a function' );
});

test( 'zlaqps has expected arity', function t() {
	assert.strictEqual( zlaqps.length, 20, 'has expected arity' );
});

test( 'zlaqps throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		zlaqps( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, kb, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlaqps throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		zlaqps( 'row-major', -1, new Float64Array( 4 ), 2, 2, kb, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlaqps throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		zlaqps( 'row-major', new Float64Array( 4 ), -1, 2, 2, kb, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlaqps: M=0 returns kb=0 (column-major)', function t() {
	const kb = new Int32Array( [ 7 ] );
	const JPVT = new Int32Array( [ 1, 2, 3 ] );
	zlaqps( 'column-major', 0, 3, 0, 2, kb, new Complex128Array( 3 ), 1, JPVT, 1, new Complex128Array( 3 ), 1, new Float64Array( 3 ), 1, new Float64Array( 3 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 6 ), 3 );
	assert.strictEqual( kb[ 0 ], 0, 'kb' );
	assert.deepStrictEqual( Array.from( JPVT ), [ 1, 2, 3 ], 'jpvt' );
});

test( 'zlaqps: LDF is validated against the dimensions of F (N-by-nb)', function t() {
	const kb = new Int32Array( 1 );

	// Column-major: LDF >= max(1,N) = 2 suffices even though M = 4.
	zlaqps( 'column-major', 4, 2, 0, 2, kb, new Complex128Array( 8 ), 4, new Int32Array( [ 1, 2 ] ), 1, new Complex128Array( 2 ), 1, new Float64Array( [ 1, 1 ] ), 1, new Float64Array( [ 1, 1 ] ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 2 );
	assert.strictEqual( kb[ 0 ], 2, 'kb' );
	assert.throws( function throws() {
		zlaqps( 'column-major', 4, 2, 0, 2, kb, new Complex128Array( 8 ), 4, new Int32Array( 2 ), 1, new Complex128Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 1 );
	}, RangeError );

	// Row-major: LDF >= max(1,nb) = 2 suffices even though N = 3.
	zlaqps( 'row-major', 4, 3, 0, 2, kb, new Complex128Array( 12 ), 3, new Int32Array( [ 1, 2, 3 ] ), 1, new Complex128Array( 3 ), 1, new Float64Array( [ 1, 1, 1 ] ), 1, new Float64Array( [ 1, 1, 1 ] ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 6 ), 2 );
	assert.strictEqual( kb[ 0 ], 2, 'kb' );
	assert.throws( function throws() {
		zlaqps( 'row-major', 4, 3, 0, 2, kb, new Complex128Array( 12 ), 3, new Int32Array( 3 ), 1, new Complex128Array( 3 ), 1, new Float64Array( 3 ), 1, new Float64Array( 3 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 6 ), 1 );
	}, RangeError );
});
