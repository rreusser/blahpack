/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-params, max-lines, max-statements, max-lines-per-function */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zggsvp3 from './../lib/zggsvp3.js';


// VARIABLES //

var MAXN = 8;


// FUNCTIONS //

function makeWS() {
	return {
		'IWORK': new Int32Array( 8 ),
		'RWORK': new Float64Array( 5 * 8 ),
		'TAU': new Complex128Array( 8 ),
		'WORK': new Complex128Array( 5000 )
	};
}

function buildDiag3() {
	var arr = new Complex128Array( MAXN * MAXN );
	var view = reinterpret( arr, 0 );
	view[ 2 * 0 ] = 10.0;
	view[ 2 * ( 1 + ( 1 * MAXN ) ) ] = 5.0;
	view[ 2 * ( 2 + ( 2 * MAXN ) ) ] = 1.0;
	return arr;
}

function buildDiag3B() {
	var arr = new Complex128Array( MAXN * MAXN );
	var view = reinterpret( arr, 0 );
	view[ 2 * 0 ] = 8.0;
	view[ 2 * ( 1 + ( 1 * MAXN ) ) ] = 4.0;
	view[ 2 * ( 2 + ( 2 * MAXN ) ) ] = 2.0;
	return arr;
}


// TESTS //

test( 'zggsvp3 is a function', function t() {
	assert.strictEqual( typeof zggsvp3, 'function', 'is a function' );
});

test( 'zggsvp3: column-major basic 3x3 all compute', function t() {
	var ws = makeWS();
	var A = buildDiag3();
	var B = buildDiag3B();
	var U = new Complex128Array( MAXN * MAXN );
	var V = new Complex128Array( MAXN * MAXN );
	var Q = new Complex128Array( MAXN * MAXN );
	var K = [ 0 ];
	var l = [ 0 ];
	var info = zggsvp3( 'column-major', 'compute-U', 'compute-V', 'compute-Q', 3, 3, 3, A, MAXN, B, MAXN, 1e-8, 1e-8, K, l, U, MAXN, V, MAXN, Q, MAXN, ws.IWORK, 1, 0, ws.RWORK, 1, ws.TAU, 1, ws.WORK, 1, 5000 );
	assert.equal( info, 0, 'info' );
});

test( 'zggsvp3: row-major basic 3x3 all compute', function t() {
	var ws = makeWS();
	var A = buildDiag3();
	var B = buildDiag3B();
	var U = new Complex128Array( MAXN * MAXN );
	var V = new Complex128Array( MAXN * MAXN );
	var Q = new Complex128Array( MAXN * MAXN );
	var K = [ 0 ];
	var l = [ 0 ];
	var info = zggsvp3( 'row-major', 'compute-U', 'compute-V', 'compute-Q', 3, 3, 3, A, MAXN, B, MAXN, 1e-8, 1e-8, K, l, U, MAXN, V, MAXN, Q, MAXN, ws.IWORK, 1, 0, ws.RWORK, 1, ws.TAU, 1, ws.WORK, 1, 5000 );
	assert.equal( info, 0, 'info' );
});

test( 'zggsvp3 throws TypeError for invalid order', function t() {
	var ws = makeWS();
	assert.throws( function throws() {
		zggsvp3( 'invalid', 'compute-U', 'compute-V', 'compute-Q', 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, 1e-8, 1e-8, [ 0 ], [ 0 ], new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, ws.IWORK, 1, 0, ws.RWORK, 1, ws.TAU, 1, ws.WORK, 1, 5000 );
	}, TypeError );
});

test( 'zggsvp3 throws RangeError for negative M', function t() {
	var ws = makeWS();
	assert.throws( function throws() {
		zggsvp3( 'column-major', 'compute-U', 'compute-V', 'compute-Q', -1, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, 1e-8, 1e-8, [ 0 ], [ 0 ], new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, ws.IWORK, 1, 0, ws.RWORK, 1, ws.TAU, 1, ws.WORK, 1, 5000 );
	}, RangeError );
});

test( 'zggsvp3 throws RangeError for negative N', function t() {
	var ws = makeWS();
	assert.throws( function throws() {
		zggsvp3( 'column-major', 'compute-U', 'compute-V', 'compute-Q', 2, 2, -1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, 1e-8, 1e-8, [ 0 ], [ 0 ], new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, ws.IWORK, 1, 0, ws.RWORK, 1, ws.TAU, 1, ws.WORK, 1, 5000 );
	}, RangeError );
});

test( 'zggsvp3 throws RangeError for negative K', function t() {
	var ws = makeWS();
	assert.throws( function throws() {
		zggsvp3( 'column-major', 'compute-U', 'compute-V', 'compute-Q', 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, 1e-8, 1e-8, -1, [ 0 ], new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, ws.IWORK, 1, 0, ws.RWORK, 1, ws.TAU, 1, ws.WORK, 1, 5000 );
	}, RangeError );
});

