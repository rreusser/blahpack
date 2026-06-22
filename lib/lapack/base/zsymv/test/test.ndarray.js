// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsymv from './../lib/ndarray.js';

// FIXTURES //

import upper_a1_b0 from './fixtures/upper_a1_b0.json' with { type: 'json' };
import lower_a2_b05 from './fixtures/lower_a2_b05.json' with { type: 'json' };
import n0 from './fixtures/n0.json' with { type: 'json' };
import a0_b1 from './fixtures/a0_b1.json' with { type: 'json' };

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

function toF64( cArr, n ) {
	return Array.prototype.slice.call( reinterpret( cArr, 0 ), 0, n );
}

// 4x4 upper symmetric: same matrix used in the Fortran test
function makeUpperA() {
	return new Complex128Array( new Float64Array( [
		2.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		1.0, 2.0, 5.0, -1.0, 0.0, 0.0, 0.0, 0.0,
		3.0, -1.0, 2.0, 1.0, 4.0, 2.0, 0.0, 0.0,
		0.5, 0.5, 1.0, -2.0, 3.0, 0.0, 6.0, -3.0
	] ) );
}

// 4x4 lower symmetric
function makeLowerA() {
	return new Complex128Array( new Float64Array( [
		2.0, 1.0, 1.0, 2.0, 3.0, -1.0, 0.5, 0.5,
		0.0, 0.0, 5.0, -1.0, 2.0, 1.0, 1.0, -2.0,
		0.0, 0.0, 0.0, 0.0, 4.0, 2.0, 3.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 6.0, -3.0
	] ) );
}

function makeX() {
	return new Complex128Array( new Float64Array( [
		1.0, 0.0, 0.0, 1.0, 2.0, -1.0, 1.0, 1.0
	] ) );
}

// TESTS //

test( 'zsymv: upper, alpha=1, beta=0', function t() {
	var tc = upper_a1_b0;
	var A = makeUpperA();
	var x = makeX();
	var y = new Complex128Array( 4 );
	var alpha = new Complex128( 1.0, 0.0 );
	var beta = new Complex128( 0.0, 0.0 );
	zsymv( 'upper', 4, alpha, A, 1, 4, 0, x, 1, 0, beta, y, 1, 0 );
	assertArrayClose( toF64( y, 8 ), tc.y, 1e-14, 'y' );
});

test( 'zsymv: lower, alpha=(2,1), beta=(0.5,0)', function t() {
	var tc = lower_a2_b05;
	var A = makeLowerA();
	var x = makeX();
	// y starts with the result from the upper test
	var tcPrev = upper_a1_b0;
	var y = new Complex128Array( new Float64Array( tcPrev.y ) );
	var alpha = new Complex128( 2.0, 1.0 );
	var beta = new Complex128( 0.5, 0.0 );
	zsymv( 'lower', 4, alpha, A, 1, 4, 0, x, 1, 0, beta, y, 1, 0 );
	assertArrayClose( toF64( y, 8 ), tc.y, 1e-14, 'y' );
});

test( 'zsymv: N=0 quick return', function t() {
	var tc = n0;
	var A = makeUpperA();
	var x = makeX();
	var y = new Complex128Array( new Float64Array( [ 99.0, 99.0 ] ) );
	var alpha = new Complex128( 2.0, 1.0 );
	var beta = new Complex128( 0.5, 0.0 );
	zsymv( 'upper', 0, alpha, A, 1, 4, 0, x, 1, 0, beta, y, 1, 0 );
	assertArrayClose( toF64( y, 2 ), tc.y, 1e-14, 'y' );
});

test( 'zsymv: alpha=0, beta=1 quick return', function t() {
	var tc = a0_b1;
	var A = makeUpperA();
	var x = makeX();
	var y = new Complex128Array( new Float64Array( [ 7.0, 3.0, 2.0, 5.0 ] ) );
	var alpha = new Complex128( 0.0, 0.0 );
	var beta = new Complex128( 1.0, 0.0 );
	zsymv( 'upper', 2, alpha, A, 1, 4, 0, x, 1, 0, beta, y, 1, 0 );
	assertArrayClose( toF64( y, 4 ), tc.y, 1e-14, 'y' );
});

test( 'zsymv: alpha=0, beta=0 zeroes y', function t() {
	var A = makeUpperA();
	var x = makeX();
	var y = new Complex128Array( new Float64Array( [ 7.0, 3.0, 2.0, 5.0 ] ) );
	var alpha = new Complex128( 0.0, 0.0 );
	var beta = new Complex128( 0.0, 0.0 );
	zsymv( 'upper', 2, alpha, A, 1, 4, 0, x, 1, 0, beta, y, 1, 0 );
	assertArrayClose( toF64( y, 4 ), [ 0.0, 0.0, 0.0, 0.0 ], 1e-14, 'y' );
});

test( 'zsymv: alpha=0, beta=2 scales y', function t() {
	var A = makeUpperA();
	var x = makeX();
	var y = new Complex128Array( new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] ) );
	var alpha = new Complex128( 0.0, 0.0 );
	var beta = new Complex128( 2.0, 0.0 );
	zsymv( 'upper', 2, alpha, A, 1, 4, 0, x, 1, 0, beta, y, 1, 0 );
	assertArrayClose( toF64( y, 4 ), [ 2.0, 4.0, 6.0, 8.0 ], 1e-14, 'y' );
});
