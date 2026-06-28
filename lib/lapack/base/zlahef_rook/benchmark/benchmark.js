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

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zlahefRook from './../lib/zlahef_rook.js';


// FUNCTIONS //

/**
* Creates a Hermitian indefinite matrix with diagonally dominant real part.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Complex128Array} matrix
*/
function makeHermitian( N ) {
	var idx;
	var A;
	var v;
	var i;
	var j;
	A = new Complex128Array( N * N );
	v = reinterpret( A, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i < N; i++ ) {
			idx = ( ( j * N ) + i ) * 2;
			if ( i === j ) {
				v[ idx ] = ( N * 2.0 ) + 1.0;
				v[ idx + 1 ] = 0.0;
			} else {
				v[ idx ] = ( ( i + j ) % 7 ) * 0.1;
				v[ idx + 1 ] = ( ( i - j ) % 5 ) * 0.05;
			}
		}
	}
	return A;
}

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var nb = 32;
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var result;
		var IPIV;
		var A;
		var W;
		var i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			A = makeHermitian( N );
			IPIV = new Int32Array( N );
			W = new Complex128Array( N * nb );
			result = zlahefRook( 'column-major', 'lower', N, nb, A, N, IPIV, W, N );
			if ( result.info !== 0 ) {
				b.fail( 'unexpected info' );
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
	var len;
	var min;
	var max;
	var f;
	var i;

	min = 1;
	max = 2;

	for ( i = min; i <= max; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:len=%d', pkg, len ), f );
	}
}

main();
