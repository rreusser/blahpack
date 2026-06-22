/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgelqf from './../lib/dgelqf.js';


// TESTS //

test( 'dgelqf is a function', function t() {
	assert.strictEqual( typeof dgelqf, 'function', 'is a function' );
});

test( 'dgelqf has expected arity', function t() {
	assert.strictEqual( dgelqf.length, 9, 'has expected arity' );
});

test( 'dgelqf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgelqf( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dgelqf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgelqf( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgelqf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgelqf( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
