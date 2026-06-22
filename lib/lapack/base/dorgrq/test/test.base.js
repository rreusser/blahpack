/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorgrqBase from './../lib/base.js';


// TESTS //

test( 'dorgrq base: M=0 returns 0 (covers base.js M<=0 short-circuit)', function t() {
	var WORK;
	var info;
	var TAU;
	var A;

	A = new Float64Array( 1 );
	TAU = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dorgrqBase( 0, 4, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
});
