
/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeevx from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dgeevx, 'function', 'main export is a function' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof dgeevx.strided, 'function', 'has strided method' );
});

test( 'main export computes eigenvalues of a diagonal matrix', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const A = new Float64Array( [ 1, 0, 0, 0, 2, 0, 0, 0, 3 ] );
	const WR = new Float64Array( 3 );
	const WI = new Float64Array( 3 );
	const VL = new Float64Array( 9 );
	const VR = new Float64Array( 9 );
	const SCALE = new Float64Array( 3 );
	const RCONDE = new Float64Array( 3 );
	const RCONDV = new Float64Array( 3 );
	const out = dgeevx( 'column-major', 'both', 'compute-vectors', 'compute-vectors', 'none', 3, A, 3, WR, 1, WI, 1, VL, 3, VR, 3, ilo, ihi, SCALE, 1, abnrm, RCONDE, 1, RCONDV ); // eslint-disable-line max-len
	assert.equal( out, 0, 'info should be 0' );
	assert.ok( typeof ilo[ 0 ] === 'number', 'ilo present' );
	assert.ok( typeof ihi[ 0 ] === 'number', 'ihi present' );
	assert.ok( typeof abnrm[ 0 ] === 'number', 'abnrm present' );
});
