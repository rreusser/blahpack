/* eslint-disable no-restricted-syntax, max-lines, max-params */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ndarray from './../lib/ndarray.js';
import zhbgv from './../lib/zhbgv.js';


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
* @param {string} jobz - job option
* @param {string} uplo - triangle
* @param {boolean} nullWork - whether to pass `null` workspaces to the wrapper
*/
function compare( order, jobz, uplo, nullWork ) {
	const N = 5;
	const ka = 2;
	const kb = 1;
	const LDAB = ( order === 'column-major' ) ? ka + 1 : N;
	const LDBB = ( order === 'column-major' ) ? kb + 1 : N;
	const LDZ = N;
	const AB1 = band( order, uplo, N, ka, LDAB, 10.0 );
	const BB1 = band( order, uplo, N, kb, LDBB, 4.0 );
	const AB2 = band( order, uplo, N, ka, LDAB, 10.0 );
	const BB2 = band( order, uplo, N, kb, LDBB, 4.0 );
	const w1 = new Float64Array( N );
	const w2 = new Float64Array( N );
	const Z1 = new Complex128Array( LDZ * N );
	const Z2 = new Complex128Array( LDZ * N );
	const s1 = ( order === 'column-major' );
	const info1 = zhbgv( order, jobz, uplo, N, ka, kb, AB1, LDAB, BB1, LDBB, w1, 1, Z1, LDZ, ( nullWork ) ? null : new Complex128Array( N ), ( nullWork ) ? null : new Float64Array( 3 * N ) );
	const info2 = ndarray( jobz, uplo, N, ka, kb, AB2, ( s1 ) ? 1 : LDAB, ( s1 ) ? LDAB : 1, 0, BB2, ( s1 ) ? 1 : LDBB, ( s1 ) ? LDBB : 1, 0, w2, 1, 0, Z2, ( s1 ) ? 1 : LDZ, ( s1 ) ? LDZ : 1, 0, new Complex128Array( N ), 1, 0, new Float64Array( 3 * N ), 1, 0 );
	assert.strictEqual( info1, 0, 'info' );
	assert.strictEqual( info1, info2, 'info matches' );
	assert.deepStrictEqual( w1, w2, 'w' );
	assert.deepStrictEqual( reinterpret( Z1, 0 ), reinterpret( Z2, 0 ), 'Z' );
	assert.deepStrictEqual( reinterpret( AB1, 0 ), reinterpret( AB2, 0 ), 'AB' );
	assert.deepStrictEqual( reinterpret( BB1, 0 ), reinterpret( BB2, 0 ), 'BB' );

	// Eigenvalues are real and returned in ascending order:
	for ( let i = 1; i < N; i++ ) {
		assert.ok( w1[ i ] >= w1[ i - 1 ], 'ascending' );
	}
}

/**
* Returns a wrapper invocation with one argument replaced.
*
* @private
* @param {NonNegativeInteger} idx - argument index
* @param {*} value - replacement value
* @returns {Function} function which invokes the wrapper
*/
function callWith( idx, value ) {
	return function call() {
		const args = [ 'column-major', 'compute-vectors', 'upper', 3, 2, 1, new Complex128Array( 9 ), 3, new Complex128Array( 6 ), 2, new Float64Array( 3 ), 1, new Complex128Array( 9 ), 3, null, null ];
		args[ idx ] = value;
		zhbgv.apply( null, args );
	};
}


// TESTS //

test( 'zhbgv is a function', function t() {
	assert.strictEqual( typeof zhbgv, 'function', 'is a function' );
});

test( 'zhbgv has expected arity', function t() {
	assert.strictEqual( zhbgv.length, 16, 'has expected arity' );
});

test( 'zhbgv: valid baseline arguments do not throw', function t() {
	assert.doesNotThrow( callWith( 0, 'column-major' ) );
});

test( 'zhbgv throws TypeError for invalid order', function t() {
	assert.throws( callWith( 0, 'invalid' ), TypeError );
});

test( 'zhbgv throws TypeError for invalid jobz', function t() {
	assert.throws( callWith( 1, 'invalid' ), TypeError );
});

test( 'zhbgv throws TypeError for invalid uplo', function t() {
	assert.throws( callWith( 2, 'invalid' ), TypeError );
});

test( 'zhbgv throws RangeError for negative N', function t() {
	assert.throws( callWith( 3, -1 ), RangeError );
});

test( 'zhbgv throws RangeError for negative ka', function t() {
	assert.throws( callWith( 4, -1 ), RangeError );
});

test( 'zhbgv throws RangeError for invalid kb', function t() {
	assert.throws( callWith( 5, -1 ), RangeError );
	assert.throws( callWith( 5, 3 ), RangeError );
});

test( 'zhbgv throws RangeError for invalid LDAB', function t() {
	assert.throws( callWith( 7, 2 ), RangeError );
	assert.throws( function throws() {
		zhbgv( 'row-major', 'compute-vectors', 'upper', 3, 2, 1, new Complex128Array( 9 ), 2, new Complex128Array( 6 ), 3, new Float64Array( 3 ), 1, new Complex128Array( 9 ), 3, null, null );
	}, RangeError );
});

test( 'zhbgv throws RangeError for invalid LDBB', function t() {
	assert.throws( callWith( 9, 1 ), RangeError );
	assert.throws( function throws() {
		zhbgv( 'row-major', 'compute-vectors', 'upper', 3, 2, 1, new Complex128Array( 9 ), 3, new Complex128Array( 6 ), 2, new Float64Array( 3 ), 1, new Complex128Array( 9 ), 3, null, null );
	}, RangeError );
});

test( 'zhbgv throws RangeError for invalid LDZ', function t() {
	assert.throws( callWith( 13, 0 ), RangeError );
	assert.throws( callWith( 13, 2 ), RangeError );
});

test( 'zhbgv: column-major, compute-vectors, upper matches ndarray (null workspace)', function t() {
	compare( 'column-major', 'compute-vectors', 'upper', true );
});

test( 'zhbgv: column-major, compute-vectors, lower matches ndarray (provided workspace)', function t() {
	compare( 'column-major', 'compute-vectors', 'lower', false );
});

test( 'zhbgv: column-major, no-vectors, upper matches ndarray', function t() {
	compare( 'column-major', 'no-vectors', 'upper', true );
});

test( 'zhbgv: row-major, compute-vectors, upper matches ndarray (null workspace)', function t() {
	compare( 'row-major', 'compute-vectors', 'upper', true );
});

test( 'zhbgv: row-major, compute-vectors, lower matches ndarray (provided workspace)', function t() {
	compare( 'row-major', 'compute-vectors', 'lower', false );
});

test( 'zhbgv: row-major and column-major give the same eigenvalues', function t() {
	const w1 = new Float64Array( 5 );
	const w2 = new Float64Array( 5 );
	zhbgv( 'column-major', 'no-vectors', 'lower', 5, 2, 1, band( 'column-major', 'lower', 5, 2, 3, 10.0 ), 3, band( 'column-major', 'lower', 5, 1, 2, 4.0 ), 2, w1, 1, new Complex128Array( 25 ), 5, null, null );
	zhbgv( 'row-major', 'no-vectors', 'lower', 5, 2, 1, band( 'row-major', 'lower', 5, 2, 5, 10.0 ), 5, band( 'row-major', 'lower', 5, 1, 5, 4.0 ), 5, w2, 1, new Complex128Array( 25 ), 5, null, null );
	assert.deepStrictEqual( w1, w2, 'w' );
});
