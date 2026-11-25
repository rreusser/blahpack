/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zunbdb4 from './../lib/zunbdb4.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const fixture = readFileSync( path.join( fixtureDir, 'zunbdb4.jsonl' ), 'utf8' ).trim().split( '\n' ).map( function parse( line ) { // eslint-disable-line node/no-sync
	return JSON.parse( line );
});


// TESTS //

test( 'zunbdb4 is a function', function t() {
	assert.strictEqual( typeof zunbdb4, 'function', 'is a function' );
});

test( 'zunbdb4 has expected arity', function t() {
	assert.strictEqual( zunbdb4.length, 21, 'has expected arity' );
});

test( 'zunbdb4 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zunbdb4( 'invalid', 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ) );
	}, TypeError );
});

test( 'zunbdb4 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zunbdb4( 'column-major', -1, 0, 0, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ) );
	}, RangeError );
});

test( 'zunbdb4 throws RangeError when P < M-Q', function t() {
	assert.throws( function throws() {
		// M=8, Q=4, M-Q=4, P=2 violates P >= M-Q
		zunbdb4( 'column-major', 8, 2, 4, new Complex128Array( 16 ), 8, new Complex128Array( 16 ), 8, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 8 ), 1, new Complex128Array( 8 ) );
	}, RangeError );
});

