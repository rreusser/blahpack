
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import base from './../lib/ndarray.js';
const ndarrayFn = base;


// FIXTURES //

const fixtures = readFileSync( resolve( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'dlarrd.jsonl' ), 'utf8' )
	.trim()
	.split( '\n' )
	.map( function parse( line ) { return JSON.parse( line ); } );

function byName( name ) {
	for ( let i = 0; i < fixtures.length; i++ ) {
		if ( fixtures[ i ].name === name ) {
			return fixtures[ i ];
		}
	}
	throw new Error( 'missing fixture: ' + name );
}


// HELPERS //

const SAFEMN = 2.2250738585072014e-308;
const EPS = 2.220446049250313e-16;
const PIVMIN = SAFEMN;
const RELTOL = EPS * 4.0;

function buildGers( d, e, N ) {
	const GERS = new Float64Array( 2 * N );
	let i, tmp;
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
	const N = 5;
	const d = new Float64Array( [ 2.0, -1.0, 3.0, 0.5, 4.0 ] );
	const e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0, 0.0 ] );
	const E2 = new Float64Array( N );
	let i;
	for ( i = 0; i < N; i++ ) {
		E2[ i ] = e[ i ] * e[ i ];
	}
	const GERS = buildGers( d, e, N );
	const ISPLIT = new Int32Array( [ 5 ] );
	const w = new Float64Array( N );
	const WERR = new Float64Array( N );
	const IBLOCK = new Int32Array( N );
	const INDEXW = new Int32Array( N );

	const res = ndarrayFn( 'all', 'entire', N, 0.0, 0.0, 0, 0, GERS, 1, 0, RELTOL, d, 1, 0, e, 1, 0, E2, 1, 0, PIVMIN, 1, ISPLIT, 1, 0, w, 1, 0, WERR, 1, 0, IBLOCK, 1, 0, INDEXW, 1, 0 );

	const expected = byName( 'range_all_order_entire' );
	assert.strictEqual( res.info, expected.info, 'info' );
	assert.strictEqual( res.m, expected.m, 'm' );
	for ( i = 0; i < res.m; i++ ) {
		assert.ok( Math.abs( w[ i ] - expected.w[ i ] ) < 1e-12, 'w[' + i + ']' );
		assert.strictEqual( IBLOCK[ i ], expected.iblock[ i ], 'iblock[' + i + ']' );
	}
});

test( 'ndarray: non-zero offsets on d, e, E2, GERS match fixture', function t() {
	const N = 5;

	// Prepad each input by 2 elements
	const d = new Float64Array( [ 0.0, 0.0, 2.0, -1.0, 3.0, 0.5, 4.0 ] );
	const e = new Float64Array( [ 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0 ] );
	const E2 = new Float64Array( 7 );
	let i;
	for ( i = 0; i < N; i++ ) {
		E2[ 2 + i ] = e[ 2 + i ] * e[ 2 + i ];
	}
	// Build GERS normally, then prepad
	const baseGers = buildGers(
		new Float64Array( [ 2.0, -1.0, 3.0, 0.5, 4.0 ] ),
		new Float64Array( [ 1.0, 1.0, 1.0, 1.0, 0.0 ] ),
		N
	);
	const GERS = new Float64Array( 2 * N + 3 );
	for ( i = 0; i < 2 * N; i++ ) {
		GERS[ 3 + i ] = baseGers[ i ];
	}

	const ISPLIT = new Int32Array( [ 0, 5 ] );
	const w = new Float64Array( N + 1 );
	const WERR = new Float64Array( N + 1 );
	const IBLOCK = new Int32Array( N + 1 );
	const INDEXW = new Int32Array( N + 1 );

	const res = ndarrayFn(
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

	const expected = byName( 'range_all_order_entire' );
	assert.strictEqual( res.info, expected.info, 'info' );
	assert.strictEqual( res.m, expected.m, 'm' );
	for ( i = 0; i < res.m; i++ ) {
		assert.ok( Math.abs( w[ 1 + i ] - expected.w[ i ] ) < 1e-12, 'w[' + i + '] ' + w[ 1 + i ] + ' vs ' + expected.w[ i ] );
		assert.strictEqual( IBLOCK[ 1 + i ], expected.iblock[ i ], 'iblock[' + i + ']' );
	}
});

test( 'ndarray: non-unit stride on d and e match fixture', function t() {
	const N = 5;

	// Interleave d with zeros at stride 2
	const d = new Float64Array( [ 2.0, 0.0, -1.0, 0.0, 3.0, 0.0, 0.5, 0.0, 4.0 ] );
	const e = new Float64Array( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0 ] );
	const E2src = new Float64Array( [ 1.0, 1.0, 1.0, 1.0, 0.0 ] );
	const E2 = new Float64Array( N );
	let i;
	for ( i = 0; i < N; i++ ) {
		E2[ i ] = E2src[ i ];
	}
	const GERS = buildGers(
		new Float64Array( [ 2.0, -1.0, 3.0, 0.5, 4.0 ] ),
		new Float64Array( [ 1.0, 1.0, 1.0, 1.0, 0.0 ] ),
		N
	);
	const ISPLIT = new Int32Array( [ 5 ] );
	const w = new Float64Array( N );
	const WERR = new Float64Array( N );
	const IBLOCK = new Int32Array( N );
	const INDEXW = new Int32Array( N );

	const res = ndarrayFn(
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

	const expected = byName( 'range_all_order_entire' );
	assert.strictEqual( res.info, expected.info, 'info' );
	assert.strictEqual( res.m, expected.m, 'm' );
	for ( i = 0; i < res.m; i++ ) {
		assert.ok( Math.abs( w[ i ] - expected.w[ i ] ) < 1e-12, 'w[' + i + '] ' + w[ i ] + ' vs ' + expected.w[ i ] );
	}
});
