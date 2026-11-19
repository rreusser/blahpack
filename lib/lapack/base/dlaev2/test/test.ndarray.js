/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlaev2 from './../lib/ndarray.js';


// FIXTURES //

import identity from './fixtures/identity.json' with { type: 'json' };
import diagonal from './fixtures/diagonal.json' with { type: 'json' };
import off_diagonal from './fixtures/off_diagonal.json' with { type: 'json' };
import general from './fixtures/general.json' with { type: 'json' };
import negative_diagonal from './fixtures/negative_diagonal.json' with { type: 'json' };
import sm_zero from './fixtures/sm_zero.json' with { type: 'json' };
import equal_diagonal from './fixtures/equal_diagonal.json' with { type: 'json' };
import negative_offdiag from './fixtures/negative_offdiag.json' with { type: 'json' };
import df_negative from './fixtures/df_negative.json' with { type: 'json' };
import b_zero_a_lt_c from './fixtures/b_zero_a_lt_c.json' with { type: 'json' };

const fixtures = {
	'identity': identity,
	'diagonal': diagonal,
	'off_diagonal': off_diagonal,
	'general': general,
	'negative_diagonal': negative_diagonal,
	'sm_zero': sm_zero,
	'equal_diagonal': equal_diagonal,
	'negative_offdiag': negative_offdiag,
	'df_negative': df_negative,
	'b_zero_a_lt_c': b_zero_a_lt_c
};


// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Checks all four outputs of dlaev2 against fixture values.
*
* @private
* @param {Object} out - result from dlaev2
* @param {Object} tc - test case from fixture
* @param {number} tol - tolerance
*/
function checkResult( out, tc, tol ) {
	assertClose( out.rt1, tc.rt1, tol, 'rt1' );
	assertClose( out.rt2, tc.rt2, tol, 'rt2' );
	assertClose( out.cs1, tc.cs1, tol, 'cs1' );
	assertClose( out.sn1, tc.sn1, tol, 'sn1' );
}


// TESTS //

test( 'dlaev2 is a function', function t() {
	assert.strictEqual( typeof dlaev2, 'function' );
} );

test( 'dlaev2: identity matrix', function t() {
	const rt1 = new Float64Array( 1 );
	const rt2 = new Float64Array( 1 );
	const cs1 = new Float64Array( 1 );
	const sn1 = new Float64Array( 1 );

	const tc = identity;
	dlaev2( tc.a, tc.b, tc.c, rt1, rt2, cs1, sn1 );
	const out = {
		'rt1': rt1[ 0 ],
		'rt2': rt2[ 0 ],
		'cs1': cs1[ 0 ],
		'sn1': sn1[ 0 ]
	};
	checkResult( out, tc, 1e-14 );
} );

test( 'dlaev2: diagonal matrix', function t() {
	const rt1 = new Float64Array( 1 );
	const rt2 = new Float64Array( 1 );
	const cs1 = new Float64Array( 1 );
	const sn1 = new Float64Array( 1 );

	const tc = diagonal;
	dlaev2( tc.a, tc.b, tc.c, rt1, rt2, cs1, sn1 );
	const out = {
		'rt1': rt1[ 0 ],
		'rt2': rt2[ 0 ],
		'cs1': cs1[ 0 ],
		'sn1': sn1[ 0 ]
	};
	checkResult( out, tc, 1e-14 );
} );

test( 'dlaev2: off-diagonal only', function t() {
	const rt1 = new Float64Array( 1 );
	const rt2 = new Float64Array( 1 );
	const cs1 = new Float64Array( 1 );
	const sn1 = new Float64Array( 1 );

	const tc = off_diagonal;
	dlaev2( tc.a, tc.b, tc.c, rt1, rt2, cs1, sn1 );
	const out = {
		'rt1': rt1[ 0 ],
		'rt2': rt2[ 0 ],
		'cs1': cs1[ 0 ],
		'sn1': sn1[ 0 ]
	};
	checkResult( out, tc, 1e-14 );
} );

