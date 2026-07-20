/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqr5 from './../lib/dlaqr5.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

// 6x6 real upper Hessenberg (column-major) — the fixture from test.ndarray.js:
function makeH() {
	const H = new Float64Array( 36 );
	const spec = {
		'1,1': 4.0, '1,2': 3.0, '1,3': 2.0, '1,4': 1.0, '1,5': 0.5, '1,6': 0.25,
		'2,1': 1.0, '2,2': 3.0, '2,3': 2.5, '2,4': 1.5, '2,5': 0.8, '2,6': 0.4,
		'3,2': 1.5, '3,3': 2.0, '3,4': 1.0, '3,5': 0.7, '3,6': 0.3,
		'4,3': 0.8, '4,4': 1.5, '4,5': 0.6, '4,6': 0.2,
		'5,4': 0.5, '5,5': 1.0, '5,6': 0.5,
		'6,5': 0.3, '6,6': 0.5
	};
	const keys = Object.keys( spec );
	let k;
	let ij;
	for ( k = 0; k < keys.length; k++ ) {
		ij = keys[ k ].split( ',' );
		H[ ( ( ij[ 0 ]-1 ) )+( ( ij[ 1 ]-1 )*6 ) ] = spec[ keys[ k ] ];
	}
	return H;
}

function identity6() {
	const Z = new Float64Array( 36 );
	let d;
	for ( d = 0; d < 6; d++ ) {
		Z[ d + ( d*6 ) ] = 1.0;
	}
	return Z;
}


// TESTS //

test( 'dlaqr5 is a function', function t() {
	assert.strictEqual( typeof dlaqr5, 'function', 'is a function' );
});

test( 'dlaqr5 has expected arity', function t() {
	assert.strictEqual( dlaqr5.length, 27, 'has expected arity' );
});

test( 'dlaqr5 throws a RangeError for LDH < max(1,N)', function t() {
	assert.throws( function throws() {
		dlaqr5( true, true, 0, 6, 0, 5, 2, new Float64Array([ 2.0, 2.0 ]), 1, new Float64Array([ 0.5, -0.5 ]), 1, makeH(), 5, 0, 5, identity6(), 6, new Float64Array( 12 ), 3, new Float64Array( 16 ), 4, 6, new Float64Array( 24 ), 6, 6, new Float64Array( 24 ), 4 );
	}, RangeError );
});

test( 'dlaqr5 (column-major) matches the ndarray form for a 6x6, 2-shift sweep', function t() {
	const SR = [ 2.0, 2.0 ];
	const SI = [ 0.5, -0.5 ];

	// Wrapper:
	const H1 = makeH();
	const Z1 = identity6();
	dlaqr5( true, true, 0, 6, 0, 5, 2, new Float64Array( SR ), 1, new Float64Array( SI ), 1, H1, 6, 0, 5, Z1, 6, new Float64Array( 12 ), 3, new Float64Array( 16 ), 4, 6, new Float64Array( 24 ), 6, 6, new Float64Array( 24 ), 4 );

	// ndarray (column-major strides):
	const H2 = makeH();
	const Z2 = identity6();
	ndarray( true, true, 0, 6, 0, 5, 2, new Float64Array( SR ), 1, 0, new Float64Array( SI ), 1, 0, H2, 1, 6, 0, 0, 5, Z2, 1, 6, 0, new Float64Array( 12 ), 1, 3, 0, new Float64Array( 16 ), 1, 4, 0, 6, new Float64Array( 24 ), 1, 6, 0, 6, new Float64Array( 24 ), 1, 4, 0 );

	// Sanity: the sweep produced finite values (not a degenerate config):
	assert.ok( Number.isFinite( H1[ 0 ] ) && Number.isFinite( H1[ 22 ] ), 'H is finite' );

	for ( let i = 0; i < H1.length; i++ ) {
		assert.ok( Math.abs( H1[ i ] - H2[ i ] ) < 1e-12, 'H['+i+'] matches' );
	}
	for ( let i = 0; i < Z1.length; i++ ) {
		assert.ok( Math.abs( Z1[ i ] - Z2[ i ] ) < 1e-12, 'Z['+i+'] matches' );
	}
});
