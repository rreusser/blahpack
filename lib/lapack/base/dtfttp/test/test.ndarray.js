/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtfttp from './../lib/ndarray.js';


// FIXTURES //

import n1N from './fixtures/n1_n.json' with { type: 'json' };
import n1T from './fixtures/n1_t.json' with { type: 'json' };
import n5NL from './fixtures/n5_n_l.json' with { type: 'json' };
import n5NU from './fixtures/n5_n_u.json' with { type: 'json' };
import n5TL from './fixtures/n5_t_l.json' with { type: 'json' };
import n5TU from './fixtures/n5_t_u.json' with { type: 'json' };
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
	'n1_N': n1N,
	'n1_T': n1T,
	'n5_N_L': n5NL,
	'n5_N_U': n5NU,
	'n5_T_L': n5TL,
	'n5_T_U': n5TU,
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
* RunCase.
*
* @private
* @param {string} name - test case name
* @param {*} transr - transr
* @param {*} uplo - uplo
*/
function runCase( name, transr, uplo ) {
	var expected;
	var info;
	var ARF;
	var tc;
	var AP;
	var N;

	tc = fixtures[ name ];
	N = tc.n;
	ARF = new Float64Array( tc.ARF );
	AP = new Float64Array( tc.AP.length );
	expected = new Float64Array( tc.AP );
	info = dtfttp( transr, uplo, N, ARF, 1, 0, AP, 1, 0 );
	assert.equal( info, 0, name + ': info' );
	assert.deepStrictEqual( AP, expected, name + ': AP' );
}


// TESTS //

test( 'dtfttp is a function', function t() {
	assert.equal( typeof dtfttp, 'function' );
});

