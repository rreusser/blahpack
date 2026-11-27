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

/* eslint-disable no-restricted-syntax, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlarcm from './../lib/zlarcm.js';


// TESTS //

test( 'zlarcm is a function', function t() {
	assert.strictEqual( typeof zlarcm, 'function', 'is a function' );
});

test( 'zlarcm has expected arity', function t() {
	assert.strictEqual( zlarcm.length, 10, 'has expected arity' );
});

test( 'zlarcm throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlarcm( 'invalid', 2, 2, new Float64Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Float64Array( 8 ) );
	}, TypeError );
});

test( 'zlarcm throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlarcm( 'row-major', -1, 2, new Float64Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Float64Array( 8 ) );
	}, RangeError );
});

test( 'zlarcm throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlarcm( 'row-major', 2, -1, new Float64Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Float64Array( 8 ) );
	}, RangeError );
});

test( 'zlarcm: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// B and C are M by N (ZLARCM: LDB, LDC >= max(1,M)).
	function F() {
		return new Float64Array( 1024 );
	}
	function Z() {
		return new Complex128Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDA': 16, 'LDB': 16, 'LDC': 16 };
		Object.assign( L, ld );
		return zlarcm( order, 3, 5, F(), L.LDA, Z(), L.LDB, Z(), L.LDC, F() );
	}
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDB': 3 } );
	}, 'column-major LDB = 3 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDB': 2 } );
	}, RangeError, 'column-major LDB = 2 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'row-major', { 'LDB': 5 } );
	}, 'row-major LDB = 5 is accepted' );
	assert.throws( function bad() {
		call( 'row-major', { 'LDB': 4 } );
	}, RangeError, 'row-major LDB = 4 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDC': 3 } );
	}, 'column-major LDC = 3 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDC': 2 } );
	}, RangeError, 'column-major LDC = 2 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'row-major', { 'LDC': 5 } );
	}, 'row-major LDC = 5 is accepted' );
	assert.throws( function bad() {
		call( 'row-major', { 'LDC': 4 } );
	}, RangeError, 'row-major LDC = 4 is rejected' );
});
