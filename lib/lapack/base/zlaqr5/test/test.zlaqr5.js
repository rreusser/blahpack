/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlaqr5 from './../lib/zlaqr5.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

// 6x6 complex upper Hessenberg (column-major):
function makeH() {
	const H = new Complex128Array( 36 );
	const v = new Float64Array( H.buffer );
	function set( i, j, re, im ) {
		const k = i + ( j*6 );
		v[ 2*k ] = re;
		v[ ( 2*k )+1 ] = im;
	}
	let i;
	let j;
	for ( i = 0; i < 6; i++ ) {
		set( i, i, 2.0+i, 0.1*i );
	}
	for ( i = 0; i < 6; i++ ) {
		for ( j = i+1; j < 6; j++ ) {
			set( i, j, 0.5, 0.1 );
		}
	}
	for ( j = 0; j < 5; j++ ) {
		set( j+1, j, 0.3, -0.1 );
	}
	return H;
}

function identity6() {
	const Z = new Complex128Array( 36 );
	const v = new Float64Array( Z.buffer );
	let d;
	for ( d = 0; d < 6; d++ ) {
		v[ 2*( d+( d*6 ) ) ] = 1.0;
	}
	return Z;
}

function shifts() {
	return new Complex128Array([ 3.0, 1.0, 2.0, -0.5 ]);
}


// TESTS //

test( 'zlaqr5 is a function', function t() {
	assert.strictEqual( typeof zlaqr5, 'function', 'is a function' );
});

test( 'zlaqr5 has expected arity', function t() {
	assert.strictEqual( zlaqr5.length, 25, 'has expected arity' );
});

test( 'zlaqr5 throws a RangeError for LDH < max(1,N)', function t() {
	assert.throws( function throws() {
		zlaqr5( true, true, 0, 6, 1, 6, 2, shifts(), 1, makeH(), 5, 1, 6, identity6(), 6, new Complex128Array( 9 ), 3, new Complex128Array( 25 ), 5, 6, new Complex128Array( 30 ), 6, 6, new Complex128Array( 30 ), 5 );
	}, RangeError );
});

test( 'zlaqr5 (column-major) matches the ndarray form for a 6x6, 2-shift sweep', function t() {
	// Wrapper:
	const H1 = makeH();
	const Z1 = identity6();
	zlaqr5( true, true, 0, 6, 1, 6, 2, shifts(), 1, H1, 6, 1, 6, Z1, 6, new Complex128Array( 9 ), 3, new Complex128Array( 25 ), 5, 6, new Complex128Array( 30 ), 6, 6, new Complex128Array( 30 ), 5 );

	// ndarray (column-major strides):
	const H2 = makeH();
	const Z2 = identity6();
	ndarray( true, true, 0, 6, 1, 6, 2, shifts(), 1, 0, H2, 1, 6, 0, 1, 6, Z2, 1, 6, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 25 ), 1, 5, 0, 6, new Complex128Array( 30 ), 1, 6, 0, 6, new Complex128Array( 30 ), 1, 5, 0 );

	const a1 = new Float64Array( H1.buffer );
	const a2 = new Float64Array( H2.buffer );
	for ( let i = 0; i < a1.length; i++ ) {
		assert.ok( Math.abs( a1[ i ] - a2[ i ] ) < 1e-12, 'H['+i+'] matches' );
	}
	const z1 = new Float64Array( Z1.buffer );
	const z2 = new Float64Array( Z2.buffer );
	for ( let i = 0; i < z1.length; i++ ) {
		assert.ok( Math.abs( z1[ i ] - z2[ i ] ) < 1e-12, 'Z['+i+'] matches' );
	}
});
