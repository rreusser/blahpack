/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlarrd from './../lib/index.js';


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

function buildGersMultiBlock( d, e, blockBounds ) {
	var N = d.length;
	var GERS = new Float64Array( 2 * N );
	var bi;
	var first;
	var last;
	var i;
	var tmp;
	for ( bi = 0; bi < blockBounds.length; bi++ ) {
		first = ( bi === 0 ) ? 0 : blockBounds[ bi - 1 ];
		last = blockBounds[ bi ] - 1;
		if ( first === last ) {
			GERS[ 2 * first ] = d[ first ];
			GERS[ 2 * first + 1 ] = d[ first ];
			continue;
		}
		GERS[ 2 * first ] = d[ first ] - Math.abs( e[ first ] );
		GERS[ 2 * first + 1 ] = d[ first ] + Math.abs( e[ first ] );
		for ( i = first + 1; i < last; i++ ) {
			tmp = Math.abs( e[ i - 1 ] ) + Math.abs( e[ i ] );
			GERS[ 2 * i ] = d[ i ] - tmp;
			GERS[ 2 * i + 1 ] = d[ i ] + tmp;
		}
		GERS[ 2 * last ] = d[ last ] - Math.abs( e[ last - 1 ] );
		GERS[ 2 * last + 1 ] = d[ last ] + Math.abs( e[ last - 1 ] );
	}
	return GERS;
}

var SAFEMN = 2.2250738585072014e-308;
var EPS = 2.220446049250313e-16;
var PIVMIN = SAFEMN;
var RELTOL = EPS * 4.0;


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlarrd, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dlarrd.ndarray, 'function', 'has ndarray method' );
});

test( "range='all' order='entire', 5x5", function t() {
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

	var res = dlarrd.ndarray( 'all', 'entire', N, 0.0, 0.0, 0, 0, GERS, 1, 0, RELTOL, d, 1, 0, e, 1, 0, E2, 1, 0, PIVMIN, 1, ISPLIT, 1, 0, w, 1, 0, WERR, 1, 0, IBLOCK, 1, 0, INDEXW, 1, 0 );

	var expected = byName( 'range_all_order_entire' );
	assert.strictEqual( res.info, expected.info, 'info' );
	assert.strictEqual( res.m, expected.m, 'm' );
	for ( i = 0; i < res.m; i++ ) {
		assert.ok( Math.abs( w[ i ] - expected.w[ i ] ) < 1e-12, 'w[' + i + '] ' + w[ i ] + ' vs ' + expected.w[ i ] );
		assert.strictEqual( IBLOCK[ i ], expected.iblock[ i ], 'iblock[' + i + ']' );
		assert.strictEqual( INDEXW[ i ], expected.indexw[ i ], 'indexw[' + i + ']' );
	}
});

test( "range='index', 5x5, il=2, iu=4", function t() {
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

	var res = dlarrd.ndarray( 'index', 'entire', N, 0.0, 0.0, 2, 4, GERS, 1, 0, RELTOL, d, 1, 0, e, 1, 0, E2, 1, 0, PIVMIN, 1, ISPLIT, 1, 0, w, 1, 0, WERR, 1, 0, IBLOCK, 1, 0, INDEXW, 1, 0 );

	var expected = byName( 'range_index_2_4' );
	assert.strictEqual( res.info, expected.info, 'info' );
	assert.strictEqual( res.m, expected.m, 'm' );
	for ( i = 0; i < res.m; i++ ) {
		assert.ok( Math.abs( w[ i ] - expected.w[ i ] ) < 1e-12, 'w[' + i + ']' );
	}
	assert.ok( Math.abs( res.wl - expected.wl ) < 1e-12, 'wl' );
	assert.ok( Math.abs( res.wu - expected.wu ) < 1e-12, 'wu' );
});

test( "range='value', 5x5, vl=-2, vu=3", function t() {
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

	var res = dlarrd.ndarray( 'value', 'entire', N, -2.0, 3.0, 0, 0, GERS, 1, 0, RELTOL, d, 1, 0, e, 1, 0, E2, 1, 0, PIVMIN, 1, ISPLIT, 1, 0, w, 1, 0, WERR, 1, 0, IBLOCK, 1, 0, INDEXW, 1, 0 );

	var expected = byName( 'range_value_neg2_3' );
	assert.strictEqual( res.info, expected.info, 'info' );
	assert.strictEqual( res.m, expected.m, 'm' );
	for ( i = 0; i < res.m; i++ ) {
		assert.ok( Math.abs( w[ i ] - expected.w[ i ] ) < 1e-12, 'w[' + i + ']' );
	}
});

