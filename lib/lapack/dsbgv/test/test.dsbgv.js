/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsbgv from './../lib/dsbgv.js';
import strided from './../lib/strided.js';

// FIXTURES //

import upper_n5_ka2_kb1_ev from './fixtures/upper_n5_ka2_kb1_ev.json' with { type: 'json' };
import lower_n5_ka2_kb1_ev from './fixtures/lower_n5_ka2_kb1_ev.json' with { type: 'json' };


// VARIABLES //

const A_DIAGS = [ [ 10.0, 8.0, 6.0, 9.0, 7.0 ], [ 1.0, 2.0, 1.5, 1.0 ], [ 0.5, 0.3, 0.4 ] ];
const B_DIAGS = [ [ 4.0, 5.0, 3.0, 6.0, 4.0 ], [ 0.2, 0.3, 0.1, 0.2 ] ];


// FUNCTIONS //

/**
* Builds symmetric band storage from a list of diagonals.
*
* @private
* @param {string} order - storage layout
* @param {string} uplo - which triangle is stored
* @param {NonNegativeInteger} N - matrix order
* @param {NonNegativeInteger} k - bandwidth
* @param {PositiveInteger} LD - leading dimension
* @param {Array<Array<number>>} diags - `diags[d][j]` is element `(j, j+d)`
* @returns {Float64Array} band storage
*/
function band( order, uplo, N, k, LD, diags ) {
	const out = new Float64Array( ( order === 'column-major' ) ? LD * N : LD * ( k + 1 ) );
	let row;
	let col;
	let d;
	let j;
	for ( d = 0; d <= k; d++ ) {
		for ( j = 0; j < N - d; j++ ) {
			if ( uplo === 'upper' ) {
				row = k - d;
				col = j + d;
			} else {
				row = d;
				col = j;
			}
			if ( order === 'column-major' ) {
				out[ row + ( col * LD ) ] = diags[ d ][ j ];
			} else {
				out[ ( row * LD ) + col ] = diags[ d ][ j ];
			}
		}
	}
	return out;
}

/**
* Asserts that two arrays are bitwise equal.
*
* @private
* @param {Float64Array} actual - actual values
* @param {Float64Array} expected - expected values
* @param {string} msg - assertion message
*/
function assertSame( actual, expected, msg ) {
	let i;
	assert.strictEqual( actual.length, expected.length, msg + ': length' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.strictEqual( actual[ i ], expected[ i ], msg + '[' + i + ']' );
	}
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {Float64Array} actual - actual values
* @param {Array<number>} expected - expected values
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, msg ) {
	let i;
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok( Math.abs( actual[ i ] - expected[ i ] ) <= 1e-13 * Math.max( 1.0, Math.abs( expected[ i ] ) ), msg + '[' + i + ']' );
	}
}

/**
* Copies an N-by-N matrix into column-major order.
*
* @private
* @param {Float64Array} Z - matrix
* @param {NonNegativeInteger} N - order
* @param {integer} s1 - row stride
* @param {integer} s2 - column stride
* @returns {Array<number>} column-major copy
*/
function colMajor( Z, N, s1, s2 ) {
	const out = [];
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			out.push( Z[ ( i * s1 ) + ( j * s2 ) ] );
		}
	}
	return out;
}

/**
* Calls the wrapper with otherwise-valid arguments, overriding some.
*
* @private
* @param {Object} o - overrides
* @returns {integer} info
*/
function call( o ) {
	const a = {
		'order': 'column-major',
		'jobz': 'compute-vectors',
		'uplo': 'upper',
		'N': 2,
		'ka': 1,
		'kb': 1,
		'LDAB': 2,
		'LDBB': 2,
		'LDZ': 2
	};
	Object.assign( a, o );
	const n = Math.max( 1, a.N );
	// Each array sized for the call; WORK at the reference's 3*N (DSBGV's WORK( 3*N )).
	return dsbgv( a.order, a.jobz, a.uplo, a.N, a.ka, a.kb, new Float64Array( Math.max( 8, a.LDAB * n ) ), a.LDAB, new Float64Array( Math.max( 8, a.LDBB * n ) ), a.LDBB, new Float64Array( n ), 1, new Float64Array( Math.max( 8, a.LDZ * n ) ), a.LDZ, new Float64Array( Math.max( 8, 3 * n ) ) );
}




// TESTS //

test( 'dsbgv is a function', function t() {
	assert.strictEqual( typeof dsbgv, 'function', 'is a function' );
});

test( 'dsbgv has expected arity', function t() {
	assert.strictEqual( dsbgv.length, 15, 'has expected arity' );
});

test( 'dsbgv baseline arguments used by the throw tests are valid', function t() {
	assert.doesNotThrow( function noThrow() {
		call( {} );
	});
	assert.doesNotThrow( function noThrow() {
		call( { 'order': 'row-major', 'N': 3, 'LDAB': 3, 'LDBB': 3, 'LDZ': 3 } );
	});
	assert.doesNotThrow( function noThrow() {
		call( { 'LDZ': 1, 'N': 2, 'jobz': 'no-vectors' } );
	});
});

