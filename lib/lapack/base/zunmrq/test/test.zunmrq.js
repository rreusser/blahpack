/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zunmrq from './../lib/zunmrq.js';


// TESTS //

test( 'zunmrq is a function', function t() {
	assert.strictEqual( typeof zunmrq, 'function', 'is a function' );
});

test( 'zunmrq has expected arity', function t() {
	assert.strictEqual( zunmrq.length, 13, 'has expected arity' );
});

test( 'zunmrq throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zunmrq( 'invalid', 'left', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zunmrq throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zunmrq( 'row-major', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zunmrq throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zunmrq( 'row-major', 'left', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zunmrq throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zunmrq( 'row-major', 'left', 'no-transpose', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zunmrq throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zunmrq( 'row-major', 'left', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zunmrq throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zunmrq( 'row-major', 'left', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zunmrq throws RangeError for an undersized caller-provided WORK', function t() {
	// side='left' (M=2, N=3, K=1): needs N*32 + 33*32 = 3*32 + 1056 = 1152 complex elements...
	assert.throws( function throws() {
		zunmrq( 'column-major', 'left', 'no-transpose', 2, 3, 1, new Complex128Array( 2 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 6 ), 2, new Complex128Array( 1151 ) );
	}, RangeError );

	// side='right' (M=2, N=3, K=1): needs M*32 + 33*32 = 2*32 + 1056 = 1120 complex elements...
	assert.throws( function throws() {
		zunmrq( 'column-major', 'right', 'no-transpose', 2, 3, 1, new Complex128Array( 3 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 6 ), 2, new Complex128Array( 1119 ) );
	}, RangeError );
});

test( 'zunmrq accepts a caller-provided WORK of exactly the documented size', function t() {
	// With TAU = 0 the reflector is the identity, so C is unchanged...
	const C = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	let info = zunmrq( 'column-major', 'left', 'no-transpose', 2, 3, 1, new Complex128Array( 2 ), 1, new Complex128Array( 1 ), 1, C, 2, new Complex128Array( 1152 ) );
	assert.strictEqual( info, 0, 'left info' );
	info = zunmrq( 'column-major', 'right', 'conjugate-transpose', 2, 3, 1, new Complex128Array( 3 ), 1, new Complex128Array( 1 ), 1, C, 2, new Complex128Array( 1120 ) );
	assert.strictEqual( info, 0, 'right info' );
	assert.deepStrictEqual( Array.from( new Float64Array( C.buffer ) ), [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ], 'C' );
});
