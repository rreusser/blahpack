/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsbgvx from './../lib/dsbgvx.js';
import ndarray from './../lib/ndarray.js';

// FIXTURES //

import v_a_u_n5_ka2_kb1 from './fixtures/v_a_u_n5_ka2_kb1.json' with { type: 'json' };
import v_a_l_n5_ka2_kb1 from './fixtures/v_a_l_n5_ka2_kb1.json' with { type: 'json' };
import v_i_u_n5_ka2_kb1 from './fixtures/v_i_u_n5_ka2_kb1.json' with { type: 'json' };


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
* @param {Collection} actual - actual values
* @param {Collection} expected - expected values
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
* @param {Collection} actual - actual values
* @param {Array<number>} expected - expected values
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, msg ) {
	let i;
	assert.strictEqual( actual.length, expected.length, msg + ': length' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok( Math.abs( actual[ i ] - expected[ i ] ) <= 1e-13 * Math.max( 1.0, Math.abs( expected[ i ] ) ), msg + '[' + i + ']' );
	}
}

/**
* Copies an N-by-M matrix into a column-major array.
*
* @private
* @param {Float64Array} Z - matrix
* @param {NonNegativeInteger} N - rows
* @param {NonNegativeInteger} M - columns
* @param {integer} s1 - row stride
* @param {integer} s2 - column stride
* @returns {Array<number>} column-major copy
*/
function colMajor( Z, N, M, s1, s2 ) {
	const out = [];
	let i;
	let j;
	for ( j = 0; j < M; j++ ) {
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
		'range': 'all',
		'uplo': 'upper',
		'N': 2,
		'ka': 1,
		'kb': 1,
		'LDAB': 2,
		'LDBB': 2,
		'LDQ': 2,
		'vl': 0.0,
		'vu': 1.0,
		'il': 1,
		'iu': 2,
		'LDZ': 2
	};
	Object.assign( a, o );
	return dsbgvx( a.order, a.jobz, a.range, a.uplo, a.N, a.ka, a.kb, new Float64Array( 16 ), a.LDAB, new Float64Array( 16 ), a.LDBB, new Float64Array( 16 ), a.LDQ, a.vl, a.vu, a.il, a.iu, 0.0, new Int32Array( 1 ), new Float64Array( 4 ), 1, new Float64Array( 16 ), a.LDZ, new Float64Array( 32 ), new Int32Array( 32 ), new Int32Array( 4 ), 1 );
}



// TESTS //

test( 'dsbgvx is a function', function t() {
	assert.strictEqual( typeof dsbgvx, 'function', 'is a function' );
});

test( 'dsbgvx has expected arity', function t() {
	assert.strictEqual( dsbgvx.length, 27, 'has expected arity' );
});

test( 'dsbgvx baseline arguments used by the throw tests are valid', function t() {
	assert.doesNotThrow( function noThrow() {
		call( {} );
	});
	assert.doesNotThrow( function noThrow() {
		call( { 'order': 'row-major', 'N': 3, 'LDAB': 3, 'LDBB': 3, 'LDQ': 3, 'LDZ': 3 } );
	});
	assert.doesNotThrow( function noThrow() {
		call( { 'order': 'row-major', 'N': 3, 'LDAB': 3, 'LDBB': 3, 'LDQ': 3, 'range': 'index', 'il': 2, 'iu': 3, 'LDZ': 2 } );
	});
	assert.doesNotThrow( function noThrow() {
		call( { 'range': 'value', 'vl': 0.0, 'vu': 1.0 } );
	});
});

test( 'dsbgvx throws TypeError for an invalid order', function t() {
	assert.throws( function throws() {
		call( { 'order': 'invalid' } );
	}, TypeError );
});

test( 'dsbgvx throws TypeError for an invalid jobz', function t() {
	assert.throws( function throws() {
		call( { 'jobz': 'invalid' } );
	}, TypeError );
});

test( 'dsbgvx throws TypeError for an invalid range', function t() {
	assert.throws( function throws() {
		call( { 'range': 'invalid' } );
	}, TypeError );
});

test( 'dsbgvx throws TypeError for an invalid uplo', function t() {
	assert.throws( function throws() {
		call( { 'uplo': 'invalid' } );
	}, TypeError );
});

test( 'dsbgvx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		call( { 'N': -1 } );
	}, RangeError );
});

