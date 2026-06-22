/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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
import dorbdb3 from './../lib/dorbdb3.js';


// FUNCTIONS //

/**
* Constructs the minimal set of arrays required to call `dorbdb3` (without invoking the algorithm body, since validation runs first).
*
* @private
* @returns {Object} packed argument arrays
*/
function args() {
	return {
		'X11': new Float64Array( 64 ),
		'X21': new Float64Array( 64 ),
		'THETA': new Float64Array( 8 ),
		'PHI': new Float64Array( 8 ),
		'TAUP1': new Float64Array( 8 ),
		'TAUP2': new Float64Array( 8 ),
		'TAUQ1': new Float64Array( 8 ),
		'WORK': new Float64Array( 64 )
	};
}


// TESTS //

test( 'dorbdb3 is a function', function t() {
	assert.strictEqual( typeof dorbdb3, 'function', 'is a function' );
});

test( 'dorbdb3 has expected arity', function t() {
	assert.strictEqual( dorbdb3.length, 20, 'has expected arity' );
});

test( 'dorbdb3 throws TypeError for invalid order', function t() {
	var a = args();
	assert.throws( function throws() {
		dorbdb3( 'invalid', 8, 5, 4, a.X11, 8, a.X21, 8, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.WORK, 1 );
	}, TypeError );
});

test( 'dorbdb3 throws RangeError for negative M', function t() {
	var a = args();
	assert.throws( function throws() {
		dorbdb3( 'column-major', -1, 5, 4, a.X11, 8, a.X21, 8, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'dorbdb3 throws RangeError when 2*P < M (constraint M-P <= P)', function t() {
	var a = args();
	assert.throws( function throws() {
		dorbdb3( 'column-major', 8, 1, 4, a.X11, 8, a.X21, 8, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'dorbdb3 throws RangeError when P > M (constraint P <= M)', function t() {
	var a = args();
	assert.throws( function throws() {
		dorbdb3( 'column-major', 4, 8, 4, a.X11, 8, a.X21, 8, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'dorbdb3 throws RangeError when Q < M-P', function t() {
	var a = args();
	assert.throws( function throws() {
		// M=6, P=4 => M-P=2; Q=1 < 2 violates Q >= M-P
		dorbdb3( 'column-major', 6, 4, 1, a.X11, 8, a.X21, 8, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'dorbdb3 throws RangeError when M-Q < M-P', function t() {
	var a = args();
	assert.throws( function throws() {
		// M=6, P=5, Q=5 => M-P=1, M-Q=1 — boundary OK; pick M=6, P=4, Q=5: M-P=2, M-Q=1 < 2
		dorbdb3( 'column-major', 6, 4, 5, a.X11, 8, a.X21, 8, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'dorbdb3 throws RangeError for LDX11 too small (column-major)', function t() {
	var a = args();
	assert.throws( function throws() {
		// LDX11=1 < P=5
		dorbdb3( 'column-major', 8, 5, 4, a.X11, 1, a.X21, 8, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'dorbdb3 throws RangeError for LDX21 too small (column-major)', function t() {
	var a = args();
	assert.throws( function throws() {
		// LDX21=1 < M-P=3
		dorbdb3( 'column-major', 8, 5, 4, a.X11, 8, a.X21, 1, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'dorbdb3 throws RangeError for LDX11 too small (row-major)', function t() {
	var a = args();
	assert.throws( function throws() {
		// LDX11=1 < Q=4
		dorbdb3( 'row-major', 8, 5, 4, a.X11, 1, a.X21, 8, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'dorbdb3 throws RangeError for LDX21 too small (row-major)', function t() {
	var a = args();
	assert.throws( function throws() {
		// LDX21=1 < Q=4
		dorbdb3( 'row-major', 8, 5, 4, a.X11, 8, a.X21, 1, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'dorbdb3 (column-major): runs to completion on Q=0 quick-return', function t() {
	var info;
	var a = args();
	info = dorbdb3( 'column-major', 2, 2, 0, a.X11, 2, a.X21, 1, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.WORK, 1 );
	assert.strictEqual( info, 0, 'info' );
});

test( 'dorbdb3 (row-major): runs to completion on Q=0 quick-return', function t() {
	var info;
	var a = args();
	info = dorbdb3( 'row-major', 2, 2, 0, a.X11, 1, a.X21, 1, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.WORK, 1 );
	assert.strictEqual( info, 0, 'info' );
});