test( 'zunbdb4 throws RangeError when M-Q > Q', function t() {
	assert.throws( function throws() {
		// M=4, Q=1, M-Q=3 > Q=1 violates M-Q <= Q
		zunbdb4( 'column-major', 4, 2, 1, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'zunbdb4 throws RangeError when Q > M', function t() {
	assert.throws( function throws() {
		// M=4, P=4, Q=5: Q > M violates Q <= M
		zunbdb4( 'column-major', 4, 4, 5, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4, new Float64Array( 5 ), 1, new Float64Array( 5 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 5 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 8 ) );
	}, RangeError );
});

test( 'zunbdb4 throws RangeError for invalid LDX11 (column-major)', function t() {
	assert.throws( function throws() {
		// LDX11=2 < P=4 in column-major layout
		zunbdb4( 'column-major', 8, 4, 6, new Complex128Array( 32 ), 2, new Complex128Array( 32 ), 8, new Float64Array( 6 ), 1, new Float64Array( 6 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 6 ), 1, new Complex128Array( 8 ), 1, new Complex128Array( 16 ) );
	}, RangeError );
});

test( 'zunbdb4 throws RangeError for invalid LDX21 (column-major)', function t() {
	assert.throws( function throws() {
		// LDX21=1 < M-P=4 in column-major layout
		zunbdb4( 'column-major', 8, 4, 6, new Complex128Array( 32 ), 8, new Complex128Array( 32 ), 1, new Float64Array( 6 ), 1, new Float64Array( 6 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 6 ), 1, new Complex128Array( 8 ), 1, new Complex128Array( 16 ) );
	}, RangeError );
});

test( 'zunbdb4 throws RangeError for invalid LDX11 (row-major)', function t() {
	assert.throws( function throws() {
		// LDX11=2 < Q=6 in row-major layout
		zunbdb4( 'row-major', 8, 4, 6, new Complex128Array( 32 ), 2, new Complex128Array( 32 ), 6, new Float64Array( 6 ), 1, new Float64Array( 6 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 6 ), 1, new Complex128Array( 8 ), 1, new Complex128Array( 16 ) );
	}, RangeError );
});

test( 'zunbdb4 throws RangeError for invalid LDX21 (row-major)', function t() {
	assert.throws( function throws() {
		// LDX21=1 < Q=6 in row-major layout
		zunbdb4( 'row-major', 8, 4, 6, new Complex128Array( 32 ), 6, new Complex128Array( 32 ), 1, new Float64Array( 6 ), 1, new Float64Array( 6 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 6 ), 1, new Complex128Array( 8 ), 1, new Complex128Array( 16 ) );
	}, RangeError );
});

test( 'zunbdb4 column-major: M=Q=0 degenerate succeeds', function t() {
	const X = new Complex128Array( 1 );
	const Y = new Float64Array( 1 );
	const info = zunbdb4( 'column-major', 0, 0, 0, X, 1, X, 1, Y, 1, Y, 1, X, 1, X, 1, X, 1, X, 1, X );
	assert.strictEqual( info, 0, 'info' );
});

test( 'zunbdb4 row-major: M=Q=0 degenerate succeeds', function t() {
	const X = new Complex128Array( 1 );
	const Y = new Float64Array( 1 );
	const info = zunbdb4( 'row-major', 0, 0, 0, X, 1, X, 1, Y, 1, Y, 1, X, 1, X, 1, X, 1, X, 1, X );
	assert.strictEqual( info, 0, 'info' );
});

test( 'zunbdb4: WORK=null allocates enough workspace (matches ndarray with ample WORK; ticket 0074)', function t() {
	// [ name, M, P, Q ]: the reference LWORKMIN = max(Q-1, P-1, M-P-1, Q) + 1 exceeds M-Q:
	const cases = [ [ 'basic_8x4x6', 8, 4, 6 ], [ 'm10_p5_q7', 10, 5, 7 ], [ 'p_small_q_large', 10, 4, 8 ], [ 'm_eq_q_no_phantom', 4, 2, 4 ] ];
	cases.forEach( function run( c ) {
		const tc = fixture.find( function find( r ) {
			return r.name === c[ 0 ];
		});
		const M = c[ 1 ];
		const P = c[ 2 ];
		const Q = c[ 3 ];
		const out = [ 0, 1 ].map( function call( k ) {
			const r = {
				'X11': new Complex128Array( new Float64Array( tc.X11in ) ),
				'X21': new Complex128Array( new Float64Array( tc.X21in ) ),
				'THETA': new Float64Array( Q ),
				'PHI': new Float64Array( Q ),
				'TAUP1': new Complex128Array( M ),
				'TAUP2': new Complex128Array( M ),
				'TAUQ1': new Complex128Array( Q ),
				'PHANTOM': new Complex128Array( M )
			};
			if ( k === 0 ) {
				r.info = zunbdb4( 'column-major', M, P, Q, r.X11, P, r.X21, M - P, r.THETA, 1, r.PHI, 1, r.TAUP1, 1, r.TAUP2, 1, r.TAUQ1, 1, r.PHANTOM, 1, null );
			} else {
				r.info = ndarray( M, P, Q, r.X11, 1, P, 0, r.X21, 1, M - P, 0, r.THETA, 1, 0, r.PHI, 1, 0, r.TAUP1, 1, 0, r.TAUP2, 1, 0, r.TAUQ1, 1, 0, r.PHANTOM, 1, 0, new Complex128Array( 4 * M ), 1, 0 );
			}
			return r;
		});
		assert.strictEqual( out[ 0 ].info, out[ 1 ].info, c[ 0 ] + ': info' );
		[ 'X11', 'X21', 'THETA', 'PHI', 'TAUP1', 'TAUP2', 'TAUQ1', 'PHANTOM' ].forEach( function cmp( key ) {
			const a = ( key === 'THETA' || key === 'PHI' ) ? out[ 0 ][ key ] : reinterpret( out[ 0 ][ key ], 0 );
			const e = ( key === 'THETA' || key === 'PHI' ) ? out[ 1 ][ key ] : reinterpret( out[ 1 ][ key ], 0 );
			let i;
			for ( i = 0; i < e.length; i++ ) {
				assert.strictEqual( a[ i ], e[ i ], c[ 0 ] + ': ' + key + '[' + i + ']' );
			}
		});
		assert.ok( out[ 0 ].THETA[ 0 ] === out[ 0 ].THETA[ 0 ], c[ 0 ] + ': THETA finite' );
	});
});
