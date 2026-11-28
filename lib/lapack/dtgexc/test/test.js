
/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtgexc from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dtgexc, 'function', 'main export is a function' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof dtgexc.strided, 'function', 'has strided method' );
});

test( 'dtgexc reorders generalized Schur form (column-major)', function t() {
	const ifst = new Int32Array( 1 );
	const ilst = new Int32Array( 1 );

	const A = new Float64Array( [ 1.0, 0.0, 0.0, 0.5, 2.0, 0.0, 0.3, 0.4, 3.0 ] );
	const B = new Float64Array( [ 1.0, 0.0, 0.0, 0.2, 1.5, 0.0, 0.1, 0.3, 2.0 ] );
	const Q = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
	const Z = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
	const WORK = new Float64Array( 28 );
	ifst[ 0 ] = 0;
	ilst[ 0 ] = 2;
	const r = dtgexc( 'column-major', true, true, 3, A, 3, B, 3, Q, 3, Z, 3, ifst, ilst, WORK ); // eslint-disable-line max-len
	assert.strictEqual( r, 0, 'info is zero' );
	assert.strictEqual( ilst[ 0 ], 2, 'ilst is 2' );
	assert.ok( A[ 0 ] !== 1.0, 'A is modified' );
});
