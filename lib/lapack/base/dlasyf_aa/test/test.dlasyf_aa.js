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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlasyfAa from './../lib/dlasyf_aa.js';


// TESTS //

test( 'dlasyfAa is a function', function t() {
	assert.strictEqual( typeof dlasyfAa, 'function', 'is a function' );
});

test( 'dlasyfAa has expected arity', function t() {
	assert.strictEqual( dlasyfAa.length, 12, 'has expected arity' );
});

test( 'dlasyfAa throws TypeError for invalid order', function t() {
	const WORK = new Float64Array( 2 );
	const IPIV = new Int32Array( 2 );
	const A = new Float64Array( 4 );
	const H = new Float64Array( 4 );
	assert.throws( function throws() {
		dlasyfAa( 'invalid', 'upper', 1, 2, 2, A, 2, IPIV, 1, H, 2, WORK ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dlasyfAa throws TypeError for invalid uplo', function t() {
	const WORK = new Float64Array( 2 );
	const IPIV = new Int32Array( 2 );
	const A = new Float64Array( 4 );
	const H = new Float64Array( 4 );
	assert.throws( function throws() {
		dlasyfAa( 'column-major', 'invalid', 1, 2, 2, A, 2, IPIV, 1, H, 2, WORK ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dlasyfAa throws RangeError for negative M', function t() {
	const WORK = new Float64Array( 2 );
	const IPIV = new Int32Array( 2 );
	const A = new Float64Array( 4 );
	const H = new Float64Array( 4 );
	assert.throws( function throws() {
		dlasyfAa( 'column-major', 'upper', 1, -1, 2, A, 2, IPIV, 1, H, 2, WORK ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dlasyfAa throws RangeError for LDA < M', function t() {
	const WORK = new Float64Array( 2 );
	const IPIV = new Int32Array( 2 );
	const A = new Float64Array( 4 );
	const H = new Float64Array( 4 );
	assert.throws( function throws() {
		dlasyfAa( 'column-major', 'upper', 1, 2, 2, A, 1, IPIV, 1, H, 2, WORK ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dlasyfAa throws RangeError for LDH < M', function t() {
	const WORK = new Float64Array( 2 );
	const IPIV = new Int32Array( 2 );
	const A = new Float64Array( 4 );
	const H = new Float64Array( 4 );
	assert.throws( function throws() {
		dlasyfAa( 'column-major', 'upper', 1, 2, 2, A, 2, IPIV, 1, H, 1, WORK ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dlasyfAa: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// H is M by NB (DLASYF_AA: LDH >= max(1,M)).
	function F() {
		return new Float64Array( 1024 );
	}
	function I() {
		return new Int32Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDA': 16, 'LDH': 16 };
		Object.assign( L, ld );
		return dlasyfAa( order, 'upper', 1, 6, 2, F(), L.LDA, I(), 1, F(), L.LDH, F() );
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
