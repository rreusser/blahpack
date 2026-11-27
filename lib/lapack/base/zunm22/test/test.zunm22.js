/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zunm22 from './../lib/zunm22.js';
import ndarray from './../lib/ndarray.js';


// TESTS //

test( 'zunm22 is a function', function t() {
	assert.strictEqual( typeof zunm22, 'function', 'is a function' );
});

test( 'zunm22 has expected arity', function t() {
	assert.strictEqual( zunm22.length, 12, 'has expected arity' );
});

test( 'zunm22 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zunm22( 'invalid', 'left', 'no-transpose', 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zunm22 throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zunm22( 'row-major', 'invalid', 'no-transpose', 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zunm22 throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zunm22( 'row-major', 'left', 'invalid', 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zunm22 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zunm22( 'row-major', 'left', 'no-transpose', -1, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zunm22 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zunm22( 'row-major', 'left', 'no-transpose', 2, -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zunm22 throws RangeError for negative n2', function t() {
	assert.throws( function throws() {
		zunm22( 'column-major', 'left', 'no-transpose', 2, 2, 3, -1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'zunm22 allocates at least NQ workspace elements when WORK is null and the other dimension is zero (ticket 0074)', function t() {
	var info;
	var Q;
	var C;

	// side='left', M=5, N=0: M*N = 0, but the reference requires LWORK >= NQ = M = 5:
	Q = new Complex128Array( 25 );
	C = new Complex128Array( 5 );
	info = zunm22( 'column-major', 'left', 'no-transpose', 5, 0, 3, 2, Q, 5, C, 5, null );
	assert.strictEqual( info, ndarray( 'left', 'no-transpose', 5, 0, 3, 2, Q, 1, 5, 0, C, 1, 5, 0, new Complex128Array( 5 ), 1, 0 ), 'returns expected value' );
	assert.strictEqual( info, 0, 'returns expected value' );

	// side='right', M=0, N=5: LWORK >= NQ = N = 5:
	info = zunm22( 'row-major', 'right', 'conjugate-transpose', 0, 5, 2, 3, Q, 5, C, 5, null );
	assert.strictEqual( info, ndarray( 'right', 'conjugate-transpose', 0, 5, 2, 3, Q, 5, 1, 0, C, 5, 1, 0, new Complex128Array( 5 ), 1, 0 ), 'returns expected value' );
	assert.strictEqual( info, 0, 'returns expected value' );
});
