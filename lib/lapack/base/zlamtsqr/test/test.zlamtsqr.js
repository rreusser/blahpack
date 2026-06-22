
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlamtsqr from './../lib/zlamtsqr.js';


// TESTS //

test( 'zlamtsqr is a function', function t() {
	assert.strictEqual( typeof zlamtsqr, 'function', 'is a function' );
});

test( 'zlamtsqr has expected arity', function t() {
	assert.strictEqual( zlamtsqr.length, 17, 'has expected arity' );
});

test( 'zlamtsqr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlamtsqr( 'invalid', 'left', 'no-transpose', 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, TypeError );
});

test( 'zlamtsqr throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zlamtsqr( 'row-major', 'invalid', 'no-transpose', 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, TypeError );
});

test( 'zlamtsqr throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zlamtsqr( 'row-major', 'left', 'invalid', 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, TypeError );
});

test( 'zlamtsqr rejects plain "transpose" (Q is unitary)', function t() {
	assert.throws( function throws() {
		zlamtsqr( 'column-major', 'left', 'transpose', 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, TypeError );
});

test( 'zlamtsqr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlamtsqr( 'row-major', 'left', 'no-transpose', -1, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, RangeError );
});

test( 'zlamtsqr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlamtsqr( 'row-major', 'left', 'no-transpose', 2, -1, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, RangeError );
});

test( 'zlamtsqr throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zlamtsqr( 'row-major', 'left', 'no-transpose', 2, 2, -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, RangeError );
});
