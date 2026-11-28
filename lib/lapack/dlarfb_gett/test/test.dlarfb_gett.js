/* eslint-disable no-restricted-syntax, camelcase */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarfb_gett from './../lib/dlarfb_gett.js';
import dlarfb_gettNd from './../lib/strided.js';


// TESTS //

test( 'dlarfb_gett is a function', function t() {
	assert.strictEqual( typeof dlarfb_gett, 'function', 'is a function' );
});

test( 'dlarfb_gett has expected arity', function t() {
	assert.strictEqual( dlarfb_gett.length, 13, 'has expected arity' );
});

test( 'dlarfb_gett throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlarfb_gett( 'invalid', 'not-identity', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlarfb_gett throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlarfb_gett( 'row-major', 'not-identity', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlarfb_gett throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlarfb_gett( 'row-major', 'not-identity', 2, -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlarfb_gett throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dlarfb_gett( 'row-major', 'not-identity', 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlarfb_gett: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// T is K by K, A is K by N, WORK is K by max(K,N-K) (DLARFB_GETT).
	function F() {
		return new Float64Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDT': 16, 'LDA': 16, 'LDB': 16, 'LDWORK': 16 };
		Object.assign( L, ld );
		return dlarfb_gett( order, 'not-identity', 6, 5, 2, F(), L.LDT, F(), L.LDA, F(), L.LDB, F(), L.LDWORK );
	}
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDT': 2 } );
	}, 'column-major LDT = 2 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDT': 1 } );
	}, RangeError, 'column-major LDT = 1 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDA': 2 } );
	}, 'column-major LDA = 2 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDA': 1 } );
	}, RangeError, 'column-major LDA = 1 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDWORK': 2 } );
	}, 'column-major LDWORK = 2 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDWORK': 1 } );
	}, RangeError, 'column-major LDWORK = 1 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'row-major', { 'LDT': 2 } );
	}, 'row-major LDT = 2 is accepted' );
	assert.throws( function bad() {
		call( 'row-major', { 'LDT': 1 } );
	}, RangeError, 'row-major LDT = 1 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'row-major', { 'LDWORK': 3 } );
	}, 'row-major LDWORK = 3 is accepted' );
	assert.throws( function bad() {
		call( 'row-major', { 'LDWORK': 2 } );
	}, RangeError, 'row-major LDWORK = 2 is rejected' );
});

test( 'dlarfb_gett matches strided (both layouts, both ident values, allocated and provided WORK)', function t() {
	const orders = [ 'column-major', 'row-major' ];
	let i;
	for ( i = 0; i < orders.length; i++ ) {
		checkAgainstStrided( orders[ i ], 'not-identity', null );
		checkAgainstStrided( orders[ i ], 'identity', null );
		checkAgainstStrided( orders[ i ], 'not-identity', new Float64Array( 128 ) );
	}
});


// FUNCTIONS //

/**
* Returns a deterministic pseudo-random array.
*
* @private
* @param {NonNegativeInteger} n - number of elements
* @param {integer} seed - seed
* @returns {Float64Array} array
*/
function fill( n, seed ) {
	const out = new Float64Array( n );
	let s = seed;
	let i;
	for ( i = 0; i < out.length; i++ ) {
		s = ( ( s * 1103515245 ) + 12345 ) % 2147483648;
		out[ i ] = ( s / 1073741824 ) - 1.0;
	}
	return new Float64Array( out.buffer );
}

/**
* Returns a real view of an array.
*
* @private
* @param {Float64Array} x - array
* @returns {Float64Array} view
*/
function view( x ) {
	return new Float64Array( x.buffer, x.byteOffset, x.byteLength / 8 );
}

/**
* Calls the layout wrapper and `strided` on the same data and asserts identical outputs.
*
* @private
* @param {string} order - layout
* @param {string} ident - whether the unit lower triangular part of A is the identity
* @param {(Float64Array|null)} WORK - workspace passed to the wrapper
*/
function checkAgainstStrided( order, ident, WORK ) {
	const M = 6;
	const N = 5;
	const K = 2;
	const LD = 8;
	const T = fill( 128, 3 );
	const A1 = fill( 128, 5 );
	const A2 = fill( 128, 5 );
	const B1 = fill( 128, 7 );
	const B2 = fill( 128, 7 );
	const W2 = new Float64Array( 128 );
	let s1 = 1;
	let s2 = LD;
	let a1;
	let a2;
	let b1;
	let b2;
	let i;
	if ( order === 'row-major' ) {
		s1 = LD;
		s2 = 1;
	}
	dlarfb_gett( order, ident, M, N, K, T, LD, A1, LD, B1, LD, WORK, LD );
	dlarfb_gettNd( ident, M, N, K, T, s1, s2, 0, A2, s1, s2, 0, B2, s1, s2, 0, W2, s1, s2, 0 );
	a1 = view( A1 );
	a2 = view( A2 );
	b1 = view( B1 );
	b2 = view( B2 );
	for ( i = 0; i < a1.length; i++ ) {
		assert.strictEqual( a1[ i ], a2[ i ], order + ' ' + ident + ' A[' + i + ']' );
	}
	for ( i = 0; i < b1.length; i++ ) {
		assert.strictEqual( b1[ i ], b2[ i ], order + ' ' + ident + ' B[' + i + ']' );
	}
	assert.notDeepStrictEqual( b1, view( fill( 128, 7 ) ), 'B was modified' );
}
