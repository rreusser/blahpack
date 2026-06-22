// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zppequ from './../lib/ndarray.js';

// FIXTURES //

import upper_basic from './fixtures/upper_basic.json' with { type: 'json' };
import lower_basic from './fixtures/lower_basic.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import non_positive_upper from './fixtures/non_positive_upper.json' with { type: 'json' };
import zero_diag_lower from './fixtures/zero_diag_lower.json' with { type: 'json' };
import identity_upper from './fixtures/identity_upper.json' with { type: 'json' };
import diagonal_varied_lower from './fixtures/diagonal_varied_lower.json' with { type: 'json' };
import non_positive_first from './fixtures/non_positive_first.json' with { type: 'json' };
import non_positive_last from './fixtures/non_positive_last.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// TESTS //

test( 'zppequ is a function', function t() {
	assert.equal( typeof zppequ, 'function' );
});

test( 'zppequ: upper_basic', function t() {
	var result;
	var tc = upper_basic;

	// Upper packed: col 1 = [4], col 2 = [1+2i, 9], col 3 = [0.5+i, 2-i, 16], col 4 = [0.3+0.1i, 1.5-0.5i, 3+0.2i, 25]
	var ap = new Complex128Array( [ 4.0, 0.0, 1.0, 2.0, 9.0, 0.0, 0.5, 1.0, 2.0, -1.0, 16.0, 0.0, 0.3, 0.1, 1.5, -0.5, 3.0, 0.2, 25.0, 0.0 ] );
	var s = new Float64Array( 4 );

	result = zppequ( 'upper', 4, ap, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
	assertArrayClose( Array.from( s ), tc.s, 1e-14, 's' );
});

test( 'zppequ: lower_basic', function t() {
	var result;
	var tc = lower_basic;

	// Lower packed: col 1 = [4, 1-2i, 0.5-i, 0.3-0.1i], col 2 = [9, 2+i, 1.5+0.5i], col 3 = [16, 3-0.2i], col 4 = [25]
	var ap = new Complex128Array( [ 4.0, 0.0, 1.0, -2.0, 0.5, -1.0, 0.3, -0.1, 9.0, 0.0, 2.0, 1.0, 1.5, 0.5, 16.0, 0.0, 3.0, -0.2, 25.0, 0.0 ] );
	var s = new Float64Array( 4 );

	result = zppequ( 'lower', 4, ap, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
	assertArrayClose( Array.from( s ), tc.s, 1e-14, 's' );
});

test( 'zppequ: n_zero', function t() {
	var result;
	var tc = n_zero;
	var ap = new Complex128Array( 1 );
	var s = new Float64Array( 1 );

	result = zppequ( 'upper', 0, ap, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
});

test( 'zppequ: n_one', function t() {
	var result;
	var tc = n_one;
	var ap = new Complex128Array( [ 49.0, 0.0 ] );
	var s = new Float64Array( 1 );

	result = zppequ( 'upper', 1, ap, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
	assertArrayClose( Array.from( s ), tc.s, 1e-14, 's' );
});

test( 'zppequ: non_positive_upper', function t() {
	var result;
	var tc = non_positive_upper;

	// Upper packed N=3: diag at positions 0, 2, 5
	// Diagonal real parts: 4.0, -1.0, 9.0
	var ap = new Complex128Array( [ 4.0, 0.0, 1.0, 0.5, -1.0, 0.0, 0.5, 0.3, 2.0, -0.1, 9.0, 0.0 ] );
	var s = new Float64Array( 3 );

	result = zppequ( 'upper', 3, ap, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
});

test( 'zppequ: zero_diag_lower', function t() {
	var result;
	var tc = zero_diag_lower;

	// Lower packed N=3: diag at positions 0, 3, 5
	// Diagonal real parts: 4.0, 0.0, 9.0
	var ap = new Complex128Array( [ 4.0, 0.0, 1.0, -0.5, 0.5, 0.2, 0.0, 0.0, 2.0, 0.1, 9.0, 0.0 ] );
	var s = new Float64Array( 3 );

	result = zppequ( 'lower', 3, ap, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
});

test( 'zppequ: identity_upper', function t() {
	var result;
	var tc = identity_upper;

	// Upper packed identity N=3: diag at 0, 2, 5, all (1.0, 0.0)
	var ap = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
	var s = new Float64Array( 3 );

	result = zppequ( 'upper', 3, ap, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
	assertArrayClose( Array.from( s ), tc.s, 1e-14, 's' );
});

test( 'zppequ: diagonal_varied_lower', function t() {
	var result;
	var tc = diagonal_varied_lower;

	// Lower packed N=3: diag at 0, 3, 5
	// Diagonal real parts: 100.0, 1.0, 0.25
	var ap = new Complex128Array( [ 100.0, 0.0, 5.0, 1.0, 2.0, -0.5, 1.0, 0.0, 0.1, 0.03, 0.25, 0.0 ] );
	var s = new Float64Array( 3 );

	result = zppequ( 'lower', 3, ap, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
	assertArrayClose( Array.from( s ), tc.s, 1e-14, 's' );
});

test( 'zppequ: non_positive_first', function t() {
	var result;
	var tc = non_positive_first;

	// Lower packed N=3: diag at 0, 3, 5
	// Diagonal real parts: -2.0, 4.0, 9.0
	var ap = new Complex128Array( [ -2.0, 0.0, 1.0, 0.3, 0.5, -0.1, 4.0, 0.0, 2.0, 0.7, 9.0, 0.0 ] );
	var s = new Float64Array( 3 );

	result = zppequ( 'lower', 3, ap, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
});

test( 'zppequ: non_positive_last', function t() {
	var result;
	var tc = non_positive_last;

	// Upper packed N=3: diag at 0, 2, 5
	// Diagonal real parts: 4.0, 9.0, -3.0
	var ap = new Complex128Array( [ 4.0, 0.0, 1.0, 0.5, 9.0, 0.0, 0.5, -0.2, 2.0, 0.8, -3.0, 0.0 ] );
	var s = new Float64Array( 3 );

	result = zppequ( 'upper', 3, ap, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
});

test( 'zppequ: non-unit stride for s', function t() {
	// Upper packed N=3: diag real parts 4.0, 9.0, 16.0
	var ap = new Complex128Array( [ 4.0, 0.0, 1.0, 0.5, 9.0, 0.0, 0.5, 0.1, 2.0, -0.3, 16.0, 0.0 ] );
	var s = new Float64Array( 6 );
	var result;

	result = zppequ( 'upper', 3, ap, 1, 0, s, 2, 0 );
	assert.equal( result.info, 0, 'info' );
	assertClose( s[ 0 ], 1.0 / Math.sqrt( 4.0 ), 1e-14, 's[0]' );
	assertClose( s[ 2 ], 1.0 / Math.sqrt( 9.0 ), 1e-14, 's[2]' );
	assertClose( s[ 4 ], 1.0 / Math.sqrt( 16.0 ), 1e-14, 's[4]' );
});

test( 'zppequ: offset for AP', function t() {
	// Prepend 3 complex elements, then upper packed N=2: diag real parts 25.0, 36.0
	var ap = new Complex128Array( [ 999.0, 0.0, 999.0, 0.0, 999.0, 0.0, 25.0, 0.0, 7.0, 1.0, 36.0, 0.0 ] );
	var s = new Float64Array( 2 );
	var result;

	result = zppequ( 'upper', 2, ap, 1, 3, s, 1, 0 );
	assert.equal( result.info, 0, 'info' );
	assertClose( s[ 0 ], 1.0 / Math.sqrt( 25.0 ), 1e-14, 's[0]' );
	assertClose( s[ 1 ], 1.0 / Math.sqrt( 36.0 ), 1e-14, 's[1]' );
	assertClose( result.amax, 36.0, 1e-14, 'amax' );
	assertClose( result.scond, Math.sqrt( 25.0 ) / Math.sqrt( 36.0 ), 1e-14, 'scond' );
});

test( 'zppequ: offset for s', function t() {
	// Lower packed N=2: diag real parts 9.0, 16.0
	var ap = new Complex128Array( [ 9.0, 0.0, 3.0, 0.5, 16.0, 0.0 ] );
	var s = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	var result;

	result = zppequ( 'lower', 2, ap, 1, 0, s, 1, 2 );
	assert.equal( result.info, 0, 'info' );
	assertClose( s[ 2 ], 1.0 / Math.sqrt( 9.0 ), 1e-14, 's[2]' );
	assertClose( s[ 3 ], 1.0 / Math.sqrt( 16.0 ), 1e-14, 's[3]' );
});

test( 'zppequ: N=1 lower', function t() {
	var ap = new Complex128Array( [ 25.0, 0.0 ] );
	var s = new Float64Array( 1 );
	var result;

	result = zppequ( 'lower', 1, ap, 1, 0, s, 1, 0 );
	assert.equal( result.info, 0, 'info' );
	assertClose( s[ 0 ], 1.0 / Math.sqrt( 25.0 ), 1e-14, 's[0]' );
	assertClose( result.scond, 1.0, 1e-14, 'scond' );
	assertClose( result.amax, 25.0, 1e-14, 'amax' );
});

test( 'zppequ: nonzero imaginary parts on diagonal', function t() {
	// Upper packed N=2: AP = [(4+3i), (1+2i), (9+5i)]
	// Diagonal real parts: 4.0, 9.0 (imaginary parts ignored)
	var ap = new Complex128Array( [ 4.0, 3.0, 1.0, 2.0, 9.0, 5.0 ] );
	var s = new Float64Array( 2 );
	var result;

	result = zppequ( 'upper', 2, ap, 1, 0, s, 1, 0 );
	assert.equal( result.info, 0, 'info' );
	assertClose( s[ 0 ], 1.0 / Math.sqrt( 4.0 ), 1e-14, 's[0]' );
	assertClose( s[ 1 ], 1.0 / Math.sqrt( 9.0 ), 1e-14, 's[1]' );
	assertClose( result.amax, 9.0, 1e-14, 'amax' );
	assertClose( result.scond, Math.sqrt( 4.0 ) / Math.sqrt( 9.0 ), 1e-14, 'scond' );
});
