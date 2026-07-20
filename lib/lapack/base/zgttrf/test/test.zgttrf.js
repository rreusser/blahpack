/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zgttrf from './../lib/zgttrf.js';
import ndarray from './../lib/ndarray.js';


// TESTS //

test( 'zgttrf is a function', function t() {
	assert.strictEqual( typeof zgttrf, 'function', 'is a function' );
});

test( 'zgttrf has expected arity', function t() {
	assert.strictEqual( zgttrf.length, 11, 'has expected arity' );
});

test( 'zgttrf throws a RangeError for a negative N', function t() {
	assert.throws( function throws() {
		zgttrf( -1, new Complex128Array( 2 ), 1, new Complex128Array( 3 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 1 ), 1, new Int32Array( 3 ), 1 );
	}, RangeError );
});

test( 'zgttrf factorizes the 3x3 diagonal identity (info=0, U diagonal unchanged)', function t() {
	const DL = new Complex128Array([ 0.0, 0.0, 0.0, 0.0 ]);
	const d = new Complex128Array([ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ]);
	const DU = new Complex128Array([ 0.0, 0.0, 0.0, 0.0 ]);
	const DU2 = new Complex128Array([ 0.0, 0.0 ]);
	const IPIV = new Int32Array( 3 );

	const info = zgttrf( 3, DL, 1, d, 1, DU, 1, DU2, 1, IPIV, 1 );
	assert.strictEqual( info, 0, 'info is 0' );

	const view = new Float64Array( d.buffer );
	assert.ok( Math.abs( view[ 0 ] - 1.0 ) < 1e-12, 'U[0,0]' );
	assert.ok( Math.abs( view[ 2 ] - 1.0 ) < 1e-12, 'U[1,1]' );
	assert.ok( Math.abs( view[ 4 ] - 1.0 ) < 1e-12, 'U[2,2]' );
	assert.deepStrictEqual( Array.from( IPIV ), [ 0, 1, 2 ], 'no pivoting for the identity' );
});

test( 'zgttrf matches the ndarray form', function t() {
	// Wrapper:
	const info1 = zgttrf( 3, new Complex128Array([ 0.0, 0.0, 0.0, 0.0 ]), 1, new Complex128Array([ 2.0, 0.0, 3.0, 0.0, 4.0, 0.0 ]), 1, new Complex128Array([ 0.0, 0.0, 0.0, 0.0 ]), 1, new Complex128Array([ 0.0, 0.0 ]), 1, new Int32Array( 3 ), 1 );

	// ndarray:
	const d2 = new Complex128Array([ 2.0, 0.0, 3.0, 0.0, 4.0, 0.0 ]);
	const ip2 = new Int32Array( 3 );
	const info2 = ndarray( 3, new Complex128Array([ 0.0, 0.0, 0.0, 0.0 ]), 1, 0, d2, 1, 0, new Complex128Array([ 0.0, 0.0, 0.0, 0.0 ]), 1, 0, new Complex128Array([ 0.0, 0.0 ]), 1, 0, ip2, 1, 0 );

	assert.strictEqual( info1, info2, 'info matches' );
	assert.deepStrictEqual( Array.from( ip2 ), [ 0, 1, 2 ], 'ndarray IPIV' );
});
