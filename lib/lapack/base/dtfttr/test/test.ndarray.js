/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtfttr from './../lib/ndarray.js';


// FIXTURES //

import n1 from './fixtures/n1.json' with { type: 'json' };
import n5NL from './fixtures/n5_n_l.json' with { type: 'json' };
import n5NU from './fixtures/n5_n_u.json' with { type: 'json' };
import n5TL from './fixtures/n5_t_l.json' with { type: 'json' };
import n5TU from './fixtures/n5_t_u.json' with { type: 'json' };
import n5NLLda8 from './fixtures/n5_n_l_lda8.json' with { type: 'json' };
import n6NL from './fixtures/n6_n_l.json' with { type: 'json' };
import n6NU from './fixtures/n6_n_u.json' with { type: 'json' };
import n6TL from './fixtures/n6_t_l.json' with { type: 'json' };
import n6TU from './fixtures/n6_t_u.json' with { type: 'json' };
import n7NL from './fixtures/n7_n_l.json' with { type: 'json' };
import n7NU from './fixtures/n7_n_u.json' with { type: 'json' };
import n7TL from './fixtures/n7_t_l.json' with { type: 'json' };
import n7TU from './fixtures/n7_t_u.json' with { type: 'json' };
import n8NL from './fixtures/n8_n_l.json' with { type: 'json' };
import n8NU from './fixtures/n8_n_u.json' with { type: 'json' };
import n8TL from './fixtures/n8_t_l.json' with { type: 'json' };
import n8TU from './fixtures/n8_t_u.json' with { type: 'json' };

var fixtures = {
	'n1': n1,
	'n5_N_L': n5NL,
	'n5_N_U': n5NU,
	'n5_T_L': n5TL,
	'n5_T_U': n5TU,
	'n5_N_L_lda8': n5NLLda8,
	'n6_N_L': n6NL,
	'n6_N_U': n6NU,
	'n6_T_L': n6TL,
	'n6_T_U': n6TU,
	'n7_N_L': n7NL,
	'n7_N_U': n7NU,
	'n7_T_L': n7TL,
	'n7_T_U': n7TU,
	'n8_N_L': n8NL,
	'n8_N_U': n8NU,
	'n8_T_L': n8TL,
	'n8_T_U': n8TU
};

