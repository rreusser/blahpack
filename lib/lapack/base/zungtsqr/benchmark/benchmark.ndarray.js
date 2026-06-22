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

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import zlatsqr from './../../zlatsqr/lib/base.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zungtsqr from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} M - number of matrix rows
* @returns {Function} benchmark function
*/
function createBenchmark( M ) {
	var numblk;
	var WORK;
	var Awrk;
	var mb;
	var nb;
	var N;
	var T;

	N = 4;
	nb = 2;
	mb = ( M < 32 ) ? M : 32;
	if ( mb <= N ) {
		mb = N + 1;
	}
	numblk = Math.ceil( ( M - N ) / ( mb - N ) );
	if ( numblk < 1 ) {
		numblk = 1;
	}
	Awrk = new Complex128Array( M * N );
	T = new Complex128Array( nb * numblk * N );
	WORK = new Complex128Array( nb * N );

	zlatsqr( M, N, mb, nb, Awrk, 1, M, 0, T, 1, nb, 0, WORK, 1, 0 );
	WORK = new Complex128Array( ( M + nb ) * N );

	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var y;
		var i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			y = zungtsqr( M, N, mb, nb, Awrk, 1, M, 0, T, 1, nb, 0, WORK, 1, 0 );
			if ( isnan( y ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( isnan( y ) ) {
			b.fail( 'should not return NaN' );
		}
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
	var max;
	var min;
	var len;
	var f;
	var i;

	min = 1; // 10^min
	max = 3; // 10^max

	for ( i = min; i <= max; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:ndarray:M=%d', pkg, len ), f );
	}
}

main();
