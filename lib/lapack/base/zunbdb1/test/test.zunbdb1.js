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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zunbdb1 from './../lib/zunbdb1.js';


// FUNCTIONS //

/**
* Helper that constructs the minimal set of arrays required to call zunbdb1.
*
* @private
* @returns {Object} packed argument arrays
*/
function args() {
	return {
		'X11': new Complex128Array( 64 ),
		'X21': new Complex128Array( 64 ),
		'THETA': new Float64Array( 8 ),
		'PHI': new Float64Array( 8 ),
		'TAUP1': new Complex128Array( 8 ),
		'TAUP2': new Complex128Array( 8 ),
		'TAUQ1': new Complex128Array( 8 ),
		'WORK': new Complex128Array( 64 )
	};
}


// TESTS //

test( 'zunbdb1 is a function', function t() {
	assert.strictEqual( typeof zunbdb1, 'function', 'is a function' );
});

test( 'zunbdb1 has expected arity', function t() {
	assert.strictEqual( zunbdb1.length, 20, 'has expected arity' );
});

test( 'zunbdb1 throws TypeError for invalid order', function t() {
	var a = args();
	assert.throws( function throws() {
		zunbdb1( 'invalid', 8, 4, 2, a.X11, 8, a.X21, 8, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.WORK, 1 );
	}, TypeError );
});

test( 'zunbdb1 throws RangeError for negative M', function t() {
	var a = args();
	assert.throws( function throws() {
		zunbdb1( 'column-major', -1, 4, 2, a.X11, 8, a.X21, 8, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'zunbdb1 throws RangeError when P < Q (constraint Q <= P)', function t() {
	var a = args();
	assert.throws( function throws() {
		zunbdb1( 'column-major', 8, 1, 2, a.X11, 8, a.X21, 8, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'zunbdb1 throws RangeError when M-P < Q (constraint Q <= M-P)', function t() {
	var a = args();
	assert.throws( function throws() {
		zunbdb1( 'column-major', 8, 7, 2, a.X11, 8, a.X21, 8, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'zunbdb1 throws RangeError when Q < 0', function t() {
	var a = args();
	assert.throws( function throws() {
		zunbdb1( 'column-major', 8, 4, -1, a.X11, 8, a.X21, 8, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'zunbdb1 throws RangeError when M-Q < Q (constraint Q <= M-Q)', function t() {
	var a = args();
	assert.throws( function throws() {
		zunbdb1( 'column-major', 4, 4, 4, a.X11, 8, a.X21, 8, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'zunbdb1 throws RangeError for LDX11 too small (column-major)', function t() {
	var a = args();
	assert.throws( function throws() {
		zunbdb1( 'column-major', 8, 4, 2, a.X11, 1, a.X21, 8, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'zunbdb1 throws RangeError for LDX21 too small (column-major)', function t() {
	var a = args();
	assert.throws( function throws() {
		zunbdb1( 'column-major', 8, 4, 2, a.X11, 8, a.X21, 1, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'zunbdb1 throws RangeError for LDX11 too small (row-major)', function t() {
	var a = args();
	assert.throws( function throws() {
		zunbdb1( 'row-major', 8, 4, 2, a.X11, 1, a.X21, 8, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'zunbdb1 throws RangeError for LDX21 too small (row-major)', function t() {
	var a = args();
	assert.throws( function throws() {
		zunbdb1( 'row-major', 8, 4, 2, a.X11, 8, a.X21, 1, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'zunbdb1 (column-major): runs to completion on Q=0 quick-return', function t() {
	var info;
	var a = args();
	info = zunbdb1( 'column-major', 4, 2, 0, a.X11, 4, a.X21, 4, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.WORK, 1 );
	assert.strictEqual( info, 0, 'info' );
});

test( 'zunbdb1 (row-major): runs to completion on Q=0 quick-return', function t() {
	var info;
	var a = args();
	info = zunbdb1( 'row-major', 4, 2, 0, a.X11, 1, a.X21, 1, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.WORK, 1 );
	assert.strictEqual( info, 0, 'info' );
});
