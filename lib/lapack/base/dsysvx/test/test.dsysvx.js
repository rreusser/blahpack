/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsysvx from './../lib/dsysvx.js';
import { computeOptimalWorkSize } from './../lib/base.js';


// FUNCTIONS //

/**
* Returns a well-conditioned symmetric indefinite N-by-N matrix (column-major).
*
* @private
* @param {NonNegativeInteger} N - order
* @returns {Float64Array} matrix
*/
function indefinite( N ) {
	const A = new Float64Array( N * N );
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			A[ i + ( j * N ) ] = ( i === j ) ? ( ( i % 2 === 0 ) ? 4.0 : -4.0 ) : 1.0 / ( 1.0 + Math.abs( i - j ) );
		}
	}
	return A;
}


// TESTS //

test( 'dsysvx is a function', function t() {
	assert.strictEqual( typeof dsysvx, 'function', 'is a function' );
});

test( 'dsysvx has expected arity', function t() {
	assert.strictEqual( dsysvx.length, 22, 'has expected arity' );
});

test( 'dsysvx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsysvx( 'column-major', 2, 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dsysvx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsysvx( 'column-major', 'factored', 'upper', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dsysvx throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dsysvx( 'column-major', 'factored', 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dsysvx: computeOptimalWorkSize returns the reference LWKOPT (NB = ILAENV( 1, DSYTRF ) = 64)', function t() {
	assert.strictEqual( computeOptimalWorkSize( 'not-factored', 'upper', 0 ), 1, 'N = 0' );
	assert.strictEqual( computeOptimalWorkSize( 'not-factored', 'upper', 5 ), 320, 'not-factored, upper' );
	assert.strictEqual( computeOptimalWorkSize( 'not-factored', 'lower', 70 ), 4480, 'not-factored, lower' );
	assert.strictEqual( computeOptimalWorkSize( 'factored', 'upper', 5 ), 15, 'factored' );
});

test( 'dsysvx: a null WORK allocates the reference optimum, so dsytrf takes its NB = 64 blocked path, as with an explicit LWKOPT-length WORK', function t() {
	const N = 70;
	const nrhs = 2;
	let expected;
	let actual;

	expected = run( new Float64Array( N * 64 ) );
	actual = run( null );
	assert.deepStrictEqual( actual, expected, 'bit-identical to the explicit optimal WORK' );

	/**
	* Runs the wrapper on a fixed system with the given WORK.
	*
	* @private
	* @param {(Float64Array|null)} WORK - workspace
	* @returns {Object} outputs
	*/
	function run( WORK ) {
		const A = indefinite( N );
		const AF = new Float64Array( N * N );
		const IPIV = new Int32Array( N );
		const B = new Float64Array( N * nrhs );
		const X = new Float64Array( N * nrhs );
		const rcond = new Float64Array( 1 );
		const FERR = new Float64Array( nrhs );
		const BERR = new Float64Array( nrhs );
		const b = B;
		let info;
		let i;
		for ( i = 0; i < b.length; i++ ) {
			b[ i ] = ( ( i % 7 ) - 3 ) * 0.5;
		}
		info = dsysvx( 'column-major', 'not-factored', 'lower', N, nrhs, A, N, AF, N, IPIV, 1, B, N, X, N, rcond, FERR, 1, BERR, 1, WORK, new Int32Array( N ) );
		return {
			'info': info,
			'AF': Array.from( AF ),
			'IPIV': Array.from( IPIV ),
			'X': Array.from( X ),
			'rcond': rcond[ 0 ],
			'FERR': Array.from( FERR ),
			'BERR': Array.from( BERR )
		};
	}
});
