/* eslint-disable no-restricted-syntax */

/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztftri from './../lib/strided.js';
import ztrttf from './../../ztrttf/lib/strided.js';
import ztfttr from './../../ztfttr/lib/strided.js';
import ztrtri from './../../ztrtri/lib/strided.js';

// FIXTURES //

import lower_odd_normal_nonunit from './fixtures/lower_odd_normal_nonunit.json' with { type: 'json' };
import upper_odd_normal_nonunit from './fixtures/upper_odd_normal_nonunit.json' with { type: 'json' };
import lower_odd_conjtrans_nonunit from './fixtures/lower_odd_conjtrans_nonunit.json' with { type: 'json' };
import upper_odd_conjtrans_nonunit from './fixtures/upper_odd_conjtrans_nonunit.json' with { type: 'json' };
import lower_even_normal_nonunit from './fixtures/lower_even_normal_nonunit.json' with { type: 'json' };
import upper_even_normal_nonunit from './fixtures/upper_even_normal_nonunit.json' with { type: 'json' };
import lower_even_conjtrans_nonunit from './fixtures/lower_even_conjtrans_nonunit.json' with { type: 'json' };
import upper_even_conjtrans_nonunit from './fixtures/upper_even_conjtrans_nonunit.json' with { type: 'json' };
import lower_odd_normal_unit from './fixtures/lower_odd_normal_unit.json' with { type: 'json' };
import upper_odd_normal_unit from './fixtures/upper_odd_normal_unit.json' with { type: 'json' };
import lower_even_normal_unit from './fixtures/lower_even_normal_unit.json' with { type: 'json' };
import upper_even_normal_unit from './fixtures/upper_even_normal_unit.json' with { type: 'json' };
import lower_odd_conjtrans_unit from './fixtures/lower_odd_conjtrans_unit.json' with { type: 'json' };
import upper_odd_conjtrans_unit from './fixtures/upper_odd_conjtrans_unit.json' with { type: 'json' };
import lower_even_conjtrans_unit from './fixtures/lower_even_conjtrans_unit.json' with { type: 'json' };
import upper_even_conjtrans_unit from './fixtures/upper_even_conjtrans_unit.json' with { type: 'json' };
import lower_5_normal_nonunit from './fixtures/lower_5_normal_nonunit.json' with { type: 'json' };
import upper_5_conjtrans_nonunit from './fixtures/upper_5_conjtrans_nonunit.json' with { type: 'json' };
import upper_5_normal_nonunit from './fixtures/upper_5_normal_nonunit.json' with { type: 'json' };
import lower_5_conjtrans_nonunit from './fixtures/lower_5_conjtrans_nonunit.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Constructs the Complex128Array from fixture input data.
*
* @private
* @param {*} tc - test case
* @returns {*} result
*/
function makeInput( tc ) {
	return new Complex128Array( tc.input );
}

// TESTS //

test( 'ztftri: lower_odd_normal_nonunit (N=3, TRANSR=N, UPLO=L, DIAG=N)', function t() { // eslint-disable-line max-len

	const tc = lower_odd_normal_nonunit;
	const A = makeInput( tc );
	const info = ztftri( 'no-transpose', 'lower', 'non-unit', 3, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-12, 'a' );
});

test( 'ztftri: upper_odd_normal_nonunit (N=3, TRANSR=N, UPLO=U, DIAG=N)', function t() { // eslint-disable-line max-len

	const tc = upper_odd_normal_nonunit;
	const A = makeInput( tc );
	const info = ztftri( 'no-transpose', 'upper', 'non-unit', 3, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-12, 'a' );
});

test( 'ztftri: lower_odd_conjtrans_nonunit (N=3, TRANSR=C, UPLO=L, DIAG=N)', function t() { // eslint-disable-line max-len

	const tc = lower_odd_conjtrans_nonunit;
	const A = makeInput( tc );
	const info = ztftri( 'conjugate-transpose', 'lower', 'non-unit', 3, A, 1, 0 ); // eslint-disable-line max-len
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-12, 'a' );
});

test( 'ztftri: upper_odd_conjtrans_nonunit (N=3, TRANSR=C, UPLO=U, DIAG=N)', function t() { // eslint-disable-line max-len

	const tc = upper_odd_conjtrans_nonunit;
	const A = makeInput( tc );
	const info = ztftri( 'conjugate-transpose', 'upper', 'non-unit', 3, A, 1, 0 ); // eslint-disable-line max-len
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-12, 'a' );
});

test( 'ztftri: lower_even_normal_nonunit (N=4, TRANSR=N, UPLO=L, DIAG=N)', function t() { // eslint-disable-line max-len

	const tc = lower_even_normal_nonunit;
	const A = makeInput( tc );
	const info = ztftri( 'no-transpose', 'lower', 'non-unit', 4, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-12, 'a' );
});

