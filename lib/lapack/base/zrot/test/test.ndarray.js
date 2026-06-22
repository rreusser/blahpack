import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import base from './../lib/ndarray.js';

// FIXTURES //

import zrot_basic from './fixtures/zrot_basic.json' with { type: 'json' };
import zrot_n_zero from './fixtures/zrot_n_zero.json' with { type: 'json' };
import zrot_identity from './fixtures/zrot_identity.json' with { type: 'json' };
import zrot_complex_s from './fixtures/zrot_complex_s.json' with { type: 'json' };
import zrot_stride from './fixtures/zrot_stride.json' with { type: 'json' };
// HELPERS //

function assertClose( actual, expected, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= 1e-14, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, msg ) {
	var i;
	assert.strictEqual( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], msg + '[' + i + ']' );
	}
}

function c128( arr ) {
	return new Complex128Array( arr );
}

// TESTS //

test( 'zrot: main export is a function', function t() {
	assert.strictEqual( typeof base, 'function' );
});

test( 'zrot: basic rotation c=1/sqrt(2), s=(1/sqrt(2),0)', function t() {
	var tc = zrot_basic;
	var c = 1.0 / Math.sqrt( 2.0 );
	var s = new Float64Array( [ 1.0 / Math.sqrt( 2.0 ), 0.0 ] );
	var cx = c128( new Float64Array( [ 1.0, 0.0, 0.0, 1.0, 1.0, 1.0 ] ) );
	var cy = c128( new Float64Array( [ 0.0, 0.0, 1.0, 0.0, 0.0, -1.0 ] ) );
	base( 3, cx, 1, 0, cy, 1, 0, c, s );
	assertArrayClose( Array.from( reinterpret( cx, 0 ) ), tc.cx, 'zrot_basic cx' );
	assertArrayClose( Array.from( reinterpret( cy, 0 ) ), tc.cy, 'zrot_basic cy' );
});

test( 'zrot: n=0 is a no-op', function t() {
	var tc = zrot_n_zero;
	var c = 1.0 / Math.sqrt( 2.0 );
	var s = new Float64Array( [ 1.0 / Math.sqrt( 2.0 ), 0.0 ] );
	var cx = c128( new Float64Array( [ 1.0, 2.0 ] ) );
	var cy = c128( new Float64Array( [ 3.0, 4.0 ] ) );
	base( 0, cx, 1, 0, cy, 1, 0, c, s );
	assertArrayClose( Array.from( reinterpret( cx, 0 ) ), tc.cx, 'zrot_n_zero cx' );
	assertArrayClose( Array.from( reinterpret( cy, 0 ) ), tc.cy, 'zrot_n_zero cy' );
});

test( 'zrot: identity rotation c=1, s=(0,0)', function t() {
	var tc = zrot_identity;
	var c = 1.0;
	var s = new Float64Array( [ 0.0, 0.0 ] );
	var cx = c128( new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] ) );
	var cy = c128( new Float64Array( [ 5.0, 6.0, 7.0, 8.0 ] ) );
	base( 2, cx, 1, 0, cy, 1, 0, c, s );
	assertArrayClose( Array.from( reinterpret( cx, 0 ) ), tc.cx, 'zrot_identity cx' );
	assertArrayClose( Array.from( reinterpret( cy, 0 ) ), tc.cy, 'zrot_identity cy' );
});

test( 'zrot: complex s, c=0.6, s=(0,0.8)', function t() {
	var tc = zrot_complex_s;
	var c = 0.6;
	var s = new Float64Array( [ 0.0, 0.8 ] );
	var cx = c128( new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] ) );
	var cy = c128( new Float64Array( [ 0.0, 1.0, 1.0, 0.0 ] ) );
	base( 2, cx, 1, 0, cy, 1, 0, c, s );
	assertArrayClose( Array.from( reinterpret( cx, 0 ) ), tc.cx, 'zrot_complex_s cx' );
	assertArrayClose( Array.from( reinterpret( cy, 0 ) ), tc.cy, 'zrot_complex_s cy' );
});

test( 'zrot: non-unit stride (strideX=2, strideY=2)', function t() {
	var tc = zrot_stride;
	var c = 0.0;
	var s = new Float64Array( [ 1.0, 0.0 ] );
	var cx = c128( new Float64Array( [ 1.0, 0.0, 99.0, 99.0, 2.0, 0.0 ] ) );
	var cy = c128( new Float64Array( [ 3.0, 0.0, 99.0, 99.0, 4.0, 0.0 ] ) );
	base( 2, cx, 2, 0, cy, 2, 0, c, s );
	assertArrayClose( Array.from( reinterpret( cx, 0 ) ), tc.cx, 'zrot_stride cx' );
	assertArrayClose( Array.from( reinterpret( cy, 0 ) ), tc.cy, 'zrot_stride cy' );
});
