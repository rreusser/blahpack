/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhesvx from './../lib/zhesvx.js';
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

test( 'zhesvx is a function', function t() {
	assert.strictEqual( typeof zhesvx, 'function', 'is a function' );
});

test( 'zhesvx has expected arity', function t() {
	assert.strictEqual( zhesvx.length, 22, 'has expected arity' );
});

test( 'zhesvx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhesvx( 'column-major', 2, 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zhesvx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhesvx( 'column-major', 'factored', 'upper', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zhesvx throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zhesvx( 'column-major', 'factored', 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zhesvx allocates WORK and RWORK when they are null and solves A*X = B', function t() {
	// A = [ 4 1; 1 3 ] (Hermitian, symmetric and positive definite), B = A*[ 1; 2 ].
	const A = new Complex128Array( [ 4.0, 0.0, 1.0, 0.0, 1.0, 0.0, 3.0, 0.0 ] );
	const B = new Complex128Array( [ 6.0, 0.0, 7.0, 0.0 ] );
	const X = new Complex128Array( 2 );
	const rcond = new Float64Array( 1 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const xv = reinterpret( X, 0 );
	let info;
	let i;
	info = zhesvx( 'column-major', 'not-factored', 'upper', 2, 1, A, 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, B, 2, X, 2, rcond, FERR, 1, BERR, 1, null, null );
	assert.strictEqual( info, 0, 'info' );
	assert.ok( rcond[ 0 ] > 0.1, 'rcond: ' + rcond[ 0 ] );
	for ( i = 0; i < 4; i++ ) {
		assert.ok( Math.abs( xv[ i ] - [ 1.0, 0.0, 2.0, 0.0 ][ i ] ) <= 1e-14, 'X[' + i + ']: ' + xv[ i ] );
	}
	assert.ok( FERR[ 0 ] >= 0.0 && FERR[ 0 ] < 1e-12, 'FERR: ' + FERR[ 0 ] );
	assert.ok( BERR[ 0 ] >= 0.0 && BERR[ 0 ] <= 4.0 * 1.1102230246251565e-16, 'BERR: ' + BERR[ 0 ] );
});

test( 'zhesvx: computeOptimalWorkSize returns the reference LWKOPT (NB = ILAENV( 1, ZHETRF ) = 64)', function t() {
	assert.strictEqual( computeOptimalWorkSize( 'not-factored', 'upper', 0 ), 1, 'N = 0' );
	assert.strictEqual( computeOptimalWorkSize( 'not-factored', 'upper', 5 ), 320, 'not-factored, upper' );
	assert.strictEqual( computeOptimalWorkSize( 'not-factored', 'lower', 70 ), 4480, 'not-factored, lower' );
	assert.strictEqual( computeOptimalWorkSize( 'factored', 'upper', 5 ), 10, 'factored' );
});

test( 'zhesvx: a null WORK allocates the reference optimum, so zhetrf takes its NB = 64 blocked path, as with an explicit LWKOPT-length WORK', function t() {
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
		const AF = new Complex128Array( N * N );
		const IPIV = new Int32Array( N );
		const B = new Complex128Array( N * nrhs );
		const X = new Complex128Array( N * nrhs );
		const rcond = new Float64Array( 1 );
		const FERR = new Float64Array( nrhs );
		const BERR = new Float64Array( nrhs );
		const b = reinterpret( B, 0 );
		let info;
		let i;
		for ( i = 0; i < b.length; i++ ) {
			b[ i ] = ( ( i % 7 ) - 3 ) * 0.5;
		}
		info = zhesvx( 'column-major', 'not-factored', 'lower', N, nrhs, A, N, AF, N, IPIV, 1, B, N, X, N, rcond, FERR, 1, BERR, 1, WORK, new Float64Array( N ) );
		return {
			'info': info,
			'AF': Array.from( reinterpret( AF, 0 ) ),
			'IPIV': Array.from( IPIV ),
			'X': Array.from( reinterpret( X, 0 ) ),
			'rcond': rcond[ 0 ],
			'FERR': Array.from( FERR ),
			'BERR': Array.from( BERR )
		};
	}
});
