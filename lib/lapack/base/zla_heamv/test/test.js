
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zla_heamv from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zla_heamv, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zla_heamv.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'the BLAS-style interface computes y := alpha*|A|*|x| + beta*|y|', function t() { // eslint-disable-line max-len
	var out;
	var A;
	var x;
	var y;

	A = new Complex128Array([
		2.0,
		0.0,   // A(0,0)
		0.0,
		0.0,   // A(1,0)
		1.0,
		2.0,   // A(0,1)
		5.0,
		0.0    // A(1,1)
	]);
	x = new Complex128Array( [ 1.0, 1.0, 2.0, 0.0 ] );
	y = new Float64Array( 2 );
	out = zla_heamv( 'column-major', 'upper', 2, 1.0, A, 2, x, 1, 0.0, y, 1 );
	assert.strictEqual( out, y, 'returns y' );
	assert.ok( Math.abs( y[ 0 ] - 10.0 ) < 0.01, 'y[0] approx 10' );
	assert.ok( Math.abs( y[ 1 ] - 16.0 ) < 0.01, 'y[1] approx 16' );
});

test( 'the ndarray interface computes y := alpha*|A|*|x| + beta*|y|', function t() { // eslint-disable-line max-len
	var out;
	var A;
	var x;
	var y;

	A = new Complex128Array([
		2.0,
		0.0,
		0.0,
		0.0,
		1.0,
		2.0,
		5.0,
		0.0
	]);
	x = new Complex128Array( [ 1.0, 1.0, 2.0, 0.0 ] );
	y = new Float64Array( 2 );
	out = zla_heamv.ndarray( 'upper', 2, 1.0, A, 1, 2, 0, x, 1, 0, 0.0, y, 1, 0 );
	assert.strictEqual( out, y, 'returns y' );
	assert.ok( Math.abs( y[ 0 ] - 10.0 ) < 0.01, 'y[0] approx 10' );
	assert.ok( Math.abs( y[ 1 ] - 16.0 ) < 0.01, 'y[1] approx 16' );
});