test( 'dsbgvx throws RangeError for negative ka', function t() {
	assert.throws( function throws() {
		call( { 'ka': -1 } );
	}, RangeError );
});

test( 'dsbgvx throws RangeError for kb out of range', function t() {
	assert.throws( function throws() {
		call( { 'kb': -1 } );
	}, RangeError );
	assert.throws( function throws() {
		call( { 'kb': 2 } );
	}, RangeError );
});

test( 'dsbgvx throws RangeError for LDAB too small', function t() {
	assert.throws( function throws() {
		call( { 'LDAB': 1 } );
	}, RangeError );
	assert.throws( function throws() {
		call( { 'order': 'row-major', 'N': 3, 'LDAB': 2, 'LDBB': 3, 'LDQ': 3, 'LDZ': 3 } );
	}, RangeError );
});

test( 'dsbgvx throws RangeError for LDBB too small', function t() {
	assert.throws( function throws() {
		call( { 'LDBB': 1 } );
	}, RangeError );
	assert.throws( function throws() {
		call( { 'order': 'row-major', 'N': 3, 'LDAB': 3, 'LDBB': 2, 'LDQ': 3, 'LDZ': 3 } );
	}, RangeError );
});

test( 'dsbgvx throws RangeError for LDQ too small', function t() {
	assert.throws( function throws() {
		call( { 'LDQ': 1 } );
	}, RangeError );
	assert.throws( function throws() {
		call( { 'LDQ': 0, 'jobz': 'no-vectors' } );
	}, RangeError );
});

test( 'dsbgvx throws RangeError for an empty value range', function t() {
	assert.throws( function throws() {
		call( { 'range': 'value', 'vl': 1.0, 'vu': 1.0 } );
	}, RangeError );
});

test( 'dsbgvx throws RangeError for il out of range', function t() {
	assert.throws( function throws() {
		call( { 'range': 'index', 'il': 0, 'iu': 1 } );
	}, RangeError );
	assert.throws( function throws() {
		call( { 'range': 'index', 'il': 3, 'iu': 2 } );
	}, RangeError );
});

test( 'dsbgvx throws RangeError for iu out of range', function t() {
	assert.throws( function throws() {
		call( { 'range': 'index', 'il': 2, 'iu': 1 } );
	}, RangeError );
	assert.throws( function throws() {
		call( { 'range': 'index', 'il': 1, 'iu': 3 } );
	}, RangeError );
});

test( 'dsbgvx throws RangeError for LDZ too small', function t() {
	assert.throws( function throws() {
		call( { 'LDZ': 1 } );
	}, RangeError );
	assert.throws( function throws() {
		call( { 'LDZ': 0, 'jobz': 'no-vectors' } );
	}, RangeError );
	assert.throws( function throws() {
		call( { 'order': 'row-major', 'N': 3, 'LDAB': 3, 'LDBB': 3, 'LDQ': 3, 'LDZ': 2 } );
	}, RangeError );
	assert.throws( function throws() {
		call( { 'order': 'row-major', 'N': 3, 'LDAB': 3, 'LDBB': 3, 'LDQ': 3, 'range': 'index', 'il': 1, 'iu': 3, 'LDZ': 2 } );
	}, RangeError );
	assert.throws( function throws() {
		call( { 'order': 'row-major', 'jobz': 'no-vectors', 'N': 3, 'LDAB': 3, 'LDBB': 3, 'LDQ': 3, 'LDZ': 0 } );
	}, RangeError );
});

