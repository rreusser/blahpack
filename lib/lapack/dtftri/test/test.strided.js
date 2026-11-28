/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtftri from './../lib/strided.js';
import dtrttf from './../../dtrttf/lib/strided.js';
import dtfttr from './../../dtfttr/lib/strided.js';
import dtrtri from './../../dtrtri/lib/strided.js';


// FIXTURES //

import lowerOddNormalNonunit from './fixtures/lower_odd_normal_nonunit.json' with { type: 'json' };
import upperOddNormalNonunit from './fixtures/upper_odd_normal_nonunit.json' with { type: 'json' };
import lowerOddTransNonunit from './fixtures/lower_odd_trans_nonunit.json' with { type: 'json' };
import upperOddTransNonunit from './fixtures/upper_odd_trans_nonunit.json' with { type: 'json' };
import lowerEvenNormalNonunit from './fixtures/lower_even_normal_nonunit.json' with { type: 'json' };
import upperEvenNormalNonunit from './fixtures/upper_even_normal_nonunit.json' with { type: 'json' };
import lowerEvenTransNonunit from './fixtures/lower_even_trans_nonunit.json' with { type: 'json' };
import upperEvenTransNonunit from './fixtures/upper_even_trans_nonunit.json' with { type: 'json' };
import lowerOddNormalUnit from './fixtures/lower_odd_normal_unit.json' with { type: 'json' };
import upperOddNormalUnit from './fixtures/upper_odd_normal_unit.json' with { type: 'json' };
import lowerOddTransUnit from './fixtures/lower_odd_trans_unit.json' with { type: 'json' };
import upperOddTransUnit from './fixtures/upper_odd_trans_unit.json' with { type: 'json' };
import lowerEvenNormalUnit from './fixtures/lower_even_normal_unit.json' with { type: 'json' };
import upperEvenNormalUnit from './fixtures/upper_even_normal_unit.json' with { type: 'json' };
import lowerEvenTransUnit from './fixtures/lower_even_trans_unit.json' with { type: 'json' };
import upperEvenTransUnit from './fixtures/upper_even_trans_unit.json' with { type: 'json' };
import nOneNonunit from './fixtures/n_one_nonunit.json' with { type: 'json' };
import nOneUnit from './fixtures/n_one_unit.json' with { type: 'json' };
import lower5NormalNonunit from './fixtures/lower_5_normal_nonunit.json' with { type: 'json' };
import upper5TransNonunit from './fixtures/upper_5_trans_nonunit.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };

const fixtures = {
	'lower_odd_normal_nonunit': lowerOddNormalNonunit,
	'upper_odd_normal_nonunit': upperOddNormalNonunit,
	'lower_odd_trans_nonunit': lowerOddTransNonunit,
	'upper_odd_trans_nonunit': upperOddTransNonunit,
	'lower_even_normal_nonunit': lowerEvenNormalNonunit,
	'upper_even_normal_nonunit': upperEvenNormalNonunit,
	'lower_even_trans_nonunit': lowerEvenTransNonunit,
	'upper_even_trans_nonunit': upperEvenTransNonunit,
	'lower_odd_normal_unit': lowerOddNormalUnit,
	'upper_odd_normal_unit': upperOddNormalUnit,
	'lower_odd_trans_unit': lowerOddTransUnit,
	'upper_odd_trans_unit': upperOddTransUnit,
	'lower_even_normal_unit': lowerEvenNormalUnit,
	'upper_even_normal_unit': upperEvenNormalUnit,
	'lower_even_trans_unit': lowerEvenTransUnit,
	'upper_even_trans_unit': upperEvenTransUnit,
	'n_one_nonunit': nOneNonunit,
	'n_one_unit': nOneUnit,
	'lower_5_normal_nonunit': lower5NormalNonunit,
	'upper_5_trans_nonunit': upper5TransNonunit,
	'singular': singular
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
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual ); // eslint-disable-line max-len
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
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' ); // eslint-disable-line max-len
	}
}

