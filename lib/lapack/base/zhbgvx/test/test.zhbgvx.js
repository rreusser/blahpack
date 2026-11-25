/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines, max-params */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ndarray from './../lib/ndarray.js';
import zhbgvx from './../lib/zhbgvx.js';


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
* @param {string} range - range option
* @param {string} uplo - triangle
* @param {boolean} nullWork - whether to pass `null` workspaces to the wrapper
* @returns {Object} wrapper results
*/
function compare( order, jobz, range, uplo, nullWork ) {
	const N = 5;
	const ka = 2;
	const kb = 1;
	const il = 2;
	const iu = 4;
	const vl = 0.0;
	const vu = 3.0;
	const s1 = ( order === 'column-major' );
	const LDAB = ( s1 ) ? ka + 1 : N;
	const LDBB = ( s1 ) ? kb + 1 : N;
	const LDQ = N;
	const LDZ = ( s1 ) ? N : ( ( range === 'index' ) ? iu - il + 1 : N );
	const AB1 = band( order, uplo, N, ka, LDAB, 10.0 );
	const BB1 = band( order, uplo, N, kb, LDBB, 4.0 );
	const AB2 = band( order, uplo, N, ka, LDAB, 10.0 );
	const BB2 = band( order, uplo, N, kb, LDBB, 4.0 );
	const Q1 = new Complex128Array( N * N );
	const Q2 = new Complex128Array( N * N );
	const Z1 = new Complex128Array( N * N );
	const Z2 = new Complex128Array( N * N );
	const w1 = new Float64Array( N );
	const w2 = new Float64Array( N );
	const m1 = new Int32Array( 1 );
	const m2 = new Int32Array( 1 );
	const IF1 = new Int32Array( N );
	const IF2 = new Int32Array( N );
	const info1 = zhbgvx( order, jobz, range, uplo, N, ka, kb, AB1, LDAB, BB1, LDBB, Q1, LDQ, vl, vu, il, iu, 0.0, m1, w1, 1, Z1, LDZ, ( nullWork ) ? null : new Complex128Array( N ), ( nullWork ) ? null : new Float64Array( 7 * N ), ( nullWork ) ? null : new Int32Array( 5 * N ), IF1, 1 );
	const info2 = ndarray( jobz, range, uplo, N, ka, kb, AB2, ( s1 ) ? 1 : LDAB, ( s1 ) ? LDAB : 1, 0, BB2, ( s1 ) ? 1 : LDBB, ( s1 ) ? LDBB : 1, 0, Q2, ( s1 ) ? 1 : LDQ, ( s1 ) ? LDQ : 1, 0, vl, vu, il, iu, 0.0, m2, w2, 1, 0, Z2, ( s1 ) ? 1 : LDZ, ( s1 ) ? LDZ : 1, 0, new Complex128Array( N ), 1, 0, new Float64Array( 7 * N ), 1, 0, new Int32Array( 5 * N ), 1, 0, IF2, 1, 0 );
	assert.strictEqual( info1, 0, 'info' );
	assert.strictEqual( info1, info2, 'info matches' );
	assert.strictEqual( m1[ 0 ], m2[ 0 ], 'M' );
	assert.deepStrictEqual( w1, w2, 'w' );
	assert.deepStrictEqual( reinterpret( Z1, 0 ), reinterpret( Z2, 0 ), 'Z' );
	assert.deepStrictEqual( reinterpret( Q1, 0 ), reinterpret( Q2, 0 ), 'Q' );
	assert.deepStrictEqual( IF1, IF2, 'IFAIL' );
	assert.deepStrictEqual( reinterpret( AB1, 0 ), reinterpret( AB2, 0 ), 'AB' );
	assert.deepStrictEqual( reinterpret( BB1, 0 ), reinterpret( BB2, 0 ), 'BB' );
	return {
		'M': m1[ 0 ],
		'w': w1
	};
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
		const args = [ order, 'compute-vectors', 'index', 'upper', 3, 2, 1, new Complex128Array( 9 ), 3, new Complex128Array( 9 ), ( order === 'column-major' ) ? 2 : 3, new Complex128Array( 9 ), 3, 0.0, 1.0, 1, 2, 0.0, new Int32Array( 1 ), new Float64Array( 3 ), 1, new Complex128Array( 9 ), 3, null, null, null, new Int32Array( 3 ), 1 ];
		args[ idx ] = value;
		zhbgvx.apply( null, args );
	};
}


// TESTS //

test( 'zhbgvx is a function', function t() {
	assert.strictEqual( typeof zhbgvx, 'function', 'is a function' );
});

test( 'zhbgvx has expected arity', function t() {
	assert.strictEqual( zhbgvx.length, 28, 'has expected arity' );
});

test( 'zhbgvx: valid baseline arguments do not throw', function t() {
	assert.doesNotThrow( callWith( 'column-major', 0, 'column-major' ) );
	assert.doesNotThrow( callWith( 'row-major', 0, 'row-major' ) );
});

