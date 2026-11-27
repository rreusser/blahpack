/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytri2x from './../lib/dsytri2x.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
const fixture = readFileSync( path.join( fixtureDir, 'dsytri2x.jsonl' ), 'utf8' ).trim().split( '\n' ).map( function parse( line ) { // eslint-disable-line max-len
	return JSON.parse( line );
});


// TESTS //

test( 'dsytri2x is a function', function t() {
	assert.strictEqual( typeof dsytri2x, 'function', 'is a function' );
});

test( 'dsytri2x has expected arity', function t() {
	assert.strictEqual( dsytri2x.length, 9, 'has expected arity' );
});

test( 'dsytri2x throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsytri2x( 'invalid', 'upper', 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dsytri2x throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsytri2x( 'row-major', 'invalid', 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dsytri2x throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsytri2x( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dsytri2x: WORK=null allocates the full (N+nb+1)-by-(nb+3) workspace (matches ndarray; ticket 0074)', function t() {
	const cases = [ [ '4x4_lower_def_nb2', 'lower', 4, 2 ], [ '4x4_upper_indef_nb2', 'upper', 4, 2 ], [ '5x5_lower_mixed_nb3', 'lower', 5, 3 ], [ '5x5_upper_mixed_nb2', 'upper', 5, 2 ] ]; // eslint-disable-line max-len
	cases.forEach( function run( c ) {
		let i;
		const tc = fixture.find( function find( r ) {
			return r.name === c[ 0 ];
		});
		const N = c[ 2 ];
		const nb = c[ 3 ];
		const ipiv = new Int32Array( tc.ipiv.length );
		for ( i = 0; i < ipiv.length; i++ ) {
			ipiv[ i ] = ( tc.ipiv[ i ] > 0 ) ? ( tc.ipiv[ i ] - 1 ) : tc.ipiv[ i ];
		}
		const A1 = new Float64Array( tc.a_factored );
		const A2 = new Float64Array( tc.a_factored );
		const info1 = dsytri2x( 'column-major', c[ 1 ], N, A1, N, ipiv, 1, null, nb ); // eslint-disable-line max-len
		const info2 = ndarray( c[ 1 ], N, A2, 1, N, 0, ipiv, 1, 0, new Float64Array( ( N + nb + 1 ) * ( nb + 3 ) ), 1, 0, nb ); // eslint-disable-line max-len
		assert.strictEqual( info1, info2, c[ 0 ] + ': info' );
		for ( i = 0; i < A2.length; i++ ) {
			assert.strictEqual( A1[ i ], A2[ i ], c[ 0 ] + ': A[' + i + ']' );
		}
	});
});
