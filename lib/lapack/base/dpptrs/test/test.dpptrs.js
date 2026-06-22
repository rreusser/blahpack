/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpptrs from './../lib/dpptrs.js';


// TESTS //

test( 'dpptrs is a function', function t() {
	assert.strictEqual( typeof dpptrs, 'function', 'is a function' );
});

test( 'dpptrs has expected arity', function t() {
	assert.strictEqual( dpptrs.length, 7, 'has expected arity' );
});

test( 'dpptrs throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dpptrs( 'invalid', 'upper', new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dpptrs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dpptrs( 'row-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dpptrs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dpptrs( 'row-major', 'upper', -1, 2, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dpptrs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dpptrs( 'row-major', 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});
