/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zunmlq from './../lib/zunmlq.js';


// TESTS //

test( 'zunmlq is a function', function t() {
	assert.strictEqual( typeof zunmlq, 'function', 'is a function' );
});

test( 'zunmlq has expected arity', function t() {
	assert.strictEqual( zunmlq.length, 13, 'has expected arity' );
});

test( 'zunmlq throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zunmlq( 'invalid', 'left', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zunmlq throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zunmlq( 'row-major', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zunmlq throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zunmlq( 'row-major', 'left', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zunmlq throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zunmlq( 'row-major', 'left', 'no-transpose', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zunmlq throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zunmlq( 'row-major', 'left', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zunmlq throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zunmlq( 'row-major', 'left', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zunmlq throws RangeError for an undersized caller-provided WORK', function t() {
	// side='left' (M=2, N=3, K=1): needs N*nb + (nb+1)*nb = 3*1 + 2*1 = 5 complex elements...
	assert.throws( function throws() {
		zunmlq( 'column-major', 'left', 'no-transpose', 2, 3, 1, new Complex128Array( 2 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 6 ), 2, new Complex128Array( 4 ) );
	}, RangeError );

	// side='right' (M=2, N=3, K=1): needs M*nb + (nb+1)*nb = 2*1 + 2*1 = 4 complex elements...
	assert.throws( function throws() {
		zunmlq( 'column-major', 'right', 'no-transpose', 2, 3, 1, new Complex128Array( 3 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 6 ), 2, new Complex128Array( 3 ) );
	}, RangeError );
});

test( 'zunmlq accepts a caller-provided WORK of exactly the documented size', function t() {
	// With TAU = 0 the reflector is the identity, so C is unchanged...
	const C = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	let info = zunmlq( 'column-major', 'left', 'no-transpose', 2, 3, 1, new Complex128Array( 2 ), 1, new Complex128Array( 1 ), 1, C, 2, new Complex128Array( 5 ) );
	assert.strictEqual( info, 0, 'left info' );
	info = zunmlq( 'column-major', 'right', 'conjugate-transpose', 2, 3, 1, new Complex128Array( 3 ), 1, new Complex128Array( 1 ), 1, C, 2, new Complex128Array( 4 ) );
	assert.strictEqual( info, 0, 'right info' );
	assert.deepStrictEqual( Array.from( new Float64Array( C.buffer ) ), [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ], 'C' );
});
