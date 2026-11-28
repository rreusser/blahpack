/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import dtrevc from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dtrevc, 'function', 'main export is a function' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof dtrevc.strided, 'function', 'has strided method' );
});

test( 'strided method returns 0 for N=0', function t() {
	const m = new Int32Array( 1 );

	const SELECT = new Uint8Array( 0 );
	const T = new Float64Array( 0 );
	const VL = new Float64Array( 0 );
	const VR = new Float64Array( 0 );
	const WORK = new Float64Array( 0 );
	const info = dtrevc.strided( 'right', 'all', SELECT, 1, 0, 0, T, 1, 0, 0, VL, 1, 0, 0, VR, 1, 0, 0, 0, m, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'returns 0 for N=0' );
});
