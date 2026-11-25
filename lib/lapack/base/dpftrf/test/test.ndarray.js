/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpftrf from './../lib/ndarray.js';
import dtrttf from './../../dtrttf/lib/ndarray.js';
import dtfttr from './../../dtfttr/lib/ndarray.js';
import dpotrf from './../../dpotrf/lib/ndarray.js';


// FIXTURES //

import lowerOddNormal from './fixtures/lower_odd_normal.json' with { type: 'json' };
import upperOddNormal from './fixtures/upper_odd_normal.json' with { type: 'json' };
import lowerOddTrans from './fixtures/lower_odd_trans.json' with { type: 'json' };
import upperOddTrans from './fixtures/upper_odd_trans.json' with { type: 'json' };
import lowerEvenNormal from './fixtures/lower_even_normal.json' with { type: 'json' };
import upperEvenNormal from './fixtures/upper_even_normal.json' with { type: 'json' };
import lowerEvenTrans from './fixtures/lower_even_trans.json' with { type: 'json' };
import upperEvenTrans from './fixtures/upper_even_trans.json' with { type: 'json' };
import nOne from './fixtures/n_one.json' with { type: 'json' };
import notPosdef from './fixtures/not_posdef.json' with { type: 'json' };
import lower5Normal from './fixtures/lower_5_normal.json' with { type: 'json' };
import upper5Trans from './fixtures/upper_5_trans.json' with { type: 'json' };
import notpdOddNormalUpper from './fixtures/notpd_odd_normal_upper.json' with { type: 'json' };
import notpdOddTransLower from './fixtures/notpd_odd_trans_lower.json' with { type: 'json' };
import notpdOddTransUpper from './fixtures/notpd_odd_trans_upper.json' with { type: 'json' };
import notpdEvenNormalLower from './fixtures/notpd_even_normal_lower.json' with { type: 'json' };
import notpdEvenNormalUpper from './fixtures/notpd_even_normal_upper.json' with { type: 'json' };
import notpdEvenTransLower from './fixtures/notpd_even_trans_lower.json' with { type: 'json' };
import notpdEvenTransUpper from './fixtures/notpd_even_trans_upper.json' with { type: 'json' };

const fixtures = {
	'lower_odd_normal': lowerOddNormal,
	'upper_odd_normal': upperOddNormal,
	'lower_odd_trans': lowerOddTrans,
	'upper_odd_trans': upperOddTrans,
	'lower_even_normal': lowerEvenNormal,
	'upper_even_normal': upperEvenNormal,
	'lower_even_trans': lowerEvenTrans,
	'upper_even_trans': upperEvenTrans,
	'n_one': nOne,
	'not_posdef': notPosdef,
	'lower_5_normal': lower5Normal,
	'upper_5_trans': upper5Trans,
	'notpd_odd_normal_upper': notpdOddNormalUpper,
	'notpd_odd_trans_lower': notpdOddTransLower,
	'notpd_odd_trans_upper': notpdOddTransUpper,
	'notpd_even_normal_lower': notpdEvenNormalLower,
	'notpd_even_normal_upper': notpdEvenNormalUpper,
	'notpd_even_trans_lower': notpdEvenTransLower,
	'notpd_even_trans_upper': notpdEvenTransUpper
};


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
* RunTest.
*
* @private
* @param {string} name - test case name
* @param {*} transr - transr
* @param {*} uplo - uplo
* @param {*} N - N
*/
function runTest( name, transr, uplo, N ) {
	let expected, actual, i;

	const tc = fixtures[ name ];
	const a = new Float64Array( tc.input.length );
	for ( i = 0; i < tc.input.length; i++ ) {
		a[ i ] = tc.input[ i ];
	}

	const info = dpftrf( transr, uplo, N, a, 1, 0 );
	assert.equal( info, tc.info, 'info' );

	if ( tc.a ) {
		expected = tc.a;
		actual = [];
		for ( i = 0; i < expected.length; i++ ) {
			actual.push( a[ i ] );
		}
		assertArrayClose( actual, expected, 1e-14, 'a' );
	}
}

