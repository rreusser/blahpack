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
