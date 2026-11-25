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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len, max-statements */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dla_gbrfsx_extended from './../lib/dla_gbrfsx_extended.js';


// FUNCTIONS //

/**
* Invokes the layout wrapper with a valid tridiagonal system and the requested overrides.
*
* @private
* @param {string} order - layout order
* @param {string} trans - trans type
* @param {integer} N - matrix order
* @param {integer} nrhs - number of right-hand sides
* @returns {integer} info
*/
function callValid( order, trans, N, nrhs ) {
	const AB = new Float64Array( 12 );
	const AFB = new Float64Array( 16 );
	const IPIV = new Int32Array( 4 );
	const C = new Float64Array( 4 );
	const B = new Float64Array( 8 );
	const Y = new Float64Array( 8 );
	const BERR_OUT = new Float64Array( 2 );
	const EBN = new Float64Array( 6 );
	const EBC = new Float64Array( 6 );
	const RES = new Float64Array( 4 );
	const AYB = new Float64Array( 4 );
	const DY = new Float64Array( 4 );
	const YT = new Float64Array( 4 );
	return dla_gbrfsx_extended( order, 2, trans, N, 1, 1, nrhs, AB, 3, AFB, 4, IPIV, 1, false, C, 1, B, 4, Y, 4, BERR_OUT, 1, 2, EBN, 2, EBC, 2, RES, 1, AYB, 1, DY, 1, YT, 1, 1e-2, 10, 0.5, 0.25, false );
}


// TESTS //

test( 'dla_gbrfsx_extended is a function', function t() {
	assert.strictEqual( typeof dla_gbrfsx_extended, 'function', 'is a function' );
});

test( 'dla_gbrfsx_extended throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		callValid( 'invalid', 'no-transpose', 4, 1 );
	}, TypeError );
});

test( 'dla_gbrfsx_extended throws TypeError for invalid trans_type', function t() {
	assert.throws( function throws() {
		callValid( 'column-major', 'bogus', 4, 1 );
	}, TypeError );
});

test( 'dla_gbrfsx_extended throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		callValid( 'column-major', 'no-transpose', -1, 1 );
	}, RangeError );
});

test( 'dla_gbrfsx_extended throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		callValid( 'column-major', 'no-transpose', 4, -1 );
	}, RangeError );
});

test( 'dla_gbrfsx_extended column-major runs successfully (nrhs=0)', function t() {
	const info = callValid( 'column-major', 'no-transpose', 4, 0 );
	assert.strictEqual( info, 0, 'returns 0' );
});

test( 'dla_gbrfsx_extended row-major runs successfully (nrhs=0)', function t() {
	const info = callValid( 'row-major', 'no-transpose', 4, 0 );
	assert.strictEqual( info, 0, 'returns 0' );
});

test( 'dla_gbrfsx_extended throws RangeError for invalid LDB', function t() {
	const BERR_OUT = new Float64Array( 2 );
	const IPIV = new Int32Array( 4 );
	const AFB = new Float64Array( 16 );
	const EBN = new Float64Array( 6 );
	const EBC = new Float64Array( 6 );
	const AYB = new Float64Array( 4 );
	const RES = new Float64Array( 4 );
	const AB = new Float64Array( 12 );
	const DY = new Float64Array( 4 );
	const YT = new Float64Array( 4 );
	const B = new Float64Array( 8 );
	const Y = new Float64Array( 8 );
	const C = new Float64Array( 4 );
	assert.throws( function throws() {
		dla_gbrfsx_extended( 'column-major', 2, 'no-transpose', 4, 1, 1, 1, AB, 3, AFB, 4, IPIV, 1, false, C, 1, B, 1, Y, 4, BERR_OUT, 1, 2, EBN, 2, EBC, 2, RES, 1, AYB, 1, DY, 1, YT, 1, 1e-2, 10, 0.5, 0.25, false );
	}, RangeError );
});

test( 'dla_gbrfsx_extended throws RangeError for invalid LDY', function t() {
	const BERR_OUT = new Float64Array( 2 );
	const IPIV = new Int32Array( 4 );
	const AFB = new Float64Array( 16 );
	const EBN = new Float64Array( 6 );
	const EBC = new Float64Array( 6 );
	const AYB = new Float64Array( 4 );
	const RES = new Float64Array( 4 );
	const AB = new Float64Array( 12 );
	const DY = new Float64Array( 4 );
	const YT = new Float64Array( 4 );
	const B = new Float64Array( 8 );
	const Y = new Float64Array( 8 );
	const C = new Float64Array( 4 );
	assert.throws( function throws() {
		dla_gbrfsx_extended( 'column-major', 2, 'no-transpose', 4, 1, 1, 1, AB, 3, AFB, 4, IPIV, 1, false, C, 1, B, 4, Y, 1, BERR_OUT, 1, 2, EBN, 2, EBC, 2, RES, 1, AYB, 1, DY, 1, YT, 1, 1e-2, 10, 0.5, 0.25, false );
	}, RangeError );
});

