
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import base from './../lib/ndarray.js';
var ndarrayFn = base;


// FIXTURES //

var fixtures = readFileSync( resolve( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'dlarrd.jsonl' ), 'utf8' )
	.trim()
	.split( '\n' )
	.map( function parse( line ) { return JSON.parse( line ); } );

function byName( name ) {
	for ( var i = 0; i < fixtures.length; i++ ) {
		if ( fixtures[ i ].name === name ) {
			return fixtures[ i ];
		}
	}
	throw new Error( 'missing fixture: ' + name );
}


// HELPERS //

var SAFEMN = 2.2250738585072014e-308;
var EPS = 2.220446049250313e-16;
var PIVMIN = SAFEMN;
var RELTOL = EPS * 4.0;

function buildGers( d, e, N ) {
	var GERS = new Float64Array( 2 * N );
	var i;
	var tmp;
	if ( N === 1 ) {
		GERS[ 0 ] = d[ 0 ];
		GERS[ 1 ] = d[ 0 ];
		return GERS;
	}
	GERS[ 0 ] = d[ 0 ] - Math.abs( e[ 0 ] );
	GERS[ 1 ] = d[ 0 ] + Math.abs( e[ 0 ] );
	for ( i = 1; i < N - 1; i++ ) {
		tmp = Math.abs( e[ i - 1 ] ) + Math.abs( e[ i ] );
		GERS[ 2 * i ] = d[ i ] - tmp;
		GERS[ 2 * i + 1 ] = d[ i ] + tmp;
	}
	GERS[ 2 * (N - 1) ] = d[ N - 1 ] - Math.abs( e[ N - 2 ] );
	GERS[ 2 * (N - 1) + 1 ] = d[ N - 1 ] + Math.abs( e[ N - 2 ] );
	return GERS;
}


// TESTS //

test( 'base is a function', function t() {
	assert.strictEqual( typeof base, 'function', 'is a function' );
});

test( 'ndarray is a function', function t() {
	assert.strictEqual( typeof ndarrayFn, 'function', 'is a function' );
});

test( 'ndarray: unit-stride zero-offset matches fixture (range=all, 5x5)', function t() {
	var N = 5;
	var d = new Float64Array( [ 2.0, -1.0, 3.0, 0.5, 4.0 ] );
	var e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0, 0.0 ] );
	var E2 = new Float64Array( N );
	var i;
	for ( i = 0; i < N; i++ ) {
		E2[ i ] = e[ i ] * e[ i ];
	}
	var GERS = buildGers( d, e, N );
	var ISPLIT = new Int32Array( [ 5 ] );
	var w = new Float64Array( N );
	var WERR = new Float64Array( N );
	var IBLOCK = new Int32Array( N );
	var INDEXW = new Int32Array( N );

	var res = ndarrayFn( 'all', 'entire', N, 0.0, 0.0, 0, 0, GERS, 1, 0, RELTOL, d, 1, 0, e, 1, 0, E2, 1, 0, PIVMIN, 1, ISPLIT, 1, 0, w, 1, 0, WERR, 1, 0, IBLOCK, 1, 0, INDEXW, 1, 0 );

	var expected = byName( 'range_all_order_entire' );
	assert.strictEqual( res.info, expected.info, 'info' );
	assert.strictEqual( res.m, expected.m, 'm' );
	for ( i = 0; i < res.m; i++ ) {
		assert.ok( Math.abs( w[ i ] - expected.w[ i ] ) < 1e-12, 'w[' + i + ']' );
		assert.strictEqual( IBLOCK[ i ], expected.iblock[ i ], 'iblock[' + i + ']' );
	}
});

