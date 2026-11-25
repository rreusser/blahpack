/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ndarray from './../lib/ndarray.js';
import zhbtrd from './../lib/zhbtrd.js';


// FUNCTIONS //

/**
* Returns the (real, imaginary) parts of the Hermitian test matrix element `(i,j)` with `i <= j`.
*
* @private
* @param {number} scale - diagonal scale
* @param {NonNegativeInteger} i - row index
* @param {NonNegativeInteger} j - column index
* @returns {Array<number>} element
*/
function upperElement( scale, i, j ) {
	if ( i === j ) {
		return [ scale + i, 0.0 ];
	}
	return [ 0.3 * ( i + 1 ) + ( 0.1 * j ), 0.2 * ( j - i ) - ( 0.05 * i ) ];
}

/**
* Builds Hermitian band storage.
*
* @private
* @param {string} order - storage layout
* @param {string} uplo - triangle
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} k - bandwidth
* @param {NonNegativeInteger} LD - leading dimension
* @param {number} scale - diagonal scale
* @returns {Complex128Array} band storage
*/
function band( order, uplo, N, k, LD, scale ) {
	let out;
	let idx;
	let v;
	let e;
	let r;
	let i;
	let j;
	if ( order === 'column-major' ) {
		out = new Complex128Array( LD * N );
	} else {
		out = new Complex128Array( LD * ( k + 1 ) );
	}
	v = reinterpret( out, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( uplo === 'upper' && i <= j && j - i <= k ) {
				r = k + i - j;
				e = upperElement( scale, i, j );
			} else if ( uplo === 'lower' && i >= j && i - j <= k ) {
				r = i - j;
				e = upperElement( scale, j, i );
				e = [ e[ 0 ], -e[ 1 ] ];
			} else {
				continue;
			}
			idx = ( order === 'column-major' ) ? r + ( j * LD ) : ( r * LD ) + j;
			v[ 2 * idx ] = e[ 0 ];
			v[ ( 2 * idx ) + 1 ] = e[ 1 ];
		}
	}
	return out;
}

/**
* Runs the wrapper and the ndarray interface on identical data and compares outputs.
*
* @private
* @param {string} order - storage layout
* @param {string} vect - job option
* @param {string} uplo - triangle
* @param {boolean} nullWork - whether to pass a `null` workspace to the wrapper
* @returns {Float64Array} diagonal computed by the wrapper
*/
function compare( order, vect, uplo, nullWork ) {
	const N = 6;
	const kd = 2;
	const s1 = ( order === 'column-major' );
	const LDAB = ( s1 ) ? kd + 1 : N;
	const LDQ = N;
	const AB1 = band( order, uplo, N, kd, LDAB, 5.0 );
	const AB2 = band( order, uplo, N, kd, LDAB, 5.0 );
	const d1 = new Float64Array( N );
	const d2 = new Float64Array( N );
	const e1 = new Float64Array( N - 1 );
	const e2 = new Float64Array( N - 1 );
	const Q1 = new Complex128Array( N * N );
	const Q2 = new Complex128Array( N * N );
	let i;
	if ( vect === 'update' ) {
		for ( i = 0; i < N; i++ ) {
			Q1.set( [ 1.0, 0.0 ], i * ( N + 1 ) );
			Q2.set( [ 1.0, 0.0 ], i * ( N + 1 ) );
		}
	}
	const info1 = zhbtrd( order, vect, uplo, N, kd, AB1, LDAB, d1, 1, e1, 1, Q1, LDQ, ( nullWork ) ? null : new Complex128Array( N ) );
	const info2 = ndarray( vect, uplo, N, kd, AB2, ( s1 ) ? 1 : LDAB, ( s1 ) ? LDAB : 1, 0, d2, 1, 0, e2, 1, 0, Q2, ( s1 ) ? 1 : LDQ, ( s1 ) ? LDQ : 1, 0, new Complex128Array( N ), 1, 0 );
	assert.strictEqual( info1, 0, 'info' );
	assert.strictEqual( info1, info2, 'info matches' );
	assert.deepStrictEqual( d1, d2, 'd' );
	assert.deepStrictEqual( e1, e2, 'e' );
	assert.deepStrictEqual( reinterpret( Q1, 0 ), reinterpret( Q2, 0 ), 'Q' );
	assert.deepStrictEqual( reinterpret( AB1, 0 ), reinterpret( AB2, 0 ), 'AB' );
	return d1;
}