/**
* Runs a standard dtfttr fixture test with LDA = N.
*
* @private
* @param {string} name - fixture case name
* @param {string} transr - `'no-transpose'` or `'transpose'`
* @param {string} uplo - `'lower'` or `'upper'`
*/
function runFixtureTest( name, transr, uplo ) {
	var expected;
	var actual;
	var info;
	var arf;
	var tc;
	var n;
	var A;
	var i;

	tc = fixtures[ name ];
	n = tc.n;
	arf = new Float64Array( tc.ARF );
	A = new Float64Array( n * n );
	info = dtfttr( transr, uplo, n, arf, 1, 0, A, 1, n, 0, n );

	assert.equal( info, tc.info, name + ' info' );

	expected = tc.A;
	actual = toArray( A );
	assert.equal( actual.length, expected.length, name + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		assert.equal( actual[ i ], expected[ i ], name + ': A[' + i + '] expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
	}
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}


// TESTS //

test( 'dtfttr is a function', function t() {
	assert.equal( typeof dtfttr, 'function' );
});

test( 'dtfttr: N=0 quick return', function t() {
	var info;
	var arf;
	var A;

	A = new Float64Array( [ -1.0 ] );
	arf = new Float64Array( 1 );
	info = dtfttr( 'no-transpose', 'lower', 0, arf, 1, 0, A, 1, 1, 0, 1 );
	assert.equal( info, 0, 'info' );
	assert.equal( A[ 0 ], -1.0, 'A unchanged' );
});

test( 'dtfttr: N=1 quick return', function t() {
	var info;
	var arf;
	var tc;
	var A;

	tc = n1;
	arf = new Float64Array( [ 42.0 ] );
	A = new Float64Array( 1 );
	info = dtfttr( 'no-transpose', 'lower', 1, arf, 1, 0, A, 1, 1, 0, 1 );
	assert.equal( info, 0, 'info' );
	assert.equal( A[ 0 ], tc.a00, 'A[0,0]' );
});

// N=5 (odd) tests
test( 'dtfttr: N=5, normal, lower', function t() {
	runFixtureTest( 'n5_N_L', 'no-transpose', 'lower' );
});

test( 'dtfttr: N=5, normal, upper', function t() {
	runFixtureTest( 'n5_N_U', 'no-transpose', 'upper' );
});

test( 'dtfttr: N=5, transpose, lower', function t() {
	runFixtureTest( 'n5_T_L', 'transpose', 'lower' );
});

test( 'dtfttr: N=5, transpose, upper', function t() {
	runFixtureTest( 'n5_T_U', 'transpose', 'upper' );
});

// N=6 (even) tests
test( 'dtfttr: N=6, normal, lower', function t() {
	runFixtureTest( 'n6_N_L', 'no-transpose', 'lower' );
});

test( 'dtfttr: N=6, normal, upper', function t() {
	runFixtureTest( 'n6_N_U', 'no-transpose', 'upper' );
});

test( 'dtfttr: N=6, transpose, lower', function t() {
	runFixtureTest( 'n6_T_L', 'transpose', 'lower' );
});

test( 'dtfttr: N=6, transpose, upper', function t() {
	runFixtureTest( 'n6_T_U', 'transpose', 'upper' );
});

// N=7 (odd, larger) tests
test( 'dtfttr: N=7, normal, lower', function t() {
	runFixtureTest( 'n7_N_L', 'no-transpose', 'lower' );
});

test( 'dtfttr: N=7, normal, upper', function t() {
	runFixtureTest( 'n7_N_U', 'no-transpose', 'upper' );
});

test( 'dtfttr: N=7, transpose, lower', function t() {
	runFixtureTest( 'n7_T_L', 'transpose', 'lower' );
});

test( 'dtfttr: N=7, transpose, upper', function t() {
	runFixtureTest( 'n7_T_U', 'transpose', 'upper' );
});

// N=8 (even, larger) tests
test( 'dtfttr: N=8, normal, lower', function t() {
	runFixtureTest( 'n8_N_L', 'no-transpose', 'lower' );
});

test( 'dtfttr: N=8, normal, upper', function t() {
	runFixtureTest( 'n8_N_U', 'no-transpose', 'upper' );
});

test( 'dtfttr: N=8, transpose, lower', function t() {
	runFixtureTest( 'n8_T_L', 'transpose', 'lower' );
});

test( 'dtfttr: N=8, transpose, upper', function t() {
	runFixtureTest( 'n8_T_U', 'transpose', 'upper' );
});

// LDA > N test
test( 'dtfttr: N=5, normal, lower, LDA=8', function t() {
	var expected;
	var info;
	var arf;
	var lda;
	var tc;
	var ei;
	var n;
	var A;
	var i;
	var j;

	tc = n5NLLda8;
	n = tc.n;
	lda = tc.lda;
	arf = new Float64Array( tc.ARF );
	A = new Float64Array( lda * n );
	info = dtfttr( 'no-transpose', 'lower', n, arf, 1, 0, A, 1, lda, 0, lda );
	assert.equal( info, tc.info, 'info' );
	expected = tc.A;
	ei = 0;
	for ( j = 0; j < n; j += 1 ) {
		for ( i = 0; i < n; i += 1 ) {
			assert.equal( A[ ( j * lda ) + i ], expected[ ei ], 'A(' + i + ',' + j + ')' ); // eslint-disable-line max-len
			ei += 1;
		}
	}
});

// Offset test for ARF
test( 'dtfttr: ARF offset', function t() {
	var expected;
	var info;
	var arf;
	var tc;
	var n;
	var A;
	var i;

	tc = n5NL;
	n = tc.n;
	arf = new Float64Array( [ 99.0, 88.0, 77.0 ].concat( toArray( tc.ARF ) ) );
	A = new Float64Array( n * n );
	info = dtfttr( 'no-transpose', 'lower', n, arf, 1, 3, A, 1, n, 0, n );
	assert.equal( info, 0, 'info' );
	expected = tc.A;
	for ( i = 0; i < expected.length; i += 1 ) {
		assert.equal( A[ i ], expected[ i ], 'A[' + i + ']' );
	}
});

// Offset test for A
test( 'dtfttr: A offset', function t() {
	var expected;
	var info;
	var arf;
	var tc;
	var n;
	var A;
	var i;

	tc = n5NL;
	n = tc.n;
	arf = new Float64Array( tc.ARF );
	A = new Float64Array( 2 + ( n * n ) );
	info = dtfttr( 'no-transpose', 'lower', n, arf, 1, 0, A, 1, n, 2, n );
	assert.equal( info, 0, 'info' );
	expected = tc.A;
	for ( i = 0; i < expected.length; i += 1 ) {
		assert.equal( A[ 2 + i ], expected[ i ], 'A[' + i + ']' );
	}
});