test( 'dsbgvx matches ndarray and the Fortran fixtures for both layouts (WORK/IWORK provided and null)', function t() {
	const cases = [
		[ 'all', 'upper', 1, 5, v_a_u_n5_ka2_kb1 ],
		[ 'all', 'lower', 1, 5, v_a_l_n5_ka2_kb1 ],
		[ 'index', 'upper', 2, 4, v_i_u_n5_ka2_kb1 ]
	];
	const orders = [ 'column-major', 'row-major' ];
	const N = 5;
	let IFAILa;
	let IFAILe;
	let order;
	let infoA;
	let infoE;
	let range;
	let uplo;
	let LDAB;
	let LDBB;
	let LDZ;
	let ABa;
	let ABe;
	let BBa;
	let BBe;
	let ma;
	let me;
	let wa;
	let we;
	let Qa;
	let Qe;
	let Za;
	let Ze;
	let tc;
	let il;
	let iu;
	let ZM;
	let s1;
	let s2;
	let c;
	let i;
	let k;
	for ( i = 0; i < orders.length; i++ ) {
		order = orders[ i ];
		for ( c = 0; c < cases.length; c++ ) {
			range = cases[ c ][ 0 ];
			uplo = cases[ c ][ 1 ];
			il = cases[ c ][ 2 ];
			iu = cases[ c ][ 3 ];
			tc = cases[ c ][ 4 ];
			ZM = ( range === 'index' ) ? iu - il + 1 : N;
			for ( k = 0; k < 2; k++ ) {
				LDAB = ( order === 'column-major' ) ? 3 : N;
				LDBB = ( order === 'column-major' ) ? 2 : N;
				LDZ = ( order === 'column-major' ) ? N : ZM;
				ABa = band( order, uplo, N, 2, LDAB, A_DIAGS );
				ABe = band( order, uplo, N, 2, LDAB, A_DIAGS );
				BBa = band( order, uplo, N, 1, LDBB, B_DIAGS );
				BBe = band( order, uplo, N, 1, LDBB, B_DIAGS );
				Qa = new Float64Array( N * N );
				Qe = new Float64Array( N * N );
				Za = new Float64Array( N * ZM );
				Ze = new Float64Array( N * ZM );
				wa = new Float64Array( N );
				we = new Float64Array( N );
				ma = new Int32Array( 1 );
				me = new Int32Array( 1 );
				IFAILa = new Int32Array( N );
				IFAILe = new Int32Array( N );
				if ( k === 0 ) {
					infoA = dsbgvx( order, 'compute-vectors', range, uplo, N, 2, 1, ABa, LDAB, BBa, LDBB, Qa, N, 0.0, 0.0, il, iu, 0.0, ma, wa, 1, Za, LDZ, new Float64Array( 7 * N ), new Int32Array( 5 * N ), IFAILa, 1 );
				} else {
					infoA = dsbgvx( order, 'compute-vectors', range, uplo, N, 2, 1, ABa, LDAB, BBa, LDBB, Qa, N, 0.0, 0.0, il, iu, 0.0, ma, wa, 1, Za, LDZ, null, null, IFAILa, 1 );
				}
				if ( order === 'column-major' ) {
					infoE = ndarray( 'compute-vectors', range, uplo, N, 2, 1, ABe, 1, LDAB, 0, BBe, 1, LDBB, 0, Qe, 1, N, 0, 0.0, 0.0, il, iu, 0.0, me, we, 1, 0, Ze, 1, LDZ, 0, new Float64Array( 7 * N ), 1, 0, new Int32Array( 5 * N ), 1, 0, IFAILe, 1, 0 );
					s1 = 1;
					s2 = LDZ;
				} else {
					infoE = ndarray( 'compute-vectors', range, uplo, N, 2, 1, ABe, LDAB, 1, 0, BBe, LDBB, 1, 0, Qe, N, 1, 0, 0.0, 0.0, il, iu, 0.0, me, we, 1, 0, Ze, LDZ, 1, 0, new Float64Array( 7 * N ), 1, 0, new Int32Array( 5 * N ), 1, 0, IFAILe, 1, 0 );
					s1 = LDZ;
					s2 = 1;
				}
				assert.strictEqual( infoA, tc.info, 'info' );
				assert.strictEqual( infoA, infoE, 'info matches ndarray' );
				assert.strictEqual( ma[ 0 ], tc.M, 'M' );
				assert.strictEqual( ma[ 0 ], me[ 0 ], 'M matches ndarray' );
				assertSame( wa, we, order + ' ' + range + ' ' + uplo + ' w' );
				assertSame( Za, Ze, order + ' ' + range + ' ' + uplo + ' Z' );
				assertSame( Qa, Qe, order + ' ' + range + ' ' + uplo + ' Q' );
				assertSame( IFAILa, IFAILe, order + ' ' + range + ' ' + uplo + ' IFAIL' );
				assertClose( Array.prototype.slice.call( wa, 0, ma[ 0 ] ), tc.W, order + ' ' + range + ' ' + uplo + ' w vs fixture' );
				assertClose( colMajor( Za, N, ma[ 0 ], s1, s2 ), tc.Z, order + ' ' + range + ' ' + uplo + ' Z vs fixture' );
			}
		}
	}
});
