/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhetf2rk from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zhetf2rk, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zhetf2rk.strided, 'function', 'has strided method' ); // eslint-disable-line max-len
});

test( 'main export factorizes a diagonal Hermitian 2x2', function t() {

	const A = new Complex128Array([
		4,
		0,
		0,
		0,
		0,
		0,
		-3,
		0
	]);
	const e = new Complex128Array( 2 );
	const ipiv = new Int32Array( 2 );
	const info = zhetf2rk( 'column-major', 'lower', 2, A, 2, e, 1, ipiv, 1 );
	assert.equal( info, 0, 'info should be 0' );
});

test( 'strided export factorizes a diagonal Hermitian 2x2', function t() {

	const A = new Complex128Array([
		4,
		0,
		0,
		0,
		0,
		0,
		-3,
		0
	]);
	const e = new Complex128Array( 2 );
	const ipiv = new Int32Array( 2 );
	const info = zhetf2rk.strided( 'lower', 2, A, 1, 2, 0, e, 1, 0, ipiv, 1, 0 );
	assert.equal( info, 0, 'info should be 0' );
});
