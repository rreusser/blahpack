/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zpftrs from './../lib/zpftrs.js';


// TESTS //

test( 'zpftrs is a function', function t() {
	assert.strictEqual( typeof zpftrs, 'function', 'is a function' );
});

test( 'zpftrs has expected arity', function t() {
	assert.strictEqual( zpftrs.length, 9, 'has expected arity' );
});

test( 'zpftrs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zpftrs( 'column-major', 2, 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zpftrs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zpftrs( 'column-major', 'no-transpose', 'upper', -1, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zpftrs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zpftrs( 'column-major', 'no-transpose', 'upper', 2, -1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zpftrs throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zpftrs( 'invalid', 'no-transpose', 'upper', 2, 1, new Float64Array( 6 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zpftrs throws RangeError for invalid LDB', function t() {
	assert.throws( function throws() {
		zpftrs( 'column-major', 'no-transpose', 'upper', 2, 1, new Float64Array( 6 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
	assert.throws( function throws() {
		zpftrs( 'row-major', 'no-transpose', 'upper', 2, 3, new Float64Array( 6 ), 1, new Float64Array( 12 ), 2 );
	}, RangeError );
});