/**
* RunNotPDTest.
*
* @private
* @param {string} name - test case name
* @param {*} transr - transr
* @param {*} uplo - uplo
* @param {*} N - N
*/
function runNotPDTest( name, transr, uplo, N ) {
	let i;

	const tc = fixtures[ name ];
	const a = new Float64Array( tc.input.length );
	for ( i = 0; i < tc.input.length; i++ ) {
		a[ i ] = tc.input[ i ];
	}

	const info = dpftrf( transr, uplo, N, a, 1, 0 );
	assert.equal( info, tc.info, 'info should indicate not positive definite' );
}


// TESTS //

test( 'dpftrf: lower_odd_normal', function t() {
	runTest( 'lower_odd_normal', 'no-transpose', 'lower', 3 );
});

test( 'dpftrf: upper_odd_normal', function t() {
	runTest( 'upper_odd_normal', 'no-transpose', 'upper', 3 );
});

test( 'dpftrf: lower_odd_trans', function t() {
	runTest( 'lower_odd_trans', 'transpose', 'lower', 3 );
});

test( 'dpftrf: upper_odd_trans', function t() {
	runTest( 'upper_odd_trans', 'transpose', 'upper', 3 );
});

test( 'dpftrf: lower_even_normal', function t() {
	runTest( 'lower_even_normal', 'no-transpose', 'lower', 4 );
});

test( 'dpftrf: upper_even_normal', function t() {
	runTest( 'upper_even_normal', 'no-transpose', 'upper', 4 );
});

test( 'dpftrf: lower_even_trans', function t() {
	runTest( 'lower_even_trans', 'transpose', 'lower', 4 );
});

test( 'dpftrf: upper_even_trans', function t() {
	runTest( 'upper_even_trans', 'transpose', 'upper', 4 );
});

test( 'dpftrf: n_zero', function t() {
	const info = dpftrf( 'no-transpose', 'lower', 0, new Float64Array( 0 ), 1, 0 );
	assert.equal( info, 0, 'info should be 0 for N=0' );
});

test( 'dpftrf: n_one', function t() {
	runTest( 'n_one', 'no-transpose', 'lower', 1 );
});

test( 'dpftrf: not_posdef', function t() {
	runNotPDTest( 'not_posdef', 'no-transpose', 'lower', 3 );
});

test( 'dpftrf: lower_5_normal', function t() {
	runTest( 'lower_5_normal', 'no-transpose', 'lower', 5 );
});

test( 'dpftrf: upper_5_trans', function t() {
	runTest( 'upper_5_trans', 'transpose', 'upper', 5 );
});

test( 'dpftrf: notpd_odd_normal_upper', function t() {
	runNotPDTest( 'notpd_odd_normal_upper', 'no-transpose', 'upper', 3 );
});

test( 'dpftrf: notpd_odd_trans_lower', function t() {
	runNotPDTest( 'notpd_odd_trans_lower', 'transpose', 'lower', 3 );
});

test( 'dpftrf: notpd_odd_trans_upper', function t() {
	runNotPDTest( 'notpd_odd_trans_upper', 'transpose', 'upper', 3 );
});

test( 'dpftrf: notpd_even_normal_lower', function t() {
	runNotPDTest( 'notpd_even_normal_lower', 'no-transpose', 'lower', 4 );
});

test( 'dpftrf: notpd_even_normal_upper', function t() {
	runNotPDTest( 'notpd_even_normal_upper', 'no-transpose', 'upper', 4 );
});

test( 'dpftrf: notpd_even_trans_lower', function t() {
	runNotPDTest( 'notpd_even_trans_lower', 'transpose', 'lower', 4 );
});

