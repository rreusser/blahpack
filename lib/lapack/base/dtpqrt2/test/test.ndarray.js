/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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

import path from 'node:path';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtpqrt2 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dtpqrt2.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Find a test case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture record
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Convert a plain array of doubles to a `Float64Array`.
*
* @private
* @param {Array<number>} arr - source array
* @returns {Float64Array} packed array
*/
function toF64( arr ) {
	var out;
	var i;
	out = new Float64Array( arr.length );
	for ( i = 0; i < arr.length; i++ ) {
		out[ i ] = arr[ i ];
	}
	return out;
}

/**
* Build the input matrices for a fixture case (column-major, packed).
*
* @private
* @param {string} name - case name
* @returns {Object} `{ M, N, L, A, B, T, lda, ldb, ldt }`
*/
function buildInputs( name ) {
	var inputs;
	var def;
	var A;
	var B;
	var T;

	inputs = {};
	inputs.m4_n3_l0 = {
		'M': 4,
		'N': 3,
		'L': 0
	};
	inputs.m4_n3_l3 = {
		'M': 4,
		'N': 3,
		'L': 3
	};
	inputs.m3_n3_l2 = {
		'M': 3,
		'N': 3,
		'L': 2
	};
	inputs.m3_n3_l3 = {
		'M': 3,
		'N': 3,
		'L': 3
	};
	inputs.m3_n1_l1 = {
		'M': 3,
		'N': 1,
		'L': 1
	};
	inputs.m2_n4_l2 = {
		'M': 2,
		'N': 4,
		'L': 2
	};
	def = inputs[ name ];
	A = new Float64Array( def.N * def.N );
	B = new Float64Array( def.M * def.N );
	T = new Float64Array( def.N * def.N );

	if ( name === 'm4_n3_l0' ) {
		// A 3x3 upper triangular (column-major; A[i + j*N])
		A[ 0 + ( 0 * 3 ) ] = 2.0;
		A[ 0 + ( 1 * 3 ) ] = 0.5;
		A[ 1 + ( 1 * 3 ) ] = 3.0;
		A[ 0 + ( 2 * 3 ) ] = 0.25;
		A[ 1 + ( 2 * 3 ) ] = 0.75;
		A[ 2 + ( 2 * 3 ) ] = 4.0;

		// B 4x3 rectangular (column-major; B[i + j*M])
		B[ 0 + ( 0 * 4 ) ] = 1.0;
		B[ 1 + ( 0 * 4 ) ] = 0.3;
		B[ 2 + ( 0 * 4 ) ] = 0.7;
		B[ 3 + ( 0 * 4 ) ] = 0.2;
		B[ 0 + ( 1 * 4 ) ] = 0.5;
		B[ 1 + ( 1 * 4 ) ] = 1.1;
		B[ 2 + ( 1 * 4 ) ] = 0.4;
		B[ 3 + ( 1 * 4 ) ] = 0.9;
		B[ 0 + ( 2 * 4 ) ] = 0.25;
		B[ 1 + ( 2 * 4 ) ] = 0.6;
		B[ 2 + ( 2 * 4 ) ] = 1.2;
		B[ 3 + ( 2 * 4 ) ] = 0.8;
	} else if ( name === 'm4_n3_l3' ) {
		A[ 0 + ( 0 * 3 ) ] = 2.0;
		A[ 0 + ( 1 * 3 ) ] = 0.5;
		A[ 1 + ( 1 * 3 ) ] = 3.0;
		A[ 0 + ( 2 * 3 ) ] = 0.25;
		A[ 1 + ( 2 * 3 ) ] = 0.75;
		A[ 2 + ( 2 * 3 ) ] = 4.0;

		// B has 1 rectangular row + 3 upper trapezoidal rows
		B[ 0 + ( 0 * 4 ) ] = 1.0;
		B[ 1 + ( 0 * 4 ) ] = 1.1;
		B[ 0 + ( 1 * 4 ) ] = 0.5;
		B[ 1 + ( 1 * 4 ) ] = 0.6;
		B[ 2 + ( 1 * 4 ) ] = 1.2;
		B[ 0 + ( 2 * 4 ) ] = 0.25;
		B[ 1 + ( 2 * 4 ) ] = 0.2;
		B[ 2 + ( 2 * 4 ) ] = 0.9;
		B[ 3 + ( 2 * 4 ) ] = 1.5;
	} else if ( name === 'm3_n3_l2' ) {
		A[ 0 + ( 0 * 3 ) ] = 3.0;
		A[ 0 + ( 1 * 3 ) ] = 0.5;
		A[ 1 + ( 1 * 3 ) ] = 2.5;
		A[ 0 + ( 2 * 3 ) ] = 0.25;
		A[ 1 + ( 2 * 3 ) ] = 0.75;
		A[ 2 + ( 2 * 3 ) ] = 4.5;

		B[ 0 + ( 0 * 3 ) ] = 0.9;
		B[ 0 + ( 1 * 3 ) ] = 0.2;
		B[ 1 + ( 1 * 3 ) ] = 1.3;
		B[ 0 + ( 2 * 3 ) ] = 0.6;
		B[ 1 + ( 2 * 3 ) ] = 0.4;
		B[ 2 + ( 2 * 3 ) ] = 1.1;
	} else if ( name === 'm3_n3_l3' ) {
		A[ 0 + ( 0 * 3 ) ] = 2.0;
		A[ 0 + ( 1 * 3 ) ] = 0.3;
		A[ 1 + ( 1 * 3 ) ] = 3.0;
		A[ 0 + ( 2 * 3 ) ] = 0.1;
		A[ 1 + ( 2 * 3 ) ] = 0.2;
		A[ 2 + ( 2 * 3 ) ] = 4.0;

		B[ 0 + ( 0 * 3 ) ] = 1.1;
		B[ 0 + ( 1 * 3 ) ] = 0.4;
		B[ 1 + ( 1 * 3 ) ] = 1.5;
		B[ 0 + ( 2 * 3 ) ] = 0.6;
		B[ 1 + ( 2 * 3 ) ] = 0.3;
		B[ 2 + ( 2 * 3 ) ] = 1.7;
	} else if ( name === 'm3_n1_l1' ) {
		A[ 0 ] = 5.0;
		B[ 0 ] = 1.0;
		B[ 1 ] = 2.0;
		B[ 2 ] = 3.0;
	} else if ( name === 'm2_n4_l2' ) {
		// A is 4x4 upper triangular
		A[ 0 + ( 0 * 4 ) ] = 2.0;
		A[ 0 + ( 1 * 4 ) ] = 0.5;
		A[ 1 + ( 1 * 4 ) ] = 3.0;
		A[ 0 + ( 2 * 4 ) ] = 0.2;
		A[ 1 + ( 2 * 4 ) ] = 0.4;
		A[ 2 + ( 2 * 4 ) ] = 2.5;
		A[ 0 + ( 3 * 4 ) ] = 0.1;
		A[ 1 + ( 3 * 4 ) ] = 0.3;
		A[ 2 + ( 3 * 4 ) ] = 0.6;
		A[ 3 + ( 3 * 4 ) ] = 3.5;

		// B is 2x4, both rows trapezoidal (M=L=2)
		B[ 0 + ( 0 * 2 ) ] = 1.0;
		B[ 0 + ( 1 * 2 ) ] = 0.5;
		B[ 1 + ( 1 * 2 ) ] = 1.2;
		B[ 0 + ( 2 * 2 ) ] = 0.7;
		B[ 1 + ( 2 * 2 ) ] = 0.8;
		B[ 0 + ( 3 * 2 ) ] = 0.3;
		B[ 1 + ( 3 * 2 ) ] = 0.6;
	}
	return {
		'M': def.M,
		'N': def.N,
		'L': def.L,
		'A': A,
		'B': B,
		'T': T,
		'lda': def.N,
		'ldb': def.M,
		'ldt': def.N
	};
}

