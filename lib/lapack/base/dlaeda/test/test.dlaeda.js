

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

'use strict';

// MODULES //

var test = require( 'node:test' );
var assert = require( 'node:assert/strict' );
var Float64Array = require( '@stdlib/array/float64' );
var dlaeda = require( './../lib/dlaeda.js' );


// TESTS //

test( 'dlaeda is a function', function t() {
	assert.strictEqual( typeof dlaeda, 'function', 'is a function' );
});

test( 'dlaeda has expected arity', function t() {
	assert.strictEqual( dlaeda.length, 29, 'has expected arity' );
});

test( 'dlaeda throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlaeda( 'invalid', 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlaeda throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlaeda( 'row-major', -1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

