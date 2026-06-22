/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrtri from './../lib/dtrtri.js';


// TESTS //

test( 'dtrtri is a function', function t() {
	assert.strictEqual( typeof dtrtri, 'function', 'is a function' );
});

test( 'dtrtri has expected arity', function t() {
	assert.strictEqual( dtrtri.length, 6, 'has expected arity' );
});

test( 'dtrtri throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtrtri( 'invalid', 'upper', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtrtri throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtrtri( 'row-major', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtrtri throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dtrtri( 'row-major', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtrtri throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtrtri( 'row-major', 'upper', 'non-unit', -1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
