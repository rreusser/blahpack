/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgbtrf from './../lib/dgbtrf.js';


// TESTS //

test( 'dgbtrf is a function', function t() {
	assert.strictEqual( typeof dgbtrf, 'function', 'is a function' );
});

test( 'dgbtrf has expected arity', function t() {
	assert.strictEqual( dgbtrf.length, 9, 'has expected arity' );
});

test( 'dgbtrf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgbtrf( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dgbtrf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgbtrf( 'row-major', -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgbtrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgbtrf( 'row-major', new Float64Array( 4 ), -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
