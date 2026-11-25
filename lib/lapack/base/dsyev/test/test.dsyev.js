/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsyev from './../lib/dsyev.js';


// TESTS //

test( 'dsyev is a function', function t() {
	assert.strictEqual( typeof dsyev, 'function', 'is a function' );
});

test( 'dsyev has expected arity', function t() {
	assert.strictEqual( dsyev.length, 9, 'has expected arity' );
});

test( 'dsyev throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsyev( 'invalid', 2, 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dsyev throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsyev( 'row-major', 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dsyev throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsyev( 'row-major', 'no-vectors', 'upper', -1, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dsyev throws a RangeError reporting length 0 when WORK is a non-array falsy value', function t() {
	const A = new Float64Array( [ 2.0, 1.0, 1.0, 2.0 ] );
	const w = new Float64Array( 2 );
	assert.throws( function throws() {
		dsyev( 'column-major', 'no-vectors', 'upper', 2, A, 2, w, 1, false );
	}, {
		'name': 'RangeError',
		'message': 'invalid argument. WORK array must have at least 5 elements from offset 0. Provided length: 0.'
	});
});

test( 'dsyev throws a RangeError reporting the provided length when WORK is too short', function t() {
	const A = new Float64Array( [ 2.0, 1.0, 1.0, 2.0 ] );
	const w = new Float64Array( 2 );
	assert.throws( function throws() {
		dsyev( 'column-major', 'no-vectors', 'upper', 2, A, 2, w, 1, new Float64Array( 4 ) );
	}, {
		'name': 'RangeError',
		'message': 'invalid argument. WORK array must have at least 5 elements from offset 0. Provided length: 4.'
	});
});
