/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dstevx from './../lib/dstevx.js';


// TESTS //

test( 'dstevx is a function', function t() {
	assert.strictEqual( typeof dstevx, 'function', 'is a function' );
});

test( 'dstevx has expected arity', function t() {
	assert.strictEqual( dstevx.length, 22, 'has expected arity' );
});

test( 'dstevx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dstevx( 'column-major', 2, 2, -1, 2, 1, 2, 1, 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dstevx: row-major Z must have room for N eigenvector columns (range = all)', function t() {
	// Regression (tickets/0001): the row-major bound was `max( 1, M )` with M
	// the Int32Array output, i.e. NaN, so an undersized LDZ was never rejected.
	function run( LDZ ) {
		const d = new Float64Array( [ 2.0, 2.0, 2.0 ] );
		const e = new Float64Array( [ 1.0, 1.0 ] );
		return dstevx( 'row-major', 'compute-vectors', 'all', 3, d, 1, e, 1, 0.0, 0.0, 1, 3, 0.0, new Int32Array( 1 ), new Float64Array( 3 ), 1, new Float64Array( 9 ), LDZ, new Float64Array( 15 ), new Int32Array( 15 ), new Int32Array( 3 ), 1 );
	}
	assert.throws( function bad() {
		run( 1 );
	}, RangeError );
	assert.strictEqual( run( 3 ), 0, 'LDZ = N is accepted' );
});
