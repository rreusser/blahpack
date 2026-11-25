/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zpbstf from './../lib/zpbstf.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ndarray from './../lib/ndarray.js';


// TESTS //

test( 'zpbstf is a function', function t() {
	assert.strictEqual( typeof zpbstf, 'function', 'is a function' );
});

test( 'zpbstf has expected arity', function t() {
	assert.strictEqual( zpbstf.length, 6, 'has expected arity' );
});

test( 'zpbstf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zpbstf( 'invalid', 'upper', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zpbstf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zpbstf( 'row-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zpbstf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zpbstf( 'row-major', 'upper', -1, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zpbstf throws RangeError for negative kd', function t() {
	assert.throws( function throws() {
		zpbstf( 'column-major', 'upper', 3, -1, new Complex128Array( 9 ), 2 );
	}, RangeError );
});

test( 'zpbstf throws RangeError for LDAB too small (column-major)', function t() {
	assert.throws( function throws() {
		zpbstf( 'column-major', 'upper', 3, 2, new Complex128Array( 9 ), 2 );
	}, RangeError );
});

test( 'zpbstf throws RangeError for LDAB too small (row-major)', function t() {
	assert.throws( function throws() {
		zpbstf( 'row-major', 'upper', 3, 1, new Complex128Array( 9 ), 2 );
	}, RangeError );
});

/**
* Returns the (real, imaginary) band entry at band row `r`, column `j` of a diagonally dominant Hermitian band matrix.
*
* @private
* @param {string} uplo - triangle
* @param {NonNegativeInteger} kd - number of off-diagonals
* @param {NonNegativeInteger} r - band row
* @param {NonNegativeInteger} j - column
* @returns {Array} entry
*/
function band( uplo, kd, r, j ) {
	const d = ( uplo === 'upper' ) ? kd - r : r;
	if ( d === 0 ) {
		return [ 10.0 + j, 0.0 ];
	}
	return [ 1.0 / ( d + 1 + ( 0.5 * j ) ), ( 0.25 * d ) - ( 0.1 * j ) ];
}

/**
* Builds band storage `AB` holding a well-conditioned positive definite band matrix.
*
* @private
* @param {string} order - storage layout
* @param {string} uplo - triangle
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} kd - number of off-diagonals
* @param {PositiveInteger} LDAB - leading dimension
* @returns {Object} band storage and the linear index of every band entry `(r,j)`, in `r + j*(kd+1)` order
*/
function build( order, uplo, N, kd, LDAB ) {
	const n = ( order === 'column-major' ) ? LDAB * N : ( kd + 1 ) * LDAB;
	const AB = new Complex128Array( n );
	const view = reinterpret( AB, 0 );
	const offsets = [];
	let idx;
	let v;
	let r;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( r = 0; r <= kd; r++ ) {
			offsets.push( ( order === 'column-major' ) ? r + ( j * LDAB ) : ( r * LDAB ) + j );
			if ( ( uplo === 'upper' && r < kd - j ) || ( uplo === 'lower' && r >= N - j ) ) {
				continue; // unused corner of band storage
			}
			v = band( uplo, kd, r, j );
			idx = 2 * offsets[ offsets.length - 1 ];
			view[ idx ] = v[ 0 ];
			view[ idx + 1 ] = v[ 1 ];
		}
	}
	return {
		'AB': AB,
		'offsets': offsets
	};
}

/**
* Runs the wrapper and `ndarray` on the same data and returns the wrapper output in canonical `(r,j)` order.
*
* @private
* @param {string} order - storage layout
* @param {string} uplo - triangle
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} kd - number of off-diagonals
* @param {PositiveInteger} LDAB - leading dimension
* @returns {Array} wrapper output in canonical order
*/
function run( order, uplo, N, kd, LDAB ) {
	const a = build( order, uplo, N, kd, LDAB );
	const b = build( order, uplo, N, kd, LDAB );
	const s1 = ( order === 'column-major' ) ? 1 : LDAB;
	const s2 = ( order === 'column-major' ) ? LDAB : 1;
	const info1 = zpbstf( order, uplo, N, kd, a.AB, LDAB );
	const info2 = ndarray( uplo, N, kd, b.AB, s1, s2, 0 );
	const x = reinterpret( a.AB, 0 );
	const y = reinterpret( b.AB, 0 );
	const out = [];
	let i;
	assert.strictEqual( info1, 0, 'info' );
	assert.strictEqual( info1, info2, 'info matches ndarray' );
	for ( i = 0; i < x.length; i++ ) {
		assert.strictEqual( x[ i ], y[ i ], order + ' ' + uplo + ' AB[' + i + ']' );
	}
	for ( i = 0; i < a.offsets.length; i++ ) {
		out.push( x[ 2 * a.offsets[ i ] ] );
		out.push( x[ ( 2 * a.offsets[ i ] ) + 1 ] );
	}
	return out;
}

test( 'zpbstf matches ndarray in both layouts and is layout invariant', function t() {
	const uplos = [ 'upper', 'lower' ];
	const N = 6;
	const kd = 2;
	let colMajor;
	let colPad;
	let rowMajor;
	let i;
	let k;
	for ( k = 0; k < uplos.length; k++ ) {
		colMajor = run( 'column-major', uplos[ k ], N, kd, kd + 1 );
		colPad = run( 'column-major', uplos[ k ], N, kd, kd + 3 );
		rowMajor = run( 'row-major', uplos[ k ], N, kd, N + 1 );
		for ( i = 0; i < colMajor.length; i++ ) {
			assert.strictEqual( colPad[ i ], colMajor[ i ], uplos[ k ] + ' padded LDAB entry ' + i );
			assert.strictEqual( rowMajor[ i ], colMajor[ i ], uplos[ k ] + ' row-major entry ' + i );
		}
	}
});
