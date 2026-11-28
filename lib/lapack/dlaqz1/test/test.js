/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqz1 from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlaqz1, 'function', 'main export is a function' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof dlaqz1.strided, 'function', 'has strided method' );
});

test( 'main export has expected arity', function t() {
	assert.strictEqual( dlaqz1.length, 12, 'has expected arity' );
});

test( 'strided export has expected arity', function t() {
	assert.strictEqual( dlaqz1.strided.length, 16, 'has expected arity' );
});

test( 'main and strided produce identical results for column-major', function t() { // eslint-disable-line max-len
	const A = new Float64Array( [ 4.0, 2.0, 0.0, 1.0, 5.0, 3.0, 0.5, 1.0, 6.0 ] );
	const B = new Float64Array( [ 2.0, 0.0, 0.0, 0.5, 3.0, 0.0, 0.1, 0.5, 4.0 ] );
	const v1 = new Float64Array( 3 );
	const v2 = new Float64Array( 3 );
	dlaqz1( 'column-major', A, 3, B, 3, 1.0, 2.0, 0.0, 1.0, 1.0, v1, 1 );
	dlaqz1.strided( A, 1, 3, 0, B, 1, 3, 0, 1.0, 2.0, 0.0, 1.0, 1.0, v2, 1, 0 );
	assert.deepStrictEqual( v1, v2, 'identical results' );
});