/**
* Returns a wrapper invocation with one argument replaced.
*
* @private
* @param {string} order - storage layout
* @param {NonNegativeInteger} idx - argument index
* @param {*} value - replacement value
* @returns {Function} function which invokes the wrapper
*/
function callWith( order, idx, value ) {
	return function call() {
		const args = [ order, 'initialize', 'upper', 3, 2, new Complex128Array( 9 ), 3, new Float64Array( 3 ), 1, new Float64Array( 2 ), 1, new Complex128Array( 9 ), 3, null ];
		args[ idx ] = value;
		zhbtrd.apply( null, args );
	};
}


// TESTS //

test( 'zhbtrd is a function', function t() {
	assert.strictEqual( typeof zhbtrd, 'function', 'is a function' );
});

test( 'zhbtrd has expected arity', function t() {
	assert.strictEqual( zhbtrd.length, 14, 'has expected arity' );
});

test( 'zhbtrd: valid baseline arguments do not throw', function t() {
	assert.doesNotThrow( callWith( 'column-major', 0, 'column-major' ) );
	assert.doesNotThrow( callWith( 'row-major', 0, 'row-major' ) );
});

test( 'zhbtrd throws TypeError for invalid order', function t() {
	assert.throws( callWith( 'column-major', 0, 'invalid' ), TypeError );
});

test( 'zhbtrd throws TypeError for invalid vect', function t() {
	assert.throws( callWith( 'column-major', 1, 'invalid' ), TypeError );
});

test( 'zhbtrd throws TypeError for invalid uplo', function t() {
	assert.throws( callWith( 'column-major', 2, 'invalid' ), TypeError );
});

test( 'zhbtrd throws RangeError for negative N', function t() {
	assert.throws( callWith( 'column-major', 3, -1 ), RangeError );
});

test( 'zhbtrd throws RangeError for negative kd', function t() {
	assert.throws( callWith( 'column-major', 4, -1 ), RangeError );
});

test( 'zhbtrd throws RangeError for invalid LDAB', function t() {
	assert.throws( callWith( 'column-major', 6, 2 ), RangeError );
	assert.throws( callWith( 'row-major', 6, 2 ), RangeError );
});

test( 'zhbtrd throws RangeError for invalid LDQ', function t() {
	assert.throws( callWith( 'column-major', 12, 2 ), RangeError );
});

test( 'zhbtrd does not check LDQ when vect is none', function t() {
	const d = new Float64Array( 3 );
	assert.doesNotThrow( function call() {
		zhbtrd( 'column-major', 'none', 'upper', 3, 2, band( 'column-major', 'upper', 3, 2, 3, 5.0 ), 3, d, 1, new Float64Array( 2 ), 1, new Complex128Array( 1 ), 1, null );
	});
	assert.ok( d[ 0 ] !== 0.0, 'd computed' );
});

test( 'zhbtrd: column-major, initialize, upper matches ndarray (null workspace)', function t() {
	compare( 'column-major', 'initialize', 'upper', true );
});

test( 'zhbtrd: column-major, update, lower matches ndarray (provided workspace)', function t() {
	compare( 'column-major', 'update', 'lower', false );
});

test( 'zhbtrd: column-major, none, lower matches ndarray', function t() {
	compare( 'column-major', 'none', 'lower', true );
});

test( 'zhbtrd: row-major, initialize, upper matches ndarray (null workspace)', function t() {
	compare( 'row-major', 'initialize', 'upper', true );
});

test( 'zhbtrd: row-major, initialize, lower matches ndarray (provided workspace)', function t() {
	compare( 'row-major', 'initialize', 'lower', false );
});

test( 'zhbtrd: row-major and column-major give the same tridiagonal form', function t() {
	const a = compare( 'column-major', 'none', 'upper', true );
	const b = compare( 'row-major', 'none', 'upper', true );
	assert.deepStrictEqual( a, b, 'd' );
});
