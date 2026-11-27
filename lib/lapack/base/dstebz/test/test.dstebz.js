/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dstebz from './../lib/dstebz.js';


// TESTS //

test( 'dstebz is a function', function t() {
	assert.strictEqual( typeof dstebz, 'function', 'is a function' );
});

test( 'dstebz throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dstebz( 'all', 'block', -1, 0, 0, 0, 0, 0, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Int32Array( 1 ), new Int32Array( 1 ), new Float64Array( 1 ), 1, new Int32Array( 1 ), 1, new Int32Array( 1 ), 1, new Float64Array( 1 ), new Int32Array( 1 ) );
	}, RangeError );
});

test( 'dstebz allocates WORK and IWORK when they are null', function t() {
	// T = tridiag(1, 2, 1) of order 3: eigenvalues 2 - sqrt(2), 2, 2 + sqrt(2).
	const M = new Int32Array( 1 );
	const nsplit = new Int32Array( 1 );
	const w = new Float64Array( 3 );
	const IBLOCK = new Int32Array( 3 );
	const ISPLIT = new Int32Array( 3 );
	const info = dstebz( 'all', 'entire', 3, 0.0, 0.0, 1, 3, 0.0, new Float64Array( [ 2.0, 2.0, 2.0 ] ), 1, new Float64Array( [ 1.0, 1.0 ] ), 1, M, nsplit, w, 1, IBLOCK, 1, ISPLIT, 1, null, null );
	const expected = [ 2.0 - Math.SQRT2, 2.0, 2.0 + Math.SQRT2 ];
	let i;
	assert.strictEqual( info, 0 );
	assert.strictEqual( M[ 0 ], 3 );
	assert.strictEqual( nsplit[ 0 ], 1 );
	for ( i = 0; i < 3; i++ ) {
		assert.ok( Math.abs( w[ i ] - expected[ i ] ) <= 1e-14, 'w[' + i + ']' );
		assert.strictEqual( IBLOCK[ i ], 1 );
	}
	assert.strictEqual( ISPLIT[ 0 ], 3 );
});
