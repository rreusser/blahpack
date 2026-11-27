
/* eslint-disable no-restricted-syntax */

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

test( 'dlarrr returns 0 for N <= 0, as the reference does (it checks no arguments)', function t() {
	// dlarrr.f: IF( N.LE.0 ) THEN INFO = 0; RETURN. The wrapper used to throw for N < 0, which ndarray.js and the reference do not (CONVENTIONS V1).
	assert.strictEqual( dlarrr( -1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 ), 0 );
	assert.strictEqual( dlarrr( 0, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 ), 0 );
});

test( 'dlarrr returns 0 for well-conditioned matrix', function t() {
	const d = new Float64Array( [ 4.0, 4.0, 4.0 ] );
	const e = new Float64Array( [ 1.0, 1.0 ] );
	const info = dlarrr( 3, d, 1, e, 1 );

	assert.strictEqual( info, 0 );
});

test( 'dlarrr returns 1 for poorly-conditioned matrix', function t() {
	const d = new Float64Array( [ 4.0, 1.0e-320, 4.0 ] );
	const e = new Float64Array( [ 1.0, 1.0 ] );
	const info = dlarrr( 3, d, 1, e, 1 );

	assert.strictEqual( info, 1 );
});