test( 'zggsvp3 throws RangeError when LDA < N (row-major)', function t() {
	var ws = makeWS();
	assert.throws( function throws() {
		zggsvp3( 'row-major', 'compute-U', 'compute-V', 'compute-Q', 2, 2, 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, 1e-8, 1e-8, [ 0 ], [ 0 ], new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, ws.IWORK, 1, 0, ws.RWORK, 1, ws.TAU, 1, ws.WORK, 1, 5000 );
	}, RangeError );
});

test( 'zggsvp3 throws RangeError when LDA < M (column-major)', function t() {
	var ws = makeWS();
	assert.throws( function throws() {
		zggsvp3( 'column-major', 'compute-U', 'compute-V', 'compute-Q', 2, 2, 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, 1e-8, 1e-8, [ 0 ], [ 0 ], new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, ws.IWORK, 1, 0, ws.RWORK, 1, ws.TAU, 1, ws.WORK, 1, 5000 );
	}, RangeError );
});

test( 'zggsvp3 throws RangeError when LDB < N (row-major)', function t() {
	var ws = makeWS();
	assert.throws( function throws() {
		zggsvp3( 'row-major', 'compute-U', 'compute-V', 'compute-Q', 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1, 1e-8, 1e-8, [ 0 ], [ 0 ], new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, ws.IWORK, 1, 0, ws.RWORK, 1, ws.TAU, 1, ws.WORK, 1, 5000 );
	}, RangeError );
});

test( 'zggsvp3 throws RangeError when LDB < M (column-major)', function t() {
	var ws = makeWS();
	assert.throws( function throws() {
		zggsvp3( 'column-major', 'compute-U', 'compute-V', 'compute-Q', 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1, 1e-8, 1e-8, [ 0 ], [ 0 ], new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, ws.IWORK, 1, 0, ws.RWORK, 1, ws.TAU, 1, ws.WORK, 1, 5000 );
	}, RangeError );
});

test( 'zggsvp3 throws RangeError when LDU < N (row-major)', function t() {
	var ws = makeWS();
	assert.throws( function throws() {
		zggsvp3( 'row-major', 'compute-U', 'compute-V', 'compute-Q', 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, 1e-8, 1e-8, [ 0 ], [ 0 ], new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, ws.IWORK, 1, 0, ws.RWORK, 1, ws.TAU, 1, ws.WORK, 1, 5000 );
	}, RangeError );
});

test( 'zggsvp3 throws RangeError when LDU < M (column-major)', function t() {
	var ws = makeWS();
	assert.throws( function throws() {
		zggsvp3( 'column-major', 'compute-U', 'compute-V', 'compute-Q', 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, 1e-8, 1e-8, [ 0 ], [ 0 ], new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, ws.IWORK, 1, 0, ws.RWORK, 1, ws.TAU, 1, ws.WORK, 1, 5000 );
	}, RangeError );
});

test( 'zggsvp3 throws RangeError when LDV < N (row-major)', function t() {
	var ws = makeWS();
	assert.throws( function throws() {
		zggsvp3( 'row-major', 'compute-U', 'compute-V', 'compute-Q', 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, 1e-8, 1e-8, [ 0 ], [ 0 ], new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, ws.IWORK, 1, 0, ws.RWORK, 1, ws.TAU, 1, ws.WORK, 1, 5000 );
	}, RangeError );
});

test( 'zggsvp3 throws RangeError when LDV < M (column-major)', function t() {
	var ws = makeWS();
	assert.throws( function throws() {
		zggsvp3( 'column-major', 'compute-U', 'compute-V', 'compute-Q', 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, 1e-8, 1e-8, [ 0 ], [ 0 ], new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, ws.IWORK, 1, 0, ws.RWORK, 1, ws.TAU, 1, ws.WORK, 1, 5000 );
	}, RangeError );
});

test( 'zggsvp3 throws RangeError when LDQ < N (row-major)', function t() {
	var ws = makeWS();
	assert.throws( function throws() {
		zggsvp3( 'row-major', 'compute-U', 'compute-V', 'compute-Q', 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, 1e-8, 1e-8, [ 0 ], [ 0 ], new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1, ws.IWORK, 1, 0, ws.RWORK, 1, ws.TAU, 1, ws.WORK, 1, 5000 );
	}, RangeError );
});

test( 'zggsvp3 throws RangeError when LDQ < M (column-major)', function t() {
	var ws = makeWS();
	assert.throws( function throws() {
		zggsvp3( 'column-major', 'compute-U', 'compute-V', 'compute-Q', 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, 1e-8, 1e-8, [ 0 ], [ 0 ], new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1, ws.IWORK, 1, 0, ws.RWORK, 1, ws.TAU, 1, ws.WORK, 1, 5000 );
	}, RangeError );
});
