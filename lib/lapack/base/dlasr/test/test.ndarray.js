/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasr from './../lib/ndarray.js';


// FIXTURES //

import mZero from './fixtures/m_zero.json' with { type: 'json' };
import nZero from './fixtures/n_zero.json' with { type: 'json' };
import lVF from './fixtures/l_v_f.json' with { type: 'json' };
import lVB from './fixtures/l_v_b.json' with { type: 'json' };
import lTF from './fixtures/l_t_f.json' with { type: 'json' };
import lTB from './fixtures/l_t_b.json' with { type: 'json' };
import lBF from './fixtures/l_b_f.json' with { type: 'json' };
import lBB from './fixtures/l_b_b.json' with { type: 'json' };
import rVF from './fixtures/r_v_f.json' with { type: 'json' };
import rVB from './fixtures/r_v_b.json' with { type: 'json' };
import rTF from './fixtures/r_t_f.json' with { type: 'json' };
import rTB from './fixtures/r_t_b.json' with { type: 'json' };
import rBF from './fixtures/r_b_f.json' with { type: 'json' };
import rBB from './fixtures/r_b_b.json' with { type: 'json' };

var fixtures = {
	'm_zero': mZero,
	'n_zero': nZero,
	'L_V_F': lVF,
	'L_V_B': lVB,
	'L_T_F': lTF,
	'L_T_B': lTB,
	'L_B_F': lBF,
	'L_B_B': lBB,
	'R_V_F': rVF,
	'R_V_B': rVB,
	'R_T_F': rTF,
	'R_T_B': rTB,
	'R_B_F': rBF,
	'R_B_B': rBB
};


// FUNCTIONS //

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
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		var relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
	}
}

/**
* Returns a 4x4 matrix A = [1 5 9 13; 2 6 10 14; 3 7 11 15; 4 8 12 16].
* in column-major flat array.
*/
function initMatrix( ) {
	return new Float64Array([
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		10,
		11,
		12,
		13,
		14,
		15,
		16
	]);
}

/**
* Returns the c and s arrays used in all 12 combination tests.
*/
function initCS( ) {
	return {
		'c': new Float64Array([ 0.6, 0.8, 0.5 ]),
		's': new Float64Array([ 0.8, 0.6, 0.866025403784439 ])
	};
}

/**
* Helper to run a single test case against fixture.
*/
function runCase( side, pivot, direct, M, N, caseName ) {
	var tc = fixtures[ caseName ];
	var cs = initCS();
	var A = initMatrix();
	dlasr( side, pivot, direct, M, N, cs.c, 1, 0, cs.s, 1, 0, A, 1, M, 0 );
	assertArrayClose( A, tc.A, 1e-14, caseName + ' A' );
}


// TESTS //

