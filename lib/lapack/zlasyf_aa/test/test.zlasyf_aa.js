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

/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zlasyfAa from './../lib/zlasyf_aa.js';


// TESTS //

test( 'zlasyfAa is a function', function t() {
	assert.strictEqual( typeof zlasyfAa, 'function', 'is a function' );
});

test( 'zlasyfAa has expected arity', function t() {
	assert.strictEqual( zlasyfAa.length, 12, 'has expected arity' );
});

test( 'zlasyfAa throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlasyfAa( 'invalid', 'upper', 1, 2, 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ) );
	}, TypeError );
});

test( 'zlasyfAa throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlasyfAa( 'column-major', 'invalid', 1, 2, 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ) );
	}, TypeError );
});

test( 'zlasyfAa throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlasyfAa( 'column-major', 'upper', 1, -1, 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ) );
	}, RangeError );
});

test( 'zlasyfAa throws RangeError for LDA < max(1,M)', function t() {
	assert.throws( function throws() {
		zlasyfAa( 'column-major', 'upper', 1, 4, 2, new Complex128Array( 16 ), 2, new Int32Array( 4 ), 1, new Complex128Array( 16 ), 4, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'zlasyfAa throws RangeError for LDH < max(1,M)', function t() {
	assert.throws( function throws() {
		zlasyfAa( 'column-major', 'upper', 1, 4, 2, new Complex128Array( 16 ), 4, new Int32Array( 4 ), 1, new Complex128Array( 16 ), 2, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'zlasyfAa accepts row-major', function t() {
	const info = zlasyfAa( 'row-major', 'lower', 1, 2, 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ) );
	assert.ok( info instanceof Complex128Array );
});

test( 'zlasyfAa: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// H is M by NB (ZLASYF_AA: LDH >= max(1,M)).
	function Z() {
		return new Complex128Array( 1024 );
	}
	function I() {
		return new Int32Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDA': 16, 'LDH': 16 };
		Object.assign( L, ld );
		return zlasyfAa( order, 'upper', 1, 6, 2, Z(), L.LDA, I(), 1, Z(), L.LDH, Z() );
	}
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDH': 6 } );
	}, 'column-major LDH = 6 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDH': 5 } );
	}, RangeError, 'column-major LDH = 5 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'row-major', { 'LDH': 2 } );
	}, 'row-major LDH = 2 is accepted' );
	assert.throws( function bad() {
		call( 'row-major', { 'LDH': 1 } );
	}, RangeError, 'row-major LDH = 1 is rejected' );
});