test( 'dsbgv throws TypeError for an invalid order', function t() {
	assert.throws( function throws() {
		call( { 'order': 'invalid' } );
	}, TypeError );
});

test( 'dsbgv throws TypeError for an invalid jobz', function t() {
	assert.throws( function throws() {
		call( { 'jobz': 'invalid' } );
	}, TypeError );
});

test( 'dsbgv throws TypeError for an invalid uplo', function t() {
	assert.throws( function throws() {
		call( { 'uplo': 'invalid' } );
	}, TypeError );
});

test( 'dsbgv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		call( { 'N': -1 } );
	}, RangeError );
});

test( 'dsbgv throws RangeError for negative ka', function t() {
	assert.throws( function throws() {
		call( { 'ka': -1 } );
	}, RangeError );
});

test( 'dsbgv throws RangeError for kb out of range', function t() {
	assert.throws( function throws() {
		call( { 'kb': -1 } );
	}, RangeError );
	assert.throws( function throws() {
		call( { 'kb': 2 } );
	}, RangeError );
});

test( 'dsbgv throws RangeError for LDAB too small', function t() {
	assert.throws( function throws() {
		call( { 'LDAB': 1 } );
	}, RangeError );
	assert.throws( function throws() {
		call( { 'order': 'row-major', 'N': 3, 'LDAB': 2, 'LDBB': 3, 'LDZ': 3 } );
	}, RangeError );
});

test( 'dsbgv throws RangeError for LDBB too small', function t() {
	assert.throws( function throws() {
		call( { 'LDBB': 1 } );
	}, RangeError );
	assert.throws( function throws() {
		call( { 'order': 'row-major', 'N': 3, 'LDAB': 3, 'LDBB': 2, 'LDZ': 3 } );
	}, RangeError );
});

test( 'dsbgv throws RangeError for LDZ too small', function t() {
	assert.throws( function throws() {
		call( { 'LDZ': 1 } );
	}, RangeError );
	assert.throws( function throws() {
		call( { 'LDZ': 0, 'jobz': 'no-vectors' } );
	}, RangeError );
});

test( 'dsbgv matches strided and the Fortran fixtures for both layouts and triangles (WORK provided and null)', function t() {
	const fixtures = {
		'upper': upper_n5_ka2_kb1_ev,
		'lower': lower_n5_ka2_kb1_ev
	};
	const orders = [ 'column-major', 'row-major' ];
	const uplos = [ 'upper', 'lower' ];
	const works = [ true, false ];
	const N = 5;
	let LDAB;
	let LDBB;
	let order;
	let infoA;
	let infoE;
	let uplo;
	let ABa;
	let ABe;
	let BBa;
	let BBe;
	let wa;
	let we;
	let Za;
	let Ze;
	let s1;
	let s2;
	let i;
	let j;
	let k;
	for ( i = 0; i < orders.length; i++ ) {
		order = orders[ i ];
		for ( j = 0; j < uplos.length; j++ ) {
			uplo = uplos[ j ];
			for ( k = 0; k < works.length; k++ ) {
				LDAB = ( order === 'column-major' ) ? 3 : N;
				LDBB = ( order === 'column-major' ) ? 2 : N;
				ABa = band( order, uplo, N, 2, LDAB, A_DIAGS );
				ABe = band( order, uplo, N, 2, LDAB, A_DIAGS );
				BBa = band( order, uplo, N, 1, LDBB, B_DIAGS );
				BBe = band( order, uplo, N, 1, LDBB, B_DIAGS );
				wa = new Float64Array( N );
				we = new Float64Array( N );
				Za = new Float64Array( N * N );
				Ze = new Float64Array( N * N );
				infoA = dsbgv( order, 'compute-vectors', uplo, N, 2, 1, ABa, LDAB, BBa, LDBB, wa, 1, Za, N, ( works[ k ] ) ? new Float64Array( 3 * N ) : null );
				if ( order === 'column-major' ) {
					infoE = strided( 'compute-vectors', uplo, N, 2, 1, ABe, 1, LDAB, 0, BBe, 1, LDBB, 0, we, 1, 0, Ze, 1, N, 0, new Float64Array( 3 * N ), 1, 0 );
					s1 = 1;
					s2 = N;
				} else {
					infoE = strided( 'compute-vectors', uplo, N, 2, 1, ABe, LDAB, 1, 0, BBe, LDBB, 1, 0, we, 1, 0, Ze, N, 1, 0, new Float64Array( 3 * N ), 1, 0 );
					s1 = N;
					s2 = 1;
				}
				assert.strictEqual( infoA, 0, 'info' );
				assert.strictEqual( infoA, infoE, 'info matches strided' );
				assertSame( wa, we, order + ' ' + uplo + ' w' );
				assertSame( Za, Ze, order + ' ' + uplo + ' Z' );
				assertSame( ABa, ABe, order + ' ' + uplo + ' AB' );
				assertSame( BBa, BBe, order + ' ' + uplo + ' BB' );
				assertClose( wa, fixtures[ uplo ].W, order + ' ' + uplo + ' w vs fixture' );
				assertClose( colMajor( Za, N, s1, s2 ), fixtures[ uplo ].Z, order + ' ' + uplo + ' Z vs fixture' );
			}
		}
	}
});
