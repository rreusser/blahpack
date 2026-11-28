
/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zlaic1 from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zlaic1, 'function', 'main export is a function' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zlaic1.strided, 'function', 'has strided method' );
});

test( 'strided throws if provided an invalid job string', function t() {
	let sestpr, gamma, sv, cv, x, w;

	x = new Complex128Array( [ 1.0, 0.0 ] );
	w = new Complex128Array( [ 1.0, 0.0 ] );
	gamma = new Complex128( 1.0, 0.0 );
	sestpr = new Float64Array( 1 );
	sv = new Complex128Array( 1 );
	cv = new Complex128Array( 1 );

	assert.throws( function badJob() {
		zlaic1.strided( 'invalid', 1, x, 1, 0, 1.0, w, 1, 0, gamma, sestpr, sv, 0, cv, 0 ); // eslint-disable-line max-len
	}, TypeError, 'throws for invalid job' );

	assert.throws( function singleChar() {
		zlaic1.strided( '1', 1, x, 1, 0, 1.0, w, 1, 0, gamma, sestpr, sv, 0, cv, 0 ); // eslint-disable-line max-len
	}, TypeError, 'throws for single-char Fortran flag' );
});
