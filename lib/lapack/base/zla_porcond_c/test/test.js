
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zla_porcond_c from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zla_porcond_c, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zla_porcond_c.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'ndarray returns 1.0 for N=0', function t() {
	var result;
	var RWORK;
	var WORK;
	var AF;
	var A;
	var c;

	A = new Complex128Array( 0 );
	AF = new Complex128Array( 0 );
	c = new Float64Array( 0 );
	WORK = new Complex128Array( 0 );
	RWORK = new Float64Array( 0 );
	result = zla_porcond_c.ndarray( 'upper', 0, A, 1, 1, 0, AF, 1, 1, 0, c, 1, 0, true, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, 1.0, 'returns 1.0 for N=0' );
});