test( 'N=1', function t() {
	var N = 1;
	var d = new Float64Array( [ 3.5 ] );
	var e = new Float64Array( [ 0.0 ] );
	var E2 = new Float64Array( [ 0.0 ] );
	var GERS = new Float64Array( [ 3.5, 3.5 ] );
	var ISPLIT = new Int32Array( [ 1 ] );
	var w = new Float64Array( N );
	var WERR = new Float64Array( N );
	var IBLOCK = new Int32Array( N );
	var INDEXW = new Int32Array( N );

	var res = dlarrd.ndarray( 'all', 'entire', N, 0.0, 0.0, 0, 0, GERS, 1, 0, RELTOL, d, 1, 0, e, 1, 0, E2, 1, 0, PIVMIN, 1, ISPLIT, 1, 0, w, 1, 0, WERR, 1, 0, IBLOCK, 1, 0, INDEXW, 1, 0 );

	var expected = byName( 'n1' );
	assert.strictEqual( res.info, expected.info, 'info' );
	assert.strictEqual( res.m, expected.m, 'm' );
	assert.ok( Math.abs( w[ 0 ] - expected.w[ 0 ] ) < 1e-12, 'w[0]' );
});

test( 'two blocks, all, entire order', function t() {
	var N = 6;
	var d = new Float64Array( [ 2.0, -1.0, 3.0, 0.5, 4.0, -2.0 ] );
	var e = new Float64Array( [ 1.0, 1.0, 0.0, 1.0, 1.0, 0.0 ] );
	var E2 = new Float64Array( N );
	var i;
	for ( i = 0; i < N; i++ ) {
		E2[ i ] = e[ i ] * e[ i ];
	}
	var GERS = buildGersMultiBlock( d, e, [ 3, 6 ] );
	var ISPLIT = new Int32Array( [ 3, 6 ] );
	var w = new Float64Array( N );
	var WERR = new Float64Array( N );
	var IBLOCK = new Int32Array( N );
	var INDEXW = new Int32Array( N );

	var res = dlarrd.ndarray( 'all', 'entire', N, 0.0, 0.0, 0, 0, GERS, 1, 0, RELTOL, d, 1, 0, e, 1, 0, E2, 1, 0, PIVMIN, 2, ISPLIT, 1, 0, w, 1, 0, WERR, 1, 0, IBLOCK, 1, 0, INDEXW, 1, 0 );

	var expected = byName( 'two_blocks_all' );
	assert.strictEqual( res.info, expected.info, 'info' );
	assert.strictEqual( res.m, expected.m, 'm' );
	for ( i = 0; i < res.m; i++ ) {
		assert.ok( Math.abs( w[ i ] - expected.w[ i ] ) < 1e-12, 'w[' + i + ']' );
		assert.strictEqual( IBLOCK[ i ], expected.iblock[ i ], 'iblock[' + i + ']' );
	}
});

test( 'two blocks, all, block order', function t() {
	var N = 6;
	var d = new Float64Array( [ 2.0, -1.0, 3.0, 0.5, 4.0, -2.0 ] );
	var e = new Float64Array( [ 1.0, 1.0, 0.0, 1.0, 1.0, 0.0 ] );
	var E2 = new Float64Array( N );
	var i;
	for ( i = 0; i < N; i++ ) {
		E2[ i ] = e[ i ] * e[ i ];
	}
	var GERS = buildGersMultiBlock( d, e, [ 3, 6 ] );
	var ISPLIT = new Int32Array( [ 3, 6 ] );
	var w = new Float64Array( N );
	var WERR = new Float64Array( N );
	var IBLOCK = new Int32Array( N );
	var INDEXW = new Int32Array( N );

	var res = dlarrd.ndarray( 'all', 'block', N, 0.0, 0.0, 0, 0, GERS, 1, 0, RELTOL, d, 1, 0, e, 1, 0, E2, 1, 0, PIVMIN, 2, ISPLIT, 1, 0, w, 1, 0, WERR, 1, 0, IBLOCK, 1, 0, INDEXW, 1, 0 );

	var expected = byName( 'two_blocks_block_order' );
	assert.strictEqual( res.info, expected.info, 'info' );
	assert.strictEqual( res.m, expected.m, 'm' );
	for ( i = 0; i < res.m; i++ ) {
		assert.ok( Math.abs( w[ i ] - expected.w[ i ] ) < 1e-12, 'w[' + i + '] ' + w[ i ] + ' vs ' + expected.w[ i ] );
		assert.strictEqual( IBLOCK[ i ], expected.iblock[ i ], 'iblock[' + i + ']' );
	}
});

