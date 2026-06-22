/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgbtf2 from './../lib/dgbtf2.js';


// TESTS //

test( 'dgbtf2 is a function', function t() {
	assert.strictEqual( typeof dgbtf2, 'function', 'is a function' );
});

test( 'dgbtf2 has expected arity', function t() {
	assert.strictEqual( dgbtf2.length, 9, 'has expected arity' );
});

test( 'dgbtf2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgbtf2( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dgbtf2 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgbtf2( 'row-major', -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgbtf2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgbtf2( 'row-major', new Float64Array( 4 ), -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
