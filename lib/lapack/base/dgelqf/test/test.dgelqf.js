/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgelqf from './../lib/dgelqf.js';
import dgelqfNd from './../lib/ndarray.js';


// TESTS //

test( 'dgelqf is a function', function t() {
	assert.strictEqual( typeof dgelqf, 'function', 'is a function' );
});

test( 'dgelqf has expected arity', function t() {
	assert.strictEqual( dgelqf.length, 8, 'has expected arity' );
});

test( 'dgelqf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgelqf( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dgelqf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgelqf( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dgelqf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgelqf( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});


test( 'dgelqf allocates the optimal WORK when WORK is null (140x140, blocked)', function t() {
	const A = new Float64Array( 140 * 140 );
	let i;
	for ( i = 0; i < 140 * 140; i++ ) {
		A[ i ] = Math.sin( ( 0.37 * i ) + 1.0 ) + ( ( i % 141 === 0 ) ? 4.0 : 0.0 );
	}
	const B = new Float64Array( A );
	const TAU = new Float64Array( 140 );
	const TAU2 = new Float64Array( 140 );
	const info = dgelqf( 'column-major', 140, 140, A, 140, TAU, 1, null );
	assert.strictEqual( info, 0 );
	dgelqfNd( 140, 140, B, 1, 140, 0, TAU2, 1, 0, new Float64Array( 140 * 32 ), 1, 0 );
	assert.deepStrictEqual( A, B );
	assert.deepStrictEqual( TAU, TAU2 );
});
