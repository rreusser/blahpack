/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zlaqr1 from './../lib/zlaqr1.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

// 3x3 complex upper Hessenberg (column-major):
function hess3() {
	return new Complex128Array([
		2.0, 0.0, 1.0, 0.0, 0.0, 0.0, // col 0
		3.0, 0.0, 4.0, 0.0, 1.0, 0.0, // col 1
		0.0, 0.0, 5.0, 0.0, 6.0, 0.0  // col 2
	]);
}


// TESTS //

test( 'zlaqr1 is a function', function t() {
	assert.strictEqual( typeof zlaqr1, 'function', 'is a function' );
});

test( 'zlaqr1 has expected arity', function t() {
	assert.strictEqual( zlaqr1.length, 7, 'has expected arity' );
});

test( 'zlaqr1 throws a RangeError for LDH < max(1,N)', function t() {
	assert.throws( function throws() {
		zlaqr1( 3, hess3(), 2, new Complex128( 1.0, 0.0 ), new Complex128( 2.0, 0.0 ), new Complex128Array( 3 ), 1 );
	}, RangeError );
});

test( 'zlaqr1 populates the output vector for a 3x3 Hessenberg', function t() {
	const v = new Complex128Array( 3 );
	zlaqr1( 3, hess3(), 3, new Complex128( 1.0, 0.0 ), new Complex128( 2.0, 0.0 ), v, 1 );
	const view = new Float64Array( v.buffer );
	const nonzero = view.some( function some( x ) {
		return x !== 0.0;
	});
	assert.ok( nonzero, 'v is populated' );
});

test( 'zlaqr1 matches the ndarray form', function t() {
	const v1 = new Complex128Array( 3 );
	zlaqr1( 3, hess3(), 3, new Complex128( 1.0, 0.5 ), new Complex128( 2.0, -0.5 ), v1, 1 );

	const v2 = new Complex128Array( 3 );
	ndarray( 3, hess3(), 1, 3, 0, new Complex128( 1.0, 0.5 ), new Complex128( 2.0, -0.5 ), v2, 1, 0 );

	const a1 = new Float64Array( v1.buffer );
	const a2 = new Float64Array( v2.buffer );
	for ( let i = 0; i < a1.length; i++ ) {
		assert.ok( Math.abs( a1[ i ] - a2[ i ] ) < 1e-14, 'v['+i+'] matches' );
	}
});
