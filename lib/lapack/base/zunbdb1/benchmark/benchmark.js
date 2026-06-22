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
import zunbdb1 from './../lib/zunbdb1.js';


// FUNCTIONS //

/**
* Build complex orthonormal-column inputs of size M-by-Q with `Q = M/4` (so the dimension constraints are easily satisfied at `P = M/2`). Columns are made orthonormal under the complex inner product via two Gram-Schmidt passes.
*
* @private
* @param {PositiveInteger} M - total number of rows
* @returns {Object} packed inputs (X11, X21, THETA, PHI, TAU*, WORK, P, Q)
*/
function makeInputs( M ) {
	var X11v;
	var X21v;
	var pass;
	var dotR;
	var dotI;
	var X11;
	var X21;
	var nrm;
	var Av;
	var aR;
	var aI;
	var bR;
	var bI;
	var A;
	var P;
	var Q;
	var i;
	var j;
	var k;

	P = M >> 1;
	Q = M >> 2;
	A = new Complex128Array( M * Q );
	Av = reinterpret( A, 0 );
	for ( j = 0; j < Q; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Av[ ( ( i + ( j * M ) ) * 2 ) ] = Math.sin( ( ( i + 1 ) * 17 ) + ( ( j + 1 ) * 31 ) );
			Av[ ( ( i + ( j * M ) ) * 2 ) + 1 ] = Math.sin( ( ( i + 1 ) * 13 ) + ( ( j + 1 ) * 23 ) + 5 );
		}
	}
	for ( pass = 0; pass < 2; pass++ ) {
		for ( j = 0; j < Q; j++ ) {
			for ( i = 0; i < j; i++ ) {
				dotR = 0.0;
				dotI = 0.0;
				for ( k = 0; k < M; k++ ) {
					// Compute dot += conj(A(k,i)) * A(k,j):
					aR = Av[ ( ( k + ( i * M ) ) * 2 ) ];
					aI = Av[ ( ( k + ( i * M ) ) * 2 ) + 1 ];
					bR = Av[ ( ( k + ( j * M ) ) * 2 ) ];
					bI = Av[ ( ( k + ( j * M ) ) * 2 ) + 1 ];
					dotR += ( aR * bR ) + ( aI * bI );
					dotI += ( aR * bI ) - ( aI * bR );
				}
				for ( k = 0; k < M; k++ ) {
					aR = Av[ ( ( k + ( i * M ) ) * 2 ) ];
					aI = Av[ ( ( k + ( i * M ) ) * 2 ) + 1 ];
					Av[ ( ( k + ( j * M ) ) * 2 ) ] -= ( dotR * aR ) - ( dotI * aI );
					Av[ ( ( k + ( j * M ) ) * 2 ) + 1 ] -= ( dotR * aI ) + ( dotI * aR );
				}
			}
			nrm = 0.0;
			for ( k = 0; k < M; k++ ) {
				aR = Av[ ( ( k + ( j * M ) ) * 2 ) ];
				aI = Av[ ( ( k + ( j * M ) ) * 2 ) + 1 ];
				nrm += ( aR * aR ) + ( aI * aI );
			}
			nrm = Math.sqrt( nrm );
			for ( k = 0; k < M; k++ ) {
				Av[ ( ( k + ( j * M ) ) * 2 ) ] /= nrm;
				Av[ ( ( k + ( j * M ) ) * 2 ) + 1 ] /= nrm;
			}
		}
	}
	X11 = new Complex128Array( P * Q );
	X21 = new Complex128Array( ( M - P ) * Q );
	X11v = reinterpret( X11, 0 );
	X21v = reinterpret( X21, 0 );
	for ( j = 0; j < Q; j++ ) {
		for ( i = 0; i < P; i++ ) {
			X11v[ ( ( i + ( j * P ) ) * 2 ) ] = Av[ ( ( i + ( j * M ) ) * 2 ) ];
			X11v[ ( ( i + ( j * P ) ) * 2 ) + 1 ] = Av[ ( ( i + ( j * M ) ) * 2 ) + 1 ];
		}
		for ( i = 0; i < M - P; i++ ) {
			X21v[ ( ( i + ( j * ( M - P ) ) ) * 2 ) ] = Av[ ( ( ( P + i ) + ( j * M ) ) * 2 ) ];
			X21v[ ( ( i + ( j * ( M - P ) ) ) * 2 ) + 1 ] = Av[ ( ( ( P + i ) + ( j * M ) ) * 2 ) + 1 ];
		}
	}
	return {
		'P': P,
		'Q': Q,
		'X11': X11,
		'X21': X21,
		'THETA': new Float64Array( Q ),
		'PHI': new Float64Array( Math.max( 1, Q - 1 ) ),
		'TAUP1': new Complex128Array( P ),
		'TAUP2': new Complex128Array( M - P ),
		'TAUQ1': new Complex128Array( Q ),
		'WORK': new Complex128Array( M - Q )
	};
}

/**
* Creates a benchmark function for a given M.
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
			info = zunbdb1( 'column-major', M, ins.P, ins.Q, X11, ins.P, X21, M - ins.P, ins.THETA, 1, ins.PHI, 1, ins.TAUP1, 1, ins.TAUP2, 1, ins.TAUQ1, 1, ins.WORK, 1 );
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
