
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dla_lin_berr from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dla_lin_berr, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dla_lin_berr.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'ndarray: computes berr for a nominal case', function t() {
	var nrhs;
	var berr;
	var res;
	var ayb;
	var N;

	N = 3;
	nrhs = 2;
	res = new Float64Array( [ 1e-4, 2e-4, 3e-4, 4e-4, 5e-4, 6e-4 ] );
	ayb = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	berr = new Float64Array( nrhs );
	dla_lin_berr.ndarray( N, N, nrhs, res, 1, N, 0, ayb, 1, N, 0, berr, 1, 0 );
	assert.ok( Math.abs( berr[ 0 ] - 1e-4 ) < 1e-16, 'col 0' );
	assert.ok( Math.abs( berr[ 1 ] - 1e-4 ) < 1e-16, 'col 1' );
});

test( 'ndarray: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dla_lin_berr.ndarray( -1, 1, 1, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0 ); // eslint-disable-line max-len
	}, /First argument/ );
});

test( 'ndarray: throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dla_lin_berr.ndarray( 1, 1, -1, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0 ); // eslint-disable-line max-len
	}, /Third argument/ );
});
