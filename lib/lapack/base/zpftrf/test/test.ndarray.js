/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

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
import zpftrf from './../lib/ndarray.js';
import ztrttf from './../../ztrttf/lib/ndarray.js';
import ztfttr from './../../ztfttr/lib/ndarray.js';
import zpotrf from './../../zpotrf/lib/ndarray.js';

// FIXTURES //

import lower_odd_normal from './fixtures/lower_odd_normal.json' with { type: 'json' };
import upper_odd_normal from './fixtures/upper_odd_normal.json' with { type: 'json' };
import lower_odd_conjtrans from './fixtures/lower_odd_conjtrans.json' with { type: 'json' };
import upper_odd_conjtrans from './fixtures/upper_odd_conjtrans.json' with { type: 'json' };
import lower_even_normal from './fixtures/lower_even_normal.json' with { type: 'json' };
import upper_even_normal from './fixtures/upper_even_normal.json' with { type: 'json' };
import lower_even_conjtrans from './fixtures/lower_even_conjtrans.json' with { type: 'json' };
import upper_even_conjtrans from './fixtures/upper_even_conjtrans.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import not_posdef from './fixtures/not_posdef.json' with { type: 'json' };
import lower_5_normal from './fixtures/lower_5_normal.json' with { type: 'json' };
import upper_5_conjtrans from './fixtures/upper_5_conjtrans.json' with { type: 'json' };
import notpd_odd_normal_upper from './fixtures/notpd_odd_normal_upper.json' with { type: 'json' };
import notpd_odd_conjtrans_lower from './fixtures/notpd_odd_conjtrans_lower.json' with { type: 'json' };
import notpd_odd_conjtrans_upper from './fixtures/notpd_odd_conjtrans_upper.json' with { type: 'json' };
import notpd_even_normal_lower from './fixtures/notpd_even_normal_lower.json' with { type: 'json' };
import notpd_even_normal_upper from './fixtures/notpd_even_normal_upper.json' with { type: 'json' };
import notpd_even_conjtrans_lower from './fixtures/notpd_even_conjtrans_lower.json' with { type: 'json' };
import notpd_even_conjtrans_upper from './fixtures/notpd_even_conjtrans_upper.json' with { type: 'json' };

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
* MakeInput.
*
* @private
* @param {*} tc - tc
* @returns {*} result
*/
function makeInput( tc ) {
	return new Complex128Array( tc.input );
}

// TESTS //

