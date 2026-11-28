/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpbtrf from './../lib/ndarray.js';

// FIXTURES //

import upper_tridiag_5 from './fixtures/upper_tridiag_5.json' with { type: 'json' };
import lower_tridiag_5 from './fixtures/lower_tridiag_5.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import upper_penta_4 from './fixtures/upper_penta_4.json' with { type: 'json' };
import lower_penta_4 from './fixtures/lower_penta_4.json' with { type: 'json' };
import not_posdef from './fixtures/not_posdef.json' with { type: 'json' };
import upper_banded_8 from './fixtures/upper_banded_8.json' with { type: 'json' };
import lower_banded_8 from './fixtures/lower_banded_8.json' with { type: 'json' };
import upper_blocked from './fixtures/upper_blocked.json' with { type: 'json' };
import lower_blocked from './fixtures/lower_blocked.json' with { type: 'json' };
import dpbtf2 from '../../dpbtf2/lib/base.js';

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
* Returns a diagonally dominant SPD band matrix (column-major, `LDAB = KD+1`) of the Fortran test's blocked cases: diagonal `diag`, and `A(i,j) = ( MOD( 7*(i+j) + i*j, 13 ) - 6 ) / 8` (1-based) off the diagonal.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} kd - number of super- or subdiagonals
* @param {number} diag - diagonal value
* @returns {Float64Array} band matrix
*/
function spdBand( uplo, N, kd, diag ) {
	const ldab = kd + 1;
	const ab = new Float64Array( ldab * N );
	let i;
	let j;
	for ( j = 1; j <= N; j++ ) {
		if ( uplo === 'upper' ) {
			ab[ kd + ( ( j - 1 ) * ldab ) ] = diag;
			for ( i = Math.max( 1, j - kd ); i < j; i++ ) {
				ab[ ( kd + i - j ) + ( ( j - 1 ) * ldab ) ] = ( ( ( ( 7 * ( i + j ) ) + ( i * j ) ) % 13 ) - 6 ) / 8.0;
			}
		} else {
			ab[ ( j - 1 ) * ldab ] = diag;
			for ( i = j + 1; i <= Math.min( N, j + kd ); i++ ) {
				ab[ ( i - j ) + ( ( j - 1 ) * ldab ) ] = ( ( ( ( 7 * ( i + j ) ) + ( i * j ) ) % 13 ) - 6 ) / 8.0;
			}
		}
	}
	return ab;
}


// TESTS //

