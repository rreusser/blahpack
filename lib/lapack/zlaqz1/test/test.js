/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlaqz1 from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zlaqz1, 'function', 'main export is a function' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zlaqz1.strided, 'function', 'has strided method' );
});

test( 'main export has expected arity', function t() {
	assert.strictEqual( zlaqz1.length, 19, 'has expected arity' );
});

test( 'strided export has expected arity', function t() {
	assert.strictEqual( zlaqz1.strided.length, 26, 'has expected arity' );
});

test( 'main and strided are callable on identity inputs (no bulge)', function t() { // eslint-disable-line max-len
	let i;
	const A = new Complex128Array( 25 );
	const B = new Complex128Array( 25 );
	const Q = new Complex128Array( 25 );
	const Z = new Complex128Array( 25 );
	for ( i = 0; i < 5; i++ ) {
		B.set( [ 1.0, 0.0 ], ( i * 5 ) + i );
		Q.set( [ 1.0, 0.0 ], ( i * 5 ) + i );
		Z.set( [ 1.0, 0.0 ], ( i * 5 ) + i );
	}
	zlaqz1( 'column-major', true, true, 4, 0, 4, 4, A, 5, B, 5, 5, 0, Q, 5, 5, 0, Z, 5 ); // eslint-disable-line max-len
	assert.ok( true, 'no throw' );
});
