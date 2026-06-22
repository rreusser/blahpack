/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaset from './../lib/dlaset.js';


// TESTS //

test( 'dlaset is a function', function t() {
	assert.strictEqual( typeof dlaset, 'function', 'is a function' );
});

test( 'dlaset has expected arity', function t() {
	assert.strictEqual( dlaset.length, 8, 'has expected arity' );
});

test( 'dlaset throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlaset( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlaset throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dlaset( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlaset throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlaset( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlaset throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlaset( 'row-major', 'upper', new Float64Array( 4 ), -1, 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
