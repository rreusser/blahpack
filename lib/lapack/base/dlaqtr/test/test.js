// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import dlaqtr from './../lib/base.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dlaqtr.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( function parse( line ) { return JSON.parse( line ); } );


// FUNCTIONS //

function findCase( name ) {
	return fixture.find( function find( t ) { return t.name === name; } );
}

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function buildT( rows, ldt, N ) {
	var out = new Float64Array( ldt * N );
	var i;
	var j;
	for ( i = 0; i < rows.length; i++ ) {
		for ( j = 0; j < rows[ i ].length; j++ ) {
			out[ i + ( j * ldt ) ] = rows[ i ][ j ];
		}
	}
	return out;
}

function runReal( tc, ltran, N, Trows, xInit, keys ) {
	var ldt = N;
	var T = buildT( Trows, ldt, N );
	var b = new Float64Array( Math.max( N, 1 ) );
	var x = new Float64Array( xInit );
	var work = new Float64Array( Math.max( N, 1 ) );
	var res = dlaqtr( ltran, true, N, T, 1, ldt, 0, b, 1, 0, 0.0, x, 1, 0, work, 1, 0 );
	var i;
	assert.equal( res.info, tc.INFO, 'INFO' );
	assertClose( res.scale, tc.SCALE, 1e-13, 'SCALE' );
	for ( i = 0; i < keys.length; i++ ) {
		assertClose( x[ i ], tc[ keys[ i ] ], 1e-13, keys[ i ] );
	}
}

function runComplex( tc, ltran, N, Trows, bArr, w, xInit, keys ) {
	var ldt = N;
	var T = buildT( Trows, ldt, N );
	var b = new Float64Array( bArr );
	var x = new Float64Array( xInit );
	var work = new Float64Array( Math.max( N, 1 ) );
	var res = dlaqtr( ltran, false, N, T, 1, ldt, 0, b, 1, 0, w, x, 1, 0, work, 1, 0 );
	var i;
	assert.equal( res.info, tc.INFO, 'INFO' );
	assertClose( res.scale, tc.SCALE, 1e-13, 'SCALE' );
	for ( i = 0; i < keys.length; i++ ) {
		assertClose( x[ i ], tc[ keys[ i ] ], 1e-13, keys[ i ] );
	}
}


// TESTS //

test( 'dlaqtr: n0_quick', function t() {
	var tc = findCase( 'n0_quick' );
	var T = new Float64Array( 1 );
	var b = new Float64Array( 1 );
	var x = new Float64Array( 1 );
	var work = new Float64Array( 1 );
	var res = dlaqtr( false, true, 0, T, 1, 1, 0, b, 1, 0, 0.0, x, 1, 0, work, 1, 0 );
	assert.equal( res.info, tc.INFO );
	assert.equal( res.scale, 1.0 );
});

test( 'dlaqtr: real_notran_n1', function t() {
	var tc = findCase( 'real_notran_n1' );
	runReal( tc, false, 1, [ [ 2.0 ] ], [ 6.0 ], [ 'X1' ] );
});

test( 'dlaqtr: real_notran_n3_triangular', function t() {
	var tc = findCase( 'real_notran_n3_triangular' );
	runReal( tc, false, 3, [
		[ 2.0, 1.0, 3.0 ],
		[ 0.0, 3.0, -1.0 ],
		[ 0.0, 0.0, 4.0 ]
	], [ 10.0, 5.0, 8.0 ], [ 'X1', 'X2', 'X3' ] );
});

test( 'dlaqtr: real_trans_n3_triangular', function t() {
	var tc = findCase( 'real_trans_n3_triangular' );
	runReal( tc, true, 3, [
		[ 2.0, 1.0, 3.0 ],
		[ 0.0, 3.0, -1.0 ],
		[ 0.0, 0.0, 4.0 ]
	], [ 10.0, 5.0, 8.0 ], [ 'X1', 'X2', 'X3' ] );
});

test( 'dlaqtr: real_notran_n3_2x2block', function t() {
	var tc = findCase( 'real_notran_n3_2x2block' );
	runReal( tc, false, 3, [
		[ 5.0, 2.0, 1.0 ],
		[ 0.0, 1.0, 3.0 ],
		[ 0.0, -4.0, 1.0 ]
	], [ 1.0, 2.0, 3.0 ], [ 'X1', 'X2', 'X3' ] );
});

test( 'dlaqtr: real_trans_n3_2x2block', function t() {
	var tc = findCase( 'real_trans_n3_2x2block' );
	runReal( tc, true, 3, [
		[ 5.0, 2.0, 1.0 ],
		[ 0.0, 1.0, 3.0 ],
		[ 0.0, -4.0, 1.0 ]
	], [ 1.0, 2.0, 3.0 ], [ 'X1', 'X2', 'X3' ] );
});

test( 'dlaqtr: complex_notran_n2', function t() {
	var tc = findCase( 'complex_notran_n2' );
	runComplex( tc, false, 2, [
		[ 3.0, 1.0 ],
		[ 0.0, 2.0 ]
	], [ 0.5, 0.25 ], 1.5, [ 4.0, 3.0, 1.0, 2.0 ], [ 'X1', 'X2', 'X3', 'X4' ] );
});

test( 'dlaqtr: complex_trans_n2', function t() {
	var tc = findCase( 'complex_trans_n2' );
	runComplex( tc, true, 2, [
		[ 3.0, 1.0 ],
		[ 0.0, 2.0 ]
	], [ 0.5, 0.25 ], 1.5, [ 4.0, 3.0, 1.0, 2.0 ], [ 'X1', 'X2', 'X3', 'X4' ] );
});

test( 'dlaqtr: complex_notran_n3_2x2', function t() {
	var tc = findCase( 'complex_notran_n3_2x2' );
	runComplex( tc, false, 3, [
		[ 4.0, 1.0, 0.5 ],
		[ 0.0, 1.0, 2.0 ],
		[ 0.0, -3.0, 1.0 ]
	], [ 0.3, 0.2, 0.1 ], 0.8, [ 1.0, 2.0, 3.0, 0.5, 0.25, 0.125 ], [ 'X1', 'X2', 'X3', 'X4', 'X5', 'X6' ] );
});

test( 'dlaqtr: complex_trans_n3_2x2', function t() {
	var tc = findCase( 'complex_trans_n3_2x2' );
	runComplex( tc, true, 3, [
		[ 4.0, 1.0, 0.5 ],
		[ 0.0, 1.0, 2.0 ],
		[ 0.0, -3.0, 1.0 ]
	], [ 0.3, 0.2, 0.1 ], 0.8, [ 1.0, 2.0, 3.0, 0.5, 0.25, 0.125 ], [ 'X1', 'X2', 'X3', 'X4', 'X5', 'X6' ] );
});

test( 'dlaqtr: real_notran_n4_zero_rhs', function t() {
	var tc = findCase( 'real_notran_n4_zero_rhs' );
	runReal( tc, false, 4, [
		[ 2.0, 1.0, 0.5, 0.25 ],
		[ 0.0, 3.0, 1.0, 0.5 ],
		[ 0.0, 0.0, 1.0, 2.0 ],
		[ 0.0, 0.0, -3.0, 1.0 ]
	], [ 0.0, 0.0, 1.0, 0.0 ], [ 'X1', 'X2', 'X3', 'X4' ] );
});
