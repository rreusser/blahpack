

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-params, max-lines, max-statements, max-lines-per-function */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztgsen from './../lib/ztgsen.js';


// FUNCTIONS //

function eye( N ) {
	var M = new Complex128Array( N * N );
	var Mv = reinterpret( M, 0 );
	var i;
	for ( i = 0; i < N; i++ ) {
		Mv[ 2 * ( ( i * N ) + i ) ] = 1.0;
	}
	return M;
}

function makeAB3() {
	var A = new Complex128Array( 9 );
	var B = new Complex128Array( 9 );
	var Av = reinterpret( A, 0 );
	var Bv = reinterpret( B, 0 );
	Av[ 0 ] = 2.0; Av[ 1 ] = 1.0;
	Av[ 6 ] = 0.5; Av[ 7 ] = -0.2;
	Av[ 8 ] = 4.0; Av[ 9 ] = 0.0;
	Av[ 12 ] = 0.3; Av[ 13 ] = 0.1;
	Av[ 14 ] = 0.7; Av[ 15 ] = -0.3;
	Av[ 16 ] = 6.0; Av[ 17 ] = -1.0;
	Bv[ 0 ] = 1.0; Bv[ 1 ] = 0.0;
	Bv[ 6 ] = 0.1; Bv[ 7 ] = 0.05;
	Bv[ 8 ] = 1.0; Bv[ 9 ] = 0.0;
	Bv[ 14 ] = 0.2; Bv[ 15 ] = -0.1;
	Bv[ 16 ] = 1.0; Bv[ 17 ] = 0.0;
	return { 'A': A, 'B': B };
}

// Build a 3x3 row-major matrix (transpose of the column-major version).
function makeAB3Row() {
	var ab = makeAB3();
	var Acm = reinterpret( ab.A, 0 );
	var Bcm = reinterpret( ab.B, 0 );
	var A = new Complex128Array( 9 );
	var B = new Complex128Array( 9 );
	var Av = reinterpret( A, 0 );
	var Bv = reinterpret( B, 0 );
	var i;
	var j;
	var src;
	var dst;
	for ( i = 0; i < 3; i++ ) {
		for ( j = 0; j < 3; j++ ) {
			src = 2 * ( ( j * 3 ) + i );
			dst = 2 * ( ( i * 3 ) + j );
			Av[ dst ] = Acm[ src ]; Av[ dst + 1 ] = Acm[ src + 1 ];
			Bv[ dst ] = Bcm[ src ]; Bv[ dst + 1 ] = Bcm[ src + 1 ];
		}
	}
	return { 'A': A, 'B': B };
}


// TESTS //

test( 'ztgsen is a function', function t() {
	assert.strictEqual( typeof ztgsen, 'function', 'is a function' );
});

test( 'ztgsen: column-major, ijob=0, select=[T,T,T] N=3', function t() {
	var ab = makeAB3();
	var Q = eye( 3 );
	var Z = eye( 3 );
	var ALPHA = new Complex128Array( 3 );
	var BETA = new Complex128Array( 3 );
	var DIF = new Float64Array( 2 );
	var SEL = new Uint8Array( [ 1, 1, 1 ] );
	var WK = new Complex128Array( 64 );
	var IWK = new Int32Array( 64 );
	var r = ztgsen( 'column-major', 0, true, true, SEL, 1, 3, ab.A, 3, ab.B, 3, ALPHA, 1, BETA, 1, Q, 3, Z, 3, 0, 1.0, 1.0, DIF, 1, WK, 1, -1, IWK, 1, 0, -1 );
	assert.equal( r.info, 0, 'info' );
	assert.equal( r.m, 3, 'M' );
});

test( 'ztgsen: row-major, ijob=0, select=[T,T,T] N=3', function t() {
	var ab = makeAB3Row();
	var Q = eye( 3 );
	var Z = eye( 3 );
	var ALPHA = new Complex128Array( 3 );
	var BETA = new Complex128Array( 3 );
	var DIF = new Float64Array( 2 );
	var SEL = new Uint8Array( [ 1, 1, 1 ] );
	var WK = new Complex128Array( 64 );
	var IWK = new Int32Array( 64 );
	var r = ztgsen( 'row-major', 0, true, true, SEL, 1, 3, ab.A, 3, ab.B, 3, ALPHA, 1, BETA, 1, Q, 3, Z, 3, 0, 1.0, 1.0, DIF, 1, WK, 1, -1, IWK, 1, 0, -1 );
	assert.equal( r.info, 0, 'info' );
	assert.equal( r.m, 3, 'M' );
});

test( 'ztgsen: row-major partial select, ijob=1', function t() {
	var ab = makeAB3Row();
	var Q = eye( 3 );
	var Z = eye( 3 );
	var ALPHA = new Complex128Array( 3 );
	var BETA = new Complex128Array( 3 );
	var DIF = new Float64Array( 2 );
	var SEL = new Uint8Array( [ 1, 0, 1 ] );
	var WK = new Complex128Array( 64 );
	var IWK = new Int32Array( 64 );
	var r = ztgsen( 'row-major', 1, true, true, SEL, 1, 3, ab.A, 3, ab.B, 3, ALPHA, 1, BETA, 1, Q, 3, Z, 3, 0, 1.0, 1.0, DIF, 1, WK, 1, -1, IWK, 1, 0, -1 );
	assert.equal( r.info, 0, 'info' );
	assert.equal( r.m, 2, 'M' );
});

