/* eslint-disable no-restricted-syntax */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import dtrttf from './../../dtrttf/lib/base.js';
import dlansf from './../lib/ndarray.js';
import base from './../lib/base.js';


// FIXTURES //

const fixtureFile = path.join( import.meta.dirname, '..', '..', '..', '..', 'test', 'fixtures', 'dlansf.jsonl' );
const rawLines = readFileSync( fixtureFile, 'utf8' ).trim().split( '\n' );
const FIXTURES = rawLines.map( function parse( line ) {
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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
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
	const normMap = {
		'max': 'max',
		'one': 'one-norm',
		'inf': 'inf-norm',
		'frob': 'frobenius'
	};
	const transrMap = {
		'N': 'no-transpose',
		'T': 'transpose'
	};
	const uploMap = {
		'U': 'upper',
		'L': 'lower'
	};
	let parts, n;

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
	const sizePart = parts[ 0 ]; // odd5, even4, odd7, etc.
	const tuPart = parts[ 1 ];   // NL, NU, TL, TU
	const normPart = parts[ 2 ]; // max, one, inf, frob

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


/**
* Builds an N-by-N symmetric matrix (column-major) with distinct, mixed-sign entries.
*
* @private
* @param {integer} N - order
* @returns {Float64Array} dense symmetric matrix
*/
function denseSymmetric( N ) {
	const A = new Float64Array( N * N );
	let v;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i < N; i++ ) {
			v = ( ( ( ( i * 7 ) + ( j * 13 ) ) % 11 ) - 5 ) + ( ( i + 1 ) / ( j + 3 ) );
			A[ i + ( j * N ) ] = v;
			A[ j + ( i * N ) ] = v;
		}
	}
	return A;
}

/**
* Computes a norm of a dense N-by-N matrix (column-major) directly.
*
* @private
* @param {string} norm - norm type
* @param {integer} N - order
* @param {Float64Array} A - dense matrix
* @returns {number} norm value
*/
function denseNorm( norm, N, A ) {
	let out = 0.0;
	let s;
	let i;
	let j;
	if ( norm === 'frobenius' ) {
		for ( i = 0; i < N * N; i++ ) {
			out += A[ i ] * A[ i ];
		}
		return Math.sqrt( out );
	}
	for ( j = 0; j < N; j++ ) {
		s = 0.0;
		for ( i = 0; i < N; i++ ) {
			if ( norm === 'max' ) {
				out = Math.max( out, Math.abs( A[ i + ( j * N ) ] ) );
			} else if ( norm === 'one-norm' ) {
				s += Math.abs( A[ i + ( j * N ) ] );
			} else {
				s += Math.abs( A[ j + ( i * N ) ] );
			}
		}
		out = Math.max( out, s );
	}
	return out;
}

/**
* Converts a dense N-by-N matrix to RFP format using `dtrttf`.
*
* @private
* @param {string} transr - RFP transpose flag
* @param {string} uplo - stored triangle
* @param {integer} N - order
* @param {Float64Array} A - dense matrix
* @returns {Float64Array} RFP array
*/
function toRFP( transr, uplo, N, A ) {
	const ARF = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	dtrttf( transr, uplo, N, A, 1, N, 0, ARF, 1, 0 );
	return ARF;
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlansf, 'function', 'main export is a function' );
});

FIXTURES.forEach( function build( fx ) {
	test( 'dlansf: ' + fx.name, function t() {
		const args = parseName( fx.name );
		const N = args.N;
		const nrfp = ( N * ( N + 1 ) ) / 2;
		let A, WORK;
		const tol = 1e-12;

		if ( N === 0 ) {
			A = new Float64Array( 0 );
			WORK = new Float64Array( 1 );
		} else {
			A = new Float64Array( fx.input );
			assert.equal( A.length, nrfp, 'input length matches N*(N+1)/2' );
			WORK = new Float64Array( N );
		}

		const result = dlansf( args.norm, args.transr, args.uplo, N, A, 1, 0, WORK, 1, 0 );
		assertClose( result, fx.result, tol, fx.name );
	});
});

test( 'dlansf: every norm of an RFP matrix equals the norm of the dense symmetric matrix it represents (N=2..10, all transr/uplo)', function t() {
	const transrs = [ 'no-transpose', 'transpose' ];
	const norms = [ 'max', 'one-norm', 'inf-norm', 'frobenius' ];
	const uplos = [ 'upper', 'lower' ];
	let expected;
	let actual;
	let dense;
	let WORK;
	let ARF;
	let N;
	let a;
	let b;
	let c;
	for ( N = 2; N <= 10; N++ ) {
		dense = denseSymmetric( N );
		for ( a = 0; a < transrs.length; a++ ) {
			for ( b = 0; b < uplos.length; b++ ) {
				ARF = toRFP( transrs[ a ], uplos[ b ], N, dense );
				for ( c = 0; c < norms.length; c++ ) {
					WORK = new Float64Array( N );
					expected = denseNorm( norms[ c ], N, dense );
					actual = dlansf( norms[ c ], transrs[ a ], uplos[ b ], N, ARF, 1, 0, WORK, 1, 0 );
					assertClose( actual, expected, 1e-14, format( 'N=%d %s %s %s', N, transrs[ a ], uplos[ b ], norms[ c ] ) );
				}
			}
		}
	}
});

test( 'dlansf: a NaN entry propagates to the max, one and infinity norms (N=4,5, all transr/uplo)', function t() {
	const transrs = [ 'no-transpose', 'transpose' ];
	const norms = [ 'max', 'one-norm', 'inf-norm' ];
	const uplos = [ 'upper', 'lower' ];
	const sizes = [ 4, 5 ];
	let dense;
	let ARF;
	let N;
	let a;
	let b;
	let c;
	let d;
	for ( d = 0; d < sizes.length; d++ ) {
		N = sizes[ d ];
		dense = denseSymmetric( N );

		// Poison the last diagonal entry, so the NaN lands in a work slot other than the first:
		dense[ ( N * N ) - 1 ] = NaN;
		for ( a = 0; a < transrs.length; a++ ) {
			for ( b = 0; b < uplos.length; b++ ) {
				ARF = toRFP( transrs[ a ], uplos[ b ], N, dense );
				for ( c = 0; c < norms.length; c++ ) {
					assert.ok( Number.isNaN( dlansf( norms[ c ], transrs[ a ], uplos[ b ], N, ARF, 1, 0, new Float64Array( N ), 1, 0 ) ), format( 'N=%d %s %s %s is NaN', N, transrs[ a ], uplos[ b ], norms[ c ] ) );
				}
			}
		}
	}
});

test( 'dlansf: an unrecognized norm throws; base.js returns zero, as the reference does (ticket 0092)', function t() {
	const ARF = toRFP( 'no-transpose', 'upper', 3, denseSymmetric( 3 ) );
	const WORK = new Float64Array( 3 );
	assert.strictEqual( base( 'not-a-norm', 'no-transpose', 'upper', 3, ARF, 1, 0, WORK, 1, 0 ), 0.0, 'base.js returns 0, as the reference does' );
	assert.throws( function throws() {
		dlansf( 'not-a-norm', 'no-transpose', 'upper', 3, ARF, 1, 0, WORK, 1, 0 );
	}, TypeError );
	assert.deepStrictEqual( Array.from( WORK ), [ 0.0, 0.0, 0.0 ], 'WORK untouched' );
	assert.ok( denseNorm( 'max', 3, denseSymmetric( 3 ) ) > 0.0, 'the matrix itself is nonzero' );
});
