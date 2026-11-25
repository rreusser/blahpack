/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlarzb from './../lib/zlarzb.js';
import zlarzbNd from './../lib/ndarray.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// TESTS //

test( 'zlarzb is a function', function t() {
	assert.strictEqual( typeof zlarzb, 'function', 'is a function' );
});

test( 'zlarzb has expected arity', function t() {
	assert.strictEqual( zlarzb.length, 17, 'has expected arity' );
});

test( 'zlarzb throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlarzb( 'invalid', 'left', 'no-transpose', 'backward', 'rowwise', 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zlarzb throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zlarzb( 'row-major', 'invalid', 'no-transpose', 'backward', 'rowwise', 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zlarzb throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zlarzb( 'row-major', 'left', 'invalid', 'backward', 'rowwise', 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zlarzb throws TypeError for invalid direct', function t() {
	assert.throws( function throws() {
		zlarzb( 'row-major', 'left', 'no-transpose', 'forward', 'rowwise', 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zlarzb throws TypeError for invalid storev', function t() {
	assert.throws( function throws() {
		zlarzb( 'row-major', 'left', 'no-transpose', 'backward', 'columnwise', 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zlarzb throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlarzb( 'row-major', 'left', 'no-transpose', 'backward', 'rowwise', -1, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zlarzb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlarzb( 'row-major', 'left', 'no-transpose', 'backward', 'rowwise', 2, -1, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zlarzb throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zlarzb( 'row-major', 'left', 'no-transpose', 'backward', 'rowwise', 2, 2, -1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zlarzb: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// T is K by K (ZLARZB: LDT >= K); rowwise V is K by L (LDV >= K).
	function F() {
		return new Float64Array( 1024 );
	}
	function Z() {
		return new Complex128Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDV': 16, 'LDT': 16, 'LDC': 16, 'LDWORK': 16 };
		Object.assign( L, ld );
		return zlarzb( order, 'left', 'no-transpose', 'backward', 'rowwise', 6, 5, 2, 3, Z(), L.LDV, Z(), L.LDT, Z(), L.LDC, Z(), L.LDWORK );
	}
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDT': 2 } );
	}, 'column-major LDT = 2 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDT': 1 } );
	}, RangeError, 'column-major LDT = 1 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'row-major', { 'LDT': 2 } );
	}, 'row-major LDT = 2 is accepted' );
	assert.throws( function bad() {
		call( 'row-major', { 'LDT': 1 } );
	}, RangeError, 'row-major LDT = 1 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDV': 2 } );
	}, 'column-major LDV = 2 is accepted' );
});

test( 'zlarzb matches ndarray (both layouts, both sides, allocated and provided WORK)', function t() {
	const sides = [ 'left', 'right' ];
	const orders = [ 'column-major', 'row-major' ];
	let i;
	let j;
	for ( i = 0; i < orders.length; i++ ) {
		for ( j = 0; j < sides.length; j++ ) {
			checkAgainstNdarray( orders[ i ], sides[ j ], 'conjugate-transpose', null );
			checkAgainstNdarray( orders[ i ], sides[ j ], 'no-transpose', new Complex128Array( 64 ) );
		}
	}
});


// FUNCTIONS //

/**
* Returns a deterministic pseudo-random complex array.
*
* @private
* @param {NonNegativeInteger} n - number of complex elements
* @param {integer} seed - seed
* @returns {Complex128Array} array
*/
function fill( n, seed ) {
	const out = new Float64Array( 2 * n );
	let s = seed;
	let i;
	for ( i = 0; i < out.length; i++ ) {
		s = ( ( s * 1103515245 ) + 12345 ) % 2147483648;
		out[ i ] = ( s / 1073741824 ) - 1.0;
	}
	return new Complex128Array( out.buffer );
}

/**
* Calls the layout wrapper and `ndarray` on the same data and asserts identical outputs.
*
* @private
* @param {string} order - layout
* @param {string} side - side
* @param {string} trans - transpose operation
* @param {(Complex128Array|null)} WORK - workspace passed to the wrapper
*/
function checkAgainstNdarray( order, side, trans, WORK ) {
	const M = 6;
	const N = 5;
	const K = 2;
	const L = 3;
	const LDV = 7;
	const LDT = 3;
	const LDC = 8;
	const LDWORK = 7;
	const V = fill( 64, 3 );
	const T = fill( 16, 5 );
	const C1 = fill( 64, 7 );
	const C2 = fill( 64, 7 );
	const W2 = new Complex128Array( 64 );
	let sv1 = 1;
	let sv2 = LDV;
	let st1 = 1;
	let st2 = LDT;
	let sc1 = 1;
	let sc2 = LDC;
	let sw1 = 1;
	let sw2 = LDWORK;
	let out;
	let c1;
	let c2;
	let i;
	if ( order === 'row-major' ) {
		sv1 = LDV;
		sv2 = 1;
		st1 = LDT;
		st2 = 1;
		sc1 = LDC;
		sc2 = 1;
		sw1 = LDWORK;
		sw2 = 1;
	}
	out = zlarzb( order, side, trans, 'backward', 'rowwise', M, N, K, L, V, LDV, T, LDT, C1, LDC, WORK, LDWORK );
	assert.strictEqual( out, C1, 'returns C' );
	zlarzbNd( side, trans, 'backward', 'rowwise', M, N, K, L, V, sv1, sv2, 0, T, st1, st2, 0, C2, sc1, sc2, 0, W2, sw1, sw2, 0 );
	c1 = reinterpret( C1, 0 );
	c2 = reinterpret( C2, 0 );
	for ( i = 0; i < c1.length; i++ ) {
		assert.strictEqual( c1[ i ], c2[ i ], order + ' ' + side + ' ' + trans + ' C[' + i + ']' );
	}
	assert.notDeepStrictEqual( c1, reinterpret( fill( 64, 7 ), 0 ), 'C was modified' );
}
