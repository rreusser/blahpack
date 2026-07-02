/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgelss from './../lib/dgelss.js';


// TESTS //

test( 'dgelss is a function', function t() {
	assert.strictEqual( typeof dgelss, 'function', 'is a function' );
});

test( 'dgelss has expected arity', function t() {
	assert.strictEqual( dgelss.length, 15, 'has expected arity' );
});

test( 'dgelss throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgelss( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 1, 2 );
	}, TypeError );
});

test( 'dgelss throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgelss( 'row-major', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});

test( 'dgelss throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgelss( 'row-major', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});

test( 'dgelss throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dgelss( 'row-major', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});

test( 'dgelss row-major, overdetermined (M>N): throws RangeError when LDB < nrhs', function t() {
	assert.throws( function throws() {
		dgelss( 'row-major', 3, 2, 2, new Float64Array( 6 ), 2, new Float64Array( 6 ), 1, new Float64Array( 2 ), 1, -1.0, [ 0 ], null, 1, 0 );
	}, RangeError );
});

test( 'dgelss row-major, underdetermined (M<N): throws RangeError when LDB < nrhs', function t() {
	assert.throws( function throws() {
		dgelss( 'row-major', 2, 4, 2, new Float64Array( 8 ), 4, new Float64Array( 8 ), 1, new Float64Array( 2 ), 1, -1.0, [ 0 ], null, 1, 0 );
	}, RangeError );
});

test( 'dgelss row-major, underdetermined (M<N): does not throw when LDB === nrhs even though nrhs < N', function t() {
	assert.doesNotThrow( function notThrows() {
		dgelss( 'row-major', 2, 4, 2, new Float64Array( 8 ), 4, new Float64Array( 8 ), 2, new Float64Array( 2 ), 1, -1.0, [ 0 ], new Float64Array( 200 ), 1, 200 );
	});
});

test( 'dgelss column-major, overdetermined (M>N): throws RangeError when LDB < max(M,N)', function t() {
	assert.throws( function throws() {
		dgelss( 'column-major', 4, 2, 1, new Float64Array( 8 ), 4, new Float64Array( 8 ), 3, new Float64Array( 2 ), 1, -1.0, [ 0 ], null, 1, 0 );
	}, RangeError );
});

test( 'dgelss column-major, underdetermined (M<N): throws RangeError when LDB < max(M,N)', function t() {
	assert.throws( function throws() {
		dgelss( 'column-major', 2, 4, 1, new Float64Array( 8 ), 2, new Float64Array( 8 ), 3, new Float64Array( 2 ), 1, -1.0, [ 0 ], null, 1, 0 );
	}, RangeError );
});

test( 'dgelss column-major, underdetermined (M<N): does not throw when LDB === max(M,N)', function t() {
	assert.doesNotThrow( function notThrows() {
		dgelss( 'column-major', 2, 4, 1, new Float64Array( 8 ), 2, new Float64Array( 8 ), 4, new Float64Array( 2 ), 1, -1.0, [ 0 ], new Float64Array( 200 ), 1, 200 );
	});
});

test( 'dgelss row-major, underdetermined 2x4: numeric correctness with LDB=nrhs', function t() {
	var A = new Float64Array( [ 1, 0, 0, 0, 0, 1, 0, 0 ] ); // row-major, LDA=4
	var B = new Float64Array( [ 1, 2, 0, 0 ] ); // row-major, LDB=nrhs=1
	var S = new Float64Array( 2 );
	var WORK = new Float64Array( 200 );
	var rank = [ 0 ];
	var info = dgelss( 'row-major', 2, 4, 1, A, 4, B, 1, S, 1, -1.0, rank, WORK, 1, 200 );
	var expected = [ 1, 2, 0, 0 ];
	var i;
	assert.equal( info, 0, 'info' );
	assert.equal( rank[ 0 ], 2, 'rank' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok( Math.abs( B[ i ] - expected[ i ] ) < 1e-9, 'B[' + i + ']' );
	}
});

test( 'dgelss column-major, underdetermined 2x4: numeric correctness with LDB=max(M,N)', function t() {
	var A = new Float64Array( [ 1, 0, 0, 1, 0, 0, 0, 0 ] ); // column-major, LDA=2
	var B = new Float64Array( [ 1, 2, 0, 0 ] ); // column-major, LDB=max(M,N)=4
	var S = new Float64Array( 2 );
	var WORK = new Float64Array( 200 );
	var rank = [ 0 ];
	var info = dgelss( 'column-major', 2, 4, 1, A, 2, B, 4, S, 1, -1.0, rank, WORK, 1, 200 );
	var expected = [ 1, 2, 0, 0 ];
	var i;
	assert.equal( info, 0, 'info' );
	assert.equal( rank[ 0 ], 2, 'rank' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok( Math.abs( B[ i ] - expected[ i ] ) < 1e-9, 'B[' + i + ']' );
	}
});
