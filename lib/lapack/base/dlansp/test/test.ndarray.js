/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import dlansp from './../lib/ndarray.js';


// FIXTURES //

var fixtureFile = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'dlansp.jsonl' );
var rawLines = readFileSync( fixtureFile, 'utf8' ).trim().split( '\n' );
var FIXTURES = rawLines.map( function parse( line ) {
	return JSON.parse( line );
});


// MATRIX DATA (mirrors test/fortran/test_dlansp.f90) //

// 3x3 packed:
var DATA_3x3_U = [ 2.0, 3.0, 5.0, -1.0, 2.0, 7.0 ];
var DATA_3x3_L = [ 2.0, 3.0, -1.0, 5.0, 2.0, 7.0 ];

// 4x4 packed:
var DATA_4x4_U = [ 2.0, 3.0, 5.0, -1.0, 2.0, 7.0, 4.0, -6.0, 1.0, 8.0 ];
var DATA_4x4_L = [ 2.0, 3.0, -1.0, 4.0, 5.0, 2.0, -6.0, 7.0, 1.0, 8.0 ];

// 1x1: single element -5.5
var DATA_1x1 = [ -5.5 ];


// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, format( '%s: expected %s, got %s (rel err %s)', msg, expected, actual, relErr ) );
}

/**
* Parses a dlansp fixture name into routine arguments.
* Patterns:
*   dlansp_3x3_max_U, dlansp_4x4_frob_L
*   dlansp_n0
*   dlansp_1x1_max, dlansp_1x1_one, ...
*
* @private
* @param {string} name - fixture name
* @returns {Object} parsed args { N, uplo, norm, data }
*/
function parseName( name ) {
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
	var parts = name.split( '_' );

	// parts[0] = 'dlansp'
	var sizePart = parts[ 1 ];
	var data;
	var N;
	var uplo;
	var norm;

	if ( sizePart === 'n0' ) {
		return { 'N': 0, 'uplo': 'upper', 'norm': 'max', 'data': []};
	}

	norm = normMap[ parts[ 2 ] ];

	if ( sizePart === '3x3' ) {
		N = 3;
		uplo = uploMap[ parts[ 3 ] ];
		data = ( uplo === 'upper' ) ? DATA_3x3_U : DATA_3x3_L;
	} else if ( sizePart === '4x4' ) {
		N = 4;
		uplo = uploMap[ parts[ 3 ] ];
		data = ( uplo === 'upper' ) ? DATA_4x4_U : DATA_4x4_L;
	} else if ( sizePart === '1x1' ) {
		N = 1;
		uplo = 'upper';
		data = DATA_1x1;
	} else {
		throw new Error( 'unrecognized fixture: ' + name );
	}

	return { 'N': N, 'uplo': uplo, 'norm': norm, 'data': data };
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlansp, 'function', 'main export is a function' );
});

FIXTURES.forEach( function build( fx ) {
	test( 'dlansp: ' + fx.name, function t() {
		var args = parseName( fx.name );
		var AP = new Float64Array( args.data );
		var WORK = new Float64Array( Math.max( args.N, 1 ) );
		var result = dlansp( args.norm, args.uplo, args.N, AP, 1, 0, WORK, 1, 0 );
		assertClose( result, fx.result, 1e-12, fx.name );
	});
});
