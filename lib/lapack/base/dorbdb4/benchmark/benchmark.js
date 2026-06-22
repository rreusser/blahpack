/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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

/* eslint-disable max-len */

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import dorbdb4 from './../lib/dorbdb4.js';


// FUNCTIONS //

/**
* Build orthonormal-column inputs of size `M`-by-`Q` with `Q = 3M/4` and `P = M/2`, so the variant-4 dimension constraint `M-Q <= min(P, M-P, Q)` is comfortably satisfied (`M/4 <= M/2`).
*
* @private
* @param {PositiveInteger} M - total number of rows
* @returns {Object} packed inputs (X11, X21, THETA, PHI, TAU*, PHANTOM, WORK, P, Q)
*/
function makeInputs( M ) {
	var pass;
	var X11;
	var X21;
	var dot;
	var A;
	var P;
	var Q;
	var i;
	var j;
	var k;

	P = M >> 1;
	Q = ( ( 3 * M ) >> 2 );
	A = new Float64Array( M * Q );
	for ( j = 0; j < Q; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ i + ( j * M ) ] = Math.sin( ( ( i + 1 ) * 17 ) + ( ( j + 1 ) * 31 ) );
		}
	}
	for ( pass = 0; pass < 2; pass++ ) {
		for ( j = 0; j < Q; j++ ) {
			for ( i = 0; i < j; i++ ) {
				dot = 0;
				for ( k = 0; k < M; k++ ) {
					dot += A[ k + ( i * M ) ] * A[ k + ( j * M ) ];
				}
				for ( k = 0; k < M; k++ ) {
					A[ k + ( j * M ) ] -= dot * A[ k + ( i * M ) ];
				}
			}
			dot = 0;
			for ( k = 0; k < M; k++ ) {
				dot += A[ k + ( j * M ) ] * A[ k + ( j * M ) ];
			}
			dot = Math.sqrt( dot );
			for ( k = 0; k < M; k++ ) {
				A[ k + ( j * M ) ] /= dot;
			}
		}
	}
	X11 = new Float64Array( P * Q );
	X21 = new Float64Array( ( M - P ) * Q );
	for ( j = 0; j < Q; j++ ) {
		for ( i = 0; i < P; i++ ) {
			X11[ i + ( j * P ) ] = A[ i + ( j * M ) ];
		}
		for ( i = 0; i < M - P; i++ ) {
			X21[ i + ( j * ( M - P ) ) ] = A[ ( P + i ) + ( j * M ) ];
		}
	}
	return {
		'P': P,
		'Q': Q,
		'X11': X11,
		'X21': X21,
		'THETA': new Float64Array( Q ),
		'PHI': new Float64Array( Math.max( 1, Q - 1 ) ),
		'TAUP1': new Float64Array( Math.max( 1, M - Q ) ),
		'TAUP2': new Float64Array( Math.max( 1, M - Q ) ),
		'TAUQ1': new Float64Array( Q ),
		'PHANTOM': new Float64Array( M ),
		'WORK': new Float64Array( Q + 1 )
	};
}

/**
* Creates a benchmark function for a given `M`.
*
* @private
* @param {PositiveInteger} M - total number of rows
* @returns {Function} benchmark function
*/
function createBenchmark( M ) {
	var ins;

	ins = makeInputs( M );
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var info;
		var X11;
		var X21;
		var i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			X11 = new Float64Array( ins.X11 );
			X21 = new Float64Array( ins.X21 );
			info = dorbdb4( 'column-major', M, ins.P, ins.Q, X11, ins.P, X21, M - ins.P, ins.THETA, 1, ins.PHI, 1, ins.TAUP1, 1, ins.TAUP2, 1, ins.TAUQ1, 1, ins.PHANTOM, 1, ins.WORK, 1 );
			if ( info !== 0 ) {
				b.fail( 'expected info=0' );
			}
		}
		b.toc();
		b.pass( 'benchmark finished' );
		b.end();
	}
}


// MAIN //

/**
* Main execution sequence.
*
* @private
*/
function main() {
	var f;
	var i;
	var M;

	for ( i = 1; i <= 2; i++ ) {
		M = pow( 4, i + 1 ); // M = 16, 64
		f = createBenchmark( M );
		bench( format( '%s:M=%d', pkg, M ), f );
	}
}

main();