test( 'invalid range throws TypeError', function t() {
	var N = 2;
	var d = new Float64Array( [ 1.0, 2.0 ] );
	var e = new Float64Array( [ 0.5, 0.0 ] );
	var E2 = new Float64Array( [ 0.25, 0.0 ] );
	var GERS = buildGers( d, e, N );
	var ISPLIT = new Int32Array( [ 2 ] );
	var w = new Float64Array( N );
	var WERR = new Float64Array( N );
	var IBLOCK = new Int32Array( N );
	var INDEXW = new Int32Array( N );
	assert.throws( function () {
		dlarrd.ndarray( 'bogus', 'entire', N, 0.0, 0.0, 0, 0, GERS, 1, 0, RELTOL, d, 1, 0, e, 1, 0, E2, 1, 0, PIVMIN, 1, ISPLIT, 1, 0, w, 1, 0, WERR, 1, 0, IBLOCK, 1, 0, INDEXW, 1, 0 );
	}, TypeError );
});

test( 'invalid order throws TypeError', function t() {
	var N = 2;
	var d = new Float64Array( [ 1.0, 2.0 ] );
	var e = new Float64Array( [ 0.5, 0.0 ] );
	var E2 = new Float64Array( [ 0.25, 0.0 ] );
	var GERS = buildGers( d, e, N );
	var ISPLIT = new Int32Array( [ 2 ] );
	var w = new Float64Array( N );
	var WERR = new Float64Array( N );
	var IBLOCK = new Int32Array( N );
	var INDEXW = new Int32Array( N );
	assert.throws( function () {
		dlarrd.ndarray( 'all', 'bogus', N, 0.0, 0.0, 0, 0, GERS, 1, 0, RELTOL, d, 1, 0, e, 1, 0, E2, 1, 0, PIVMIN, 1, ISPLIT, 1, 0, w, 1, 0, WERR, 1, 0, IBLOCK, 1, 0, INDEXW, 1, 0 );
	}, TypeError );
});

test( 'vl>=vu for range=value returns info=-5', function t() {
	var N = 2;
	var d = new Float64Array( [ 1.0, 2.0 ] );
	var e = new Float64Array( [ 0.5, 0.0 ] );
	var E2 = new Float64Array( [ 0.25, 0.0 ] );
	var GERS = buildGers( d, e, N );
	var ISPLIT = new Int32Array( [ 2 ] );
	var w = new Float64Array( N );
	var WERR = new Float64Array( N );
	var IBLOCK = new Int32Array( N );
	var INDEXW = new Int32Array( N );
	var res = dlarrd.ndarray( 'value', 'entire', N, 3.0, 1.0, 0, 0, GERS, 1, 0, RELTOL, d, 1, 0, e, 1, 0, E2, 1, 0, PIVMIN, 1, ISPLIT, 1, 0, w, 1, 0, WERR, 1, 0, IBLOCK, 1, 0, INDEXW, 1, 0 );
	assert.strictEqual( res.info, -5, 'info=-5' );
});

test( 'bad il returns info=-6', function t() {
	var N = 2;
	var d = new Float64Array( [ 1.0, 2.0 ] );
	var e = new Float64Array( [ 0.5, 0.0 ] );
	var E2 = new Float64Array( [ 0.25, 0.0 ] );
	var GERS = buildGers( d, e, N );
	var ISPLIT = new Int32Array( [ 2 ] );
	var w = new Float64Array( N );
	var WERR = new Float64Array( N );
	var IBLOCK = new Int32Array( N );
	var INDEXW = new Int32Array( N );
	var res = dlarrd.ndarray( 'index', 'entire', N, 0.0, 0.0, 0, 2, GERS, 1, 0, RELTOL, d, 1, 0, e, 1, 0, E2, 1, 0, PIVMIN, 1, ISPLIT, 1, 0, w, 1, 0, WERR, 1, 0, IBLOCK, 1, 0, INDEXW, 1, 0 );
	assert.strictEqual( res.info, -6, 'info=-6' );
});

