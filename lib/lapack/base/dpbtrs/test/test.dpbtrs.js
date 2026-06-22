/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpbtrs from './../lib/dpbtrs.js';


// TESTS //

test( 'dpbtrs is a function', function t() {
	assert.strictEqual( typeof dpbtrs, 'function', 'is a function' );
});

test( 'dpbtrs has expected arity', function t() {
	assert.strictEqual( dpbtrs.length, 9, 'has expected arity' );
});

test( 'dpbtrs throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dpbtrs( 'invalid', 'upper', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dpbtrs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dpbtrs( 'row-major', 'invalid', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dpbtrs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dpbtrs( 'row-major', 'upper', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dpbtrs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dpbtrs( 'row-major', 'upper', new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
