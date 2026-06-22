/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zrotg from './../lib/ndarray.js';

test( 'zrotg: smoke (3+0i, 4+0i) produces real cosine 0.6 and sine 0.8', function t() {
	var a = new Complex128Array( [ 3.0, 0.0 ] );
	var b = new Complex128Array( [ 4.0, 0.0 ] );
	var c = new Float64Array( 1 );
	var s = new Complex128Array( 1 );
	zrotg( a, 0, b, 0, c, 0, s, 0 );
	var sFlat = new Float64Array( s.buffer );
	assert.ok( Math.abs( c[ 0 ] - 0.6 ) < 1e-12, 'c ≈ 0.6, got ' + c[ 0 ] );
	assert.ok( Math.abs( sFlat[ 0 ] - 0.8 ) < 1e-12, 's_re ≈ 0.8, got ' + sFlat[ 0 ] );
});
