/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import zlanhp from './../lib/ndarray.js';


// FIXTURES //

var fixtureFile = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'zlanhp.jsonl' );
var rawLines = readFileSync( fixtureFile, 'utf8' ).trim().split( '\n' );
var FIXTURES = rawLines.map( function parse( line ) {
	return JSON.parse( line );
});


// MATRIX DATA (mirrors test/fortran/test_zlanhp.f90) //

// 3x3 Hermitian, upper packed:
// (2,0),(1,2),(5,0),(-1,3),(0.5,-1.5),(7,0)
var DATA_3x3_U = [
	2.0, 0.0, 1.0, 2.0, 5.0, 0.0, -1.0, 3.0, 0.5, -1.5, 7.0, 0.0
];
// 3x3 Hermitian, lower packed:
// (2,0),(1,-2),(-1,-3),(5,0),(0.5,1.5),(7,0)
var DATA_3x3_L = [
	2.0, 0.0, 1.0, -2.0, -1.0, -3.0, 5.0, 0.0, 0.5, 1.5, 7.0, 0.0
];

// 4x4 Hermitian, upper packed:
// (2,0),(3,1),(5,0),(-1,2),(2,0.5),(7,0),(4,-1),(-6,3),(1,1),(8,0)
var DATA_4x4_U = [
	2.0, 0.0, 3.0, 1.0, 5.0, 0.0, -1.0, 2.0, 2.0, 0.5, 7.0, 0.0,
	4.0, -1.0, -6.0, 3.0, 1.0, 1.0, 8.0, 0.0
];
// 4x4 Hermitian, lower packed:
// (2,0),(3,-1),(-1,-2),(4,1),(5,0),(2,-0.5),(-6,-3),(7,0),(1,-1),(8,0)
var DATA_4x4_L = [
	2.0, 0.0, 3.0, -1.0, -1.0, -2.0, 4.0, 1.0, 5.0, 0.0, 2.0, -0.5,
	-6.0, -3.0, 7.0, 0.0, 1.0, -1.0, 8.0, 0.0
];

// 1x1: (3.5, 0.0)
var DATA_1x1 = [ 3.5, 0.0 ];
// 1x1 negative diagonal: (-5.5, 0.0)
var DATA_1x1_NEG = [ -5.5, 0.0 ];


// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, format( '%s: expected %s, got %s (rel err %s)', msg, expected, actual, relErr ) );
}

function makeAP( flat ) {
	var buf = new Float64Array( flat );
	return new Complex128Array( buf.buffer );
}

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
* Parses a zlanhp fixture name into routine arguments.
* Patterns:
*   zlanhp_3x3_max_U, zlanhp_4x4_frob_L
*   zlanhp_n0
*   zlanhp_1x1_max
*   zlanhp_1x1_neg_max, zlanhp_1x1_neg_frob
*
* @private
* @param {string} name - fixture name
* @returns {Object} { N, uplo, norm, data }
*/
function parseName( name ) {
	var parts = name.split( '_' );
	var sizePart = parts[ 1 ];
	var norm;
	var uplo;
	var data;
	var N;

	if ( sizePart === 'n0' ) {
		return { N: 0, uplo: 'upper', norm: 'max', data: [] };
	}

	if ( sizePart === '3x3' ) {
		N = 3;
		norm = normMap[ parts[ 2 ] ];
		uplo = uploMap[ parts[ 3 ] ];
		data = ( uplo === 'upper' ) ? DATA_3x3_U : DATA_3x3_L;
	} else if ( sizePart === '4x4' ) {
		N = 4;
		norm = normMap[ parts[ 2 ] ];
		uplo = uploMap[ parts[ 3 ] ];
		data = ( uplo === 'upper' ) ? DATA_4x4_U : DATA_4x4_L;
	} else if ( sizePart === '1x1' ) {
		N = 1;
		uplo = 'upper';
		if ( parts[ 2 ] === 'neg' ) {
			norm = normMap[ parts[ 3 ] ];
			data = DATA_1x1_NEG;
		} else {
			norm = normMap[ parts[ 2 ] ];
			data = DATA_1x1;
		}
	} else {
		throw new Error( 'unrecognized fixture: ' + name );
	}

	return { N: N, uplo: uplo, norm: norm, data: data };
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zlanhp, 'function', 'main export is a function' );
});

FIXTURES.forEach( function build( fx ) {
	test( 'zlanhp: ' + fx.name, function t() {
		var args = parseName( fx.name );
		var AP = ( args.N === 0 ) ? new Complex128Array( 0 ) : makeAP( args.data );
		var WORK = new Float64Array( Math.max( args.N, 1 ) );
		var result = zlanhp( args.norm, args.uplo, args.N, AP, 1, 0, WORK, 1, 0 );
		assertClose( result, fx.result, 1e-12, fx.name );
	});
});
