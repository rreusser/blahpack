/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaset from './../lib/zlaset.js';


// TESTS //

test( 'zlaset is a function', function t() {
	assert.strictEqual( typeof zlaset, 'function', 'is a function' );
});

test( 'zlaset has expected arity', function t() {
	assert.strictEqual( zlaset.length, 8, 'has expected arity' );
});

test( 'zlaset throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlaset( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlaset throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlaset( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlaset throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlaset( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlaset throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlaset( 'row-major', 'upper', new Float64Array( 4 ), -1, 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
