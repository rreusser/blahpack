/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgels from './../lib/dgels.js';


// TESTS //

test( 'dgels is a function', function t() {
	assert.strictEqual( typeof dgels, 'function', 'is a function' );
});

test( 'dgels has expected arity', function t() {
	assert.strictEqual( dgels.length, 11, 'has expected arity' );
});

test( 'dgels throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgels( 'invalid', 'no-transpose', 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 2 ), 2 );
	}, TypeError );
});

test( 'dgels throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dgels( 'row-major', 'invalid', 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 2 ), 2 );
	}, TypeError );
});

test( 'dgels throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgels( 'row-major', 'no-transpose', -1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 2 ), 2 );
	}, RangeError );
});

test( 'dgels throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgels( 'row-major', 'no-transpose', 2, -1, 1, new Float64Array( 4 ), 2, new Float64Array( 2 ), 2 );
	}, RangeError );
});

test( 'dgels throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dgels( 'row-major', 'no-transpose', 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 2 ), 2 );
	}, RangeError );
});

// LDA validation //

test( 'dgels throws RangeError when row-major LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		// M=4, N=2: row-major LDA must be >= N=2.
		dgels( 'row-major', 'no-transpose', 4, 2, 1, new Float64Array( 8 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgels throws RangeError when column-major LDA < max(1,M)', function t() {
	assert.throws( function throws() {
		// M=4, N=2: column-major LDA must be >= M=4.
		dgels( 'column-major', 'no-transpose', 4, 2, 1, new Float64Array( 8 ), 3, new Float64Array( 4 ), 4 );
	}, RangeError );
});

// LDB validation: row-major (bug regression coverage) //
//
// In row-major storage, B's column count is always `nrhs`, regardless of
// whether the system is over- or under-determined (the row count -- M on
// entry, N on exit -- doesn't affect the leading dimension). The correct
// constraint is therefore LDB >= max(1,nrhs) in both cases.

test( 'dgels throws RangeError when row-major, overdetermined LDB < max(1,nrhs)', function t() { // eslint-disable-line max-len
	assert.throws( function throws() {
		// M=4, N=2, nrhs=3: row-major LDB must be >= nrhs=3.
		dgels( 'row-major', 'no-transpose', 4, 2, 3, new Float64Array( 8 ), 2, new Float64Array( 12 ), 2 );
	}, RangeError );
});

test( 'dgels does not throw when row-major, overdetermined LDB === nrhs', function t() { // eslint-disable-line max-len
	assert.doesNotThrow( function notThrows() {
		dgels( 'row-major', 'no-transpose', 4, 2, 3, new Float64Array( 8 ), 2, new Float64Array( 12 ), 3 );
	});
});

test( 'dgels does not throw when row-major, underdetermined LDB === nrhs (smaller than N)', function t() { // eslint-disable-line max-len
	assert.doesNotThrow( function notThrows() {
		// M=2, N=4, nrhs=1: row-major LDB only needs to be >= nrhs=1, even
		// though N=4 > nrhs. (Previously this incorrectly required LDB>=N.)
		dgels( 'row-major', 'no-transpose', 2, 4, 1, new Float64Array( 8 ), 4, new Float64Array( 4 ), 1 );
	});
});

// LDB validation: column-major (bug regression coverage) //
//
// In column-major storage, B must have enough rows to hold both the
// M-by-nrhs input and, for underdetermined systems, the N-by-nrhs output.
// The correct constraint is therefore LDB >= max(1,M,N).

test( 'dgels throws RangeError when column-major, overdetermined LDB < max(1,M,N)', function t() { // eslint-disable-line max-len
	assert.throws( function throws() {
		// M=4, N=2: column-major LDB must be >= max(M,N)=4.
		dgels( 'column-major', 'no-transpose', 4, 2, 1, new Float64Array( 8 ), 4, new Float64Array( 12 ), 3 );
	}, RangeError );
});

test( 'dgels throws RangeError when column-major, underdetermined LDB < max(1,M,N)', function t() { // eslint-disable-line max-len
	assert.throws( function throws() {
		// M=2, N=4, nrhs=1: column-major LDB must be >= max(M,N)=4, not
		// just M=2. (This was the original reported bug: B needs enough
		// rows to hold the N-row minimum-norm solution on exit.)
		dgels( 'column-major', 'no-transpose', 2, 4, 1, new Float64Array( 8 ), 2, new Float64Array( 2 ), 2 );
	}, RangeError );
});

test( 'dgels does not throw when column-major, underdetermined LDB === max(1,M,N)', function t() { // eslint-disable-line max-len
	assert.doesNotThrow( function notThrows() {
		dgels( 'column-major', 'no-transpose', 2, 4, 1, new Float64Array( 8 ), 2, new Float64Array( 4 ), 4 );
	});
});

// Numerical correctness with a tight (minimal) LDB //

test( 'dgels: row-major underdetermined 2x4 solves correctly with LDB=nrhs', function t() { // eslint-disable-line max-len
	var info;
	var A;
	var B;

	// A (row-major, LDA=4): [[1,2,3,4],[5,6,7,8]]. A*x=b with b=[10,26]
	// has minimum-norm solution x=[1,1,1,1].
	A = new Float64Array([ 1, 2, 3, 4, 5, 6, 7, 8 ]);

	// B has N=4 rows and LDB=nrhs=1 (the tightest legal leading dimension).
	B = new Float64Array( 4 );
	B[ 0 ] = 10.0;
	B[ 1 ] = 26.0;

	info = dgels( 'row-major', 'no-transpose', 2, 4, 1, A, 4, B, 1 );
	assert.equal( info, 0, 'info' );
	assert.ok( Math.abs( B[ 0 ] - 1.0 ) < 1e-12, 'x[0]' );
	assert.ok( Math.abs( B[ 1 ] - 1.0 ) < 1e-12, 'x[1]' );
	assert.ok( Math.abs( B[ 2 ] - 1.0 ) < 1e-12, 'x[2]' );
	assert.ok( Math.abs( B[ 3 ] - 1.0 ) < 1e-12, 'x[3]' );
});

test( 'dgels: column-major underdetermined 2x4 solves correctly with LDB=max(M,N)', function t() { // eslint-disable-line max-len
	var info;
	var A;
	var B;

	// A (column-major, LDA=2): [[1,2,3,4],[5,6,7,8]]
	A = new Float64Array([ 1, 5, 2, 6, 3, 7, 4, 8 ]);

	// B has LDB=max(M,N)=4 rows to hold the N-row output.
	B = new Float64Array( 4 );
	B[ 0 ] = 10.0;
	B[ 1 ] = 26.0;

	info = dgels( 'column-major', 'no-transpose', 2, 4, 1, A, 2, B, 4 );
	assert.equal( info, 0, 'info' );
	assert.ok( Math.abs( B[ 0 ] - 1.0 ) < 1e-12, 'x[0]' );
	assert.ok( Math.abs( B[ 1 ] - 1.0 ) < 1e-12, 'x[1]' );
	assert.ok( Math.abs( B[ 2 ] - 1.0 ) < 1e-12, 'x[2]' );
	assert.ok( Math.abs( B[ 3 ] - 1.0 ) < 1e-12, 'x[3]' );
});
