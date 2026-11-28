/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zunmbr from './../lib/zunmbr.js';
import ndarray from './../lib/ndarray.js';
import { computeOptimalWorkSize } from './../lib/base.js';


// TESTS //

test( 'zunmbr is a function', function t() {
	assert.strictEqual( typeof zunmbr, 'function', 'is a function' );
});

test( 'zunmbr has expected arity', function t() {
	assert.strictEqual( zunmbr.length, 14, 'has expected arity' );
});

test( 'zunmbr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zunmbr( 'invalid', 2, 'left', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zunmbr throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zunmbr( 'row-major', 2, 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zunmbr throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zunmbr( 'row-major', 2, 'left', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zunmbr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zunmbr( 'row-major', 'apply-P', 'left', 'no-transpose', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zunmbr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zunmbr( 'row-major', 'apply-P', 'left', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zunmbr throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zunmbr( 'row-major', 'apply-P', 'left', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zunmbr allocates enough workspace for side=right when WORK is null (ticket 0074)', function t() {
	var expected;
	var actual;
	var TAU;
	var ev;
	var av;
	var A;
	var C;
	var i;

	// vect='apply-Q', side='right': NQ = N = 3, the workspace needs M = 5 elements (not N):
	A = new Complex128Array( [ 1.0, 0.0, 0.3, 0.1, -0.2, 0.4, 0.0, 0.0, 1.0, 0.0, 0.5, -0.3, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
	TAU = new Complex128Array( [ 1.2, 0.1, 0.7, -0.2, 0.0, 0.0 ] );
	C = new Float64Array( 30 );
	for ( i = 0; i < 30; i++ ) {
		C[ i ] = ( ( i * 7 ) % 11 ) - 5.0;
	}
	expected = new Complex128Array( C );
	ndarray( 'apply-Q', 'right', 'no-transpose', 5, 3, 3, A, 1, 3, 0, TAU, 1, 0, expected, 1, 5, 0, new Complex128Array( 2000 ), 1, 0 );
	actual = new Complex128Array( C );
	zunmbr( 'column-major', 'apply-Q', 'right', 'no-transpose', 5, 3, 3, A, 3, TAU, 1, actual, 5, null );
	ev = reinterpret( expected, 0 );
	av = reinterpret( actual, 0 );
	for ( i = 0; i < 30; i++ ) {
		assert.ok( !Number.isNaN( ev[ i ] ), 'expected is finite' );
		assert.strictEqual( av[ i ], ev[ i ], 'C[' + i + ']' );
	}
});

test( 'zunmbr uses min(NQ,K) as the TAU length for a negative stride (ticket 0068)', function t() {
	var expected;
	var actual;
	var TAU;
	var ev;
	var av;
	var A;
	var C;
	var i;

	// vect='apply-P', side='left', M=3, N=5, K=2: TAU has min(3,2) = 2 elements:
	A = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.4, -0.1, 1.0, 0.0, -0.6, 0.2, 0.2, 0.3 ] );
	TAU = new Complex128Array( [ 0.9, 0.2, 1.3, -0.4 ] );
	C = new Float64Array( 30 );
	for ( i = 0; i < 30; i++ ) {
		C[ i ] = ( ( i * 5 ) % 13 ) - 6.0;
	}
	expected = new Complex128Array( C );
	ndarray( 'apply-P', 'left', 'no-transpose', 3, 5, 2, A, 1, 2, 0, TAU, -1, 1, expected, 1, 3, 0, new Complex128Array( 2000 ), 1, 0 );
	actual = new Complex128Array( C );
	zunmbr( 'column-major', 'apply-P', 'left', 'no-transpose', 3, 5, 2, A, 2, TAU, -1, actual, 3, null );
	ev = reinterpret( expected, 0 );
	av = reinterpret( actual, 0 );
	for ( i = 0; i < 30; i++ ) {
		assert.ok( !Number.isNaN( ev[ i ] ), 'expected is finite' );
		assert.strictEqual( av[ i ], ev[ i ], 'C[' + i + ']' );
	}
});

test( 'zunmbr: computeOptimalWorkSize returns the reference LWKOPT (NB = ILAENV( 1, ZUNMQR/ZUNMLQ ) = 32)', function t() {
	assert.strictEqual( computeOptimalWorkSize( 'apply-Q', 'left', 'conjugate-transpose', 5, 3 ), 96, 'apply-Q, left, conjugate-transpose, 5, 3' );
	assert.strictEqual( computeOptimalWorkSize( 'apply-Q', 'right', 'no-transpose', 5, 3 ), 160, 'apply-Q, right, no-transpose, 5, 3' );
	assert.strictEqual( computeOptimalWorkSize( 'apply-P', 'left', 'no-transpose', 5, 3 ), 96, 'apply-P, left, no-transpose, 5, 3' );
	assert.strictEqual( computeOptimalWorkSize( 'apply-P', 'right', 'conjugate-transpose', 5, 3 ), 160, 'apply-P, right, conjugate-transpose, 5, 3' );
	assert.strictEqual( computeOptimalWorkSize( 'apply-Q', 'left', 'conjugate-transpose', 0, 3 ), 1, 'apply-Q, left, conjugate-transpose, 0, 3' );
	assert.strictEqual( computeOptimalWorkSize( 'apply-P', 'right', 'no-transpose', 3, 0 ), 1, 'apply-P, right, no-transpose, 3, 0' );
});