test( 'dlasr: m_zero (quick return)', function t() {
	var expected;
	var tc;
	var cs;
	var A;

	tc = mZero;
	A = initMatrix();
	expected = new Float64Array( A );
	cs = initCS();
	dlasr( 'left', 'variable', 'forward', 0, 4, cs.c, 1, 0, cs.s, 1, 0, A, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( A, expected, 1e-14, 'm_zero A' );
});

test( 'dlasr: n_zero (quick return)', function t() {
	var expected;
	var tc;
	var cs;
	var A;

	tc = nZero;
	A = initMatrix();
	expected = new Float64Array( A );
	cs = initCS();
	dlasr( 'left', 'variable', 'forward', 4, 0, cs.c, 1, 0, cs.s, 1, 0, A, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( A, expected, 1e-14, 'n_zero A' );
});

test( 'dlasr: SIDE=L, PIVOT=V, DIRECT=F', function t() {
	runCase( 'left', 'variable', 'forward', 4, 4, 'L_V_F' );
});

test( 'dlasr: SIDE=L, PIVOT=V, DIRECT=B', function t() {
	runCase( 'left', 'variable', 'backward', 4, 4, 'L_V_B' );
});

test( 'dlasr: SIDE=L, PIVOT=T, DIRECT=F', function t() {
	runCase( 'left', 'top', 'forward', 4, 4, 'L_T_F' );
});

test( 'dlasr: SIDE=L, PIVOT=T, DIRECT=B', function t() {
	runCase( 'left', 'top', 'backward', 4, 4, 'L_T_B' );
});

test( 'dlasr: SIDE=L, PIVOT=B, DIRECT=F', function t() {
	runCase( 'left', 'bottom', 'forward', 4, 4, 'L_B_F' );
});

test( 'dlasr: SIDE=L, PIVOT=B, DIRECT=B', function t() {
	runCase( 'left', 'bottom', 'backward', 4, 4, 'L_B_B' );
});

test( 'dlasr: SIDE=R, PIVOT=V, DIRECT=F', function t() {
	runCase( 'right', 'variable', 'forward', 4, 4, 'R_V_F' );
});

test( 'dlasr: SIDE=R, PIVOT=V, DIRECT=B', function t() {
	runCase( 'right', 'variable', 'backward', 4, 4, 'R_V_B' );
});

test( 'dlasr: SIDE=R, PIVOT=T, DIRECT=F', function t() {
	runCase( 'right', 'top', 'forward', 4, 4, 'R_T_F' );
});

test( 'dlasr: SIDE=R, PIVOT=T, DIRECT=B', function t() {
	runCase( 'right', 'top', 'backward', 4, 4, 'R_T_B' );
});

test( 'dlasr: SIDE=R, PIVOT=B, DIRECT=F', function t() {
	runCase( 'right', 'bottom', 'forward', 4, 4, 'R_B_F' );
});

test( 'dlasr: SIDE=R, PIVOT=B, DIRECT=B', function t() {
	runCase( 'right', 'bottom', 'backward', 4, 4, 'R_B_B' );
});

test( 'dlasr: returns A', function t() {
	var result;
	var cs;
	var A;

	cs = initCS();
	A = initMatrix();
	result = dlasr( 'left', 'variable', 'forward', 4, 4, cs.c, 1, 0, cs.s, 1, 0, A, 1, 4, 0 ); // eslint-disable-line max-len
	assert.equal( result, A );
});

test( 'dlasr: lowercase parameters match uppercase', function t() {
	var A1;
	var A2;
	var cs;

	// Test lowercase 'l', 'v', 'f'
	cs = initCS();
	A1 = initMatrix();
	A2 = initMatrix();
	dlasr( 'left', 'variable', 'forward', 4, 4, cs.c, 1, 0, cs.s, 1, 0, A1, 1, 4, 0 ); // eslint-disable-line max-len
	dlasr( 'left', 'variable', 'forward', 4, 4, cs.c, 1, 0, cs.s, 1, 0, A2, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( A2, A1, 1e-14, 'l_v_f lowercase' );

	// Test lowercase 'l', 'v', 'b'
	cs = initCS();
	A1 = initMatrix();
	A2 = initMatrix();
	dlasr( 'left', 'variable', 'backward', 4, 4, cs.c, 1, 0, cs.s, 1, 0, A1, 1, 4, 0 ); // eslint-disable-line max-len
	dlasr( 'left', 'variable', 'backward', 4, 4, cs.c, 1, 0, cs.s, 1, 0, A2, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( A2, A1, 1e-14, 'l_v_b lowercase' );

	// Test lowercase 'l', 't', 'f'
	cs = initCS();
	A1 = initMatrix();
	A2 = initMatrix();
	dlasr( 'left', 'top', 'forward', 4, 4, cs.c, 1, 0, cs.s, 1, 0, A1, 1, 4, 0 );
	dlasr( 'left', 'top', 'forward', 4, 4, cs.c, 1, 0, cs.s, 1, 0, A2, 1, 4, 0 );
	assertArrayClose( A2, A1, 1e-14, 'l_t_f lowercase' );

	// Test lowercase 'l', 'b', 'f'
	cs = initCS();
	A1 = initMatrix();
	A2 = initMatrix();
	dlasr( 'left', 'bottom', 'forward', 4, 4, cs.c, 1, 0, cs.s, 1, 0, A1, 1, 4, 0 ); // eslint-disable-line max-len
	dlasr( 'left', 'bottom', 'forward', 4, 4, cs.c, 1, 0, cs.s, 1, 0, A2, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( A2, A1, 1e-14, 'l_b_f lowercase' );

	// Test lowercase 'r', 'v', 'f'
	cs = initCS();
	A1 = initMatrix();
	A2 = initMatrix();
	dlasr( 'right', 'variable', 'forward', 4, 4, cs.c, 1, 0, cs.s, 1, 0, A1, 1, 4, 0 ); // eslint-disable-line max-len
	dlasr( 'right', 'variable', 'forward', 4, 4, cs.c, 1, 0, cs.s, 1, 0, A2, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( A2, A1, 1e-14, 'r_v_f lowercase' );

	// Test lowercase 'r', 't', 'f'
	cs = initCS();
	A1 = initMatrix();
	A2 = initMatrix();
	dlasr( 'right', 'top', 'forward', 4, 4, cs.c, 1, 0, cs.s, 1, 0, A1, 1, 4, 0 );
	dlasr( 'right', 'top', 'forward', 4, 4, cs.c, 1, 0, cs.s, 1, 0, A2, 1, 4, 0 );
	assertArrayClose( A2, A1, 1e-14, 'r_t_f lowercase' );

	// Test lowercase 'r', 'b', 'f'
	cs = initCS();
	A1 = initMatrix();
	A2 = initMatrix();
	dlasr( 'right', 'bottom', 'forward', 4, 4, cs.c, 1, 0, cs.s, 1, 0, A1, 1, 4, 0 ); // eslint-disable-line max-len
	dlasr( 'right', 'bottom', 'forward', 4, 4, cs.c, 1, 0, cs.s, 1, 0, A2, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( A2, A1, 1e-14, 'r_b_f lowercase' );
});

test( 'dlasr: identity rotation (c=1, s=0) skips computation', function t() {
	var expected;
	var A;
	var c;
	var s;

	c = new Float64Array([ 1.0, 1.0, 1.0 ]);
	s = new Float64Array([ 0.0, 0.0, 0.0 ]);
	A = initMatrix();
	expected = new Float64Array( A );
	dlasr( 'left', 'variable', 'forward', 4, 4, c, 1, 0, s, 1, 0, A, 1, 4, 0 );
	assertArrayClose( A, expected, 1e-14, 'L_V_F identity' );
	A = initMatrix();
	dlasr( 'left', 'top', 'forward', 4, 4, c, 1, 0, s, 1, 0, A, 1, 4, 0 );
	assertArrayClose( A, expected, 1e-14, 'L_T_F identity' );
	A = initMatrix();
	dlasr( 'left', 'bottom', 'forward', 4, 4, c, 1, 0, s, 1, 0, A, 1, 4, 0 );
	assertArrayClose( A, expected, 1e-14, 'L_B_F identity' );
	A = initMatrix();
	dlasr( 'right', 'variable', 'forward', 4, 4, c, 1, 0, s, 1, 0, A, 1, 4, 0 );
	assertArrayClose( A, expected, 1e-14, 'R_V_F identity' );
	A = initMatrix();
	dlasr( 'right', 'top', 'forward', 4, 4, c, 1, 0, s, 1, 0, A, 1, 4, 0 );
	assertArrayClose( A, expected, 1e-14, 'R_T_F identity' );
	A = initMatrix();
	dlasr( 'right', 'bottom', 'forward', 4, 4, c, 1, 0, s, 1, 0, A, 1, 4, 0 );
	assertArrayClose( A, expected, 1e-14, 'R_B_F identity' );
	A = initMatrix();
	dlasr( 'left', 'variable', 'backward', 4, 4, c, 1, 0, s, 1, 0, A, 1, 4, 0 );
	assertArrayClose( A, expected, 1e-14, 'L_V_B identity' );
	A = initMatrix();
	dlasr( 'left', 'top', 'backward', 4, 4, c, 1, 0, s, 1, 0, A, 1, 4, 0 );
	assertArrayClose( A, expected, 1e-14, 'L_T_B identity' );
	A = initMatrix();
	dlasr( 'left', 'bottom', 'backward', 4, 4, c, 1, 0, s, 1, 0, A, 1, 4, 0 );
	assertArrayClose( A, expected, 1e-14, 'L_B_B identity' );
	A = initMatrix();
	dlasr( 'right', 'variable', 'backward', 4, 4, c, 1, 0, s, 1, 0, A, 1, 4, 0 );
	assertArrayClose( A, expected, 1e-14, 'R_V_B identity' );
	A = initMatrix();
	dlasr( 'right', 'top', 'backward', 4, 4, c, 1, 0, s, 1, 0, A, 1, 4, 0 );
	assertArrayClose( A, expected, 1e-14, 'R_T_B identity' );
	A = initMatrix();
	dlasr( 'right', 'bottom', 'backward', 4, 4, c, 1, 0, s, 1, 0, A, 1, 4, 0 );
	assertArrayClose( A, expected, 1e-14, 'R_B_B identity' );
});
