/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zunmtr from './../lib/zunmtr.js';


// TESTS //

test( 'zunmtr is a function', function t() {
	assert.strictEqual( typeof zunmtr, 'function', 'is a function' );
});

test( 'zunmtr has expected arity', function t() {
	assert.strictEqual( zunmtr.length, 14, 'has expected arity' );
});

test( 'zunmtr throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zunmtr( 'invalid', 'upper', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, TypeError );
});

test( 'zunmtr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zunmtr( 'left', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, TypeError );
});

test( 'zunmtr throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zunmtr( 'left', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, TypeError );
});

test( 'zunmtr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zunmtr( 'left', 'upper', 'no-transpose', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});

test( 'zunmtr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zunmtr( 'left', 'upper', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
