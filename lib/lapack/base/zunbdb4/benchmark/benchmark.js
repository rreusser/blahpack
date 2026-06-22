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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zunbdb4 from './../lib/zunbdb4.js';


// FUNCTIONS //

/**
* Builds complex orthonormal-column inputs of size `M`-by-`Q` with `P = M/2` and `Q = 3*M/4`. The zunbdb4 partition requires `M-Q <= min(P, M-P, Q)`, here `M/4 <= min(M/2, M/2, 3M/4) = M/2`.
*
* @private
* @param {PositiveInteger} M - total number of rows
* @returns {Object} packed inputs (`X11`, `X21`, `THETA`, `PHI`, `TAU*`, `PHANTOM`, `WORK`, `P`, `Q`, `LD`)
*/
function makeInputs( M ) {
	var X11v;
	var X21v;
	var pass;
	var norm;
	var dotR;
	var dotI;
	var X11;
	var X21;
	var aR;
	var aI;
	var bR;
	var bI;
	var av;
	var A;
	var P;
	var Q;
	var i;
	var j;
	var k;

	P = M >> 1;
	Q = ( M * 3 ) >> 2;
	A = new Complex128Array( M * Q );
	av = reinterpret( A, 0 );
	for ( j = 0; j < Q; j++ ) {
		for ( i = 0; i < M; i++ ) {
			av[ 2 * ( i + ( j * M ) ) ] = Math.sin( ( ( i + 1 ) * 17 ) + ( ( j + 1 ) * 31 ) );
			av[ ( 2 * ( i + ( j * M ) ) ) + 1 ] = Math.cos( ( ( i + 1 ) * 13 ) + ( ( j + 1 ) * 29 ) );
		}
	}

	// Two-pass MGS with conjugate inner products.
	for ( pass = 0; pass < 2; pass++ ) {
		for ( j = 0; j < Q; j++ ) {
			for ( i = 0; i < j; i++ ) {
				dotR = 0.0;
				dotI = 0.0;

				// conj(a) * b = (aR - i*aI) * (bR + i*bI)
				for ( k = 0; k < M; k++ ) {
					aR = av[ 2 * ( k + ( i * M ) ) ];
					aI = av[ ( 2 * ( k + ( i * M ) ) ) + 1 ];
					bR = av[ 2 * ( k + ( j * M ) ) ];
					bI = av[ ( 2 * ( k + ( j * M ) ) ) + 1 ];
					dotR += ( aR * bR ) + ( aI * bI );
					dotI += ( aR * bI ) - ( aI * bR );
				}
				for ( k = 0; k < M; k++ ) {
					aR = av[ 2 * ( k + ( i * M ) ) ];
					aI = av[ ( 2 * ( k + ( i * M ) ) ) + 1 ];
					av[ 2 * ( k + ( j * M ) ) ] -= ( dotR * aR ) - ( dotI * aI );
					av[ ( 2 * ( k + ( j * M ) ) ) + 1 ] -= ( dotR * aI ) + ( dotI * aR );
				}
			}
			norm = 0.0;
			for ( k = 0; k < M; k++ ) {
				aR = av[ 2 * ( k + ( j * M ) ) ];
				aI = av[ ( 2 * ( k + ( j * M ) ) ) + 1 ];
				norm += ( aR * aR ) + ( aI * aI );
			}
			norm = Math.sqrt( norm );
			for ( k = 0; k < M; k++ ) {
				av[ 2 * ( k + ( j * M ) ) ] /= norm;
				av[ ( 2 * ( k + ( j * M ) ) ) + 1 ] /= norm;
			}
		}
	}

	// Allocate X11 and X21 with matching leading dimension `M`.
	X11 = new Complex128Array( M * Q );
	X21 = new Complex128Array( M * Q );
	X11v = reinterpret( X11, 0 );
	X21v = reinterpret( X21, 0 );
	for ( j = 0; j < Q; j++ ) {
		for ( i = 0; i < P; i++ ) {
			X11v[ 2 * ( i + ( j * M ) ) ] = av[ 2 * ( i + ( j * M ) ) ];
			X11v[ ( 2 * ( i + ( j * M ) ) ) + 1 ] = av[ ( 2 * ( i + ( j * M ) ) ) + 1 ];
		}
		for ( i = 0; i < M - P; i++ ) {
			X21v[ 2 * ( i + ( j * M ) ) ] = av[ 2 * ( ( P + i ) + ( j * M ) ) ];
			X21v[ ( 2 * ( i + ( j * M ) ) ) + 1 ] = av[ ( 2 * ( ( P + i ) + ( j * M ) ) ) + 1 ];
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
		'TAUP1': new Complex128Array( Math.max( 1, M - Q ) ),
		'TAUP2': new Complex128Array( Math.max( 1, M - Q ) ),
		'TAUQ1': new Complex128Array( Q ),
		'PHANTOM': new Complex128Array( M ),
		'WORK': new Complex128Array( Math.max( P, Q ) )
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
			X11 = new Complex128Array( ins.X11 );
			X21 = new Complex128Array( ins.X21 );
			info = zunbdb4( 'column-major', M, ins.P, ins.Q, X11, ins.LD, X21, ins.LD, ins.THETA, 1, ins.PHI, 1, ins.TAUP1, 1, ins.TAUP2, 1, ins.TAUQ1, 1, ins.PHANTOM, 1, ins.WORK, 1 );
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
