/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dpotrf from './../../dpotrf/lib/base.js';
import dla_porcond from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dla_porcond, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dla_porcond.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'ndarray returns a positive condition number for an SPD matrix', function t() { // eslint-disable-line max-len
	var result;
	var IWORK;
	var WORK;
	var AF;
	var A;
	var C;

	A = new Float64Array([ 4.0, 1.0, 0.5, 1.0, 5.0, 1.0, 0.5, 1.0, 6.0 ]);
	AF = new Float64Array( A );
	dpotrf( 'upper', 3, AF, 1, 3, 0 );
	C = new Float64Array([ 2.0, 1.0, 0.5 ]);
	WORK = new Float64Array( 9 );
	IWORK = new Int32Array( 3 );
	result = dla_porcond.ndarray( 'upper', 3, A, 1, 3, 0, AF, 1, 3, 0, 1, C, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( typeof result, 'number', 'returns a number' );
	assert.ok( result > 0, 'result is positive' );
	assert.ok( result <= 1, 'result is at most 1' );
});
