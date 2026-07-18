
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dla_gbrcond from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dla_gbrcond, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dla_gbrcond.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'ndarray returns 1.0 when N=0', function t() {

	const IWORK = new Int32Array( 1 );
	const WORK = new Float64Array( 10 );
	const IPIV = new Int32Array( 1 );
	const AFB = new Float64Array( 1 );
	const AB = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const result = dla_gbrcond.ndarray( 'no-transpose', 0, 0, 0, AB, 1, 1, 0, AFB, 1, 1, 0, IPIV, 1, 0, 1, c, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, 1.0, 'returns 1.0 for N=0' );
});
