/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlatbs from './../lib/zlatbs.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

// Diagonal (kd=0) identity band, AB is 1xN (LDAB=1):
function diagAB() {
	return new Complex128Array([ 1.0, 0.0, 1.0, 0.0 ]);
}


// TESTS //

test( 'zlatbs is a function', function t() {
	assert.strictEqual( typeof zlatbs, 'function', 'is a function' );
});

test( 'zlatbs has expected arity', function t() {
	assert.strictEqual( zlatbs.length, 13, 'has expected arity' );
});

test( 'zlatbs throws a TypeError for an invalid uplo', function t() {
	assert.throws( function throws() {
		zlatbs( 'bogus', 'no-transpose', 'non-unit', 'no', 2, 0, diagAB(), 1, new Complex128Array( 2 ), 1, new Float64Array( 1 ), new Float64Array( 2 ), 1 );
	}, TypeError );
});

test( 'zlatbs throws a TypeError for normin other than "no"', function t() {
	assert.throws( function throws() {
		zlatbs( 'upper', 'no-transpose', 'non-unit', 'yes', 2, 0, diagAB(), 1, new Complex128Array( 2 ), 1, new Float64Array( 1 ), new Float64Array( 2 ), 1 );
	}, TypeError );
});

test( 'zlatbs throws a RangeError for LDAB < kd+1', function t() {
	assert.throws( function throws() {
		zlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 2, 2, diagAB(), 2, new Complex128Array( 2 ), 1, new Float64Array( 1 ), new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'zlatbs solves I*x=b (solution equals RHS, scale=1)', function t() {
	const x = new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]);
	const scale = new Float64Array( 1 );
	const info = zlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 2, 0, diagAB(), 1, x, 1, scale, new Float64Array( 2 ), 1 );
	assert.strictEqual( info, 0, 'info is 0' );
	assert.ok( Math.abs( scale[ 0 ] - 1.0 ) < 1e-12, 'scale is 1' );

	const view = new Float64Array( x.buffer );
	assert.ok( Math.abs( view[ 0 ] - 3.0 ) < 1e-12 && Math.abs( view[ 1 ] + 1.0 ) < 1e-12, 'x[0]' );
	assert.ok( Math.abs( view[ 2 ] - 5.0 ) < 1e-12 && Math.abs( view[ 3 ] - 2.0 ) < 1e-12, 'x[1]' );
});

test( 'zlatbs matches the ndarray form', function t() {
	const x1 = new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]);
	const s1 = new Float64Array( 1 );
	const info1 = zlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 2, 0, diagAB(), 1, x1, 1, s1, new Float64Array( 2 ), 1 );

	const x2 = new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]);
	const s2 = new Float64Array( 1 );
	const info2 = ndarray( 'upper', 'no-transpose', 'non-unit', 'no', 2, 0, diagAB(), 1, 1, 0, x2, 1, 0, s2, new Float64Array( 2 ), 1, 0 );

	assert.strictEqual( info1, info2, 'info matches' );
	assert.ok( Math.abs( s1[ 0 ] - s2[ 0 ] ) < 1e-14, 'scale matches' );
	const v1 = new Float64Array( x1.buffer );
	const v2 = new Float64Array( x2.buffer );
	for ( let i = 0; i < v1.length; i++ ) {
		assert.ok( Math.abs( v1[ i ] - v2[ i ] ) < 1e-14, 'x['+i+'] matches' );
	}
});
