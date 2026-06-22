

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarrr from './../lib/dlarrr.js';


// TESTS //

test( 'dlarrr is a function', function t() {
	assert.strictEqual( typeof dlarrr, 'function', 'is a function' );
});

test( 'dlarrr has expected arity', function t() {
	assert.strictEqual( dlarrr.length, 5, 'has expected arity' );
});

test( 'dlarrr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlarrr( -1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dlarrr returns 0 for well-conditioned matrix', function t() {
	var d = new Float64Array( [ 4.0, 4.0, 4.0 ] );
	var e = new Float64Array( [ 1.0, 1.0 ] );
	var info = dlarrr( 3, d, 1, e, 1 );

	assert.strictEqual( info, 0 );
});

test( 'dlarrr returns 1 for poorly-conditioned matrix', function t() {
	var d = new Float64Array( [ 4.0, 1.0e-320, 4.0 ] );
	var e = new Float64Array( [ 1.0, 1.0 ] );
	var info = dlarrr( 3, d, 1, e, 1 );

	assert.strictEqual( info, 1 );
});
