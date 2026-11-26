

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpbtrf from './../lib/ndarray.js';

// FIXTURES //

import upper_3x3_kd1 from './fixtures/upper_3x3_kd1.json' with { type: 'json' };
import lower_3x3_kd1 from './fixtures/lower_3x3_kd1.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import not_hpd from './fixtures/not_hpd.json' with { type: 'json' };
import upper_blocked from './fixtures/upper_blocked.json' with { type: 'json' };
import lower_blocked from './fixtures/lower_blocked.json' with { type: 'json' };
import zpbtf2 from '../../zpbtf2/lib/base.js';

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Returns a diagonally dominant HPD band matrix (column-major, `LDAB = KD+1`) of the Fortran test's blocked cases: diagonal `diag`, and, for `i < j` (1-based), `A(i,j) = ( MOD( 7*(i+j) + i*j, 13 ) - 6 )/8 + i*( MOD( 3*i + 5*j, 11 ) - 5 )/8`.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} kd - number of super- or subdiagonals
* @param {number} diag - diagonal value
* @returns {Complex128Array} band matrix
*/
function hpdBand( uplo, N, kd, diag ) {
	const ldab = kd + 1;
	const AB = new Complex128Array( ldab * N );
	const v = reinterpret( AB, 0 );
	let k;
	let i;
	let j;
	for ( j = 1; j <= N; j++ ) {
		if ( uplo === 'upper' ) {
			v[ 2 * ( kd + ( ( j - 1 ) * ldab ) ) ] = diag;
			for ( i = Math.max( 1, j - kd ); i < j; i++ ) {
				k = 2 * ( ( kd + i - j ) + ( ( j - 1 ) * ldab ) );
				v[ k ] = ( ( ( ( 7 * ( i + j ) ) + ( i * j ) ) % 13 ) - 6 ) / 8.0;
				v[ k + 1 ] = ( ( ( ( 3 * i ) + ( 5 * j ) ) % 11 ) - 5 ) / 8.0;
			}
		} else {
			v[ 2 * ( ( j - 1 ) * ldab ) ] = diag;
			for ( i = j + 1; i <= Math.min( N, j + kd ); i++ ) {
				k = 2 * ( ( i - j ) + ( ( j - 1 ) * ldab ) );
				v[ k ] = ( ( ( ( 7 * ( i + j ) ) + ( i * j ) ) % 13 ) - 6 ) / 8.0;
				v[ k + 1 ] = -( ( ( ( ( 3 * j ) + ( 5 * i ) ) % 11 ) - 5 ) / 8.0 );
			}
		}
	}
	return AB;
}


// TESTS //

test( 'zpbtrf: upper_3x3_kd1 (UPLO=U, N=3, KD=1, unblocked)', function t() {
	const tc = upper_3x3_kd1;
	const AB = new Complex128Array( [
		0, 0, 4, 0,
		1, 1, 5, 0,
		2, -1, 6, 0
	] );
	const info = zpbtrf( 'upper', 3, 1, AB, 1, 2, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( AB, 0 ) ), tc.AB, 1e-14, 'AB' );
});

test( 'zpbtrf: lower_3x3_kd1 (UPLO=L, N=3, KD=1, unblocked)', function t() {
	const tc = lower_3x3_kd1;
	const AB = new Complex128Array( [
		4, 0, 1, -1,
		5, 0, 2, 1,
		6, 0, 0, 0
	] );
	const info = zpbtrf( 'lower', 3, 1, AB, 1, 2, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( AB, 0 ) ), tc.AB, 1e-14, 'AB' );
});

test( 'zpbtrf: n_zero (N=0 quick return)', function t() {
	const AB = new Complex128Array( 4 );
	const info = zpbtrf( 'upper', 0, 1, AB, 1, 2, 0 );
	assert.equal( info, 0 );
});

test( 'zpbtrf: n_one (N=1)', function t() {
	const tc = n_one;
	const AB = new Complex128Array( [ 9, 0 ] );
	const info = zpbtrf( 'upper', 1, 0, AB, 1, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( AB, 0 ) ), tc.AB, 1e-14, 'AB' );
});

test( 'zpbtrf: not_hpd (not positive definite)', function t() {
	const tc = not_hpd;
	const AB = new Complex128Array( [
		0, 0, 1, 0,
		2, 1, 1, 0
	] );
	const info = zpbtrf( 'upper', 2, 1, AB, 1, 2, 0 );
	assert.equal( info, tc.info );
});

test( 'zpbtrf: upper_blocked (UPLO=U, N=100, KD=65, blocked path) matches the reference', function t() {
	const AB = hpdBand( 'upper', 100, 65, 200.0 );
	const info = zpbtrf( 'upper', 100, 65, AB, 1, 66, 0 );
	assert.equal( info, upper_blocked.info );
	assertArrayClose( Array.from( reinterpret( AB, 0 ) ), upper_blocked.AB, 1e-14, 'AB' );
});

test( 'zpbtrf: lower_blocked (UPLO=L, N=100, KD=65, blocked path) matches the reference', function t() {
	const AB = hpdBand( 'lower', 100, 65, 200.0 );
	const info = zpbtrf( 'lower', 100, 65, AB, 1, 66, 0 );
	assert.equal( info, lower_blocked.info );
	assertArrayClose( Array.from( reinterpret( AB, 0 ) ), lower_blocked.AB, 1e-14, 'AB' );
});

test( 'zpbtrf: 32 <= KD <= 64 takes the unblocked path, as the reference does (ticket 0049)', function t() {
	// The JS used NB = 32 for every band, so it blocked whenever KD >= 32; the reference's ILAENV( 1, 'ZPBTRF' ) is 1 for KD <= 64, so ZPBTRF calls ZPBTF2. The blocked path differs from ZPBTF2 by rounding, so the factor must equal ZPBTF2's bit for bit:
	let expected;
	let uplo;
	let AB;
	let k;
	for ( k = 0; k < 2; k++ ) {
		uplo = ( k === 0 ) ? 'upper' : 'lower';
		AB = hpdBand( uplo, 100, 48, 200.0 );
		expected = new Complex128Array( reinterpret( AB, 0 ) );
		assert.equal( zpbtrf( uplo, 100, 48, AB, 1, 49, 0 ), 0 );
		assert.equal( zpbtf2( uplo, 100, 48, expected, 1, 49, 0 ), 0 );
		assert.deepStrictEqual( Array.from( reinterpret( AB, 0 ) ), Array.from( reinterpret( expected, 0 ) ), uplo );
	}
});