test( 'ztgsen: wantq=false, wantz=false, ijob=0', function t() {
	var ab = makeAB3();
	var Q = new Complex128Array( 1 );
	var Z = new Complex128Array( 1 );
	var ALPHA = new Complex128Array( 3 );
	var BETA = new Complex128Array( 3 );
	var DIF = new Float64Array( 2 );
	var SEL = new Uint8Array( [ 1, 0, 1 ] );
	var WK = new Complex128Array( 64 );
	var IWK = new Int32Array( 64 );
	var r = ztgsen( 'column-major', 0, false, false, SEL, 1, 3, ab.A, 3, ab.B, 3, ALPHA, 1, BETA, 1, Q, 1, Z, 1, 0, 1.0, 1.0, DIF, 1, WK, 1, -1, IWK, 1, 0, -1 );
	assert.equal( r.info, 0, 'info' );
});

test( 'ztgsen throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		ztgsen( 'invalid', 0, true, true, new Uint8Array( 4 ), 1, 4, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4, 0, 1.0, 1.0, new Float64Array( 2 ), 1, new Complex128Array( 64 ), 1, -1, new Int32Array( 64 ), 1, 0, -1 );
	}, TypeError );
});

test( 'ztgsen throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztgsen( 'row-major', 0, true, true, new Uint8Array( 4 ), 1, -1, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4, 0, 1.0, 1.0, new Float64Array( 2 ), 1, new Complex128Array( 64 ), 1, -1, new Int32Array( 64 ), 1, 0, -1 );
	}, RangeError );
});

test( 'ztgsen throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		ztgsen( 'row-major', 0, true, true, new Uint8Array( 4 ), 1, 4, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4, -1, 1.0, 1.0, new Float64Array( 2 ), 1, new Complex128Array( 64 ), 1, -1, new Int32Array( 64 ), 1, 0, -1 );
	}, RangeError );
});

test( 'ztgsen throws RangeError when LDA < N (row-major)', function t() {
	assert.throws( function throws() {
		ztgsen( 'row-major', 0, true, true, new Uint8Array( 4 ), 1, 4, new Complex128Array( 16 ), 1, new Complex128Array( 16 ), 4, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4, 0, 1.0, 1.0, new Float64Array( 2 ), 1, new Complex128Array( 64 ), 1, -1, new Int32Array( 64 ), 1, 0, -1 );
	}, RangeError );
});

test( 'ztgsen throws RangeError when LDA < M (column-major)', function t() {
	assert.throws( function throws() {
		ztgsen( 'column-major', 0, true, true, new Uint8Array( 4 ), 1, 4, new Complex128Array( 16 ), 1, new Complex128Array( 16 ), 4, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4, 4, 1.0, 1.0, new Float64Array( 2 ), 1, new Complex128Array( 64 ), 1, -1, new Int32Array( 64 ), 1, 0, -1 );
	}, RangeError );
});

test( 'ztgsen throws RangeError when LDB < N (row-major)', function t() {
	assert.throws( function throws() {
		ztgsen( 'row-major', 0, true, true, new Uint8Array( 4 ), 1, 4, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4, 0, 1.0, 1.0, new Float64Array( 2 ), 1, new Complex128Array( 64 ), 1, -1, new Int32Array( 64 ), 1, 0, -1 );
	}, RangeError );
});

test( 'ztgsen throws RangeError when LDB < M (column-major)', function t() {
	assert.throws( function throws() {
		ztgsen( 'column-major', 0, true, true, new Uint8Array( 4 ), 1, 4, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4, 4, 1.0, 1.0, new Float64Array( 2 ), 1, new Complex128Array( 64 ), 1, -1, new Int32Array( 64 ), 1, 0, -1 );
	}, RangeError );
});

test( 'ztgsen throws RangeError when LDQ < N (row-major)', function t() {
	assert.throws( function throws() {
		ztgsen( 'row-major', 0, true, true, new Uint8Array( 4 ), 1, 4, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 16 ), 1, new Complex128Array( 16 ), 4, 0, 1.0, 1.0, new Float64Array( 2 ), 1, new Complex128Array( 64 ), 1, -1, new Int32Array( 64 ), 1, 0, -1 );
	}, RangeError );
});

test( 'ztgsen throws RangeError when LDQ < M (column-major)', function t() {
	assert.throws( function throws() {
		ztgsen( 'column-major', 0, true, true, new Uint8Array( 4 ), 1, 4, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 16 ), 1, new Complex128Array( 16 ), 4, 4, 1.0, 1.0, new Float64Array( 2 ), 1, new Complex128Array( 64 ), 1, -1, new Int32Array( 64 ), 1, 0, -1 );
	}, RangeError );
});

test( 'ztgsen throws RangeError when LDZ < N (row-major)', function t() {
	assert.throws( function throws() {
		ztgsen( 'row-major', 0, true, true, new Uint8Array( 4 ), 1, 4, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 1, 0, 1.0, 1.0, new Float64Array( 2 ), 1, new Complex128Array( 64 ), 1, -1, new Int32Array( 64 ), 1, 0, -1 );
	}, RangeError );
});

test( 'ztgsen throws RangeError when LDZ < M (column-major)', function t() {
	assert.throws( function throws() {
		ztgsen( 'column-major', 0, true, true, new Uint8Array( 4 ), 1, 4, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 1, 4, 1.0, 1.0, new Float64Array( 2 ), 1, new Complex128Array( 64 ), 1, -1, new Int32Array( 64 ), 1, 0, -1 );
	}, RangeError );
});
