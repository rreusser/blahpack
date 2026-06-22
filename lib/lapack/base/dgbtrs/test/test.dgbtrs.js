/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgbtrs from './../lib/dgbtrs.js';


// TESTS //

test( 'dgbtrs is a function', function t() {
	assert.strictEqual( typeof dgbtrs, 'function', 'is a function' );
});

test( 'dgbtrs has expected arity', function t() {
	assert.strictEqual( dgbtrs.length, 12, 'has expected arity' );
});

test( 'dgbtrs throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgbtrs( 'invalid', 'no-transpose', new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dgbtrs throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dgbtrs( 'row-major', 'invalid', new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dgbtrs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgbtrs( 'row-major', 'no-transpose', -1, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dgbtrs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dgbtrs( 'row-major', 'no-transpose', new Float64Array( 4 ), 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
