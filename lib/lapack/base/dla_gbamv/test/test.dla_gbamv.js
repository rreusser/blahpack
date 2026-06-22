/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, camelcase, require-jsdoc, stdlib/jsdoc-private-annotation */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dla_gbamv from './../lib/dla_gbamv.js';


// FIXTURES //

function newAB() {
	return new Float64Array( 3 * 4 );
}


// TESTS //

test( 'dla_gbamv is a function', function t() {
	assert.strictEqual( typeof dla_gbamv, 'function', 'is a function' );
});

test( 'dla_gbamv has expected arity', function t() {
	assert.strictEqual( dla_gbamv.length, 14, 'has expected arity' );
});

test( 'dla_gbamv throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dla_gbamv( 'invalid', 'no-transpose', 4, 4, 1, 1, 1.0, newAB(), 3, new Float64Array( 4 ), 1, 0.0, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dla_gbamv throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dla_gbamv( 'column-major', 'bogus', 4, 4, 1, 1, 1.0, newAB(), 3, new Float64Array( 4 ), 1, 0.0, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dla_gbamv throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dla_gbamv( 'column-major', 'no-transpose', -1, 4, 1, 1, 1.0, newAB(), 3, new Float64Array( 4 ), 1, 0.0, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dla_gbamv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dla_gbamv( 'column-major', 'no-transpose', 4, -1, 1, 1, 1.0, newAB(), 3, new Float64Array( 4 ), 1, 0.0, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dla_gbamv throws RangeError for negative KL', function t() {
	assert.throws( function throws() {
		dla_gbamv( 'column-major', 'no-transpose', 4, 4, -1, 1, 1.0, newAB(), 3, new Float64Array( 4 ), 1, 0.0, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dla_gbamv throws RangeError for negative KU', function t() {
	assert.throws( function throws() {
		dla_gbamv( 'column-major', 'no-transpose', 4, 4, 1, -1, 1.0, newAB(), 3, new Float64Array( 4 ), 1, 0.0, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dla_gbamv throws RangeError for LDAB < KL+KU+1', function t() {
	assert.throws( function throws() {
		dla_gbamv( 'column-major', 'no-transpose', 4, 4, 1, 1, 1.0, newAB(), 2, new Float64Array( 4 ), 1, 0.0, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dla_gbamv throws RangeError for strideX = 0', function t() {
	assert.throws( function throws() {
		dla_gbamv( 'column-major', 'no-transpose', 4, 4, 1, 1, 1.0, newAB(), 3, new Float64Array( 4 ), 0, 0.0, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dla_gbamv throws RangeError for strideY = 0', function t() {
	assert.throws( function throws() {
		dla_gbamv( 'column-major', 'no-transpose', 4, 4, 1, 1, 1.0, newAB(), 3, new Float64Array( 4 ), 1, 0.0, new Float64Array( 4 ), 0 );
	}, RangeError );
});

test( 'dla_gbamv computes correct result (column-major)', function t() {
	// Tridiagonal A:
	//   [ 1 -2  0  0 ]
	//   [ 3  4 -5  0 ]
	//   [ 0 -6  7  8 ]
	//   [ 0  0 -9 10 ]
	var exp = [ 5, 26, 65, 67 ];
	var AB = new Float64Array( 3 * 4 );
	var x = new Float64Array( [ 1.0, -2.0, 3.0, -4.0 ] );
	var y = new Float64Array( 4 );
	var i;
	AB[ 1 ] = 1.0;
	AB[ 2 ] = 3.0;
	AB[ 3 ] = -2.0;
	AB[ 4 ] = 4.0;
	AB[ 5 ] = -6.0;
	AB[ 6 ] = -5.0;
	AB[ 7 ] = 7.0;
	AB[ 8 ] = -9.0;
	AB[ 9 ] = 8.0;
	AB[ 10 ] = 10.0;
	dla_gbamv( 'column-major', 'no-transpose', 4, 4, 1, 1, 1.0, AB, 3, x, 1, 0.0, y, 1 );
	for ( i = 0; i < 4; i++ ) {
		assert.ok( Math.abs( y[ i ] - exp[ i ] ) < 1e-10, 'y[' + i + ']' );
	}
});
