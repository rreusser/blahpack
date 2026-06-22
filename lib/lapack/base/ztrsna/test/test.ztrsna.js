/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, vars-on-top, stdlib/vars-order, require-jsdoc, stdlib/jsdoc-private-annotation, no-unused-vars */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import ztrsna from './../lib/ztrsna.js';


// FUNCTIONS //

function makeArgs() {
	return [ new Complex128Array( 4 ), new Complex128Array( 4 ), new Complex128Array( 4 ) ];
}


// TESTS //

test( 'ztrsna is a function', function t() {
	assert.strictEqual( typeof ztrsna, 'function', 'is a function' );
} );

test( 'ztrsna throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		var a = makeArgs();
		ztrsna( 'invalid', 'both', 'all', new Uint8Array( 2 ), 1, 2, a[ 0 ], 2, a[ 1 ], 2, a[ 2 ], 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, new Int32Array( 1 ), new Complex128Array( 4 ), 2, new Float64Array( 2 ), 1 );
	}, TypeError );
} );

test( 'ztrsna throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		var a = makeArgs();
		ztrsna( 'row-major', 'both', 'all', new Uint8Array( 2 ), 1, -1, a[ 0 ], 2, a[ 1 ], 2, a[ 2 ], 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, new Int32Array( 1 ), new Complex128Array( 4 ), 2, new Float64Array( 2 ), 1 );
	}, RangeError );
} );

test( 'ztrsna throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		var a = makeArgs();
		ztrsna( 'row-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, a[ 0 ], 2, a[ 1 ], 2, a[ 2 ], 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, -1, new Complex128Array( 4 ), 2, new Float64Array( 2 ), 1 );
	}, RangeError );
} );

test( 'ztrsna throws RangeError for LDT < N (row-major)', function t() {
	assert.throws( function throws() {
		var a = makeArgs();
		ztrsna( 'row-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, a[ 0 ], 0, a[ 1 ], 2, a[ 2 ], 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, new Int32Array( 1 ), new Complex128Array( 4 ), 2, new Float64Array( 2 ), 1 );
	}, RangeError );
} );

test( 'ztrsna throws RangeError for LDT < M (column-major)', function t() {
	assert.throws( function throws() {
		var a = makeArgs();
		ztrsna( 'column-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, a[ 0 ], 0, a[ 1 ], 2, a[ 2 ], 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, new Int32Array( 1 ), new Complex128Array( 4 ), 2, new Float64Array( 2 ), 1 );
	}, RangeError );
} );

test( 'ztrsna throws RangeError for LDVL < N (row-major)', function t() {
	assert.throws( function throws() {
		var a = makeArgs();
		ztrsna( 'row-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, a[ 0 ], 2, a[ 1 ], 0, a[ 2 ], 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, new Int32Array( 1 ), new Complex128Array( 4 ), 2, new Float64Array( 2 ), 1 );
	}, RangeError );
} );

test( 'ztrsna throws RangeError for LDVL < M (column-major)', function t() {
	assert.throws( function throws() {
		var a = makeArgs();
		ztrsna( 'column-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, a[ 0 ], 2, a[ 1 ], 0, a[ 2 ], 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, new Int32Array( 1 ), new Complex128Array( 4 ), 2, new Float64Array( 2 ), 1 );
	}, RangeError );
} );

test( 'ztrsna throws RangeError for LDVR < N (row-major)', function t() {
	assert.throws( function throws() {
		var a = makeArgs();
		ztrsna( 'row-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, a[ 0 ], 2, a[ 1 ], 2, a[ 2 ], 0, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, new Int32Array( 1 ), new Complex128Array( 4 ), 2, new Float64Array( 2 ), 1 );
	}, RangeError );
} );

test( 'ztrsna throws RangeError for LDVR < M (column-major)', function t() {
	assert.throws( function throws() {
		var a = makeArgs();
		ztrsna( 'column-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, a[ 0 ], 2, a[ 1 ], 2, a[ 2 ], 0, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, new Int32Array( 1 ), new Complex128Array( 4 ), 2, new Float64Array( 2 ), 1 );
	}, RangeError );
} );

test( 'ztrsna throws RangeError for LDWORK < N (row-major)', function t() {
	assert.throws( function throws() {
		var a = makeArgs();
		ztrsna( 'row-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, a[ 0 ], 2, a[ 1 ], 2, a[ 2 ], 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, new Int32Array( 1 ), new Complex128Array( 4 ), 0, new Float64Array( 2 ), 1 );
	}, RangeError );
} );

test( 'ztrsna throws RangeError for LDWORK < M (column-major)', function t() {
	assert.throws( function throws() {
		var a = makeArgs();
		ztrsna( 'column-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, a[ 0 ], 2, a[ 1 ], 2, a[ 2 ], 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, new Int32Array( 1 ), new Complex128Array( 4 ), 0, new Float64Array( 2 ), 1 );
	}, RangeError );
} );

test( 'ztrsna: column-major path runs (1x1)', function t() {
	var T = new Complex128Array( [ 3.0, 0.0 ] );
	var VL = new Complex128Array( [ 1.0, 0.0 ] );
	var VR = new Complex128Array( [ 1.0, 0.0 ] );
	var SELECT = new Uint8Array( [ 1 ] );
	var s = new Float64Array( 1 );
	var SEP = new Float64Array( 1 );
	var M = new Int32Array( 1 );
	var WORK = new Complex128Array( 2 );
	var RWORK = new Float64Array( 1 );
	var info = ztrsna( 'column-major', 'both', 'all', SELECT, 1, 1, T, 1, VL, 1, VR, 1, s, 1, SEP, 1, 1, M, WORK, 1, RWORK, 1 );
	assert.equal( info, 0, 'info=0' );
} );

test( 'ztrsna: row-major path runs (1x1)', function t() {
	var T = new Complex128Array( [ 3.0, 0.0 ] );
	var VL = new Complex128Array( [ 1.0, 0.0 ] );
	var VR = new Complex128Array( [ 1.0, 0.0 ] );
	var SELECT = new Uint8Array( [ 1 ] );
	var s = new Float64Array( 1 );
	var SEP = new Float64Array( 1 );
	var M = new Int32Array( 1 );
	var WORK = new Complex128Array( 2 );
	var RWORK = new Float64Array( 1 );
	var info = ztrsna( 'row-major', 'both', 'all', SELECT, 1, 1, T, 1, VL, 1, VR, 1, s, 1, SEP, 1, 1, M, WORK, 1, RWORK, 1 );
	assert.equal( info, 0, 'info=0' );
} );