/**
* Compare arrays element-wise within a relative tolerance.
*
* @private
* @param {Float64Array} actual - actual values
* @param {Float64Array} expected - expected values
* @param {number} tol - tolerance
* @param {string} msg - message prefix
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var ai;
	var ei;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		ai = actual[ i ];
		ei = expected[ i ];
		assert.ok( Math.abs( ai - ei ) <= tol * Math.max( 1.0, Math.abs( ei ) ), msg + '[' + i + ']: expected ' + ei + ', got ' + ai );
	}
}

/**
* Convert a column-major matrix into a row-major one.
*
* @private
* @param {Float64Array} src - column-major source
* @param {NonNegativeInteger} m - number of rows
* @param {NonNegativeInteger} n - number of columns
* @returns {Float64Array} row-major copy
*/
function colToRow( src, m, n ) {
	var dst;
	var i;
	var j;
	dst = new Float64Array( m * n );
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			dst[ ( i * n ) + j ] = src[ i + ( j * m ) ];
		}
	}
	return dst;
}

/**
* Convert a row-major matrix into a column-major one.
*
* @private
* @param {Float64Array} src - row-major source
* @param {NonNegativeInteger} m - number of rows
* @param {NonNegativeInteger} n - number of columns
* @returns {Float64Array} column-major copy
*/
function rowToCol( src, m, n ) {
	var dst;
	var i;
	var j;
	dst = new Float64Array( m * n );
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			dst[ i + ( j * m ) ] = src[ ( i * n ) + j ];
		}
	}
	return dst;
}


