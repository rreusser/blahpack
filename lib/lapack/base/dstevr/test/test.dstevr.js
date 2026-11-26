/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dstevr from './../lib/dstevr.js';


// TESTS //

test( 'dstevr is a function', function t() {
	assert.strictEqual( typeof dstevr, 'function', 'is a function' );
});

test( 'dstevr has expected arity', function t() {
	assert.strictEqual( dstevr.length, 22, 'has expected arity' );
});

test( 'dstevr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		dstevr( 'column-major', 'no-vectors', 'all', -1, 2, 1, 2, 1, 2, 2, 2, 2, 2, m, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dstevr: null WORK and IWORK are allocated internally', function t() {
	const d = new Float64Array( [ 4.0, 6.0, 8.0, 10.0, 12.0 ] );
	const e = new Float64Array( [ 1.0, 0.5, 1.0, 0.5 ] );
	const m = new Int32Array( 1 );
	const w = new Float64Array( 5 );
	const Z = new Float64Array( 25 );
	const ISUPPZ = new Int32Array( 10 );
	const info = dstevr( 'column-major', 'compute-vectors', 'index', 5, d, 1, e, 1, 0.0, 0.0, 2, 4, 0.0, m, w, 1, Z, 5, ISUPPZ, 1, null, null );
	let i;
	assert.equal( info, 0, 'info' );
	assert.equal( m[ 0 ], 3, 'M' );
	for ( i = 1; i < 3; i++ ) {
		assert.ok( w[ i ] > w[ i - 1 ], 'ascending' );
	}
});
