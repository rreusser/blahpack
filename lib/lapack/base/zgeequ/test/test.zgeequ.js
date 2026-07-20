/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zgeequ from './../lib/zgeequ.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

// 2x2 complex matrix diag(2, 4) (column-major, re/im interleaved):
function diag24() {
	return new Complex128Array([ 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 4.0, 0.0 ]);
}


// TESTS //

test( 'zgeequ is a function', function t() {
	assert.strictEqual( typeof zgeequ, 'function', 'is a function' );
});

test( 'zgeequ has expected arity', function t() {
	assert.strictEqual( zgeequ.length, 8, 'has expected arity' );
});

test( 'zgeequ throws a RangeError for a negative M', function t() {
	assert.throws( function throws() {
		zgeequ( -1, 2, diag24(), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'zgeequ throws a RangeError for a negative N', function t() {
	assert.throws( function throws() {
		zgeequ( 2, -1, diag24(), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'zgeequ throws a RangeError for LDA < max(1,M)', function t() {
	assert.throws( function throws() {
		zgeequ( 2, 2, diag24(), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'zgeequ computes scale factors for diag(2,4)', function t() {
	const r = new Float64Array( 2 );
	const c = new Float64Array( 2 );
	const out = zgeequ( 2, 2, diag24(), 2, r, 1, c, 1 );
	assert.strictEqual( out.info, 0, 'info is 0' );

	// Row scales are reciprocals of the row max-abs; col scales normalize to 1:
	assert.ok( Math.abs( r[ 0 ] - 0.5 ) < 1e-12, 'r[0]' );
	assert.ok( Math.abs( r[ 1 ] - 0.25 ) < 1e-12, 'r[1]' );
	assert.ok( Math.abs( out.amax - 4.0 ) < 1e-12, 'amax is the largest element' );
});

test( 'zgeequ matches the ndarray form for diag(2,4)', function t() {
	const r1 = new Float64Array( 2 );
	const c1 = new Float64Array( 2 );
	const o1 = zgeequ( 2, 2, diag24(), 2, r1, 1, c1, 1 );

	const r2 = new Float64Array( 2 );
	const c2 = new Float64Array( 2 );
	const o2 = ndarray( 2, 2, diag24(), 1, 2, 0, r2, 1, 0, c2, 1, 0 );

	assert.strictEqual( o1.info, o2.info, 'info matches' );
	assert.ok( Math.abs( o1.amax - o2.amax ) < 1e-14, 'amax matches' );
	assert.ok( Math.abs( r1[ 0 ] - r2[ 0 ] ) < 1e-14, 'r[0] matches' );
	assert.ok( Math.abs( c1[ 1 ] - c2[ 1 ] ) < 1e-14, 'c[1] matches' );
});