// TESTS //

test( 'is a function', function t() {
	assert.strictEqual( typeof dtpqrt2, 'function', 'is a function' );
});

[ 'm4_n3_l0', 'm4_n3_l3', 'm3_n3_l2', 'm3_n3_l3', 'm3_n1_l1', 'm2_n4_l2' ].forEach( function each( name ) {
	test( 'column-major: ' + name, function t() {
		var info;
		var inp;
		var tc;
		inp = buildInputs( name );
		tc = findCase( name );
		info = dtpqrt2( inp.M, inp.N, inp.L, inp.A, 1, inp.lda, 0, inp.B, 1, inp.ldb, 0, inp.T, 1, inp.ldt, 0 );
		assert.strictEqual( info, tc.INFO );
		assertArrayClose( inp.A, toF64( tc.A ), 1e-13, name + ':A' );
		assertArrayClose( inp.B, toF64( tc.B ), 1e-13, name + ':B' );
		assertArrayClose( inp.T, toF64( tc.T ), 1e-13, name + ':T' );
	});

	test( 'row-major: ' + name, function t() {
		var info;
		var inp;
		var tc;
		var A;
		var B;
		var T;
		inp = buildInputs( name );
		tc = findCase( name );
		A = colToRow( inp.A, inp.N, inp.N );
		B = colToRow( inp.B, inp.M, inp.N );
		T = colToRow( inp.T, inp.N, inp.N );
		info = dtpqrt2( inp.M, inp.N, inp.L, A, inp.N, 1, 0, B, inp.N, 1, 0, T, inp.N, 1, 0 );
		assert.strictEqual( info, tc.INFO );
		assertArrayClose( rowToCol( A, inp.N, inp.N ), toF64( tc.A ), 1e-13, name + ':A' );
		assertArrayClose( rowToCol( B, inp.M, inp.N ), toF64( tc.B ), 1e-13, name + ':B' );
		assertArrayClose( rowToCol( T, inp.N, inp.N ), toF64( tc.T ), 1e-13, name + ':T' );
	});
});

test( 'column-major: M=0 quick return', function t() {
	var info;
	info = dtpqrt2( 0, 3, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 0 ), 1, 0, 0, new Float64Array( 9 ), 1, 3, 0 );
	assert.strictEqual( info, 0 );
});

test( 'column-major: N=0 quick return', function t() {
	var info;
	info = dtpqrt2( 3, 0, 0, new Float64Array( 0 ), 1, 0, 0, new Float64Array( 0 ), 1, 0, 0, new Float64Array( 0 ), 1, 0, 0 );
	assert.strictEqual( info, 0 );
});

test( 'ndarray validation: throws when M is negative', function t() {
	assert.throws( function bad() {
		dtpqrt2( -1, 3, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 3, 0 );
	}, RangeError );
});

test( 'ndarray validation: throws when N is negative', function t() {
	assert.throws( function bad() {
		dtpqrt2( 3, -1, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 3, 0 );
	}, RangeError );
});

test( 'ndarray validation: throws when l is out of range', function t() {
	assert.throws( function bad() {
		dtpqrt2( 3, 3, 5, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 3, 0 );
	}, RangeError );
});
