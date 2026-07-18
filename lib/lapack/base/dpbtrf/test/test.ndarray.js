/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

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

test( 'dpbtrf: blocked path upper (KD >= 32)', function t() {
	let i, j, d;

	const n = 64;
	const kd = 32;
	const ldab = kd + 1;
	const ab = new Float64Array( ldab * n );
	for ( j = 0; j < n; j++ ) {
		// Diagonal at row kd
		ab[ kd + j * ldab ] = kd + 2.0;

		// Off-diagonals
		for ( d = 1; d <= kd; d++ ) {
			if ( j + d < n ) {
				// AB(kd+1-d, j+d) in 0-based: (kd-d) + (j+d)*ldab
				ab[ ( kd - d ) + ( j + d ) * ldab ] = -0.01;
			}
		}
	}
	const info = dpbtrf( 'upper', n, kd, ab, 1, ldab, 0 );
	assert.equal( info, 0, 'blocked upper factorization should succeed' );
	for ( j = 0; j < n; j++ ) {
		assert.ok( ab[ kd + j * ldab ] > 0, 'diagonal element ' + j + ' should be positive' ); // eslint-disable-line max-len
	}
});

test( 'dpbtrf: blocked path lower (KD >= 32)', function t() {
	let j, d;

	const n = 64;
	const kd = 32;
	const ldab = kd + 1;
	const ab = new Float64Array( ldab * n );
	for ( j = 0; j < n; j++ ) {
		// Diagonal at row 0
		ab[ j * ldab ] = kd + 2.0;

		// Off-diagonals
		for ( d = 1; d <= kd; d++ ) {
			if ( j + d < n ) {
				// AB(1+d, j) in 0-based: d + j*ldab
				// Wait - lower storage: AB(1+i-j, j) = A(i,j) for j<=i<=min(n,j+kd)
				// So AB(d+1, j) in 1-based = AB[d + j*ldab] = A(j+d, j)
				ab[ d + j * ldab ] = -0.01;
			}
		}
	}
	const info = dpbtrf( 'lower', n, kd, ab, 1, ldab, 0 );
	assert.equal( info, 0, 'blocked lower factorization should succeed' );
	for ( j = 0; j < n; j++ ) {
		assert.ok( ab[ j * ldab ] > 0, 'diagonal element ' + j + ' should be positive' ); // eslint-disable-line max-len
	}
});

test( 'dpbtrf: blocked path upper with i2>0 (KD=48)', function t() {
	let j, d;

	const n = 128;
	const kd = 48;
	const ldab = kd + 1;
	const ab = new Float64Array( ldab * n );
	for ( j = 0; j < n; j++ ) {
		ab[ kd + j * ldab ] = kd + 2.0;
		for ( d = 1; d <= kd; d++ ) {
			if ( j + d < n ) {
				ab[ ( kd - d ) + ( j + d ) * ldab ] = -0.01;
			}
		}
	}
	const info = dpbtrf( 'upper', n, kd, ab, 1, ldab, 0 );
	assert.equal( info, 0, 'blocked upper with i2>0 should succeed' );
	for ( j = 0; j < n; j++ ) {
		assert.ok( ab[ kd + j * ldab ] > 0, 'diagonal element ' + j + ' should be positive' ); // eslint-disable-line max-len
	}
});

test( 'dpbtrf: blocked path lower with i2>0 (KD=48)', function t() {
	let j, d;

	const n = 128;
	const kd = 48;
	const ldab = kd + 1;
	const ab = new Float64Array( ldab * n );
	for ( j = 0; j < n; j++ ) {
		ab[ j * ldab ] = kd + 2.0;
		for ( d = 1; d <= kd; d++ ) {
			if ( j + d < n ) {
				ab[ d + j * ldab ] = -0.01;
			}
		}
	}
	const info = dpbtrf( 'lower', n, kd, ab, 1, ldab, 0 );
	assert.equal( info, 0, 'blocked lower with i2>0 should succeed' );
	for ( j = 0; j < n; j++ ) {
		assert.ok( ab[ j * ldab ] > 0, 'diagonal element ' + j + ' should be positive' ); // eslint-disable-line max-len
	}
});

test( 'dpbtrf: blocked path not_posdef upper', function t() {
	let j;

	const n = 64;
	const kd = 32;
	const ldab = kd + 1;
	const ab = new Float64Array( ldab * n );
	for ( j = 0; j < n; j++ ) {
		ab[ kd + j * ldab ] = 1.0;
		if ( j + 1 < n ) {
			ab[ ( kd - 1 ) + ( j + 1 ) * ldab ] = 10.0;
		}
	}
	const info = dpbtrf( 'upper', n, kd, ab, 1, ldab, 0 );
	assert.ok( info > 0, 'should return positive info for non-SPD matrix' );
});

test( 'dpbtrf: blocked path not_posdef lower', function t() {
	let j;

	const n = 64;
	const kd = 32;
	const ldab = kd + 1;
	const ab = new Float64Array( ldab * n );
	for ( j = 0; j < n; j++ ) {
		ab[ j * ldab ] = 1.0;
		if ( j + 1 < n ) {
			ab[ 1 + j * ldab ] = 10.0;
		}
	}
	const info = dpbtrf( 'lower', n, kd, ab, 1, ldab, 0 );
	assert.ok( info > 0, 'should return positive info for non-SPD matrix' );
});
