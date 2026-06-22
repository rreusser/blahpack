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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zunbdb2 from './../lib/zunbdb2.js';


// FUNCTIONS //

/**
* Build orthonormal-column complex inputs of size M-by-Q with `P = M/4`, `Q = M/2` (so the dimension constraint `P <= min(M-P, Q, M-Q)` is easily satisfied).
*
* @private
* @param {PositiveInteger} M - total number of rows
* @returns {Object} packed inputs
*/
function makeInputs( M ) {
	var Areal;
	var Aimag;
	var pass;
	var X11;
	var X21;
	var dot;
	var nrm;
	var aR;
	var aI;
	var bR;
	var bI;
	var P;
	var Q;
	var i;
	var j;
	var k;

	P = M >> 2;
	Q = M >> 1;
	Areal = new Float64Array( M * Q );
	Aimag = new Float64Array( M * Q );
	for ( j = 0; j < Q; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Areal[ i + ( j * M ) ] = Math.sin( ( ( i + 1 ) * 17 ) + ( ( j + 1 ) * 31 ) );
			Aimag[ i + ( j * M ) ] = Math.cos( ( ( i + 1 ) * 17 ) + ( ( j + 1 ) * 31 ) );
		}
	}
	for ( pass = 0; pass < 2; pass++ ) {
		for ( j = 0; j < Q; j++ ) {
			for ( i = 0; i < j; i++ ) {
				// dot = conj(A[:,i]) * A[:,j]
				dot = [ 0.0, 0.0 ];
				for ( k = 0; k < M; k++ ) {
					aR = Areal[ k + ( i * M ) ];
					aI = Aimag[ k + ( i * M ) ];
					bR = Areal[ k + ( j * M ) ];
					bI = Aimag[ k + ( j * M ) ];
					dot[ 0 ] += ( aR * bR ) + ( aI * bI );
					dot[ 1 ] += ( aR * bI ) - ( aI * bR );
				}
				for ( k = 0; k < M; k++ ) {
					aR = Areal[ k + ( i * M ) ];
					aI = Aimag[ k + ( i * M ) ];
					Areal[ k + ( j * M ) ] -= ( dot[ 0 ] * aR ) - ( dot[ 1 ] * aI );
					Aimag[ k + ( j * M ) ] -= ( dot[ 0 ] * aI ) + ( dot[ 1 ] * aR );
				}
			}
			nrm = 0.0;
			for ( k = 0; k < M; k++ ) {
				nrm += ( Areal[ k + ( j * M ) ] * Areal[ k + ( j * M ) ] ) + ( Aimag[ k + ( j * M ) ] * Aimag[ k + ( j * M ) ] );
			}
			nrm = Math.sqrt( nrm );
			for ( k = 0; k < M; k++ ) {
				Areal[ k + ( j * M ) ] /= nrm;
				Aimag[ k + ( j * M ) ] /= nrm;
			}
		}
	}
	X11 = new Complex128Array( P * Q );
	X21 = new Complex128Array( ( M - P ) * Q );
	for ( j = 0; j < Q; j++ ) {
		for ( i = 0; i < P; i++ ) {
			reinterpret( X11, 0 )[ 2 * ( i + ( j * P ) ) ] = Areal[ i + ( j * M ) ];
			reinterpret( X11, 0 )[ ( 2 * ( i + ( j * P ) ) ) + 1 ] = Aimag[ i + ( j * M ) ];
		}
		for ( i = 0; i < M - P; i++ ) {
			reinterpret( X21, 0 )[ 2 * ( i + ( j * ( M - P ) ) ) ] = Areal[ ( P + i ) + ( j * M ) ];
			reinterpret( X21, 0 )[ ( 2 * ( i + ( j * ( M - P ) ) ) ) + 1 ] = Aimag[ ( P + i ) + ( j * M ) ];
		}
	}
	return {
		'P': P,
		'Q': Q,
		'X11': X11,
		'X21': X21,
		'THETA': new Float64Array( Q ),
		'PHI': new Float64Array( Math.max( 1, Q - 1 ) ),
		'TAUP1': new Complex128Array( Math.max( 1, P - 1 ) ),
		'TAUP2': new Complex128Array( Q ),
		'TAUQ1': new Complex128Array( Q ),
		'WORK': new Complex128Array( M )
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
			info = zunbdb2( 'column-major', M, ins.P, ins.Q, X11, ins.P, X21, M - ins.P, ins.THETA, 1, ins.PHI, 1, ins.TAUP1, 1, ins.TAUP2, 1, ins.TAUQ1, 1, ins.WORK, 1 );
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