test( 'bad iu returns info=-7', function t() {
	var N = 2;
	var d = new Float64Array( [ 1.0, 2.0 ] );
	var e = new Float64Array( [ 0.5, 0.0 ] );
	var E2 = new Float64Array( [ 0.25, 0.0 ] );
	var GERS = buildGers( d, e, N );
	var ISPLIT = new Int32Array( [ 2 ] );
	var w = new Float64Array( N );
	var WERR = new Float64Array( N );
	var IBLOCK = new Int32Array( N );
	var INDEXW = new Int32Array( N );
	var res = dlarrd.ndarray( 'index', 'entire', N, 0.0, 0.0, 1, 5, GERS, 1, 0, RELTOL, d, 1, 0, e, 1, 0, E2, 1, 0, PIVMIN, 1, ISPLIT, 1, 0, w, 1, 0, WERR, 1, 0, IBLOCK, 1, 0, INDEXW, 1, 0 );
	assert.strictEqual( res.info, -7, 'info=-7' );
});

test( 'N<=0 quick return', function t() {
	var N = 0;
	var d = new Float64Array( 0 );
	var e = new Float64Array( 0 );
	var E2 = new Float64Array( 0 );
	var GERS = new Float64Array( 0 );
	var ISPLIT = new Int32Array( 0 );
	var w = new Float64Array( 0 );
	var WERR = new Float64Array( 0 );
	var IBLOCK = new Int32Array( 0 );
	var INDEXW = new Int32Array( 0 );
	var res = dlarrd.ndarray( 'all', 'entire', N, 0.0, 0.0, 0, 0, GERS, 1, 0, RELTOL, d, 1, 0, e, 1, 0, E2, 1, 0, PIVMIN, 0, ISPLIT, 1, 0, w, 1, 0, WERR, 1, 0, IBLOCK, 1, 0, INDEXW, 1, 0 );
	assert.strictEqual( res.info, 0, 'info=0' );
	assert.strictEqual( res.m, 0, 'm=0' );
});

test( 'default (main) wrapper throws on invalid order', function t() {
	var N = 2;
	var d = new Float64Array( [ 1.0, 2.0 ] );
	var e = new Float64Array( [ 0.5, 0.0 ] );
	var E2 = new Float64Array( [ 0.25, 0.0 ] );
	var GERS = buildGers( d, e, N );
	var ISPLIT = new Int32Array( [ 2 ] );
	var w = new Float64Array( N );
	var WERR = new Float64Array( N );
	var IBLOCK = new Int32Array( N );
	var INDEXW = new Int32Array( N );
	assert.throws( function throws() {
		dlarrd( 'all', 'bogus', N, 0.0, 0.0, 0, 0, GERS, 1, RELTOL, d, 1, e, 1, E2, 1, PIVMIN, 1, ISPLIT, 1, w, 1, WERR, 1, IBLOCK, 1, INDEXW, 1 );
	}, TypeError );
});

test( 'default (main) wrapper throws on negative N', function t() {
	var d = new Float64Array( 1 );
	var e = new Float64Array( 1 );
	var E2 = new Float64Array( 1 );
	var GERS = new Float64Array( 2 );
	var ISPLIT = new Int32Array( 1 );
	var w = new Float64Array( 1 );
	var WERR = new Float64Array( 1 );
	var IBLOCK = new Int32Array( 1 );
	var INDEXW = new Int32Array( 1 );
	assert.throws( function throws() {
		dlarrd( 'all', 'entire', -1, 0.0, 0.0, 0, 0, GERS, 1, RELTOL, d, 1, e, 1, E2, 1, PIVMIN, 1, ISPLIT, 1, w, 1, WERR, 1, IBLOCK, 1, INDEXW, 1 );
	}, RangeError );
});

test( 'default (main) wrapper returns object', function t() {
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

	var res = dlarrd( 'all', 'entire', N, 0.0, 0.0, 0, 0, GERS, 1, RELTOL, d, 1, e, 1, E2, 1, PIVMIN, 1, ISPLIT, 1, w, 1, WERR, 1, IBLOCK, 1, INDEXW, 1 );
	assert.strictEqual( res.info, 0, 'info' );
	assert.strictEqual( res.m, 5, 'm' );
});

test( 'ndarray wrapper matches base with offsets', function t() {
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

	var res = dlarrd.ndarray( 'all', 'entire', N, 0.0, 0.0, 0, 0, GERS, 1, 0, RELTOL, d, 1, 0, e, 1, 0, E2, 1, 0, PIVMIN, 1, ISPLIT, 1, 0, w, 1, 0, WERR, 1, 0, IBLOCK, 1, 0, INDEXW, 1, 0 );
	var expected = byName( 'range_all_order_entire' );
	assert.strictEqual( res.info, expected.info );
	assert.strictEqual( res.m, expected.m );
	for ( i = 0; i < res.m; i++ ) {
		assert.ok( Math.abs( w[ i ] - expected.w[ i ] ) < 1e-12 );
	}
});