test( 'dpftrf: notpd_even_trans_upper', function t() {
	runNotPDTest( 'notpd_even_trans_upper', 'transpose', 'upper', 4 );
});


// PROPERTY TESTS (all TRANSR x UPLO x parity) //

/**
* Builds a dense column-major symmetric positive definite matrix.
*
* @private
* @param {NonNegativeInteger} N - order
* @returns {Float64Array} dense matrix
*/
function denseSPD( N ) {
	const A = new Float64Array( N * N );
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( i === j ) {
				A[ i + ( j * N ) ] = N + 2.0 + i;
			} else {
				A[ i + ( j * N ) ] = 0.5 / ( 1.0 + Math.abs( i - j ) ) * ( ( ( i + j ) % 2 === 0 ) ? 1.0 : -1.0 ); // eslint-disable-line max-len
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
* @param {Float64Array} A - dense matrix
* @returns {Float64Array} RFP array
*/
function toRFP( transr, uplo, N, A ) {
	const arf = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	dtrttf( transr, uplo, N, A, 1, N, 0, arf, 1, 0 );
	return arf;
}

const TRANSRS = [ 'no-transpose', 'transpose' ];
const UPLOS = [ 'lower', 'upper' ];

test( 'dpftrf: U^T*U (or L*L^T) reconstructs A and matches dense dpotrf for every TRANSR/UPLO and N in {1,2,5,6}', function t() { // eslint-disable-line max-len
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
				const A = denseSPD( N );
				const D = new Float64Array( A );
				const F = new Float64Array( N * N );
				let info;
				let sum;
				let arf;
				let i;
				let j;
				let p;
				arf = toRFP( transr, uplo, N, A );
				info = dpftrf( transr, uplo, N, arf, 1, 0 );
				assert.equal( info, 0, 'info' );
				dtfttr( transr, uplo, N, arf, 1, 0, F, 1, N, 0 );
				assert.equal( dpotrf( uplo, N, D, 1, N, 0 ), 0, 'dense info' );
				for ( j = 0; j < N; j++ ) {
					for ( i = 0; i < N; i++ ) {
						if ( ( uplo === 'lower' && i >= j ) || ( uplo === 'upper' && i <= j ) ) { // eslint-disable-line max-len
							assert.ok( Math.abs( F[ i + ( j * N ) ] - D[ i + ( j * N ) ] ) <= 1e-13 * N, 'factor matches dpotrf' ); // eslint-disable-line max-len
						}
					}
				}
				for ( j = 0; j < N; j++ ) {
					for ( i = 0; i < N; i++ ) {
						sum = 0.0;
						for ( p = 0; p <= Math.min( i, j ); p++ ) {
							if ( uplo === 'lower' ) {
								sum += F[ i + ( p * N ) ] * F[ j + ( p * N ) ];
							} else {
								sum += F[ p + ( i * N ) ] * F[ p + ( j * N ) ];
							}
						}
						assert.ok( Math.abs( sum - A[ i + ( j * N ) ] ) <= 1e-12 * N * ( N + 3 ), transr + '/' + uplo + '/N=' + N + ' (' + i + ',' + j + ')' ); // eslint-disable-line max-len
					}
				}
			});
		}
	}
});

test( 'dpftrf: returns info = j when the leading minor of order j is not positive definite, in both RFP blocks, for every TRANSR/UPLO and N in {1,...,6}', function t() { // eslint-disable-line max-len
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
					A = denseSPD( N );
					A[ ( j - 1 ) + ( ( j - 1 ) * N ) ] = -1.0;
					arf = toRFP( transr, uplo, N, A );
					info = dpftrf( transr, uplo, N, arf, 1, 0 );
					assert.equal( info, j, transr + '/' + uplo + '/N=' + N + '/j=' + j ); // eslint-disable-line max-len
					assert.equal( info, dpotrf( uplo, N, A, 1, N, 0 ), 'matches dense dpotrf' ); // eslint-disable-line max-len
				}
			});
		}
	}
});
