/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import dlansf from './../lib/ndarray.js';


// FIXTURES //

var fixtureFile = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'dlansf.jsonl' );
var rawLines = readFileSync( fixtureFile, 'utf8' ).trim().split( '\n' );
var FIXTURES = rawLines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, format( '%s: expected %s, got %s (rel err %s)', msg, expected, actual, relErr ) );
}

/**
* Parses a fixture name like `odd5_NL_max` or `n_zero_max` into routine arguments.
*
* @private
* @param {string} name - fixture name
* @returns {Object} parsed args { N, transr, uplo, norm }
*/
function parseName( name ) {
	var normMap = {
		'max': 'max',
		'one': 'one-norm',
		'inf': 'inf-norm',
		'frob': 'frobenius'
	};
	var transrMap = {
		'N': 'no-transpose',
		'T': 'transpose'
	};
	var uploMap = {
		'U': 'upper',
		'L': 'lower'
	};
	var parts;
	var sizePart;
	var tuPart;
	var normPart;
	var n;

	if ( name.indexOf( 'n_zero' ) === 0 ) {
		parts = name.split( '_' );

		// n_zero_<norm>
		return {
			'N': 0,
			'transr': 'no-transpose',
			'uplo': 'upper',
			'norm': normMap[ parts[ 2 ] ]
		};
	}

	if ( name.indexOf( 'n_one' ) === 0 ) {
		parts = name.split( '_' );

		// n_one_<norm>
		return {
			'N': 1,
			'transr': 'no-transpose',
			'uplo': 'upper',
			'norm': normMap[ parts[ 2 ] ]
		};
	}

	// Pattern: <size><digits>_<TU>_<norm> e.g., odd5_NL_max
	parts = name.split( '_' );
	sizePart = parts[ 0 ]; // odd5, even4, odd7, etc.
	tuPart = parts[ 1 ];   // NL, NU, TL, TU
	normPart = parts[ 2 ]; // max, one, inf, frob

	if ( sizePart.indexOf( 'odd' ) === 0 ) {
		n = parseInt( sizePart.slice( 3 ), 10 );
	} else if ( sizePart.indexOf( 'even' ) === 0 ) {
		n = parseInt( sizePart.slice( 4 ), 10 );
	} else {
		throw new Error( 'unrecognized size part: ' + sizePart );
	}

	return {
		'N': n,
		'transr': transrMap[ tuPart.charAt( 0 ) ],
		'uplo': uploMap[ tuPart.charAt( 1 ) ],
		'norm': normMap[ normPart ]
	};
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlansf, 'function', 'main export is a function' );
});

FIXTURES.forEach( function build( fx ) {
	test( 'dlansf: ' + fx.name, function t() {
		var args = parseName( fx.name );
		var N = args.N;
		var nrfp = ( N * ( N + 1 ) ) / 2;
		var A;
		var WORK;
		var result;
		var tol = 1e-12;

		if ( N === 0 ) {
			A = new Float64Array( 0 );
			WORK = new Float64Array( 1 );
		} else {
			A = new Float64Array( fx.input );
			assert.equal( A.length, nrfp, 'input length matches N*(N+1)/2' );
			WORK = new Float64Array( N );
		}

		result = dlansf( args.norm, args.transr, args.uplo, N, A, 1, 0, WORK, 1, 0 );
		assertClose( result, fx.result, tol, fx.name );
	});
});
