

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zpoequ from './../lib/ndarray.js';

// FIXTURES //

import basic from './fixtures/basic.json' with { type: 'json' };
import diagonal_varied from './fixtures/diagonal_varied.json' with { type: 'json' };
import non_positive_diag from './fixtures/non_positive_diag.json' with { type: 'json' };
import zero_diag from './fixtures/zero_diag.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import identity from './fixtures/identity.json' with { type: 'json' };

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

test( 'zpoequ: basic', function t() {
	var tc = basic;
	// A = [[4, 1+i, 0], [1-i, 9, 1], [0, 1, 16]]
	var A = new Complex128Array( [ 4, 0, 1, -1, 0, 0, 1, 1, 9, 0, 1, 0, 0, 0, 1, 0, 16, 0 ] );
	var s = new Float64Array( 3 );
	var result = zpoequ( 3, A, 1, 3, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
	assertArrayClose( Array.from( s ), tc.s, 1e-14, 's' );
});

test( 'zpoequ: diagonal_varied', function t() {
	var tc = diagonal_varied;
	// A = diag(100, 1, 0.25)
	var A = new Complex128Array( [ 100, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0.25, 0 ] );
	var s = new Float64Array( 3 );
	var result = zpoequ( 3, A, 1, 3, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
	assertArrayClose( Array.from( s ), tc.s, 1e-14, 's' );
});

test( 'zpoequ: non_positive_diag', function t() {
	var tc = non_positive_diag;
	// A has diag [4, -1, 9]
	var A = new Complex128Array( [ 4, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 9, 0 ] );
	var s = new Float64Array( 3 );
	var result = zpoequ( 3, A, 1, 3, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
});

test( 'zpoequ: zero_diag', function t() {
	var tc = zero_diag;
	// A has diag [4, 0, 9]
	var A = new Complex128Array( [ 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 0 ] );
	var s = new Float64Array( 3 );
	var result = zpoequ( 3, A, 1, 3, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
});

test( 'zpoequ: n_zero', function t() {
	var tc = n_zero;
	var A = new Complex128Array( 1 );
	var s = new Float64Array( 1 );
	var result = zpoequ( 0, A, 1, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
});

test( 'zpoequ: n_one', function t() {
	var tc = n_one;
	var A = new Complex128Array( [ 25, 0 ] );
	var s = new Float64Array( 1 );
	var result = zpoequ( 1, A, 1, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
	assertArrayClose( Array.from( s ), tc.s, 1e-14, 's' );
});

test( 'zpoequ: identity', function t() {
	var tc = identity;
	var A = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0 ] );
	var s = new Float64Array( 3 );
	var result = zpoequ( 3, A, 1, 3, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
	assertArrayClose( Array.from( s ), tc.s, 1e-14, 's' );
});