test( 'ztftri: upper_even_normal_nonunit (N=4, TRANSR=N, UPLO=U, DIAG=N)', function t() { // eslint-disable-line max-len

	const tc = upper_even_normal_nonunit;
	const A = makeInput( tc );
	const info = ztftri( 'no-transpose', 'upper', 'non-unit', 4, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-12, 'a' );
});

test( 'ztftri: lower_even_conjtrans_nonunit (N=4, TRANSR=C, UPLO=L, DIAG=N)', function t() { // eslint-disable-line max-len

	const tc = lower_even_conjtrans_nonunit;
	const A = makeInput( tc );
	const info = ztftri( 'conjugate-transpose', 'lower', 'non-unit', 4, A, 1, 0 ); // eslint-disable-line max-len
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-12, 'a' );
});

test( 'ztftri: upper_even_conjtrans_nonunit (N=4, TRANSR=C, UPLO=U, DIAG=N)', function t() { // eslint-disable-line max-len

	const tc = upper_even_conjtrans_nonunit;
	const A = makeInput( tc );
	const info = ztftri( 'conjugate-transpose', 'upper', 'non-unit', 4, A, 1, 0 ); // eslint-disable-line max-len
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-12, 'a' );
});

test( 'ztftri: lower_odd_normal_unit (N=3, TRANSR=N, UPLO=L, DIAG=U)', function t() { // eslint-disable-line max-len

	const tc = lower_odd_normal_unit;
	const A = makeInput( tc );
	const info = ztftri( 'no-transpose', 'lower', 'unit', 3, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-12, 'a' );
});

test( 'ztftri: upper_odd_normal_unit (N=3, TRANSR=N, UPLO=U, DIAG=U)', function t() { // eslint-disable-line max-len

	const tc = upper_odd_normal_unit;
	const A = makeInput( tc );
	const info = ztftri( 'no-transpose', 'upper', 'unit', 3, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-12, 'a' );
});

test( 'ztftri: lower_even_normal_unit (N=4, TRANSR=N, UPLO=L, DIAG=U)', function t() { // eslint-disable-line max-len

	const tc = lower_even_normal_unit;
	const A = makeInput( tc );
	const info = ztftri( 'no-transpose', 'lower', 'unit', 4, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-12, 'a' );
});

test( 'ztftri: upper_even_normal_unit (N=4, TRANSR=N, UPLO=U, DIAG=U)', function t() { // eslint-disable-line max-len

	const tc = upper_even_normal_unit;
	const A = makeInput( tc );
	const info = ztftri( 'no-transpose', 'upper', 'unit', 4, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-12, 'a' );
});

test( 'ztftri: lower_odd_conjtrans_unit (N=3, TRANSR=C, UPLO=L, DIAG=U)', function t() { // eslint-disable-line max-len

	const tc = lower_odd_conjtrans_unit;
	const A = makeInput( tc );
	const info = ztftri( 'conjugate-transpose', 'lower', 'unit', 3, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-12, 'a' );
});

test( 'ztftri: upper_odd_conjtrans_unit (N=3, TRANSR=C, UPLO=U, DIAG=U)', function t() { // eslint-disable-line max-len

	const tc = upper_odd_conjtrans_unit;
	const A = makeInput( tc );
	const info = ztftri( 'conjugate-transpose', 'upper', 'unit', 3, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-12, 'a' );
});

test( 'ztftri: lower_even_conjtrans_unit (N=4, TRANSR=C, UPLO=L, DIAG=U)', function t() { // eslint-disable-line max-len

	const tc = lower_even_conjtrans_unit;
	const A = makeInput( tc );
	const info = ztftri( 'conjugate-transpose', 'lower', 'unit', 4, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-12, 'a' );
});

test( 'ztftri: upper_even_conjtrans_unit (N=4, TRANSR=C, UPLO=U, DIAG=U)', function t() { // eslint-disable-line max-len

	const tc = upper_even_conjtrans_unit;
	const A = makeInput( tc );
	const info = ztftri( 'conjugate-transpose', 'upper', 'unit', 4, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-12, 'a' );
});

test( 'ztftri: lower_5_normal_nonunit (N=5, TRANSR=N, UPLO=L, DIAG=N)', function t() { // eslint-disable-line max-len

	const tc = lower_5_normal_nonunit;
	const A = makeInput( tc );
	const info = ztftri( 'no-transpose', 'lower', 'non-unit', 5, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-12, 'a' );
});

