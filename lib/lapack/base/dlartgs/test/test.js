/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlartgs from './../lib/index.js';


// VARIABLES //

var EPS = 2.220446049250313e-16;


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlartgs, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dlartgs.ndarray, 'function', 'has ndarray method' );
});

test( 'main export returns an object with cs and sn', function t() {
	var r = dlartgs( 3.0, 4.0, 1.5 );
	assert.ok( typeof r.cs === 'number' );
	assert.ok( typeof r.sn === 'number' );
});

test( 'main export produces a unit-norm rotation', function t() {
	var r = dlartgs( 3.0, 4.0, 1.5 );
	assert.ok( Math.abs( ( r.cs * r.cs ) + ( r.sn * r.sn ) - 1.0 ) < 64.0 * EPS ); // eslint-disable-line max-len
});

test( 'main export matches expected nominal case', function t() {
	var r = dlartgs( 3.0, 4.0, 1.5 );
	assert.ok( Math.abs( r.cs - 0.4902612396325590 ) < 1e-14 );
	assert.ok( Math.abs( r.sn - 0.8715755371245493 ) < 1e-14 );
});

test( 'main export: sigma = 0, positive x branch', function t() {
	var r = dlartgs( 2.0, 3.0, 0.0 );
	assert.ok( Math.abs( ( r.cs * r.cs ) + ( r.sn * r.sn ) - 1.0 ) < 64.0 * EPS ); // eslint-disable-line max-len
	assert.ok( Math.abs( r.cs - 0.5547001962252291 ) < 1e-14 );
	assert.ok( Math.abs( r.sn - 0.8320502943378437 ) < 1e-14 );
});

test( 'main export: |x| == sigma and y == 0 (PI/2 rotation)', function t() {
	var r = dlartgs( 2.5, 0.0, 2.5 );
	assert.strictEqual( r.cs, 0.0 );
	assert.strictEqual( r.sn, 1.0 );
});

test( 'ndarray method writes cs, sn into out', function t() {
	var out = new Float64Array( 2 );
	dlartgs.ndarray( 3.0, 4.0, 1.5, out );
	assert.ok( Math.abs( out[ 0 ] - 0.4902612396325590 ) < 1e-14 );
	assert.ok( Math.abs( out[ 1 ] - 0.8715755371245493 ) < 1e-14 );
});

test( 'ndarray method returns the out array', function t() {
	var out = new Float64Array( 2 );
	var ret = dlartgs.ndarray( 3.0, 4.0, 1.5, out );
	assert.strictEqual( ret, out );
});

test( 'main and ndarray produce identical results', function t() {
	var out = new Float64Array( 2 );
	var r = dlartgs( 5.0, 1.0, 2.0 );
	dlartgs.ndarray( 5.0, 1.0, 2.0, out );
	assert.ok( Math.abs( r.cs - out[ 0 ] ) < 1e-14 );
	assert.ok( Math.abs( r.sn - out[ 1 ] ) < 1e-14 );
});
