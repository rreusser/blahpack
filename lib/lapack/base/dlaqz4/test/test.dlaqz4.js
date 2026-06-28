/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqz4 from './../lib/dlaqz4.js';


// TESTS //

test( 'dlaqz4 is a function', function t() {
	assert.strictEqual( typeof dlaqz4, 'function', 'is a function' );
});

test( 'dlaqz4 has expected arity', function t() {
	assert.strictEqual( dlaqz4.length, 29, 'has expected arity' );
});

test( 'dlaqz4 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlaqz4( 'invalid', true, true, true, 4, 0, 3, 2, 4, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 16 ), 4, new Float64Array( 16 ), 4, new Float64Array( 16 ), 4, new Float64Array( 16 ), 4, new Float64Array( 16 ), 4, new Float64Array( 16 ), 4, new Float64Array( 16 ), 1 );
	}, TypeError );
});

test( 'dlaqz4 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlaqz4( 'row-major', true, true, true, -1, 0, 3, 2, 4, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 16 ), 4, new Float64Array( 16 ), 4, new Float64Array( 16 ), 4, new Float64Array( 16 ), 4, new Float64Array( 16 ), 4, new Float64Array( 16 ), 4, new Float64Array( 16 ), 1 );
	}, RangeError );
});

test( 'dlaqz4 throws RangeError for LDA < max(1, N)', function t() {
	assert.throws( function throws() {
		dlaqz4( 'column-major', true, true, true, 4, 0, 3, 2, 4, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 16 ), 1, new Float64Array( 16 ), 4, new Float64Array( 16 ), 4, new Float64Array( 16 ), 4, new Float64Array( 16 ), 4, new Float64Array( 16 ), 4, new Float64Array( 16 ), 1 );
	}, RangeError );
});

test( 'dlaqz4 returns 0 for quick return cases (nshifts < 2)', function t() {
	var info = dlaqz4( 'column-major', true, true, true, 4, 0, 3, 0, 4, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 16 ), 4, new Float64Array( 16 ), 4, new Float64Array( 16 ), 4, new Float64Array( 16 ), 4, new Float64Array( 16 ), 4, new Float64Array( 16 ), 4, new Float64Array( 16 ), 1 );
	assert.equal( info, 0, 'info is 0' );
});

test( 'dlaqz4 column-major matches expected sweep on the smallest fixture', function t() {
	var fixturesDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
	var relErr;
	var lines;
	var info;
	var line;
	var NMAX;
	var WORK;
	var ZC;
	var QC;
	var tc;
	var A;
	var B;
	var N;
	var Q;
	var Z;
	var i;
	var j;
	var k;

	lines = readFileSync( path.join( fixturesDir, 'dlaqz4.jsonl' ), 'utf8' ).trim().split( '\n' );
	NMAX = 12;
	N = 8;
	WORK = new Float64Array( NMAX * NMAX );
	ZC = new Float64Array( NMAX * NMAX );
	QC = new Float64Array( NMAX * NMAX );
	Z = new Float64Array( NMAX * NMAX );
	Q = new Float64Array( NMAX * NMAX );
	B = new Float64Array( NMAX * NMAX );
	A = new Float64Array( NMAX * NMAX );

	for ( k = 0; k < lines.length; k++ ) {
		line = JSON.parse( lines[ k ] );
		if ( line.name === 'basic_8x8_ns2' ) {
			tc = line;
			break;
		}
	}
	assert.ok( tc, 'fixture found' );

	for ( j = 1; j <= N; j++ ) {
		for ( i = 1; i <= N; i++ ) {
			if ( i <= j + 1 ) {
				A[ ( i - 1 ) + ( ( j - 1 ) * NMAX ) ] = 1.0 + ( 0.1 * ( i + ( 2 * j ) ) ) + ( 0.03 * i * j );
			}
			if ( i <= j ) {
				B[ ( i - 1 ) + ( ( j - 1 ) * NMAX ) ] = 2.0 + ( 0.2 * ( j - i ) ) + ( 0.05 * j );
			}
		}
	}
	for ( i = 0; i < N; i++ ) {
		Q[ i + ( i * NMAX ) ] = 1.0;
		Z[ i + ( i * NMAX ) ] = 1.0;
		QC[ i + ( i * NMAX ) ] = 1.0;
		ZC[ i + ( i * NMAX ) ] = 1.0;
	}
	info = dlaqz4( 'column-major', true, true, true, N, 0, N - 1, 2, 4, new Float64Array( [ 1.5, 1.5 ] ), 1, new Float64Array( [ 0.3, -0.3 ] ), 1, new Float64Array( [ 1.0, 1.0 ] ), 1, A, NMAX, B, NMAX, Q, NMAX, Z, NMAX, QC, NMAX, ZC, NMAX, WORK, 1 );
	assert.equal( info, 0, 'info' );
	k = 0;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			relErr = Math.abs( A[ i + ( j * NMAX ) ] - tc.A[ k ] ) / Math.max( Math.abs( tc.A[ k ] ), 1.0 );
			assert.ok( relErr <= 1e-12, 'A[' + i + ',' + j + ']' );
			k += 1;
		}
	}
});