test( 'zhbgvx throws TypeError for invalid order', function t() {
	assert.throws( callWith( 'column-major', 0, 'invalid' ), TypeError );
});

test( 'zhbgvx throws TypeError for invalid jobz', function t() {
	assert.throws( callWith( 'column-major', 1, 'invalid' ), TypeError );
});

test( 'zhbgvx throws TypeError for invalid range', function t() {
	assert.throws( callWith( 'column-major', 2, 'invalid' ), TypeError );
});

test( 'zhbgvx throws TypeError for invalid uplo', function t() {
	assert.throws( callWith( 'column-major', 3, 'invalid' ), TypeError );
});

test( 'zhbgvx throws RangeError for negative N', function t() {
	assert.throws( callWith( 'column-major', 4, -1 ), RangeError );
});

test( 'zhbgvx throws RangeError for negative ka', function t() {
	assert.throws( callWith( 'column-major', 5, -1 ), RangeError );
});

test( 'zhbgvx throws RangeError for invalid kb', function t() {
	assert.throws( callWith( 'column-major', 6, -1 ), RangeError );
	assert.throws( callWith( 'column-major', 6, 3 ), RangeError );
});

test( 'zhbgvx throws RangeError for invalid LDAB', function t() {
	assert.throws( callWith( 'column-major', 8, 2 ), RangeError );
	assert.throws( callWith( 'row-major', 8, 2 ), RangeError );
});

test( 'zhbgvx throws RangeError for invalid LDBB', function t() {
	assert.throws( callWith( 'column-major', 10, 1 ), RangeError );
	assert.throws( callWith( 'row-major', 10, 2 ), RangeError );
});

test( 'zhbgvx throws RangeError for invalid LDQ', function t() {
	assert.throws( callWith( 'column-major', 12, 0 ), RangeError );
	assert.throws( callWith( 'column-major', 12, 2 ), RangeError );
});

test( 'zhbgvx throws RangeError for invalid vu (range=value)', function t() {
	const f = function call() {
		zhbgvx( 'column-major', 'compute-vectors', 'value', 'upper', 3, 2, 1, new Complex128Array( 9 ), 3, new Complex128Array( 9 ), 2, new Complex128Array( 9 ), 3, 1.0, 1.0, 1, 2, 0.0, new Int32Array( 1 ), new Float64Array( 3 ), 1, new Complex128Array( 9 ), 3, null, null, null, new Int32Array( 3 ), 1 );
	};
	assert.throws( f, RangeError );
});

test( 'zhbgvx throws RangeError for invalid il', function t() {
	assert.throws( callWith( 'column-major', 15, 0 ), RangeError );
	assert.throws( callWith( 'column-major', 15, 4 ), RangeError );
});

test( 'zhbgvx throws RangeError for invalid iu', function t() {
	assert.throws( callWith( 'column-major', 16, 0 ), RangeError );
	assert.throws( callWith( 'column-major', 16, 4 ), RangeError );
});

test( 'zhbgvx throws RangeError for invalid LDZ', function t() {
	assert.throws( callWith( 'column-major', 22, 0 ), RangeError );
	assert.throws( callWith( 'column-major', 22, 2 ), RangeError );
	assert.throws( callWith( 'row-major', 22, 0 ), RangeError );
	assert.throws( callWith( 'row-major', 22, 1 ), RangeError );
});

test( 'zhbgvx: column-major, compute-vectors, all, upper matches ndarray (null workspace)', function t() {
	const r = compare( 'column-major', 'compute-vectors', 'all', 'upper', true );
	assert.strictEqual( r.M, 5, 'M' );
});

test( 'zhbgvx: column-major, compute-vectors, index, lower matches ndarray (provided workspace)', function t() {
	const r = compare( 'column-major', 'compute-vectors', 'index', 'lower', false );
	assert.strictEqual( r.M, 3, 'M' );
});

test( 'zhbgvx: column-major, no-vectors, value, upper matches ndarray', function t() {
	compare( 'column-major', 'no-vectors', 'value', 'upper', true );
});

test( 'zhbgvx: row-major, compute-vectors, all, upper matches ndarray (null workspace)', function t() {
	const r = compare( 'row-major', 'compute-vectors', 'all', 'upper', true );
	assert.strictEqual( r.M, 5, 'M' );
});

test( 'zhbgvx: row-major, compute-vectors, index, lower matches ndarray (provided workspace)', function t() {
	const r = compare( 'row-major', 'compute-vectors', 'index', 'lower', false );
	assert.strictEqual( r.M, 3, 'M' );
});

test( 'zhbgvx: row-major and column-major give the same eigenvalues', function t() {
	const a = compare( 'column-major', 'no-vectors', 'all', 'lower', true );
	const b = compare( 'row-major', 'no-vectors', 'all', 'lower', true );
	assert.strictEqual( a.M, b.M, 'M' );
	for ( let i = 0; i < a.M; i++ ) {
		assert.ok( Math.abs( a.w[ i ] - b.w[ i ] ) <= 1e-12 * Math.abs( a.w[ i ] ), 'w[' + i + ']' );
	}
});