/**
* Runs a standard test case.
*
* @private
* @param {string} name - test case name
* @param {string} transr - transpose operation
* @param {string} uplo - matrix triangle
* @param {string} diag - diagonal type
* @param {NonNegativeInteger} N - matrix order
*/
function runTest( name, transr, uplo, diag, N ) {
	let expected, actual, i;

	const tc = fixtures[ name ];
	const a = new Float64Array( tc.input.length );
	for ( i = 0; i < tc.input.length; i++ ) {
		a[ i ] = tc.input[ i ];
	}

	const info = dtftri( transr, uplo, diag, N, a, 1, 0 );
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
* Runs a singular matrix test case.
*
* @private
* @param {string} name - test case name
* @param {string} transr - transpose operation
* @param {string} uplo - matrix triangle
* @param {string} diag - diagonal type
* @param {NonNegativeInteger} N - matrix order
*/
function runSingularTest( name, transr, uplo, diag, N ) {
	let i;

	const tc = fixtures[ name ];
	const a = new Float64Array( tc.input.length );
	for ( i = 0; i < tc.input.length; i++ ) {
		a[ i ] = tc.input[ i ];
	}

	const info = dtftri( transr, uplo, diag, N, a, 1, 0 );
	assert.equal( info, tc.info, 'info should indicate singularity' ); // eslint-disable-line max-len
}


// TESTS //

test( 'dtftri: lower_odd_normal_nonunit', function t() {
	runTest( 'lower_odd_normal_nonunit', 'no-transpose', 'lower', 'non-unit', 3 ); // eslint-disable-line max-len
});

test( 'dtftri: upper_odd_normal_nonunit', function t() {
	runTest( 'upper_odd_normal_nonunit', 'no-transpose', 'upper', 'non-unit', 3 ); // eslint-disable-line max-len
});

test( 'dtftri: lower_odd_trans_nonunit', function t() {
	runTest( 'lower_odd_trans_nonunit', 'transpose', 'lower', 'non-unit', 3 ); // eslint-disable-line max-len
});

test( 'dtftri: upper_odd_trans_nonunit', function t() {
	runTest( 'upper_odd_trans_nonunit', 'transpose', 'upper', 'non-unit', 3 ); // eslint-disable-line max-len
});

test( 'dtftri: lower_even_normal_nonunit', function t() {
	runTest( 'lower_even_normal_nonunit', 'no-transpose', 'lower', 'non-unit', 4 ); // eslint-disable-line max-len
});

test( 'dtftri: upper_even_normal_nonunit', function t() {
	runTest( 'upper_even_normal_nonunit', 'no-transpose', 'upper', 'non-unit', 4 ); // eslint-disable-line max-len
});

test( 'dtftri: lower_even_trans_nonunit', function t() {
	runTest( 'lower_even_trans_nonunit', 'transpose', 'lower', 'non-unit', 4 ); // eslint-disable-line max-len
});

test( 'dtftri: upper_even_trans_nonunit', function t() {
	runTest( 'upper_even_trans_nonunit', 'transpose', 'upper', 'non-unit', 4 ); // eslint-disable-line max-len
});

test( 'dtftri: lower_odd_normal_unit', function t() {
	runTest( 'lower_odd_normal_unit', 'no-transpose', 'lower', 'unit', 3 ); // eslint-disable-line max-len
});

test( 'dtftri: upper_odd_normal_unit', function t() {
	runTest( 'upper_odd_normal_unit', 'no-transpose', 'upper', 'unit', 3 ); // eslint-disable-line max-len
});

test( 'dtftri: lower_odd_trans_unit', function t() {
	runTest( 'lower_odd_trans_unit', 'transpose', 'lower', 'unit', 3 );
});

test( 'dtftri: upper_odd_trans_unit', function t() {
	runTest( 'upper_odd_trans_unit', 'transpose', 'upper', 'unit', 3 );
});

test( 'dtftri: lower_even_normal_unit', function t() {
	runTest( 'lower_even_normal_unit', 'no-transpose', 'lower', 'unit', 4 ); // eslint-disable-line max-len
});

test( 'dtftri: upper_even_normal_unit', function t() {
	runTest( 'upper_even_normal_unit', 'no-transpose', 'upper', 'unit', 4 ); // eslint-disable-line max-len
});

test( 'dtftri: lower_even_trans_unit', function t() {
	runTest( 'lower_even_trans_unit', 'transpose', 'lower', 'unit', 4 );
});

test( 'dtftri: upper_even_trans_unit', function t() {
	runTest( 'upper_even_trans_unit', 'transpose', 'upper', 'unit', 4 );
});

test( 'dtftri: n_zero', function t() {

	const a = new Float64Array( 0 );
	const info = dtftri( 'no-transpose', 'lower', 'non-unit', 0, a, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info should be 0 for N=0' );
});

test( 'dtftri: n_one_nonunit', function t() {
	runTest( 'n_one_nonunit', 'no-transpose', 'lower', 'non-unit', 1 ); // eslint-disable-line max-len
});

test( 'dtftri: n_one_unit', function t() {
	runTest( 'n_one_unit', 'no-transpose', 'lower', 'unit', 1 );
});

test( 'dtftri: lower_5_normal_nonunit', function t() {
	runTest( 'lower_5_normal_nonunit', 'no-transpose', 'lower', 'non-unit', 5 ); // eslint-disable-line max-len
});

test( 'dtftri: upper_5_trans_nonunit', function t() {
	runTest( 'upper_5_trans_nonunit', 'transpose', 'upper', 'non-unit', 5 ); // eslint-disable-line max-len
});

test( 'dtftri: singular', function t() {
	runSingularTest( 'singular', 'no-transpose', 'lower', 'non-unit', 3 ); // eslint-disable-line max-len
});

test( 'dtftri: strided offset and stride', function t() {
	let i;

	const tc = lowerOddNormalNonunit;
	const a = new Float64Array( tc.input.length + 2 );
	a[ 0 ] = 999.0;
	for ( i = 0; i < tc.input.length; i++ ) {
		a[ i + 1 ] = tc.input[ i ];
	}
	a[ tc.input.length + 1 ] = 999.0;

	const info = dtftri( 'no-transpose', 'lower', 'non-unit', 3, a, 1, 1 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );

	const expected = tc.a;
	const actual = [];
	for ( i = 0; i < expected.length; i++ ) {
		actual.push( a[ i + 1 ] );
	}
	assertArrayClose( actual, expected, 1e-14, 'a with offset' );
	assert.equal( a[ 0 ], 999.0, 'prefix unchanged' );
	assert.equal( a[ tc.input.length + 1 ], 999.0, 'suffix unchanged' ); // eslint-disable-line max-len
});


// PROPERTY TESTS (all TRANSR x UPLO x DIAG x parity) //

/**
* Builds a well-conditioned dense column-major triangular matrix (opposite triangle zero).
*
* @private
* @param {string} uplo - triangle
* @param {NonNegativeInteger} N - order
* @returns {Float64Array} dense matrix
*/
function denseTriangle( uplo, N ) {
	const T = new Float64Array( N * N );
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( i === j ) {
				T[ i + ( j * N ) ] = 2.0 + ( 0.5 * i );
			} else if ( ( uplo === 'lower' && i > j ) || ( uplo === 'upper' && i < j ) ) { // eslint-disable-line max-len
				T[ i + ( j * N ) ] = 0.1 * ( ( ( i + ( 2 * j ) ) % 5 ) - 2 );
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
* @param {Float64Array} T - dense matrix
* @returns {Float64Array} RFP array
*/
function toRFP( transr, uplo, N, T ) {
	const arf = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	dtrttf( transr, uplo, N, T, 1, N, 0, arf, 1, 0 );
	return arf;
}

/**
* Converts RFP storage back to a dense column-major matrix (opposite triangle zero).
*
* @private
* @param {string} transr - RFP storage
* @param {string} uplo - triangle
* @param {NonNegativeInteger} N - order
* @param {Float64Array} arf - RFP array
* @returns {Float64Array} dense matrix
*/
function fromRFP( transr, uplo, N, arf ) {
	const T = new Float64Array( N * N );
	dtfttr( transr, uplo, N, arf, 1, 0, T, 1, N, 0 );
	return T;
}

const TRANSRS = [ 'no-transpose', 'transpose' ];
const UPLOS = [ 'lower', 'upper' ];

test( 'dtftri: T * inv(T) = I for every TRANSR/UPLO/DIAG and N in {1,2,5,6}', function t() { // eslint-disable-line max-len
	const diags = [ 'non-unit', 'unit' ];
	const sizes = [ 1, 2, 5, 6 ];
	let transr;
	let uplo;
	let diag;
	let info;
	let Tinv;
	let arf;
	let sum;
	let T;
	let N;
	let a;
	let b;
	let i;
	let j;
	let l;
	let p;
	for ( a = 0; a < TRANSRS.length; a++ ) {
		transr = TRANSRS[ a ];
		for ( b = 0; b < UPLOS.length; b++ ) {
			uplo = UPLOS[ b ];
			for ( l = 0; l < diags.length; l++ ) {
				diag = diags[ l ];
				sizes.forEach( function each( n ) {
					N = n;
					T = denseTriangle( uplo, N );
					if ( diag === 'unit' ) {
						// Stored diagonal must be ignored:
						for ( i = 0; i < N; i++ ) {
							T[ i + ( i * N ) ] = 7.0;
						}
					}
					arf = toRFP( transr, uplo, N, T );
					info = dtftri( transr, uplo, diag, N, arf, 1, 0 );
					assert.equal( info, 0, 'info' );
					Tinv = fromRFP( transr, uplo, N, arf );
					if ( diag === 'unit' ) {
						for ( i = 0; i < N; i++ ) {
							T[ i + ( i * N ) ] = 1.0;
							assert.equal( Tinv[ i + ( i * N ) ], 7.0, 'unit diagonal untouched' ); // eslint-disable-line max-len
							Tinv[ i + ( i * N ) ] = 1.0;
						}
					}
					for ( i = 0; i < N; i++ ) {
						for ( j = 0; j < N; j++ ) {
							sum = 0.0;
							for ( p = 0; p < N; p++ ) {
								sum += T[ i + ( p * N ) ] * Tinv[ p + ( j * N ) ];
							}
							assert.ok( Math.abs( sum - ( ( i === j ) ? 1.0 : 0.0 ) ) <= 1e-13 * N, transr + '/' + uplo + '/' + diag + '/N=' + N + ' (' + i + ',' + j + '): ' + sum ); // eslint-disable-line max-len
						}
					}
				});
			}
		}
	}
});

test( 'dtftri: returns info = j for a zero diagonal at j, in both RFP blocks, for every TRANSR/UPLO and N in {1,2,3,4,5,6}', function t() { // eslint-disable-line max-len
	const sizes = [ 1, 2, 3, 4, 5, 6 ];
	let transr;
	let uplo;
	let dinfo;
	let info;
	let arf;
	let T;
	let a;
	let b;
	for ( a = 0; a < TRANSRS.length; a++ ) {
		transr = TRANSRS[ a ];
		for ( b = 0; b < UPLOS.length; b++ ) {
			uplo = UPLOS[ b ];
			sizes.forEach( function each( N ) {
				let j;
				for ( j = 1; j <= N; j++ ) {
					T = denseTriangle( uplo, N );
					T[ ( j - 1 ) + ( ( j - 1 ) * N ) ] = 0.0;
					arf = toRFP( transr, uplo, N, T );
					info = dtftri( transr, uplo, 'non-unit', N, arf, 1, 0 );
					dinfo = dtrtri( uplo, 'non-unit', N, T, 1, N, 0 );
					assert.equal( info, j, transr + '/' + uplo + '/N=' + N + '/j=' + j ); // eslint-disable-line max-len
					assert.equal( info, dinfo, 'matches dense dtrtri' );

					// The same matrix is invertible when the diagonal is implicit:
					arf = toRFP( transr, uplo, N, T );
					info = dtftri( transr, uplo, 'unit', N, arf, 1, 0 );
					assert.equal( info, 0, 'unit diag ignores zero' );
				}
			});
		}
	}
});
