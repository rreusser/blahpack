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

/* eslint-disable max-len */

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import dorbdb3 from './../lib/dorbdb3.js';


// FUNCTIONS //

/**
* Builds orthonormal-column inputs of size `M`-by-`Q` with `P = 3*M/4` and `Q = M/2`. The dorbdb3 partition requires `M-P <= min(P, Q, M-Q)`, here `M/4 <= min(3M/4, M/2, M/2) = M/2`.
*
* @private
* @param {PositiveInteger} M - total number of rows
* @returns {Object} packed inputs (`X11`, `X21`, `THETA`, `PHI`, `TAU*`, `WORK`, `P`, `Q`)
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

	P = ( M * 3 ) >> 2;
	Q = M >> 1;
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
	// Allocate X11 and X21 with matching leading dimension `M` so that DROT in dorbdb3 (which uses LDX11 for both X11 and X21 row strides — see LEARNINGS.md) operates correctly.
	X11 = new Float64Array( M * Q );
	X21 = new Float64Array( M * Q );
	for ( j = 0; j < Q; j++ ) {
		for ( i = 0; i < P; i++ ) {
			X11[ i + ( j * M ) ] = A[ i + ( j * M ) ];
		}
		for ( i = 0; i < M - P; i++ ) {
			X21[ i + ( j * M ) ] = A[ ( P + i ) + ( j * M ) ];
		}
	}
	return {
		'P': P,
		'Q': Q,
		'LD': M,
		'X11': X11,
		'X21': X21,
		'THETA': new Float64Array( Q ),
		'PHI': new Float64Array( Math.max( 1, Q - 1 ) ),
		'TAUP1': new Float64Array( P ),
		'TAUP2': new Float64Array( Math.max( 1, M - P ) ),
		'TAUQ1': new Float64Array( Q ),
		'WORK': new Float64Array( Math.max( P, Q ) )
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
			info = dorbdb3( 'column-major', M, ins.P, ins.Q, X11, ins.LD, X21, ins.LD, ins.THETA, 1, ins.PHI, 1, ins.TAUP1, 1, ins.TAUP2, 1, ins.TAUQ1, 1, ins.WORK, 1 );
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
