/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlansfIndex from './../lib/index.js';
import zlansf from './../lib/ndarray.js';
import ztrttf from './../../ztrttf/lib/ndarray.js';


// VARIABLES //

const NORMS = [ 'max', 'one-norm', 'inf-norm', 'frobenius' ];


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zlansfIndex, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zlansfIndex.ndarray, 'function', 'has ndarray method' );
});

/**
* Returns `|a(i,j)|` of a test complex symmetric matrix.
*
* @private
* @param {integer} i - row index
* @param {integer} j - column index
* @returns {Array} real and imaginary parts
*/
function entry( i, j ) {
	const p = Math.min( i, j );
	const q = Math.max( i, j );
	return [ 1.0 + p - ( 0.5 * q ) + ( 0.125 * p * q ), ( 0.25 * q ) - ( 0.75 * p ) + ( ( p === q ) ? 0.5 : 0.0 ) ];
}

test( 'zlansf: matches the dense norms of a complex symmetric matrix for every RFP layout', function t() {
	let expected;
	let colsum;
	let ARF;
	let WORK;
	let norm;
	let full;
	let Fv;
	let tr;
	let up;
	let nm;
	let N;
	let e;
	let a;
	let i;
	let j;

	for ( N = 2; N <= 7; N++ ) {
		full = new Complex128Array( N * N );
		Fv = reinterpret( full, 0 );
		expected = {
			'max': 0.0,
			'one-norm': 0.0,
			'inf-norm': 0.0,
			'frobenius': 0.0
		};
		for ( j = 0; j < N; j++ ) {
			colsum = 0.0;
			for ( i = 0; i < N; i++ ) {
				e = entry( i, j );
				Fv[ ( ( j * N ) + i ) * 2 ] = e[ 0 ];
				Fv[ ( ( ( j * N ) + i ) * 2 ) + 1 ] = e[ 1 ];
				a = Math.sqrt( ( e[ 0 ] * e[ 0 ] ) + ( e[ 1 ] * e[ 1 ] ) );
				colsum += a;
				expected.max = Math.max( expected.max, a );
				expected.frobenius += a * a;
			}
			expected[ 'one-norm' ] = Math.max( expected[ 'one-norm' ], colsum );
		}
		expected[ 'inf-norm' ] = expected[ 'one-norm' ];
		expected.frobenius = Math.sqrt( expected.frobenius );
		for ( tr = 0; tr < 2; tr++ ) {
			for ( up = 0; up < 2; up++ ) {
				ARF = new Complex128Array( ( N * ( N + 1 ) ) / 2 );
				ztrttf( ( tr ) ? 'conjugate-transpose' : 'no-transpose', ( up ) ? 'upper' : 'lower', N, full, 1, N, 0, ARF, 1, 0 );
				for ( nm = 0; nm < NORMS.length; nm++ ) {
					norm = NORMS[ nm ];
					WORK = new Float64Array( N );
					a = zlansf( norm, ( tr ) ? 'conjugate-transpose' : 'no-transpose', ( up ) ? 'upper' : 'lower', N, ARF, 1, 0, WORK, 1, 0 );
					assert.ok( Math.abs( a - expected[ norm ] ) <= 1e-13 * expected[ norm ], 'N=' + N + ' transr=' + tr + ' upper=' + up + ' ' + norm + ': expected ' + expected[ norm ] + ', got ' + a );
				}
			}
		}
	}
});