test( 'ztftri: upper_5_conjtrans_nonunit (N=5, TRANSR=C, UPLO=U, DIAG=N)', function t() { // eslint-disable-line max-len

	const tc = upper_5_conjtrans_nonunit;
	const A = makeInput( tc );
	const info = ztftri( 'conjugate-transpose', 'upper', 'non-unit', 5, A, 1, 0 ); // eslint-disable-line max-len
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-12, 'a' );
});

test( 'ztftri: upper_5_normal_nonunit (N=5, TRANSR=N, UPLO=U, DIAG=N)', function t() { // eslint-disable-line max-len

	const tc = upper_5_normal_nonunit;
	const A = makeInput( tc );
	const info = ztftri( 'no-transpose', 'upper', 'non-unit', 5, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-12, 'a' );
});

test( 'ztftri: lower_5_conjtrans_nonunit (N=5, TRANSR=C, UPLO=L, DIAG=N)', function t() { // eslint-disable-line max-len

	const tc = lower_5_conjtrans_nonunit;
	const A = makeInput( tc );
	const info = ztftri( 'conjugate-transpose', 'lower', 'non-unit', 5, A, 1, 0 ); // eslint-disable-line max-len
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-12, 'a' );
});

test( 'ztftri: n_zero', function t() {

	const A = new Complex128Array( 0 );
	const info = ztftri( 'no-transpose', 'lower', 'non-unit', 0, A, 1, 0 );
	assert.equal( info, 0 );
});

test( 'ztftri: n_one', function t() {

	const tc = n_one;
	const A = makeInput( tc );
	const info = ztftri( 'no-transpose', 'lower', 'non-unit', 1, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-12, 'a' );
});

test( 'ztftri: singular (INFO > 0)', function t() {

	const tc = singular;
	const A = makeInput( tc );
	const info = ztftri( 'no-transpose', 'lower', 'non-unit', 3, A, 1, 0 );
	assert.equal( info, tc.info );
});


// PROPERTY TESTS (all TRANSR x UPLO x DIAG x parity) //

/**
* Builds a well-conditioned dense column-major complex triangular matrix (opposite triangle zero).
*
* @private
* @param {string} uplo - triangle
* @param {NonNegativeInteger} N - order
* @returns {Complex128Array} dense matrix
*/
function denseTriangle( uplo, N ) {
	const T = new Complex128Array( N * N );
	const v = reinterpret( T, 0 );
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( i === j ) {
				v[ 2 * ( i + ( j * N ) ) ] = 2.0 + ( 0.5 * i );
				v[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = 0.3 * ( ( i % 3 ) - 1 );
			} else if ( ( uplo === 'lower' && i > j ) || ( uplo === 'upper' && i < j ) ) { // eslint-disable-line max-len
				v[ 2 * ( i + ( j * N ) ) ] = 0.1 * ( ( ( i + ( 2 * j ) ) % 5 ) - 2 );
				v[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = 0.1 * ( ( ( ( 2 * i ) + j ) % 3 ) - 1 ); // eslint-disable-line max-len
			}
		}
	}
	return T;
}

/**
* Converts a dense column-major triangle to RFP storage.
*
* @private
* @param {string} transr - RFP storage
* @param {string} uplo - triangle
* @param {NonNegativeInteger} N - order
* @param {Complex128Array} T - dense matrix
* @returns {Complex128Array} RFP array
*/
function toRFP( transr, uplo, N, T ) {
	const arf = new Complex128Array( ( N * ( N + 1 ) ) / 2 );
	ztrttf( transr, uplo, N, T, 1, N, 0, arf, 1, 0 );
	return arf;
}

const TRANSRS = [ 'no-transpose', 'conjugate-transpose' ];
const UPLOS = [ 'lower', 'upper' ];

