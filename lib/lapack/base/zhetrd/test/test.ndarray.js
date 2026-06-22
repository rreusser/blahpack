// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhetrd from './../lib/ndarray.js';

// FIXTURES //

import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import upper_35x35 from './fixtures/upper_35x35.json' with { type: 'json' };
import lower_35x35 from './fixtures/lower_35x35.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Build 4x4 Hermitian matrix.
*/
function makeHerm4() {
	return new Complex128Array([
		4, 0,    1, -1,   2, 1,    0.5, -0.5,
		1, 1,    5, 0,    1, -2,   1, 1,
		2, -1,   1, 2,    6, 0,    2, -1,
		0.5, 0.5, 1, -1,  2, 1,   7, 0
	]);
}

/**
* Build 35x35 Hermitian matrix (same as Fortran test).
*/
function makeHerm35() {
	var data = [];
	var i;
	var j;
	var d;
	// Column-major: iterate cols then rows
	for ( j = 0; j < 35; j++ ) {
		for ( i = 0; i < 35; i++ ) {
			if ( i === j ) {
				data.push( 35 + i + 1 ); // dble(35 + i) with 1-based i
				data.push( 0 );
			} else if ( i < j ) {
				d = j - i + 1;
				data.push( 1.0 / d );
				data.push( 0.5 / d ); // upper triangle: positive imag
			} else {
				d = i - j + 1;
				data.push( 1.0 / d );
				data.push( -0.5 / d ); // lower triangle: conjugate (negative imag)
			}
		}
	}
	return new Complex128Array( data );
}

// TESTS //

test( 'zhetrd: upper_4x4 (unblocked path)', function t() {
	var tc = upper_4x4;
	var A = makeHerm4();
	var d = new Float64Array( 4 );
	var e = new Float64Array( 3 );
	var TAU = new Complex128Array( 3 );
	var WORK = new Complex128Array( 0 );
	var info = zhetrd('upper', 4, A, 1, 4, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );
	var Av = reinterpret( A, 0 );
	var Tv = reinterpret( TAU, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( Av ), tc.A, 1e-14, 'A' );
	assertArrayClose( Array.from( d ), tc.d, 1e-14, 'd' );
	assertArrayClose( Array.from( e ), tc.e, 1e-14, 'e' );
	assertArrayClose( Array.from( Tv ), tc.tau, 1e-14, 'tau' );
});

test( 'zhetrd: lower_4x4 (unblocked path)', function t() {
	var tc = lower_4x4;
	var A = makeHerm4();
	var d = new Float64Array( 4 );
	var e = new Float64Array( 3 );
	var TAU = new Complex128Array( 3 );
	var WORK = new Complex128Array( 0 );
	var info = zhetrd('lower', 4, A, 1, 4, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );
	var Av = reinterpret( A, 0 );
	var Tv = reinterpret( TAU, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( Av ), tc.A, 1e-14, 'A' );
	assertArrayClose( Array.from( d ), tc.d, 1e-14, 'd' );
	assertArrayClose( Array.from( e ), tc.e, 1e-14, 'e' );
	assertArrayClose( Array.from( Tv ), tc.tau, 1e-14, 'tau' );
});

test( 'zhetrd: N=1', function t() {
	var tc = n_one;
	var A = new Complex128Array( [ 3, 0 ] );
	var d = new Float64Array( 1 );
	var e = new Float64Array( 0 );
	var TAU = new Complex128Array( 0 );
	var WORK = new Complex128Array( 0 );
	var info = zhetrd('upper', 1, A, 1, 1, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );
	assert.equal( info, tc.info );
	assertClose( d[ 0 ], tc.d1, 1e-14, 'd1' );
});

test( 'zhetrd: N=0', function t() {
	var A = new Complex128Array( 0 );
	var d = new Float64Array( 0 );
	var e = new Float64Array( 0 );
	var TAU = new Complex128Array( 0 );
	var WORK = new Complex128Array( 0 );
	var info = zhetrd('upper', 0, A, 1, 1, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zhetrd: upper_35x35 (blocked path)', function t() {
	var tc = upper_35x35;
	var A = makeHerm35();
	var d = new Float64Array( 35 );
	var e = new Float64Array( 34 );
	var TAU = new Complex128Array( 34 );
	var WORK = new Complex128Array( 0 );
	var info = zhetrd('upper', 35, A, 1, 35, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );
	var Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( d ), tc.d, 1e-12, 'd' );
	assertArrayClose( Array.from( e ), tc.e, 1e-12, 'e' );
	assertArrayClose( Array.from( Av ), tc.A, 1e-12, 'A' );
});

test( 'zhetrd: lower_35x35 (blocked path)', function t() {
	var tc = lower_35x35;
	var A = makeHerm35();
	var d = new Float64Array( 35 );
	var e = new Float64Array( 34 );
	var TAU = new Complex128Array( 34 );
	var WORK = new Complex128Array( 0 );
	var info = zhetrd('lower', 35, A, 1, 35, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );
	var Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( d ), tc.d, 1e-12, 'd' );
	assertArrayClose( Array.from( e ), tc.e, 1e-12, 'e' );
	assertArrayClose( Array.from( Av ), tc.A, 1e-12, 'A' );
});
