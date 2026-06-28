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
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zla_gerfsx_extended from './../lib/zla_gerfsx_extended.js';


// FUNCTIONS //

/**
* Builds a dummy valid argument list for the layout wrapper.
*
* @private
* @param {string} order - storage layout
* @param {string} trans - transpose type
* @param {integer} N - matrix order
* @returns {Array} argument list
*/
function args( order, trans, N ) {
	var out = [];
	var LD = ( N < 1 ) ? 1 : N;
	out.push( order );
	out.push( 2 );
	out.push( trans );
	out.push( N );
	out.push( 1 );
	out.push( new Complex128Array( LD * LD ) );
	out.push( LD );
	out.push( new Complex128Array( LD * LD ) );
	out.push( LD );
	out.push( new Int32Array( LD ) );
	out.push( false );
	out.push( new Float64Array( LD ) );
	out.push( new Complex128Array( LD ) );
	out.push( LD );
	out.push( new Complex128Array( LD ) );
	out.push( LD );
	out.push( new Float64Array( 1 ) );
	out.push( 2 );
	out.push( new Float64Array( 3 ) );
	out.push( 1 );
	out.push( new Float64Array( 3 ) );
	out.push( 1 );
	out.push( new Complex128Array( LD ) );
	out.push( new Float64Array( LD ) );
	out.push( new Complex128Array( LD ) );
	out.push( new Complex128Array( LD ) );
	out.push( 1e-3 );
	out.push( 10 );
	out.push( 0.5 );
	out.push( 0.25 );
	out.push( false );
	return out;
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zla_gerfsx_extended, 'function', 'is a function' );
});

test( 'throws a TypeError for an invalid order', function t() {
	assert.throws( function throws() {
		zla_gerfsx_extended.apply( null, args( 'invalid', 'no-transpose', 2 ) );
	}, TypeError );
});

test( 'throws a RangeError for negative N', function t() {
	assert.throws( function throws() {
		zla_gerfsx_extended.apply( null, args( 'row-major', 'no-transpose', -1 ) );
	}, RangeError );
});

test( 'throws a TypeError for invalid trans_type', function t() {
	assert.throws( function throws() {
		zla_gerfsx_extended.apply( null, args( 'row-major', 'bogus', 2 ) );
	}, TypeError );
});

test( 'quick return for N=0 is a no-op', function t() {
	var info = zla_gerfsx_extended.apply( null, args( 'row-major', 'no-transpose', 0 ) );
	assert.strictEqual( info, 0 );
});

test( 'accepts column-major order', function t() {
	var info = zla_gerfsx_extended.apply( null, args( 'column-major', 'no-transpose', 0 ) );
	assert.strictEqual( info, 0 );
});