test( 'ztftri: T * inv(T) = I for every TRANSR/UPLO/DIAG and N in {1,2,5,6}', function t() { // eslint-disable-line max-len
	const diags = [ 'non-unit', 'unit' ];
	const sizes = [ 1, 2, 5, 6 ];
	let transr;
	let uplo;
	let diag;
	let a;
	let b;
	let l;
	for ( a = 0; a < TRANSRS.length; a++ ) {
		transr = TRANSRS[ a ];
		for ( b = 0; b < UPLOS.length; b++ ) {
			uplo = UPLOS[ b ];
			for ( l = 0; l < diags.length; l++ ) {
				diag = diags[ l ];
				sizes.forEach( function each( N ) {
					const T = denseTriangle( uplo, N );
					const Tinv = new Complex128Array( N * N );
					const tv = reinterpret( T, 0 );
					const iv = reinterpret( Tinv, 0 );
					let info;
					let arf;
					let sr;
					let si;
					let i;
					let j;
					let p;
					let x;
					let y;
					if ( diag === 'unit' ) {
						// Stored diagonal must be ignored:
						for ( i = 0; i < N; i++ ) {
							tv[ 2 * ( i + ( i * N ) ) ] = 7.0;
							tv[ ( 2 * ( i + ( i * N ) ) ) + 1 ] = -3.0;
						}
					}
					arf = toRFP( transr, uplo, N, T );
					info = ztftri( transr, uplo, diag, N, arf, 1, 0 );
					assert.equal( info, 0, 'info' );
					ztfttr( transr, uplo, N, arf, 1, 0, Tinv, 1, N, 0 );
					if ( diag === 'unit' ) {
						for ( i = 0; i < N; i++ ) {
							assert.equal( iv[ 2 * ( i + ( i * N ) ) ], 7.0, 'unit diagonal untouched (re)' ); // eslint-disable-line max-len
							assert.equal( iv[ ( 2 * ( i + ( i * N ) ) ) + 1 ], -3.0, 'unit diagonal untouched (im)' ); // eslint-disable-line max-len
							tv[ 2 * ( i + ( i * N ) ) ] = 1.0;
							tv[ ( 2 * ( i + ( i * N ) ) ) + 1 ] = 0.0;
							iv[ 2 * ( i + ( i * N ) ) ] = 1.0;
							iv[ ( 2 * ( i + ( i * N ) ) ) + 1 ] = 0.0;
						}
					}
					for ( i = 0; i < N; i++ ) {
						for ( j = 0; j < N; j++ ) {
							sr = 0.0;
							si = 0.0;
							for ( p = 0; p < N; p++ ) {
								x = 2 * ( i + ( p * N ) );
								y = 2 * ( p + ( j * N ) );
								sr += ( tv[ x ] * iv[ y ] ) - ( tv[ x + 1 ] * iv[ y + 1 ] );
								si += ( tv[ x ] * iv[ y + 1 ] ) + ( tv[ x + 1 ] * iv[ y ] );
							}
							assert.ok( Math.abs( sr - ( ( i === j ) ? 1.0 : 0.0 ) ) <= 1e-13 * N, transr + '/' + uplo + '/' + diag + '/N=' + N + ' re(' + i + ',' + j + '): ' + sr ); // eslint-disable-line max-len
							assert.ok( Math.abs( si ) <= 1e-13 * N, transr + '/' + uplo + '/' + diag + '/N=' + N + ' im(' + i + ',' + j + '): ' + si ); // eslint-disable-line max-len
						}
					}
				});
			}
		}
	}
});

test( 'ztftri: returns info = j for a zero diagonal at j, in both RFP blocks, for every TRANSR/UPLO and N in {1,2,3,4,5,6}', function t() { // eslint-disable-line max-len
	const sizes = [ 1, 2, 3, 4, 5, 6 ];
	let transr;
	let uplo;
	let a;
	let b;
	for ( a = 0; a < TRANSRS.length; a++ ) {
		transr = TRANSRS[ a ];
		for ( b = 0; b < UPLOS.length; b++ ) {
			uplo = UPLOS[ b ];
			sizes.forEach( function each( N ) {
				let info;
				let arf;
				let tv;
				let T;
				let j;
				for ( j = 1; j <= N; j++ ) {
					T = denseTriangle( uplo, N );
					tv = reinterpret( T, 0 );
					tv[ 2 * ( ( j - 1 ) + ( ( j - 1 ) * N ) ) ] = 0.0;
					tv[ ( 2 * ( ( j - 1 ) + ( ( j - 1 ) * N ) ) ) + 1 ] = 0.0;
					arf = toRFP( transr, uplo, N, T );
					info = ztftri( transr, uplo, 'non-unit', N, arf, 1, 0 );
					assert.equal( info, j, transr + '/' + uplo + '/N=' + N + '/j=' + j ); // eslint-disable-line max-len
					assert.equal( info, ztrtri( uplo, 'non-unit', N, T, 1, N, 0 ), 'matches dense ztrtri' ); // eslint-disable-line max-len

					// The same matrix is invertible when the diagonal is implicit:
					T = denseTriangle( uplo, N );
					reinterpret( T, 0 )[ 2 * ( ( j - 1 ) + ( ( j - 1 ) * N ) ) ] = 0.0; // eslint-disable-line max-len
					reinterpret( T, 0 )[ ( 2 * ( ( j - 1 ) + ( ( j - 1 ) * N ) ) ) + 1 ] = 0.0; // eslint-disable-line max-len
					arf = toRFP( transr, uplo, N, T );
					info = ztftri( transr, uplo, 'unit', N, arf, 1, 0 );
					assert.equal( info, 0, 'unit diag ignores zero' );
				}
			});
		}
	}
});
