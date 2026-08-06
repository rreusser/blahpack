/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements, max-lines-per-function, vars-on-top */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgbbrd from './../lib/dgbbrd.js';
import main from './../lib/index.js';


// HELPERS //

function makeBuffers() {
	return {
		'AB': new Float64Array( 16 ),
		'd': new Float64Array( 4 ),
		'e': new Float64Array( 4 ),
		'Q': new Float64Array( 16 ),
		'PT': new Float64Array( 16 ),
		'C': new Float64Array( 16 ),
		'WORK': new Float64Array( 16 )
	};
}


// TESTS //

test( 'dgbbrd is a function', function t() {
	assert.strictEqual( typeof dgbbrd, 'function', 'is a function' );
});

test( 'dgbbrd has expected arity', function t() {
	assert.strictEqual( dgbbrd.length, 20, 'has expected arity' );
});

test( 'dgbbrd throws TypeError for invalid order', function t() {
	const b = makeBuffers();
	assert.throws( function throws() {
		dgbbrd( 'invalid', 'no-vectors', 2, 2, 0, 1, 1, b.AB, 3, b.d, 1, b.e, 1, b.Q, 2, b.PT, 2, b.C, 2, b.WORK );
	}, TypeError );
});

test( 'dgbbrd throws TypeError for invalid vect', function t() {
	const b = makeBuffers();
	assert.throws( function throws() {
		dgbbrd( 'column-major', 'bogus', 2, 2, 0, 1, 1, b.AB, 3, b.d, 1, b.e, 1, b.Q, 2, b.PT, 2, b.C, 2, b.WORK );
	}, TypeError );
});

test( 'dgbbrd throws RangeError for negative M', function t() {
	const b = makeBuffers();
	assert.throws( function throws() {
		dgbbrd( 'column-major', 'no-vectors', -1, 2, 0, 1, 1, b.AB, 3, b.d, 1, b.e, 1, b.Q, 2, b.PT, 2, b.C, 2, b.WORK );
	}, RangeError );
});

test( 'dgbbrd throws RangeError for negative N', function t() {
	const b = makeBuffers();
	assert.throws( function throws() {
		dgbbrd( 'column-major', 'no-vectors', 2, -1, 0, 1, 1, b.AB, 3, b.d, 1, b.e, 1, b.Q, 2, b.PT, 2, b.C, 2, b.WORK );
	}, RangeError );
});

test( 'dgbbrd throws RangeError for invalid LDAB (row-major)', function t() {
	const b = makeBuffers();
	assert.throws( function throws() {
		dgbbrd( 'row-major', 'no-vectors', 2, 2, 0, 1, 1, b.AB, 1, b.d, 1, b.e, 1, b.Q, 2, b.PT, 2, b.C, 2, b.WORK );
	}, RangeError );
});

test( 'dgbbrd throws RangeError for invalid LDAB (column-major)', function t() {
	const b = makeBuffers();
	assert.throws( function throws() {
		dgbbrd( 'column-major', 'no-vectors', 5, 2, 0, 1, 1, b.AB, 1, b.d, 1, b.e, 1, b.Q, 5, b.PT, 5, b.C, 5, b.WORK );
	}, RangeError );
});

test( 'dgbbrd throws RangeError for invalid LDQ (row-major)', function t() {
	const b = makeBuffers();
	assert.throws( function throws() {
		dgbbrd( 'row-major', 'no-vectors', 2, 2, 0, 1, 1, b.AB, 3, b.d, 1, b.e, 1, b.Q, 1, b.PT, 2, b.C, 2, b.WORK );
	}, RangeError );
});

test( 'dgbbrd throws RangeError for invalid LDQ (column-major)', function t() {
	const b = makeBuffers();
	assert.throws( function throws() {
		dgbbrd( 'column-major', 'no-vectors', 2, 2, 0, 1, 1, b.AB, 3, b.d, 1, b.e, 1, b.Q, 1, b.PT, 2, b.C, 2, b.WORK );
	}, RangeError );
});

test( 'dgbbrd throws RangeError for invalid LDPT (row-major)', function t() {
	const b = makeBuffers();
	assert.throws( function throws() {
		dgbbrd( 'row-major', 'no-vectors', 2, 2, 0, 1, 1, b.AB, 3, b.d, 1, b.e, 1, b.Q, 2, b.PT, 1, b.C, 2, b.WORK );
	}, RangeError );
});

test( 'dgbbrd throws RangeError for invalid LDPT (column-major)', function t() {
	const b = makeBuffers();
	assert.throws( function throws() {
		dgbbrd( 'column-major', 'no-vectors', 2, 2, 0, 1, 1, b.AB, 3, b.d, 1, b.e, 1, b.Q, 2, b.PT, 1, b.C, 2, b.WORK );
	}, RangeError );
});

test( 'dgbbrd throws RangeError for invalid LDC (row-major)', function t() {
	const b = makeBuffers();
	assert.throws( function throws() {
		dgbbrd( 'row-major', 'no-vectors', 2, 2, 0, 1, 1, b.AB, 3, b.d, 1, b.e, 1, b.Q, 2, b.PT, 2, b.C, 1, b.WORK );
	}, RangeError );
});

test( 'dgbbrd throws RangeError for invalid LDC (column-major)', function t() {
	const b = makeBuffers();
	assert.throws( function throws() {
		dgbbrd( 'column-major', 'no-vectors', 2, 2, 0, 1, 1, b.AB, 3, b.d, 1, b.e, 1, b.Q, 2, b.PT, 2, b.C, 1, b.WORK );
	}, RangeError );
});

test( 'dgbbrd column-major path executes', function t() {
	const ldab = 3;
	const AB = new Float64Array( ldab * 3 );
	const d = new Float64Array( 3 );
	const e = new Float64Array( 2 );
	const Q = new Float64Array( 9 );
	const PT = new Float64Array( 9 );
	const C = new Float64Array( 9 );
	const WORK = new Float64Array( 6 );
	AB[ 1 ] = 2.0; AB[ 2 ] = -1.0;
	AB[ 3 ] = -1.0; AB[ 4 ] = 2.0; AB[ 5 ] = -1.0;
	AB[ 6 ] = -1.0; AB[ 7 ] = 2.0;
	const info = dgbbrd( 'column-major', 'no-vectors', 3, 3, 0, 1, 1, AB, 3, d, 1, e, 1, Q, 3, PT, 3, C, 3, WORK );
	assert.strictEqual( info, 0 );
});

test( 'dgbbrd row-major path executes', function t() {
	const AB = new Float64Array( 9 );
	const d = new Float64Array( 3 );
	const e = new Float64Array( 2 );
	const Q = new Float64Array( 9 );
	const PT = new Float64Array( 9 );
	const C = new Float64Array( 9 );
	const WORK = new Float64Array( 6 );
	AB[ 1 ] = -1; AB[ 2 ] = -1;
	AB[ 3 ] = 2; AB[ 4 ] = 2; AB[ 5 ] = 2;
	AB[ 6 ] = -1; AB[ 7 ] = -1;
	const info = dgbbrd( 'row-major', 'no-vectors', 3, 3, 0, 1, 1, AB, 3, d, 1, e, 1, Q, 3, PT, 3, C, 3, WORK );
	assert.strictEqual( info, 0 );
});

test( 'dgbbrd exposes ndarray method', function t() {
	assert.strictEqual( typeof main.ndarray, 'function', 'has ndarray method' );
});
