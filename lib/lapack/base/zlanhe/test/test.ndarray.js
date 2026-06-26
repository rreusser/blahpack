/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import zlanhe from './../lib/ndarray.js';


// FIXTURES //

var fixtureFile = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'zlanhe.jsonl' );
var rawLines = readFileSync( fixtureFile, 'utf8' ).trim().split( '\n' );
var FIXTURES = rawLines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, format( '%s: expected %s, got %s (rel err %s)', msg, expected, actual, relErr ) );
}

/**
* Builds a column-major complex matrix of dimension N from a list of (i,j,re,im).
* Indices are 0-based.
*
* @private
* @param {NonNegativeInteger} N - matrix order
* @param {Array<Array>} entries - sparse list [ [i, j, re, im], ... ]
* @returns {Complex128Array} flat column-major matrix (length N*N)
*/
function buildMatrix( N, entries ) {
	var flat = new Float64Array( 2 * N * N );
	var i;
	var j;
	var re;
	var im;
	var idx;
	var k;
	for ( k = 0; k < entries.length; k++ ) {
		i = entries[ k ][ 0 ];
		j = entries[ k ][ 1 ];
		re = entries[ k ][ 2 ];
		im = entries[ k ][ 3 ];
		idx = ( i + ( j * N ) ) * 2;
		flat[ idx ] = re;
		flat[ idx + 1 ] = im;
	}
	return new Complex128Array( flat.buffer );
}


// MATRIX DATA (mirrors test/fortran/test_zlanhe.f90) //

// 4x4 Hermitian, upper triangle
var ENTRIES_4x4_U = [
	[ 0, 0, 2.0, 0.0 ],
	[ 0, 1, 3.0, 1.0 ], [ 1, 1, 5.0, 0.0 ],
	[ 0, 2, -1.0, 2.0 ], [ 1, 2, 2.0, 0.5 ], [ 2, 2, 7.0, 0.0 ],
	[ 0, 3, 4.0, -3.0 ], [ 1, 3, -6.0, 1.0 ], [ 2, 3, 1.0, 4.0 ], [ 3, 3, 8.0, 0.0 ]
];

// 4x4 Hermitian, lower triangle (conjugates of upper)
var ENTRIES_4x4_L = [
	[ 0, 0, 2.0, 0.0 ],
	[ 1, 0, 3.0, -1.0 ], [ 1, 1, 5.0, 0.0 ],
	[ 2, 0, -1.0, -2.0 ], [ 2, 1, 2.0, -0.5 ], [ 2, 2, 7.0, 0.0 ],
	[ 3, 0, 4.0, 3.0 ], [ 3, 1, -6.0, -1.0 ], [ 3, 2, 1.0, -4.0 ], [ 3, 3, 8.0, 0.0 ]
];

// 3x3 Hermitian, upper
var ENTRIES_3x3_U = [
	[ 0, 0, 1.0, 0.0 ],
	[ 0, 1, 2.0, 3.0 ], [ 1, 1, 4.0, 0.0 ],
	[ 0, 2, 5.0, -1.0 ], [ 1, 2, 0.0, 6.0 ], [ 2, 2, 9.0, 0.0 ]
];

// 3x3 Hermitian, lower
var ENTRIES_3x3_L = [
	[ 0, 0, 1.0, 0.0 ],
	[ 1, 0, 2.0, -3.0 ], [ 1, 1, 4.0, 0.0 ],
	[ 2, 0, 5.0, 1.0 ], [ 2, 1, 0.0, -6.0 ], [ 2, 2, 9.0, 0.0 ]
];

// 1x1 Hermitian: a(0,0) = (-5.5, 0.0)
var ENTRIES_1x1 = [ [ 0, 0, -5.5, 0.0 ] ];


// PARSE //

var normMap = {
	'max': 'max',
	'one': 'one-norm',
	'inf': 'inf-norm',
	'frob': 'frobenius'
};
var uploMap = {
	'U': 'upper',
	'L': 'lower'
};

/**
* Parses a zlanhe fixture name into routine arguments.
* Patterns:
*   zlanhe_max_U, zlanhe_one_U, zlanhe_one_O_U, zlanhe_inf_U, zlanhe_frob_U, zlanhe_frob_E_U  (n=4)
*   zlanhe_n_zero
*   zlanhe_1x1_max, ...
*   zlanhe_3x3_max_U, ...
*
* @private
* @param {string} name - fixture name
* @returns {Object} { N, uplo, norm, entries }
*/
function parseName( name ) {
	var parts = name.split( '_' ); // [zlanhe, ...]
	var rest = parts.slice( 1 );
	var N;
	var uplo;
	var norm;
	var entries;
	var sizeOrNorm;

	if ( rest[ 0 ] === 'n' && rest[ 1 ] === 'zero' ) {
		return { 'N': 0, 'uplo': 'upper', 'norm': 'max', 'entries': []};
	}

	sizeOrNorm = rest[ 0 ];

	if ( sizeOrNorm === '1x1' ) {
		N = 1;
		norm = normMap[ rest[ 1 ] ];
		uplo = 'upper';
		entries = ENTRIES_1x1;
	} else if ( sizeOrNorm === '3x3' ) {
		N = 3;
		norm = normMap[ rest[ 1 ] ];
		uplo = uploMap[ rest[ rest.length - 1 ] ];
		entries = ( uplo === 'upper' ) ? ENTRIES_3x3_U : ENTRIES_3x3_L;
	} else {
		// 4x4 default cases: zlanhe_<norm>[_O|_E]_<uplo>
		N = 4;
		norm = normMap[ rest[ 0 ] ];
		uplo = uploMap[ rest[ rest.length - 1 ] ];
		entries = ( uplo === 'upper' ) ? ENTRIES_4x4_U : ENTRIES_4x4_L;
	}

	return { 'N': N, 'uplo': uplo, 'norm': norm, 'entries': entries };
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zlanhe, 'function', 'main export is a function' );
});

FIXTURES.forEach( function build( fx ) {
	test( 'zlanhe: ' + fx.name, function t() {
		var args = parseName( fx.name );
		var N = args.N;
		var A = ( N === 0 ) ? new Complex128Array( 0 ) : buildMatrix( N, args.entries );
		var WORK = new Float64Array( Math.max( N, 1 ) );

		// strideA1 = 1, strideA2 = N (column-major, lda = N)
		var result = zlanhe( args.norm, args.uplo, N, A, 1, Math.max( N, 1 ), 0, WORK, 1, 0 );
		assertClose( result, fx.result, 1e-12, fx.name );
	});
});
