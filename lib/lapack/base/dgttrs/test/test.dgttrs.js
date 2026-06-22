/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgttrs from './../lib/dgttrs.js';


// TESTS //

test( 'dgttrs is a function', function t() {
	assert.strictEqual( typeof dgttrs, 'function', 'is a function' );
});

test( 'dgttrs has expected arity', function t() {
	assert.strictEqual( dgttrs.length, 15, 'has expected arity' );
});

test( 'dgttrs throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dgttrs( 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dgttrs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgttrs( 'no-transpose', -1, 2, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dgttrs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dgttrs( 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
