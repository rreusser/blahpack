/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import zlanhf from './../lib/ndarray.js';


// FIXTURES //

const fixtureFile = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'zlanhf.jsonl' );
const rawLines = readFileSync( fixtureFile, 'utf8' ).trim().split( '\n' );
const FIXTURES = rawLines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, format( '%s: expected %s, got %s (rel err %s)', msg, expected, actual, relErr ) );
}

const normMap = {
	'max': 'max',
	'one': 'one-norm',
	'inf': 'inf-norm',
	'frob': 'frobenius'
};
const transrMap = {
	'N': 'no-transpose',
	'C': 'conjugate-transpose'
};
const uploMap = {
	'U': 'upper',
	'L': 'lower'
};

/**
* Parses a zlanhf fixture name into routine arguments.
* Patterns:
*   zlanhf_n0
*   zlanhf_n1
*   zlanhf_<N>_<transr><uplo>_<norm> e.g. zlanhf_5_NU_max
*
* @private
* @param {string} name - fixture name
* @returns {Object} { N, transr, uplo, norm, key }
*/
function parseName( name ) {
	const parts = name.split( '_' ); // ['zlanhf', ...]
	const rest = parts.slice( 1 );

	if ( rest[ 0 ] === 'n0' ) {
		return {
			'N': 0,
			'transr': 'no-transpose',
			'uplo': 'upper',
			'norm': 'max',
			'key': 'n0'
		};
	}
	if ( rest[ 0 ] === 'n1' ) {
		return {
			'N': 1,
			'transr': 'no-transpose',
			'uplo': 'upper',
			'norm': 'max',
			'key': 'n1'
		};
	}

	// rest = [<N>, <TU>, <norm>]
	const N = parseInt( rest[ 0 ], 10 );
	const transr = transrMap[ rest[ 1 ].charAt( 0 ) ];
	const uplo = uploMap[ rest[ 1 ].charAt( 1 ) ];
	const norm = normMap[ rest[ 2 ] ];
	const key = rest[ 0 ] + '_' + rest[ 1 ];

	return { 'N': N, 'transr': transr, 'uplo': uplo, 'norm': norm, 'key': key };
}

// Carry rfp data across fixtures sharing the same key prefix.
// As we iterate through FIXTURES in order, when a fixture has `rfp`,
// We cache it under its key; subsequent fixtures with the same key
// Reuse the cached rfp.
const RFP_BY_KEY = {};

FIXTURES.forEach( function buildEntry( fx ) {
	const args = parseName( fx.name );
	if ( fx.rfp ) {
		RFP_BY_KEY[ args.key ] = fx.rfp;
	}
	fx._args = args;
	fx._rfp = fx.rfp || RFP_BY_KEY[ args.key ];
});


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zlanhf, 'function', 'main export is a function' );
});

FIXTURES.forEach( function build( fx ) {
	test( 'zlanhf: ' + fx.name, function t() {
		const args = fx._args;
		const N = args.N;
		const rfp = fx._rfp;
		let A;

		if ( N === 0 ) {
			A = new Complex128Array( 0 );
		} else {
			assert.ok( rfp, 'fixture ' + fx.name + ' has no rfp data (carry failed)' );

			// Rfp is a flat real-imag pair sequence of length 2 * N*(N+1)/2.
			A = new Complex128Array( new Float64Array( rfp ).buffer );
		}
		const WORK = new Float64Array( Math.max( N, 1 ) );

		const result = zlanhf( args.norm, args.transr, args.uplo, N, A, 1, 0, WORK, 1, 0 );
		assertClose( result, fx.result, 1e-12, fx.name );
	});
});
