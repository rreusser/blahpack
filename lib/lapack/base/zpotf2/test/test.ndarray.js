

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpotf2 from './../lib/ndarray.js';
var ndarray = zpotf2;

// FIXTURES //

import upper_2x2 from './fixtures/upper_2x2.json' with { type: 'json' };
import lower_2x2 from './fixtures/lower_2x2.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import upper_3x3 from './fixtures/upper_3x3.json' with { type: 'json' };
import lower_3x3 from './fixtures/lower_3x3.json' with { type: 'json' };
import not_hpd from './fixtures/not_hpd.json' with { type: 'json' };
import not_hpd_lower from './fixtures/not_hpd_lower.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// TESTS //

test( 'zpotf2: upper_2x2', function t() {
	var tc = upper_2x2;
	// A = [4 (2+i); . 5] HPD upper stored, column-major, LDA=2
	var A = new Complex128Array( [
		4, 0, 0, 0,
		2, 1, 5, 0
	] );
	var info = zpotf2( 'upper', 2, A, 1, 2, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zpotf2: lower_2x2', function t() {
	var tc = lower_2x2;
	// A = [4 .; (2-i) 5] HPD lower stored, column-major, LDA=2
	var A = new Complex128Array( [
		4, 0, 2, -1,
		0, 0, 5, 0
	] );
	var info = zpotf2( 'lower', 2, A, 1, 2, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zpotf2: n_zero (N=0 quick return)', function t() {
	var A = new Complex128Array( 1 );
	var info = zpotf2( 'upper', 0, A, 1, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zpotf2: n_one (N=1)', function t() {
	var tc = n_one;
	var A = new Complex128Array( [ 9, 0 ] );
	var info = zpotf2( 'upper', 1, A, 1, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zpotf2: upper_3x3', function t() {
	var tc = upper_3x3;
	// A = [10 (2+i) (3-2i); . 8 (1+i); . . 6] upper stored, LDA=3
	var A = new Complex128Array( [
		10, 0, 0, 0, 0, 0,
		2, 1, 8, 0, 0, 0,
		3, -2, 1, 1, 6, 0
	] );
	var info = zpotf2( 'upper', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zpotf2: lower_3x3', function t() {
	var tc = lower_3x3;
	// Same HPD matrix, lower stored
	var A = new Complex128Array( [
		10, 0, 2, -1, 3, 2,
		0, 0, 8, 0, 1, -1,
		0, 0, 0, 0, 6, 0
	] );
	var info = zpotf2( 'lower', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zpotf2: not_hpd (upper, not positive definite)', function t() {
	var tc = not_hpd;
	var A = new Complex128Array( [
		1, 0, 0, 0,
		2, 1, 1, 0
	] );
	var info = zpotf2( 'upper', 2, A, 1, 2, 0 );
	assert.equal( info, tc.info );
});

test( 'zpotf2: not_hpd_lower (lower, not positive definite)', function t() {
	var tc = not_hpd_lower;
	var A = new Complex128Array( [
		1, 0, 2, -1,
		0, 0, 1, 0
	] );
	var info = zpotf2( 'lower', 2, A, 1, 2, 0 );
	assert.equal( info, tc.info );
});

// ndarray validation tests

test( 'zpotf2: ndarray throws TypeError for invalid uplo', function t() {
	assert.throws( function() {
		ndarray( 'invalid', 3, new Complex128Array( 9 ), 1, 3, 0 );
	}, TypeError );
});

test( 'zpotf2: ndarray throws RangeError for negative N', function t() {
	assert.throws( function() {
		ndarray( 'upper', -1, new Complex128Array( 9 ), 1, 3, 0 );
	}, RangeError );
});
