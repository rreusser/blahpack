/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlatrs from './../lib/zlatrs.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

// 2x2 complex identity (upper-triangular; column-major):
function identity2() {
	return new Complex128Array([ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ]);
}


// TESTS //

test( 'zlatrs is a function', function t() {
	assert.strictEqual( typeof zlatrs, 'function', 'is a function' );
});

test( 'zlatrs has expected arity', function t() {
	assert.strictEqual( zlatrs.length, 13, 'has expected arity' );
});

test( 'zlatrs throws a TypeError for an invalid order', function t() {
	assert.throws( function throws() {
		zlatrs( 'invalid', 'upper', 'no-transpose', 'non-unit', 'no', 2, identity2(), 2, new Complex128Array( 2 ), 1, new Float64Array( 1 ), new Float64Array( 2 ), 1 );
	}, TypeError );
});

test( 'zlatrs throws a TypeError for an invalid trans', function t() {
	assert.throws( function throws() {
		zlatrs( 'column-major', 'upper', 'bogus', 'non-unit', 'no', 2, identity2(), 2, new Complex128Array( 2 ), 1, new Float64Array( 1 ), new Float64Array( 2 ), 1 );
	}, TypeError );
});

test( 'zlatrs throws a TypeError for normin other than "no"', function t() {
	assert.throws( function throws() {
		zlatrs( 'column-major', 'upper', 'no-transpose', 'non-unit', 'yes', 2, identity2(), 2, new Complex128Array( 2 ), 1, new Float64Array( 1 ), new Float64Array( 2 ), 1 );
	}, TypeError );
});

test( 'zlatrs solves I*x=b (solution equals RHS, scale=1)', function t() {
	const x = new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]);
	const scale = new Float64Array( 1 );
	const CNORM = new Float64Array( 2 );
	const info = zlatrs( 'column-major', 'upper', 'no-transpose', 'non-unit', 'no', 2, identity2(), 2, x, 1, scale, CNORM, 1 );
	assert.strictEqual( info, 0, 'info is 0' );
	assert.ok( Math.abs( scale[ 0 ] - 1.0 ) < 1e-12, 'scale is 1' );

	const view = new Float64Array( x.buffer );
	assert.ok( Math.abs( view[ 0 ] - 3.0 ) < 1e-12 && Math.abs( view[ 1 ] + 1.0 ) < 1e-12, 'x[0]' );
	assert.ok( Math.abs( view[ 2 ] - 5.0 ) < 1e-12 && Math.abs( view[ 3 ] - 2.0 ) < 1e-12, 'x[1]' );
});

test( 'zlatrs matches the ndarray form', function t() {
	const x1 = new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]);
	const s1 = new Float64Array( 1 );
	const info1 = zlatrs( 'column-major', 'upper', 'no-transpose', 'non-unit', 'no', 2, identity2(), 2, x1, 1, s1, new Float64Array( 2 ), 1 );

	const x2 = new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]);
	const s2 = new Float64Array( 1 );
	const info2 = ndarray( 'upper', 'no-transpose', 'non-unit', 'no', 2, identity2(), 1, 2, 0, x2, 1, 0, s2, new Float64Array( 2 ), 1, 0 );

	assert.strictEqual( info1, info2, 'info matches' );
	assert.ok( Math.abs( s1[ 0 ] - s2[ 0 ] ) < 1e-14, 'scale matches' );
	const v1 = new Float64Array( x1.buffer );
	const v2 = new Float64Array( x2.buffer );
	for ( let i = 0; i < v1.length; i++ ) {
		assert.ok( Math.abs( v1[ i ] - v2[ i ] ) < 1e-14, 'x['+i+'] matches' );
	}
});