test( 'dtfttp: N=0 quick return', function t() {
	var info;
	var AP;

	AP = new Float64Array( [ -1.0, -1.0, -1.0 ] );
	info = dtfttp( 'no-transpose', 'lower', 0, new Float64Array( 0 ), 1, 0, AP, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info should be 0' );
	assert.deepStrictEqual( AP, new Float64Array( [ -1.0, -1.0, -1.0 ] ), 'AP unchanged' ); // eslint-disable-line max-len
});

test( 'dtfttp: N=1, normal', function t() {
	var info;
	var ARF;
	var tc;
	var AP;

	tc = n1N;
	ARF = new Float64Array( [ 42.0 ] );
	AP = new Float64Array( 1 );
	info = dtfttp( 'no-transpose', 'lower', 1, ARF, 1, 0, AP, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepStrictEqual( AP, new Float64Array( tc.AP ), 'AP' );
});

test( 'dtfttp: N=1, transpose', function t() {
	var info;
	var ARF;
	var tc;
	var AP;

	tc = n1T;
	ARF = new Float64Array( [ 99.0 ] );
	AP = new Float64Array( 1 );
	info = dtfttp( 'transpose', 'upper', 1, ARF, 1, 0, AP, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepStrictEqual( AP, new Float64Array( tc.AP ), 'AP' );
});

// N=5 (odd) — all 4 combinations:
test( 'dtfttp: N=5, no-transpose, lower', function t() {
	runCase( 'n5_N_L', 'no-transpose', 'lower' );
});

test( 'dtfttp: N=5, no-transpose, upper', function t() {
	runCase( 'n5_N_U', 'no-transpose', 'upper' );
});

test( 'dtfttp: N=5, transpose, lower', function t() {
	runCase( 'n5_T_L', 'transpose', 'lower' );
});

test( 'dtfttp: N=5, transpose, upper', function t() {
	runCase( 'n5_T_U', 'transpose', 'upper' );
});

// N=6 (even) — all 4 combinations:
test( 'dtfttp: N=6, no-transpose, lower', function t() {
	runCase( 'n6_N_L', 'no-transpose', 'lower' );
});

test( 'dtfttp: N=6, no-transpose, upper', function t() {
	runCase( 'n6_N_U', 'no-transpose', 'upper' );
});

test( 'dtfttp: N=6, transpose, lower', function t() {
	runCase( 'n6_T_L', 'transpose', 'lower' );
});

test( 'dtfttp: N=6, transpose, upper', function t() {
	runCase( 'n6_T_U', 'transpose', 'upper' );
});

// N=7 (odd, larger) — all 4 combinations:
test( 'dtfttp: N=7, no-transpose, lower', function t() {
	runCase( 'n7_N_L', 'no-transpose', 'lower' );
});

test( 'dtfttp: N=7, no-transpose, upper', function t() {
	runCase( 'n7_N_U', 'no-transpose', 'upper' );
});

test( 'dtfttp: N=7, transpose, lower', function t() {
	runCase( 'n7_T_L', 'transpose', 'lower' );
});

test( 'dtfttp: N=7, transpose, upper', function t() {
	runCase( 'n7_T_U', 'transpose', 'upper' );
});

// N=8 (even, larger) — all 4 combinations:
test( 'dtfttp: N=8, no-transpose, lower', function t() {
	runCase( 'n8_N_L', 'no-transpose', 'lower' );
});

test( 'dtfttp: N=8, no-transpose, upper', function t() {
	runCase( 'n8_N_U', 'no-transpose', 'upper' );
});

test( 'dtfttp: N=8, transpose, lower', function t() {
	runCase( 'n8_T_L', 'transpose', 'lower' );
});

test( 'dtfttp: N=8, transpose, upper', function t() {
	runCase( 'n8_T_U', 'transpose', 'upper' );
});

// Test with non-unit strides:
test( 'dtfttp: N=5, no-transpose, lower, strideARF=2', function t() {
	var expected;
	var info;
	var ARF;
	var tc;
	var AP;
	var N;
	var i;

	tc = n5NL;
	expected = new Float64Array( tc.AP );
	N = tc.n;
	ARF = new Float64Array( tc.ARF.length * 2 );
	for ( i = 0; i < tc.ARF.length; i += 1 ) {
		ARF[ i * 2 ] = tc.ARF[ i ];
	}
	AP = new Float64Array( tc.AP.length );
	info = dtfttp( 'no-transpose', 'lower', N, ARF, 2, 0, AP, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepStrictEqual( AP, expected, 'AP with strideARF=2' );
});

test( 'dtfttp: N=5, no-transpose, lower, strideAP=2', function t() {
	var info;
	var ARF;
	var tc;
	var AP;
	var N;
	var i;

	tc = n5NL;
	ARF = new Float64Array( tc.ARF );
	N = tc.n;
	AP = new Float64Array( tc.AP.length * 2 );
	info = dtfttp( 'no-transpose', 'lower', N, ARF, 1, 0, AP, 2, 0 );
	assert.equal( info, 0, 'info' );
	for ( i = 0; i < tc.AP.length; i += 1 ) {
		assert.equal( AP[ i * 2 ], tc.AP[ i ], 'AP[' + ( i * 2 ) + ']' );
	}
});

test( 'dtfttp: N=6, transpose, upper, with offset', function t() {
	var expected;
	var info;
	var ARF;
	var tc;
	var AP;
	var N;
	var i;

	tc = n6TU;
	N = tc.n;
	ARF = new Float64Array( tc.ARF.length + 3 );
	for ( i = 0; i < tc.ARF.length; i += 1 ) {
		ARF[ i + 3 ] = tc.ARF[ i ];
	}
	AP = new Float64Array( tc.AP.length + 5 );
	expected = new Float64Array( tc.AP );
	info = dtfttp( 'transpose', 'upper', N, ARF, 1, 3, AP, 1, 5 );
	assert.equal( info, 0, 'info' );
	for ( i = 0; i < tc.AP.length; i += 1 ) {
		assert.equal( AP[ i + 5 ], expected[ i ], 'AP[' + ( i + 5 ) + ']' );
	}
});
