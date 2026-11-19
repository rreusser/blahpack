
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztrevc from './../lib/ztrevc.js';


// TESTS //

test( 'ztrevc is a function', function t() {
	assert.strictEqual( typeof ztrevc, 'function', 'is a function' );
});

test( 'ztrevc has expected arity', function t() {
	assert.strictEqual( ztrevc.length, 16, 'has expected arity' );
});

test( 'ztrevc throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		ztrevc( 'invalid', 'left', 'no-transpose', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, m, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'ztrevc throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		ztrevc( 'row-major', 'invalid', 'no-transpose', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, m, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'ztrevc throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		ztrevc( 'row-major', 'left', 'all', new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, m, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

