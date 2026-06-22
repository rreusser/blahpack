/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpbtrf from './../lib/dpbtrf.js';


// TESTS //

test( 'dpbtrf is a function', function t() {
	assert.strictEqual( typeof dpbtrf, 'function', 'is a function' );
});

test( 'dpbtrf has expected arity', function t() {
	assert.strictEqual( dpbtrf.length, 6, 'has expected arity' );
});

test( 'dpbtrf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dpbtrf( 'invalid', 'upper', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dpbtrf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dpbtrf( 'row-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dpbtrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dpbtrf( 'row-major', 'upper', -1, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
