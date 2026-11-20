/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlanv2 from './../lib/index.js';


// TESTS //

test( 'dlanv2 is a function', function t() {
	assert.strictEqual( typeof dlanv2, 'function', 'is a function' );
});

test( 'dlanv2 has expected arity', function t() {
	assert.strictEqual( dlanv2.length, 10, 'has expected arity' );
});

test( 'dlanv2 computes the standardized Schur factorization (matches ndarray)', function t() {
	const out1 = [ 1, 2, 3, 4, 5, 6 ].map( function f() {
		return new Float64Array( 1 );
	});
	const out2 = [ 1, 2, 3, 4, 5, 6 ].map( function f() {
		return new Float64Array( 1 );
	});
	const v1 = [ 4.0, -5.0, 2.0, 1.0 ].map( function f( x ) {
		return new Float64Array( [ x ] );
	});
	const v2 = [ 4.0, -5.0, 2.0, 1.0 ].map( function f( x ) {
		return new Float64Array( [ x ] );
	});
	let i;

	dlanv2( v1[ 0 ], v1[ 1 ], v1[ 2 ], v1[ 3 ], out1[ 0 ], out1[ 1 ], out1[ 2 ], out1[ 3 ], out1[ 4 ], out1[ 5 ] );
	dlanv2.ndarray( v2[ 0 ], v2[ 1 ], v2[ 2 ], v2[ 3 ], out2[ 0 ], out2[ 1 ], out2[ 2 ], out2[ 3 ], out2[ 4 ], out2[ 5 ] );
	for ( i = 0; i < 6; i++ ) {
		assert.strictEqual( out1[ i ][ 0 ], out2[ i ][ 0 ], 'output ' + i );
	}
	for ( i = 0; i < 4; i++ ) {
		assert.strictEqual( v1[ i ][ 0 ], v2[ i ][ 0 ], 'in/out ' + i );
	}
	// Complex-conjugate pair: rt1i = -rt2i > 0
	assert.ok( out1[ 1 ][ 0 ] > 0.0, 'rt1i > 0' );
	assert.strictEqual( out1[ 1 ][ 0 ], -out1[ 3 ][ 0 ], 'conjugate pair' );
});