test( 'zpftrf: lower_odd_normal (N=3, TRANSR=no-transpose, UPLO=lower)', function t() { // eslint-disable-line max-len

	const tc = lower_odd_normal;
	const A = makeInput( tc );
	const info = zpftrf( 'no-transpose', 'lower', 3, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftrf: upper_odd_normal (N=3, TRANSR=no-transpose, UPLO=upper)', function t() { // eslint-disable-line max-len

	const tc = upper_odd_normal;
	const A = makeInput( tc );
	const info = zpftrf( 'no-transpose', 'upper', 3, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftrf: lower_odd_conjtrans (N=3, TRANSR=conjugate-transpose, UPLO=lower)', function t() { // eslint-disable-line max-len

	const tc = lower_odd_conjtrans;
	const A = makeInput( tc );
	const info = zpftrf( 'conjugate-transpose', 'lower', 3, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftrf: upper_odd_conjtrans (N=3, TRANSR=conjugate-transpose, UPLO=upper)', function t() { // eslint-disable-line max-len

	const tc = upper_odd_conjtrans;
	const A = makeInput( tc );
	const info = zpftrf( 'conjugate-transpose', 'upper', 3, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftrf: lower_even_normal (N=4, TRANSR=no-transpose, UPLO=lower)', function t() { // eslint-disable-line max-len

	const tc = lower_even_normal;
	const A = makeInput( tc );
	const info = zpftrf( 'no-transpose', 'lower', 4, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftrf: upper_even_normal (N=4, TRANSR=no-transpose, UPLO=upper)', function t() { // eslint-disable-line max-len

	const tc = upper_even_normal;
	const A = makeInput( tc );
	const info = zpftrf( 'no-transpose', 'upper', 4, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftrf: lower_even_conjtrans (N=4, TRANSR=conjugate-transpose, UPLO=lower)', function t() { // eslint-disable-line max-len

	const tc = lower_even_conjtrans;
	const A = makeInput( tc );
	const info = zpftrf( 'conjugate-transpose', 'lower', 4, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftrf: upper_even_conjtrans (N=4, TRANSR=conjugate-transpose, UPLO=upper)', function t() { // eslint-disable-line max-len

	const tc = upper_even_conjtrans;
	const A = makeInput( tc );
	const info = zpftrf( 'conjugate-transpose', 'upper', 4, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftrf: n_zero', function t() {

	const A = new Complex128Array( 0 );
	const info = zpftrf( 'no-transpose', 'lower', 0, A, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zpftrf: n_one', function t() {

	const tc = n_one;
	const A = makeInput( tc );
	const info = zpftrf( 'no-transpose', 'lower', 1, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftrf: not_posdef (INFO > 0)', function t() {

	const tc = not_posdef;
	const A = makeInput( tc );
	const info = zpftrf( 'no-transpose', 'lower', 3, A, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zpftrf: lower_5_normal (N=5, TRANSR=no-transpose, UPLO=lower)', function t() { // eslint-disable-line max-len

	const tc = lower_5_normal;
	const A = makeInput( tc );
	const info = zpftrf( 'no-transpose', 'lower', 5, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftrf: upper_5_conjtrans (N=5, TRANSR=conjugate-transpose, UPLO=upper)', function t() { // eslint-disable-line max-len

	const tc = upper_5_conjtrans;
	const A = makeInput( tc );
	const info = zpftrf( 'conjugate-transpose', 'upper', 5, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftrf: notpd_odd_normal_upper', function t() {

	const tc = notpd_odd_normal_upper;
	const A = makeInput( tc );
	const info = zpftrf( 'no-transpose', 'upper', 3, A, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zpftrf: notpd_odd_conjtrans_lower', function t() {

	const tc = notpd_odd_conjtrans_lower;
	const A = makeInput( tc );
	const info = zpftrf( 'conjugate-transpose', 'lower', 3, A, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zpftrf: notpd_odd_conjtrans_upper', function t() {

	const tc = notpd_odd_conjtrans_upper;
	const A = makeInput( tc );
	const info = zpftrf( 'conjugate-transpose', 'upper', 3, A, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zpftrf: notpd_even_normal_lower', function t() {

	const tc = notpd_even_normal_lower;
	const A = makeInput( tc );
	const info = zpftrf( 'no-transpose', 'lower', 4, A, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zpftrf: notpd_even_normal_upper', function t() {

	const tc = notpd_even_normal_upper;
	const A = makeInput( tc );
	const info = zpftrf( 'no-transpose', 'upper', 4, A, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zpftrf: notpd_even_conjtrans_lower', function t() {

	const tc = notpd_even_conjtrans_lower;
	const A = makeInput( tc );
	const info = zpftrf( 'conjugate-transpose', 'lower', 4, A, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zpftrf: notpd_even_conjtrans_upper', function t() {

	const tc = notpd_even_conjtrans_upper;
	const A = makeInput( tc );
	const info = zpftrf( 'conjugate-transpose', 'upper', 4, A, 1, 0 );
	assert.equal( info, tc.info );
});


// PROPERTY TESTS (all TRANSR x UPLO x parity) //

/**
* Builds a dense column-major Hermitian positive definite matrix.
*
* @private
* @param {NonNegativeInteger} N - order
* @returns {Complex128Array} dense matrix
*/
function denseHPD( N ) {
	const A = new Complex128Array( N * N );
	const v = reinterpret( A, 0 );
	let im;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( i === j ) {
				v[ 2 * ( i + ( j * N ) ) ] = N + 2.0 + i;
			} else {
				im = 0.25 / ( 1.0 + Math.abs( i - j ) );
				v[ 2 * ( i + ( j * N ) ) ] = 0.5 / ( 1.0 + Math.abs( i - j ) ) * ( ( ( i + j ) % 2 === 0 ) ? 1.0 : -1.0 ); // eslint-disable-line max-len
				v[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = ( i > j ) ? im : -im;
			}
		}
	}
	return A;
}

/**
* Converts a dense column-major matrix (one triangle) to RFP storage.
*
* @private
* @param {string} transr - RFP storage
* @param {string} uplo - triangle
* @param {NonNegativeInteger} N - order
* @param {Complex128Array} A - dense matrix
* @returns {Complex128Array} RFP array
*/
function toRFP( transr, uplo, N, A ) {
	const arf = new Complex128Array( ( N * ( N + 1 ) ) / 2 );
	ztrttf( transr, uplo, N, A, 1, N, 0, arf, 1, 0 );
	return arf;
}

const TRANSRS = [ 'no-transpose', 'conjugate-transpose' ];
const UPLOS = [ 'lower', 'upper' ];

test( 'zpftrf: U^H*U (or L*L^H) reconstructs A and matches dense zpotrf for every TRANSR/UPLO and N in {1,2,5,6}', function t() { // eslint-disable-line max-len
	const sizes = [ 1, 2, 5, 6 ];
	let transr;
	let uplo;
	let a;
	let b;
	for ( a = 0; a < TRANSRS.length; a++ ) {
		transr = TRANSRS[ a ];
		for ( b = 0; b < UPLOS.length; b++ ) {
			uplo = UPLOS[ b ];
			sizes.forEach( function each( N ) {
				const A = denseHPD( N );
				const D = new Complex128Array( reinterpret( A, 0 ) );
				const F = new Complex128Array( N * N );
				const av = reinterpret( A, 0 );
				const dv = reinterpret( D, 0 );
				const fv = reinterpret( F, 0 );
				let info;
				let arf;
				let sr;
				let si;
				let i;
				let j;
				let p;
				let x;
				let y;
				arf = toRFP( transr, uplo, N, A );
				info = zpftrf( transr, uplo, N, arf, 1, 0 );
				assert.equal( info, 0, 'info' );
				ztfttr( transr, uplo, N, arf, 1, 0, F, 1, N, 0 );
				assert.equal( zpotrf( uplo, N, D, 1, N, 0 ), 0, 'dense info' );
				for ( j = 0; j < N; j++ ) {
					for ( i = 0; i < N; i++ ) {
						if ( ( uplo === 'lower' && i >= j ) || ( uplo === 'upper' && i <= j ) ) { // eslint-disable-line max-len
							x = 2 * ( i + ( j * N ) );
							assert.ok( Math.abs( fv[ x ] - dv[ x ] ) <= 1e-13 * N, 'factor matches zpotrf (re)' ); // eslint-disable-line max-len
							assert.ok( Math.abs( fv[ x + 1 ] - dv[ x + 1 ] ) <= 1e-13 * N, 'factor matches zpotrf (im)' ); // eslint-disable-line max-len
						}
					}
				}

				// Reconstruct the stored triangle: lower: sum_p L(i,p)*conj(L(j,p)); upper: sum_p conj(U(p,i))*U(p,j)
				for ( j = 0; j < N; j++ ) {
					for ( i = 0; i < N; i++ ) {
						if ( ( uplo === 'lower' && i < j ) || ( uplo === 'upper' && i > j ) ) { // eslint-disable-line max-len
							continue;
						}
						sr = 0.0;
						si = 0.0;
						for ( p = 0; p <= Math.min( i, j ); p++ ) {
							if ( uplo === 'lower' ) {
								x = 2 * ( i + ( p * N ) );
								y = 2 * ( j + ( p * N ) );
								sr += ( fv[ x ] * fv[ y ] ) + ( fv[ x + 1 ] * fv[ y + 1 ] );
								si += ( fv[ x + 1 ] * fv[ y ] ) - ( fv[ x ] * fv[ y + 1 ] );
							} else {
								x = 2 * ( p + ( i * N ) );
								y = 2 * ( p + ( j * N ) );
								sr += ( fv[ x ] * fv[ y ] ) + ( fv[ x + 1 ] * fv[ y + 1 ] );
								si += ( fv[ x ] * fv[ y + 1 ] ) - ( fv[ x + 1 ] * fv[ y ] );
							}
						}
						x = 2 * ( i + ( j * N ) );
						assert.ok( Math.abs( sr - av[ x ] ) <= 1e-12 * N * ( N + 3 ), transr + '/' + uplo + '/N=' + N + ' re(' + i + ',' + j + ')' ); // eslint-disable-line max-len
						assert.ok( Math.abs( si - av[ x + 1 ] ) <= 1e-12 * N * ( N + 3 ), transr + '/' + uplo + '/N=' + N + ' im(' + i + ',' + j + ')' ); // eslint-disable-line max-len
					}
				}
			});
		}
	}
});

test( 'zpftrf: returns info = j when the leading minor of order j is not positive definite, in both RFP blocks, for every TRANSR/UPLO and N in {1,...,6}', function t() { // eslint-disable-line max-len
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
				let A;
				let j;
				for ( j = 1; j <= N; j++ ) {
					A = denseHPD( N );
					reinterpret( A, 0 )[ 2 * ( ( j - 1 ) + ( ( j - 1 ) * N ) ) ] = -1.0; // eslint-disable-line max-len
					arf = toRFP( transr, uplo, N, A );
					info = zpftrf( transr, uplo, N, arf, 1, 0 );
					assert.equal( info, j, transr + '/' + uplo + '/N=' + N + '/j=' + j ); // eslint-disable-line max-len
					assert.equal( info, zpotrf( uplo, N, A, 1, N, 0 ), 'matches dense zpotrf' ); // eslint-disable-line max-len
				}
			});
		}
	}
});