test( 'dlaev2: general case', function t() {
	const rt1 = new Float64Array( 1 );
	const rt2 = new Float64Array( 1 );
	const cs1 = new Float64Array( 1 );
	const sn1 = new Float64Array( 1 );

	const tc = general;
	dlaev2( tc.a, tc.b, tc.c, rt1, rt2, cs1, sn1 );
	const out = {
		'rt1': rt1[ 0 ],
		'rt2': rt2[ 0 ],
		'cs1': cs1[ 0 ],
		'sn1': sn1[ 0 ]
	};
	checkResult( out, tc, 1e-14 );
} );

test( 'dlaev2: negative diagonal', function t() {
	const rt1 = new Float64Array( 1 );
	const rt2 = new Float64Array( 1 );
	const cs1 = new Float64Array( 1 );
	const sn1 = new Float64Array( 1 );

	const tc = negative_diagonal;
	dlaev2( tc.a, tc.b, tc.c, rt1, rt2, cs1, sn1 );
	const out = {
		'rt1': rt1[ 0 ],
		'rt2': rt2[ 0 ],
		'cs1': cs1[ 0 ],
		'sn1': sn1[ 0 ]
	};
	checkResult( out, tc, 1e-14 );
} );

test( 'dlaev2: sm = 0', function t() {
	const rt1 = new Float64Array( 1 );
	const rt2 = new Float64Array( 1 );
	const cs1 = new Float64Array( 1 );
	const sn1 = new Float64Array( 1 );

	const tc = sm_zero;
	dlaev2( tc.a, tc.b, tc.c, rt1, rt2, cs1, sn1 );
	const out = {
		'rt1': rt1[ 0 ],
		'rt2': rt2[ 0 ],
		'cs1': cs1[ 0 ],
		'sn1': sn1[ 0 ]
	};
	checkResult( out, tc, 1e-14 );
} );

test( 'dlaev2: equal diagonal', function t() {
	const rt1 = new Float64Array( 1 );
	const rt2 = new Float64Array( 1 );
	const cs1 = new Float64Array( 1 );
	const sn1 = new Float64Array( 1 );

	const tc = equal_diagonal;
	dlaev2( tc.a, tc.b, tc.c, rt1, rt2, cs1, sn1 );
	const out = {
		'rt1': rt1[ 0 ],
		'rt2': rt2[ 0 ],
		'cs1': cs1[ 0 ],
		'sn1': sn1[ 0 ]
	};
	checkResult( out, tc, 1e-14 );
} );

test( 'dlaev2: negative off-diagonal', function t() {
	const rt1 = new Float64Array( 1 );
	const rt2 = new Float64Array( 1 );
	const cs1 = new Float64Array( 1 );
	const sn1 = new Float64Array( 1 );

	const tc = negative_offdiag;
	dlaev2( tc.a, tc.b, tc.c, rt1, rt2, cs1, sn1 );
	const out = {
		'rt1': rt1[ 0 ],
		'rt2': rt2[ 0 ],
		'cs1': cs1[ 0 ],
		'sn1': sn1[ 0 ]
	};
	checkResult( out, tc, 1e-14 );
} );

test( 'dlaev2: df < 0 (a < c)', function t() {
	const rt1 = new Float64Array( 1 );
	const rt2 = new Float64Array( 1 );
	const cs1 = new Float64Array( 1 );
	const sn1 = new Float64Array( 1 );

	const tc = df_negative;
	dlaev2( tc.a, tc.b, tc.c, rt1, rt2, cs1, sn1 );
	const out = {
		'rt1': rt1[ 0 ],
		'rt2': rt2[ 0 ],
		'cs1': cs1[ 0 ],
		'sn1': sn1[ 0 ]
	};
	checkResult( out, tc, 1e-14 );
} );

test( 'dlaev2: b=0, a < c', function t() {
	const rt1 = new Float64Array( 1 );
	const rt2 = new Float64Array( 1 );
	const cs1 = new Float64Array( 1 );
	const sn1 = new Float64Array( 1 );

	const tc = b_zero_a_lt_c;
	dlaev2( tc.a, tc.b, tc.c, rt1, rt2, cs1, sn1 );
	const out = {
		'rt1': rt1[ 0 ],
		'rt2': rt2[ 0 ],
		'cs1': cs1[ 0 ],
		'sn1': sn1[ 0 ]
	};
	checkResult( out, tc, 1e-14 );
} );

