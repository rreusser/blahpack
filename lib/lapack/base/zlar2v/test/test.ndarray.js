

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlar2v from './../lib/ndarray.js';

// FIXTURES //

import basic from './fixtures/basic.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import non_unit_stride from './fixtures/non_unit_stride.json' with { type: 'json' };
import identity from './fixtures/identity.json' with { type: 'json' };
import pure_imag_s from './fixtures/pure_imag_s.json' with { type: 'json' };
import swap from './fixtures/swap.json' with { type: 'json' };
import mixed_strides from './fixtures/mixed_strides.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// TESTS //

test( 'zlar2v is a function', function t() {
	assert.equal( typeof zlar2v, 'function' );
});

test( 'zlar2v: basic (N=4, unit strides, mixed complex S)', function t() {
	const tc = basic;
	const x = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
	const y = new Complex128Array( [ 5.0, 0.0, 6.0, 0.0, 7.0, 0.0, 8.0, 0.0 ] );
	const z = new Complex128Array( [ 0.5, 0.1, 1.0, -0.2, 1.5, 0.3, 2.0, -0.4 ] );
	const c = new Float64Array( [ 0.8660254037844387, 0.7071067811865476, 0.5, 0.0 ] );
	const s = new Complex128Array( [ 0.5, 0.0, 0.5, 0.5, 0.0, 0.8660254037844387, 0.8, 0.6 ] );

	zlar2v( 4, x, 1, 0, y, 1, 0, z, 1, 0, c, 1, 0, s, 1, 0 );

	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
	assertArrayClose( Array.from( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
	assertArrayClose( Array.from( reinterpret( z, 0 ) ), tc.z, 1e-14, 'z' );
});

test( 'zlar2v: n_zero (quick return)', function t() {
	const x = new Complex128Array( [ 1.0, 0.0 ] );
	const y = new Complex128Array( [ 2.0, 0.0 ] );
	const z = new Complex128Array( [ 0.5, 0.1 ] );
	const c = new Float64Array( [ 0.5 ] );
	const s = new Complex128Array( [ 0.8660254037844387, 0.0 ] );

	zlar2v( 0, x, 1, 0, y, 1, 0, z, 1, 0, c, 1, 0, s, 1, 0 );

	// Arrays unchanged
	const xv = reinterpret( x, 0 );
	const yv = reinterpret( y, 0 );
	const zv = reinterpret( z, 0 );
	assertClose( xv[ 0 ], 1.0, 1e-14, 'x[0]' );
	assertClose( xv[ 1 ], 0.0, 1e-14, 'x[1]' );
	assertClose( yv[ 0 ], 2.0, 1e-14, 'y[0]' );
	assertClose( yv[ 1 ], 0.0, 1e-14, 'y[1]' );
	assertClose( zv[ 0 ], 0.5, 1e-14, 'z[0]' );
	assertClose( zv[ 1 ], 0.1, 1e-14, 'z[1]' );
});

test( 'zlar2v: n_one (single element)', function t() {
	const tc = n_one;
	const x = new Complex128Array( [ 3.0, 0.0 ] );
	const y = new Complex128Array( [ 4.0, 0.0 ] );
	const z = new Complex128Array( [ 1.0, 0.5 ] );
	const c = new Float64Array( [ 0.6 ] );
	const s = new Complex128Array( [ 0.8, 0.0 ] );

	zlar2v( 1, x, 1, 0, y, 1, 0, z, 1, 0, c, 1, 0, s, 1, 0 );

	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
	assertArrayClose( Array.from( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
	assertArrayClose( Array.from( reinterpret( z, 0 ) ), tc.z, 1e-14, 'z' );
});

test( 'zlar2v: non_unit_stride (INCX=2, INCC=2)', function t() {
	const tc = non_unit_stride;
	// N=3, INCX=2, INCC=2
	// X at positions 0, 2, 4 (complex elements); Y same; Z same
	const x = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 3.0, 0.0 ] );
	const y = new Complex128Array( [ 4.0, 0.0, 0.0, 0.0, 5.0, 0.0, 0.0, 0.0, 6.0, 0.0 ] );
	const z = new Complex128Array( [ 0.5, 0.2, 0.0, 0.0, 1.0, -0.3, 0.0, 0.0, 1.5, 0.4 ] );
	const c = new Float64Array( [ 0.8, 0.0, 0.6, 0.0, 0.5 ] );
	const s = new Complex128Array( [ 0.6, 0.0, 0.0, 0.0, 0.0, 0.8, 0.0, 0.0, 0.5, 0.5 ] );

	zlar2v( 3, x, 2, 0, y, 2, 0, z, 2, 0, c, 2, 0, s, 2, 0 );

	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
	assertArrayClose( Array.from( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
	assertArrayClose( Array.from( reinterpret( z, 0 ) ), tc.z, 1e-14, 'z' );
});

test( 'zlar2v: identity rotation (c=1, s=0)', function t() {
	const tc = identity;
	const x = new Complex128Array( [ 10.0, 0.0, 20.0, 0.0, 30.0, 0.0 ] );
	const y = new Complex128Array( [ 40.0, 0.0, 50.0, 0.0, 60.0, 0.0 ] );
	const z = new Complex128Array( [ 5.0, 1.0, 10.0, -2.0, 15.0, 3.0 ] );
	const c = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	const s = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ] );

	zlar2v( 3, x, 1, 0, y, 1, 0, z, 1, 0, c, 1, 0, s, 1, 0 );

	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
	assertArrayClose( Array.from( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
	assertArrayClose( Array.from( reinterpret( z, 0 ) ), tc.z, 1e-14, 'z' );
});

test( 'zlar2v: pure imaginary S (c=0.6, s=(0,0.8))', function t() {
	const tc = pure_imag_s;
	const x = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0 ] );
	const y = new Complex128Array( [ 3.0, 0.0, 4.0, 0.0 ] );
	const z = new Complex128Array( [ 0.5, 0.3, 1.0, -0.5 ] );
	const c = new Float64Array( [ 0.6, 0.6 ] );
	const s = new Complex128Array( [ 0.0, 0.8, 0.0, 0.8 ] );

	zlar2v( 2, x, 1, 0, y, 1, 0, z, 1, 0, c, 1, 0, s, 1, 0 );

	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
	assertArrayClose( Array.from( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
	assertArrayClose( Array.from( reinterpret( z, 0 ) ), tc.z, 1e-14, 'z' );
});

test( 'zlar2v: swap rotation (c=0, s=(1,0))', function t() {
	const tc = swap;
	const x = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0 ] );
	const y = new Complex128Array( [ 3.0, 0.0, 4.0, 0.0 ] );
	const z = new Complex128Array( [ 0.5, 0.7, 1.0, -0.3 ] );
	const c = new Float64Array( [ 0.0, 0.0 ] );
	const s = new Complex128Array( [ 1.0, 0.0, 1.0, 0.0 ] );

	zlar2v( 2, x, 1, 0, y, 1, 0, z, 1, 0, c, 1, 0, s, 1, 0 );

	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
	assertArrayClose( Array.from( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
	assertArrayClose( Array.from( reinterpret( z, 0 ) ), tc.z, 1e-14, 'z' );
});

test( 'zlar2v: mixed strides (INCX=3, INCC=2)', function t() {
	const tc = mixed_strides;
	// N=2, INCX=3, INCC=2
	// Fortran X at positions 1,4 → complex elements 0,3
	const x = new Complex128Array( [ 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 4.0, 0.0 ] );
	const y = new Complex128Array( [ 6.0, 0.0, 0.0, 0.0, 0.0, 0.0, 8.0, 0.0 ] );
	const z = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 2.0, -1.0 ] );
	const c = new Float64Array( [ 0.8, 0.0, 0.6 ] );
	const s = new Complex128Array( [ 0.6, 0.0, 0.0, 0.0, 0.5, 0.5 ] );

	zlar2v( 2, x, 3, 0, y, 3, 0, z, 3, 0, c, 2, 0, s, 2, 0 );

	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
	assertArrayClose( Array.from( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
	assertArrayClose( Array.from( reinterpret( z, 0 ) ), tc.z, 1e-14, 'z' );
});
