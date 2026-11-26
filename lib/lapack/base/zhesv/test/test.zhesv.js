/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhesv from './../lib/zhesv.js';
import { computeOptimalWorkSize } from './../lib/base.js';


// FUNCTIONS //

/**
* Returns a well-conditioned Hermitian indefinite N-by-N complex matrix (column-major).
*
* @private
* @param {NonNegativeInteger} N - order
* @returns {Complex128Array} matrix
*/
function indefinite( N ) {
	const A = new Complex128Array( N * N );
	const v = reinterpret( A, 0 );
	let k;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			k = 2 * ( i + ( j * N ) );
			v[ k ] = ( i === j ) ? ( ( i % 2 === 0 ) ? 4.0 : -4.0 ) : 1.0 / ( 1.0 + Math.abs( i - j ) );
			v[ k + 1 ] = ( i === j ) ? 0.0 : ( ( i < j ) ? 0.25 : -0.25 ) / ( 1.0 + Math.abs( i - j ) );
		}
	}
	return A;
}


// TESTS //

test( 'zhesv is a function', function t() {
	assert.strictEqual( typeof zhesv, 'function', 'is a function' );
});

test( 'zhesv has expected arity', function t() {
	assert.strictEqual( zhesv.length, 11, 'has expected arity' );
});

test( 'zhesv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhesv( 'column-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zhesv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhesv( 'column-major', 'upper', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zhesv throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zhesv( 'column-major', 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zhesv: computeOptimalWorkSize returns the reference LWKOPT (NB = ILAENV( 1, ZHETRF ) = 64)', function t() {
	assert.strictEqual( computeOptimalWorkSize( 'upper', 0 ), 1, 'N = 0' );
	assert.strictEqual( computeOptimalWorkSize( 'upper', 5 ), 320, 'upper' );
	assert.strictEqual( computeOptimalWorkSize( 'lower', 70 ), 4480, 'lower' );
});

test( 'zhesv: a null WORK allocates the reference optimum, so zhetrf takes its NB = 64 blocked path and the solve uses zhetrs2, as with an explicit LWKOPT-length WORK', function t() {
	const N = 70;
	const nrhs = 2;
	let expected;
	let actual;

	expected = run( new Complex128Array( N * 64 ) );
	actual = run( null );
	assert.deepStrictEqual( actual, expected, 'bit-identical to the explicit optimal WORK' );

	/**
	* Runs the wrapper on a fixed system with the given WORK.
	*
	* @private
	* @param {(Complex128Array|null)} WORK - workspace
	* @returns {Object} outputs
	*/
	function run( WORK ) {
		const A = indefinite( N );
		const IPIV = new Int32Array( N );
		const B = new Complex128Array( N * nrhs );
		const b = reinterpret( B, 0 );
		let info;
		let i;
		for ( i = 0; i < b.length; i++ ) {
			b[ i ] = ( ( i % 7 ) - 3 ) * 0.5;
		}
		info = zhesv( 'column-major', 'lower', N, nrhs, A, N, IPIV, 1, B, N, WORK );
		return {
			'info': info,
			'A': Array.from( reinterpret( A, 0 ) ),
			'IPIV': Array.from( IPIV ),
			'B': Array.from( b )
		};
	}
});