test( 'dlaev2: verifies diagonalization property', function t() {
	const rt1 = new Float64Array( 1 );
	const rt2 = new Float64Array( 1 );
	const cs1 = new Float64Array( 1 );
	const sn1 = new Float64Array( 1 );
	let a11, a12, a21, a22, t11, t12, t21, t22, tc, i;

	const names = [ 'identity', 'diagonal', 'off_diagonal', 'general', 'negative_diagonal', 'sm_zero', 'equal_diagonal', 'negative_offdiag', 'df_negative', 'b_zero_a_lt_c' ]; // eslint-disable-line max-len
	for ( i = 0; i < names.length; i += 1 ) {
		tc = fixtures[ names[ i ] ];
		dlaev2( tc.a, tc.b, tc.c, rt1, rt2, cs1, sn1 );

		// Compute Q^T * A * Q where Q = [cs1 -sn1; sn1 cs1]:
		t11 = (tc.a * cs1[ 0 ]) + (tc.b * sn1[ 0 ]);
		t12 = (-tc.a * sn1[ 0 ]) + (tc.b * cs1[ 0 ]);
		t21 = (tc.b * cs1[ 0 ]) + (tc.c * sn1[ 0 ]);
		t22 = (-tc.b * sn1[ 0 ]) + (tc.c * cs1[ 0 ]);
		a11 = (cs1[ 0 ] * t11) + (sn1[ 0 ] * t21);
		a12 = (cs1[ 0 ] * t12) + (sn1[ 0 ] * t22);
		a21 = (-sn1[ 0 ] * t11) + (cs1[ 0 ] * t21);
		a22 = (-sn1[ 0 ] * t12) + (cs1[ 0 ] * t22);

		assertClose( a11, rt1[ 0 ], 1e-12, names[ i ] + ': diag(1,1)=rt1' );
		assertClose( a22, rt2[ 0 ], 1e-12, names[ i ] + ': diag(2,2)=rt2' );
		assertClose( a12, 0.0, 1e-12, names[ i ] + ': off(1,2)=0' );
		assertClose( a21, 0.0, 1e-12, names[ i ] + ': off(2,1)=0' );
	}
} );

test( 'dlaev2: rt1 has larger absolute value than rt2', function t() {
	const rt1 = new Float64Array( 1 );
	const rt2 = new Float64Array( 1 );
	const cs1 = new Float64Array( 1 );
	const sn1 = new Float64Array( 1 );
	let tc, i;

	const names = [ 'identity', 'diagonal', 'off_diagonal', 'general', 'negative_diagonal', 'sm_zero', 'equal_diagonal', 'negative_offdiag', 'df_negative', 'b_zero_a_lt_c' ]; // eslint-disable-line max-len
	for ( i = 0; i < names.length; i += 1 ) {
		tc = fixtures[ names[ i ] ];
		dlaev2( tc.a, tc.b, tc.c, rt1, rt2, cs1, sn1 );
		assert.ok( Math.abs( rt1[ 0 ] ) >= Math.abs( rt2[ 0 ] ), names[ i ] + ': |rt1| >= |rt2|' ); // eslint-disable-line max-len
	}
} );

test( 'dlaev2: eigenvector is unit length', function t() {
	const rt1 = new Float64Array( 1 );
	const rt2 = new Float64Array( 1 );
	const cs1 = new Float64Array( 1 );
	const sn1 = new Float64Array( 1 );
	let norm, tc, i;

	const names = [ 'identity', 'diagonal', 'off_diagonal', 'general', 'negative_diagonal', 'sm_zero', 'equal_diagonal', 'negative_offdiag', 'df_negative', 'b_zero_a_lt_c' ]; // eslint-disable-line max-len
	for ( i = 0; i < names.length; i += 1 ) {
		tc = fixtures[ names[ i ] ];
		dlaev2( tc.a, tc.b, tc.c, rt1, rt2, cs1, sn1 );
		norm = Math.sqrt( ( cs1[ 0 ] * cs1[ 0 ] ) + ( sn1[ 0 ] * sn1[ 0 ] ) );
		assertClose( norm, 1.0, 1e-14, names[ i ] + ': eigenvector should be unit length' ); // eslint-disable-line max-len
	}
} );
