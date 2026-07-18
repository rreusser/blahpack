
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js'; // eslint-disable-line max-len
import ztrevc from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof ztrevc, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof ztrevc.ndarray, 'function', 'has ndarray method' );
});

test( 'computes right eigenvectors of a 1x1 matrix', function t() {

	const RWORK = new Float64Array( 1 );
	const WORK = new Complex128Array( 2 );
	const VR = new Complex128Array( 1 );
	const VL = new Complex128Array( 1 );
	const T = new Complex128Array( [ 5, 2 ] );
	const info = ztrevc( 'column-major', 'right', 'all', new Uint8Array( 1 ), 1, 1, T, 1, VL, 1, VR, 1, 1, 0, WORK, 1, RWORK, 1 ); // eslint-disable-line max-len
	const vrv = reinterpret( VR, 0 );
	assert.strictEqual( info, 0, 'returns 0' );
	assert.strictEqual( vrv[ 0 ], 1.0, 'VR[0] real is 1' );
	assert.strictEqual( vrv[ 1 ], 0.0, 'VR[0] imag is 0' );
});
