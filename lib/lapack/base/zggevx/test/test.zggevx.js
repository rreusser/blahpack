
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-params, max-lines, max-statements, max-lines-per-function */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zggevx from './../lib/zggevx.js';


// FUNCTIONS //

function mkMat( arr ) {
	return new Complex128Array( new Float64Array( arr ) );
}


// TESTS //

test( 'zggevx is a function', function t() {
	assert.strictEqual( typeof zggevx, 'function', 'is a function' );
});

test( 'zggevx: column-major basic 2x2 diag, no vectors', function t() {
	const A = mkMat( [ 4.0, 0.0, 0.0, 0.0, 0.0, 0.0, 6.0, 0.0 ] );
	const B = mkMat( [ 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 3.0, 0.0 ] );
	const ALPHA = new Complex128Array( 2 );
	const BETA = new Complex128Array( 2 );
	const VL = new Complex128Array( 4 );
	const VR = new Complex128Array( 4 );
	const LSCALE = new Float64Array( 2 );
	const RSCALE = new Float64Array( 2 );
	const RCONDE = new Float64Array( 2 );
	const RCONDV = new Float64Array( 2 );
	const r = zggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', 2, A, 2, B, 2, ALPHA, 1, BETA, 1, VL, 2, VR, 2, LSCALE, 1, RSCALE, 1, RCONDE, 1, RCONDV, 1 );
	assert.equal( r.info, 0, 'info' );
});

test( 'zggevx: row-major basic 2x2 diag, compute vectors', function t() {
	const A = mkMat( [ 4.0, 0.0, 0.0, 0.0, 0.0, 0.0, 6.0, 0.0 ] );
	const B = mkMat( [ 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 3.0, 0.0 ] );
	const ALPHA = new Complex128Array( 2 );
	const BETA = new Complex128Array( 2 );
	const VL = new Complex128Array( 4 );
	const VR = new Complex128Array( 4 );
	const LSCALE = new Float64Array( 2 );
	const RSCALE = new Float64Array( 2 );
	const RCONDE = new Float64Array( 2 );
	const RCONDV = new Float64Array( 2 );
	const r = zggevx( 'row-major', 'both', 'compute-vectors', 'compute-vectors', 'none', 2, A, 2, B, 2, ALPHA, 1, BETA, 1, VL, 2, VR, 2, LSCALE, 1, RSCALE, 1, RCONDE, 1, RCONDV, 1 );
	assert.equal( r.info, 0, 'info' );
});

test( 'zggevx throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zggevx( 'invalid', 'none', 'no-vectors', 'no-vectors', 'none', 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1 );
	}, TypeError );
});

test( 'zggevx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', -1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'zggevx throws RangeError when LDA < N', function t() {
	assert.throws( function throws() {
		zggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'zggevx throws RangeError when LDB < N', function t() {
	assert.throws( function throws() {
		zggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'zggevx throws RangeError when LDVL < 1', function t() {
	assert.throws( function throws() {
		zggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 0, new Complex128Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'zggevx throws RangeError when LDVR < 1', function t() {
	assert.throws( function throws() {
		zggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 0, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1 );
	}, RangeError );
});
