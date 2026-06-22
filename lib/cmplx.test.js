import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';
import cmplx from './cmplx.js';

// --- Scalar operations (stdlib re-exports) ---

test( 'cmplx.mul: (1+2i) * (3+4i) = (-5+10i)', function t() {
	var z = cmplx.mul( new Complex128(1, 2), new Complex128(3, 4) );
	assert.equal( real(z), -5 );
	assert.equal( imag(z), 10 );
});

test( 'cmplx.add: (1+2i) + (3+4i) = (4+6i)', function t() {
	var z = cmplx.add( new Complex128(1, 2), new Complex128(3, 4) );
	assert.equal( real(z), 4 );
	assert.equal( imag(z), 6 );
});

test( 'cmplx.sub: (5+3i) - (2+1i) = (3+2i)', function t() {
	var z = cmplx.sub( new Complex128(5, 3), new Complex128(2, 1) );
	assert.equal( real(z), 3 );
	assert.equal( imag(z), 2 );
});

test( 'cmplx.div: (4+2i) / (1+1i) = (3-1i)', function t() {
	var z = cmplx.div( new Complex128(4, 2), new Complex128(1, 1) );
	assert.ok( Math.abs( real(z) - 3 ) < 1e-15 );
	assert.ok( Math.abs( imag(z) - (-1) ) < 1e-15 );
});

test( 'cmplx.div: (1+0i) / (0+1i) = (0-1i)', function t() {
	var z = cmplx.div( new Complex128(1, 0), new Complex128(0, 1) );
	assert.ok( Math.abs( real(z) ) < 1e-15 );
	assert.ok( Math.abs( imag(z) - (-1) ) < 1e-15 );
});

test( 'cmplx.neg: -(2+3i) = (-2-3i)', function t() {
	var z = cmplx.neg( new Complex128(2, 3) );
	assert.equal( real(z), -2 );
	assert.equal( imag(z), -3 );
});

test( 'cmplx.conj: conj(3+4i) = (3-4i)', function t() {
	var z = cmplx.conj( new Complex128(3, 4) );
	assert.equal( real(z), 3 );
	assert.equal( imag(z), -4 );
});

test( 'cmplx.abs: |3+4i| = 5', function t() {
	assert.equal( cmplx.abs( new Complex128(3, 4) ), 5 );
});

test( 'cmplx.abs: |0+0i| = 0', function t() {
	assert.equal( cmplx.abs( new Complex128(0, 0) ), 0 );
});

test( 'cmplx.abs2: |3+4i|^2 = 25', function t() {
	assert.equal( cmplx.abs2( new Complex128(3, 4) ), 25 );
});

// --- Indexed operations (on Float64Array views) ---

test( 'cmplx.absAt: |3+4i| = 5', function t() {
	var arr = new Float64Array([ 3, 4, 1, 2 ]);
	assert.equal( cmplx.absAt( arr, 0 ), 5 );
});

test( 'cmplx.absAt: |0+0i| = 0', function t() {
	var arr = new Float64Array([ 0, 0 ]);
	assert.equal( cmplx.absAt( arr, 0 ), 0 );
});

test( 'cmplx.abs1At: |3| + |-4| = 7', function t() {
	var arr = new Float64Array([ 3, -4 ]);
	assert.equal( cmplx.abs1At( arr, 0 ), 7 );
});

test( 'cmplx.mulAt: (1+2i) * (3+4i) = (-5+10i)', function t() {
	var arr = new Float64Array([ 0, 0, 1, 2, 3, 4 ]);
	cmplx.mulAt( arr, 0, arr, 2, arr, 4 );
	assert.equal( arr[ 0 ], -5 );
	assert.equal( arr[ 1 ], 10 );
});

test( 'cmplx.divAt: (4+2i) / (1+1i) = (3-1i)', function t() {
	var arr = new Float64Array([ 0, 0, 4, 2, 1, 1 ]);
	cmplx.divAt( arr, 0, arr, 2, arr, 4 );
	assert.ok( Math.abs( arr[ 0 ] - 3 ) < 1e-15 );
	assert.ok( Math.abs( arr[ 1 ] - (-1) ) < 1e-15 );
});

test( 'cmplx.divAt: (1+0i) / (0+1i) = (0-1i)', function t() {
	var arr = new Float64Array([ 0, 0, 1, 0, 0, 1 ]);
	cmplx.divAt( arr, 0, arr, 2, arr, 4 );
	assert.ok( Math.abs( arr[ 0 ] ) < 1e-15 );
	assert.ok( Math.abs( arr[ 1 ] - (-1) ) < 1e-15 );
});

test( 'cmplx.absAt: works at non-zero index', function t() {
	var arr = new Float64Array([ 99, 99, 3, 4 ]);
	assert.equal( cmplx.absAt( arr, 2 ), 5 );
});