test( 'dla_gbrfsx_extended throws RangeError for invalid LDERR_BNDS_NORM', function t() {
	const BERR_OUT = new Float64Array( 2 );
	const IPIV = new Int32Array( 4 );
	const AFB = new Float64Array( 16 );
	const EBN = new Float64Array( 6 );
	const EBC = new Float64Array( 6 );
	const AYB = new Float64Array( 4 );
	const RES = new Float64Array( 4 );
	const AB = new Float64Array( 12 );
	const DY = new Float64Array( 4 );
	const YT = new Float64Array( 4 );
	const B = new Float64Array( 8 );
	const Y = new Float64Array( 8 );
	const C = new Float64Array( 4 );
	assert.throws( function throws() {
		dla_gbrfsx_extended( 'column-major', 2, 'no-transpose', 4, 1, 1, 2, AB, 3, AFB, 4, IPIV, 1, false, C, 1, B, 4, Y, 4, BERR_OUT, 1, 2, EBN, 1, EBC, 2, RES, 1, AYB, 1, DY, 1, YT, 1, 1e-2, 10, 0.5, 0.25, false );
	}, RangeError );
});

test( 'dla_gbrfsx_extended throws RangeError for invalid LDERR_BNDS_COMP', function t() {
	const BERR_OUT = new Float64Array( 2 );
	const IPIV = new Int32Array( 4 );
	const AFB = new Float64Array( 16 );
	const EBN = new Float64Array( 6 );
	const EBC = new Float64Array( 6 );
	const AYB = new Float64Array( 4 );
	const RES = new Float64Array( 4 );
	const AB = new Float64Array( 12 );
	const DY = new Float64Array( 4 );
	const YT = new Float64Array( 4 );
	const B = new Float64Array( 8 );
	const Y = new Float64Array( 8 );
	const C = new Float64Array( 4 );
	assert.throws( function throws() {
		dla_gbrfsx_extended( 'column-major', 2, 'no-transpose', 4, 1, 1, 2, AB, 3, AFB, 4, IPIV, 1, false, C, 1, B, 4, Y, 4, BERR_OUT, 1, 2, EBN, 2, EBC, 1, RES, 1, AYB, 1, DY, 1, YT, 1, 1e-2, 10, 0.5, 0.25, false );
	}, RangeError );
});

test( 'dla_gbrfsx_extended: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// B and Y are N by NRHS (DLA_GBRFSX_EXTENDED: LDB, LDY >= max(1,N)).
	function F() {
		return new Float64Array( 1024 );
	}
	function I() {
		return new Int32Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDAB': 16, 'LDAFB': 16, 'LDB': 16, 'LDY': 16, 'LDERR_BNDS_NORM': 16, 'LDERR_BNDS_COMP': 16 };
		Object.assign( L, ld );
		return dla_gbrfsx_extended( order, 2, 'no-transpose', 6, 1, 1, 2, F(), L.LDAB, F(), L.LDAFB, I(), 1, false, F(), 1, F(), L.LDB, F(), L.LDY, F(), 1, 2, F(), L.LDERR_BNDS_NORM, F(), L.LDERR_BNDS_COMP, F(), 1, F(), 1, F(), 1, F(), 1, 1e-2, 10, 0.5, 0.25, false );
	}
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDB': 6 } );
	}, 'column-major LDB = 6 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDB': 5 } );
	}, RangeError, 'column-major LDB = 5 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'row-major', { 'LDB': 2 } );
	}, 'row-major LDB = 2 is accepted' );
	assert.throws( function bad() {
		call( 'row-major', { 'LDB': 1 } );
	}, RangeError, 'row-major LDB = 1 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDY': 6 } );
	}, 'column-major LDY = 6 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDY': 5 } );
	}, RangeError, 'column-major LDY = 5 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'row-major', { 'LDY': 2 } );
	}, 'row-major LDY = 2 is accepted' );
	assert.throws( function bad() {
		call( 'row-major', { 'LDY': 1 } );
	}, RangeError, 'row-major LDY = 1 is rejected' );
});
