
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtgex2 from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dtgex2, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dtgex2.ndarray, 'function', 'has ndarray method' );
});

test( 'dtgex2.ndarray performs a 1x1 swap', function t() {

	const N = 3;
	const A = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.5,
		2.0,
		0.0,
		0.3,
		0.4,
		3.0
	]);
	const B = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.2,
		1.5,
		0.0,
		0.1,
		0.3,
		2.0
	]);
	const Q = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,
		0.0,
		1.0
	]);
	const Z = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,
		0.0,
		1.0
	]);
	const WORK = new Float64Array( 200 );
	const info = dtgex2.ndarray( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 1, 1, WORK, 1, 0, 200 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info is 0' );
	assert.ok( Math.abs( A[ 0 ] - 1.0 ) > 0.01, 'A(1,1) changed from 1.0' );
	assert.ok( Math.abs( A[ 0 ] + 1.9107607677073015 ) < 1e-10, 'A(1,1) matches expected' ); // eslint-disable-line max-len
});
