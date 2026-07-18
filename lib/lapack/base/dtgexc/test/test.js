
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtgexc from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dtgexc, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dtgexc.ndarray, 'function', 'has ndarray method' );
});

test( 'dtgexc reorders generalized Schur form (column-major)', function t() {

	const A = new Float64Array( [ 1.0, 0.0, 0.0, 0.5, 2.0, 0.0, 0.3, 0.4, 3.0 ] );
	const B = new Float64Array( [ 1.0, 0.0, 0.0, 0.2, 1.5, 0.0, 0.1, 0.3, 2.0 ] );
	const Q = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
	const Z = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
	const WORK = new Float64Array( 28 );
	const r = dtgexc( 'column-major', true, true, 3, A, 3, B, 3, Q, 3, Z, 3, 0, 2, WORK, 1 ); // eslint-disable-line max-len
	assert.strictEqual( r.info, 0, 'info is zero' );
	assert.strictEqual( r.ilst, 2, 'ilst is 2' );
	assert.ok( A[ 0 ] !== 1.0, 'A is modified' );
});