test( 'ndarray: non-zero offsets on d, e, E2, GERS match fixture', function t() {
	var N = 5;

	// Prepad each input by 2 elements
	var d = new Float64Array( [ 0.0, 0.0, 2.0, -1.0, 3.0, 0.5, 4.0 ] );
	var e = new Float64Array( [ 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0 ] );
	var E2 = new Float64Array( 7 );
	var i;
	for ( i = 0; i < N; i++ ) {
		E2[ 2 + i ] = e[ 2 + i ] * e[ 2 + i ];
	}
	// Build GERS normally, then prepad
	var baseGers = buildGers(
		new Float64Array( [ 2.0, -1.0, 3.0, 0.5, 4.0 ] ),
		new Float64Array( [ 1.0, 1.0, 1.0, 1.0, 0.0 ] ),
		N
	);
	var GERS = new Float64Array( 2 * N + 3 );
	for ( i = 0; i < 2 * N; i++ ) {
		GERS[ 3 + i ] = baseGers[ i ];
	}

	var ISPLIT = new Int32Array( [ 0, 5 ] );
	var w = new Float64Array( N + 1 );
	var WERR = new Float64Array( N + 1 );
	var IBLOCK = new Int32Array( N + 1 );
	var INDEXW = new Int32Array( N + 1 );

	var res = ndarrayFn(
		'all', 'entire', N, 0.0, 0.0, 0, 0,
		GERS, 1, 3,
		RELTOL,
		d, 1, 2,
		e, 1, 2,
		E2, 1, 2,
		PIVMIN, 1,
		ISPLIT, 1, 1,
		w, 1, 1,
		WERR, 1, 1,
		IBLOCK, 1, 1,
		INDEXW, 1, 1
	);

	var expected = byName( 'range_all_order_entire' );
	assert.strictEqual( res.info, expected.info, 'info' );
	assert.strictEqual( res.m, expected.m, 'm' );
	for ( i = 0; i < res.m; i++ ) {
		assert.ok( Math.abs( w[ 1 + i ] - expected.w[ i ] ) < 1e-12, 'w[' + i + '] ' + w[ 1 + i ] + ' vs ' + expected.w[ i ] );
		assert.strictEqual( IBLOCK[ 1 + i ], expected.iblock[ i ], 'iblock[' + i + ']' );
	}
});

test( 'ndarray: non-unit stride on d and e match fixture', function t() {
	var N = 5;

	// Interleave d with zeros at stride 2
	var d = new Float64Array( [ 2.0, 0.0, -1.0, 0.0, 3.0, 0.0, 0.5, 0.0, 4.0 ] );
	var e = new Float64Array( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0 ] );
	var E2src = new Float64Array( [ 1.0, 1.0, 1.0, 1.0, 0.0 ] );
	var E2 = new Float64Array( N );
	var i;
	for ( i = 0; i < N; i++ ) {
		E2[ i ] = E2src[ i ];
	}
	var GERS = buildGers(
		new Float64Array( [ 2.0, -1.0, 3.0, 0.5, 4.0 ] ),
		new Float64Array( [ 1.0, 1.0, 1.0, 1.0, 0.0 ] ),
		N
	);
	var ISPLIT = new Int32Array( [ 5 ] );
	var w = new Float64Array( N );
	var WERR = new Float64Array( N );
	var IBLOCK = new Int32Array( N );
	var INDEXW = new Int32Array( N );

	var res = ndarrayFn(
		'all', 'entire', N, 0.0, 0.0, 0, 0,
		GERS, 1, 0,
		RELTOL,
		d, 2, 0,
		e, 2, 0,
		E2, 1, 0,
		PIVMIN, 1,
		ISPLIT, 1, 0,
		w, 1, 0,
		WERR, 1, 0,
		IBLOCK, 1, 0,
		INDEXW, 1, 0
	);

	var expected = byName( 'range_all_order_entire' );
	assert.strictEqual( res.info, expected.info, 'info' );
	assert.strictEqual( res.m, expected.m, 'm' );
	for ( i = 0; i < res.m; i++ ) {
		assert.ok( Math.abs( w[ i ] - expected.w[ i ] ) < 1e-12, 'w[' + i + '] ' + w[ i ] + ' vs ' + expected.w[ i ] );
	}
});
