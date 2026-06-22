
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zla_gbrcond_x from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zla_gbrcond_x, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zla_gbrcond_x.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'ndarray returns 1.0 when N=0', function t() {
	var result;
	var RWORK;
	var WORK;
	var IPIV;
	var AFB;
	var AB;
	var x;

	RWORK = new Float64Array( 1 );
	WORK = new Complex128Array( 2 );
	IPIV = new Int32Array( 1 );
	AFB = new Complex128Array( 1 );
	AB = new Complex128Array( 1 );
	x = new Complex128Array( 1 );
	result = zla_gbrcond_x.ndarray( 'no-transpose', 0, 0, 0, AB, 1, 1, 0, AFB, 1, 1, 0, IPIV, 1, 0, x, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, 1.0, 'returns 1.0 for N=0' );
});
