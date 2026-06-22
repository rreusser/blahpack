/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgelq2 from './../lib/dgelq2.js';


// TESTS //

test( 'dgelq2 is a function', function t() {
	assert.strictEqual( typeof dgelq2, 'function', 'is a function' );
});

test( 'dgelq2 has expected arity', function t() {
	assert.strictEqual( dgelq2.length, 9, 'has expected arity' );
});

test( 'dgelq2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgelq2( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dgelq2 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgelq2( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgelq2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgelq2( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