test( 'dpbtrf: upper_tridiag_5', function t() {

	const tc = upper_tridiag_5;
	const ab = new Float64Array([
		0.0,
		2.0,
		-1.0,
		2.0,
		-1.0,
		2.0,
		-1.0,
		2.0,
		-1.0,
		2.0
	]);
	const info = dpbtrf( 'upper', 5, 1, ab, 1, 2, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( ab, tc.ab, 1e-14, 'ab' );
});

test( 'dpbtrf: lower_tridiag_5', function t() {

	const tc = lower_tridiag_5;
	const ab = new Float64Array([
		2.0,
		-1.0,
		2.0,
		-1.0,
		2.0,
		-1.0,
		2.0,
		-1.0,
		2.0,
		0.0
	]);
	const info = dpbtrf( 'lower', 5, 1, ab, 1, 2, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( ab, tc.ab, 1e-14, 'ab' );
});

test( 'dpbtrf: n_zero', function t() {

	const tc = n_zero;
	const ab = new Float64Array([ 99.0 ]);
	const info = dpbtrf( 'upper', 0, 0, ab, 1, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dpbtrf: n_one', function t() {

	const tc = n_one;
	const ab = new Float64Array([ 4.0 ]);
	const info = dpbtrf( 'lower', 1, 0, ab, 1, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( ab, tc.ab, 1e-14, 'ab' );
});

test( 'dpbtrf: upper_penta_4', function t() {

	const tc = upper_penta_4;
	const ab = new Float64Array([
		0.0,
		0.0,
		4.0,
		0.0,
		-1.0,
		4.0,
		0.5,
		-1.0,
		4.0,
		0.5,
		-1.0,
		4.0
	]);
	const info = dpbtrf( 'upper', 4, 2, ab, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( ab, tc.ab, 1e-14, 'ab' );
});

test( 'dpbtrf: lower_penta_4', function t() {

	const tc = lower_penta_4;
	const ab = new Float64Array([
		4.0,
		-1.0,
		0.5,
		4.0,
		-1.0,
		0.5,
		4.0,
		-1.0,
		0.0,
		4.0,
		0.0,
		0.0
	]);
	const info = dpbtrf( 'lower', 4, 2, ab, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( ab, tc.ab, 1e-14, 'ab' );
});

test( 'dpbtrf: not_posdef', function t() {

	const tc = not_posdef;
	const ab = new Float64Array([
		1.0,
		2.0,
		1.0,
		0.0
	]);
	const info = dpbtrf( 'lower', 2, 1, ab, 1, 2, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( ab, tc.ab, 1e-14, 'ab' );
});

test( 'dpbtrf: upper_banded_8', function t() {

	const tc = upper_banded_8;
	const ab = new Float64Array([
		0.0,
		0.0,
		6.0,
		0.0,
		-1.0,
		6.0,
		0.5,
		-1.0,
		6.0,
		0.5,
		-1.0,
		6.0,
		0.5,
		-1.0,
		6.0,
		0.5,
		-1.0,
		6.0,
		0.5,
		-1.0,
		6.0,
		0.5,
		-1.0,
		6.0
	]);
	const info = dpbtrf( 'upper', 8, 2, ab, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( ab, tc.ab, 1e-14, 'ab' );
});

test( 'dpbtrf: lower_banded_8', function t() {

	const tc = lower_banded_8;
	const ab = new Float64Array([
		6.0,
		-1.0,
		0.5,
		6.0,
		-1.0,
		0.5,
		6.0,
		-1.0,
		0.5,
		6.0,
		-1.0,
		0.5,
		6.0,
		-1.0,
		0.5,
		6.0,
		-1.0,
		0.5,
		6.0,
		-1.0,
		0.0,
		6.0,
		0.0,
		0.0
	]);
	const info = dpbtrf( 'lower', 8, 2, ab, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( ab, tc.ab, 1e-14, 'ab' );
});

test( 'dpbtrf: blocked path upper (KD=65, N=100) matches the reference', function t() {
	const ab = spdBand( 'upper', 100, 65, 100.0 );
	const info = dpbtrf( 'upper', 100, 65, ab, 1, 66, 0 );
	assert.equal( info, upper_blocked.info );
	assertArrayClose( ab, upper_blocked.ab, 1e-14, 'ab' );
});

test( 'dpbtrf: blocked path lower (KD=65, N=100) matches the reference', function t() {
	const ab = spdBand( 'lower', 100, 65, 100.0 );
	const info = dpbtrf( 'lower', 100, 65, ab, 1, 66, 0 );
	assert.equal( info, lower_blocked.info );
	assertArrayClose( ab, lower_blocked.ab, 1e-14, 'ab' );
});

test( 'dpbtrf: blocked path upper with a partial last block (KD=80, N=150)', function t() {
	const ab = spdBand( 'upper', 150, 80, 150.0 );
	const expected = new Float64Array( ab );
	const info = dpbtrf( 'upper', 150, 80, ab, 1, 81, 0 );
	assert.equal( info, 0 );
	assert.equal( dpbtf2( 'upper', 150, 80, expected, 1, 81, 0 ), 0 );
	assertArrayClose( ab, expected, 1e-13, 'ab' );
});

test( 'dpbtrf: blocked path lower with a partial last block (KD=80, N=150)', function t() {
	const ab = spdBand( 'lower', 150, 80, 150.0 );
	const expected = new Float64Array( ab );
	const info = dpbtrf( 'lower', 150, 80, ab, 1, 81, 0 );
	assert.equal( info, 0 );
	assert.equal( dpbtf2( 'lower', 150, 80, expected, 1, 81, 0 ), 0 );
	assertArrayClose( ab, expected, 1e-13, 'ab' );
});

test( 'dpbtrf: blocked path not_posdef upper', function t() {
	let j;

	const n = 130;
	const kd = 65;
	const ldab = kd + 1;
	const ab = new Float64Array( ldab * n );
	for ( j = 0; j < n; j++ ) {
		ab[ kd + j * ldab ] = 1.0;
		if ( j + 1 < n ) {
			ab[ ( kd - 1 ) + ( j + 1 ) * ldab ] = 10.0;
		}
	}
	const info = dpbtrf( 'upper', n, kd, ab, 1, ldab, 0 );
	assert.equal( info, 2, 'should return positive info for non-SPD matrix' );
});

test( 'dpbtrf: blocked path not_posdef lower', function t() {
	let j;

	const n = 130;
	const kd = 65;
	const ldab = kd + 1;
	const ab = new Float64Array( ldab * n );
	for ( j = 0; j < n; j++ ) {
		ab[ j * ldab ] = 1.0;
		if ( j + 1 < n ) {
			ab[ 1 + j * ldab ] = 10.0;
		}
	}
	const info = dpbtrf( 'lower', n, kd, ab, 1, ldab, 0 );
	assert.equal( info, 2, 'should return positive info for non-SPD matrix' );
});

test( 'dpbtrf: 32 <= KD <= 64 takes the unblocked path, as the reference does (ticket 0049)', function t() {
	// The JS used NB = 32 for every band, so it blocked whenever KD >= 32; the reference's ILAENV( 1, 'DPBTRF' ) is 1 for KD <= 64, so DPBTRF calls DPBTF2. The blocked path differs from DPBTF2 by rounding, so the factor must equal DPBTF2's bit for bit:
	let expected;
	let uplo;
	let ab;
	let k;
	for ( k = 0; k < 2; k++ ) {
		uplo = ( k === 0 ) ? 'upper' : 'lower';
		ab = spdBand( uplo, 100, 48, 100.0 );
		expected = new Float64Array( ab );
		assert.equal( dpbtrf( uplo, 100, 48, ab, 1, 49, 0 ), 0 );
		assert.equal( dpbtf2( uplo, 100, 48, expected, 1, 49, 0 ), 0 );
		assert.deepStrictEqual( Array.from( ab ), Array.from( expected ), uplo );
	}
});
