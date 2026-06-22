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
import dorbdb4 from './../lib/dorbdb4.js';


// FUNCTIONS //

/**
* Helper that constructs the minimal set of arrays required to call dorbdb4 (without invoking the algorithm body, since validation runs first).
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
		'PHANTOM': new Float64Array( 16 ),
		'WORK': new Float64Array( 64 )
	};
}


// TESTS //

test( 'dorbdb4 is a function', function t() {
	assert.strictEqual( typeof dorbdb4, 'function', 'is a function' );
});

test( 'dorbdb4 has expected arity', function t() {
	assert.strictEqual( dorbdb4.length, 22, 'has expected arity' );
});

test( 'dorbdb4 throws TypeError for invalid order', function t() {
	var a = args();
	assert.throws( function throws() {
		dorbdb4( 'invalid', 8, 4, 6, a.X11, 8, a.X21, 8, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.PHANTOM, 1, a.WORK, 1 );
	}, TypeError );
});

test( 'dorbdb4 throws RangeError for negative M', function t() {
	var a = args();
	assert.throws( function throws() {
		dorbdb4( 'column-major', -1, 4, 6, a.X11, 8, a.X21, 8, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.PHANTOM, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'dorbdb4 throws RangeError when P < M-Q', function t() {
	var a = args();

	// M=8, Q=4, M-Q=4, P=2: violates P >= M-Q
	assert.throws( function throws() {
		dorbdb4( 'column-major', 8, 2, 4, a.X11, 8, a.X21, 8, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.PHANTOM, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'dorbdb4 throws RangeError when M-P < M-Q', function t() {
	var a = args();

	// M=8, P=7, Q=4: M-P=1, M-Q=4 -> 1 < 4 violates M-P >= M-Q
	assert.throws( function throws() {
		dorbdb4( 'column-major', 8, 7, 4, a.X11, 8, a.X21, 8, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.PHANTOM, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'dorbdb4 throws RangeError when Q < 0', function t() {
	var a = args();
	assert.throws( function throws() {
		dorbdb4( 'column-major', 8, 4, -1, a.X11, 8, a.X21, 8, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.PHANTOM, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'dorbdb4 throws RangeError when M-Q > Q', function t() {
	var a = args();

	// M=8, Q=2: M-Q=6 > Q=2 violates M-Q <= Q
	assert.throws( function throws() {
		dorbdb4( 'column-major', 8, 4, 2, a.X11, 8, a.X21, 8, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.PHANTOM, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'dorbdb4 throws RangeError when Q > M', function t() {
	var a = args();
	assert.throws( function throws() {
		dorbdb4( 'column-major', 4, 4, 5, a.X11, 8, a.X21, 8, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.PHANTOM, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'dorbdb4 throws RangeError for LDX11 too small (column-major)', function t() {
	var a = args();
	assert.throws( function throws() {
		dorbdb4( 'column-major', 8, 4, 6, a.X11, 1, a.X21, 8, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.PHANTOM, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'dorbdb4 throws RangeError for LDX21 too small (column-major)', function t() {
	var a = args();
	assert.throws( function throws() {
		dorbdb4( 'column-major', 8, 4, 6, a.X11, 8, a.X21, 1, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.PHANTOM, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'dorbdb4 throws RangeError for LDX11 too small (row-major)', function t() {
	var a = args();
	assert.throws( function throws() {
		dorbdb4( 'row-major', 8, 4, 6, a.X11, 1, a.X21, 8, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.PHANTOM, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'dorbdb4 throws RangeError for LDX21 too small (row-major)', function t() {
	var a = args();
	assert.throws( function throws() {
		dorbdb4( 'row-major', 8, 4, 6, a.X11, 8, a.X21, 1, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.PHANTOM, 1, a.WORK, 1 );
	}, RangeError );
});

test( 'dorbdb4 (column-major): runs to completion on M=Q quick-return-like case', function t() {
	var info;
	var a = args();
	info = dorbdb4( 'column-major', 4, 2, 4, a.X11, 4, a.X21, 4, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.PHANTOM, 1, a.WORK, 1 );
	assert.strictEqual( info, 0, 'info' );
});

test( 'dorbdb4 (row-major): runs to completion on M=Q quick-return-like case', function t() {
	var info;
	var a = args();
	info = dorbdb4( 'row-major', 4, 2, 4, a.X11, 4, a.X21, 4, a.THETA, 1, a.PHI, 1, a.TAUP1, 1, a.TAUP2, 1, a.TAUQ1, 1, a.PHANTOM, 1, a.WORK, 1 );
	assert.strictEqual( info, 0, 'info' );
});
