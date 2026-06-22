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
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlatsqr from './../../dlatsqr/lib/dlatsqr.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import dorgtsqr from './../lib/dorgtsqr.js';


// VARIABLES //

var options = {
	'dtype': 'float64'
};


// FUNCTIONS //

/**
* Creates a benchmark function for a given problem size.
*
* @private
* @param {PositiveInteger} M - number of rows
* @returns {Function} benchmark function
*/
function createBenchmark( M ) {
	var Afact;
	var Tfact;
	var nblk;
	var WORK;
	var mb;
	var nb;
	var N;
	N = 8;
	mb = 32;
	nb = 4;
	if ( M < N ) {
		N = M;
	}
	nblk = ( mb > N && mb < M ) ? Math.ceil( ( M - N ) / ( mb - N ) ) : 1;

	// Pre-factor a random matrix once so each benchmark iteration starts with valid reflectors and T factors.
	Afact = uniform( M * N, -1.0, 1.0, options );
	Tfact = new Float64Array( nb * N * nblk );
	WORK = new Float64Array( ( M + nb ) * N );
	dlatsqr( 'column-major', M, N, mb, nb, Afact, M, Tfact, nb, WORK );

	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var info;
		var A;
		var i;
		var j;

		A = new Float64Array( Afact.length );

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			// Reset A so each iteration sees fresh reflectors.
			for ( j = 0; j < A.length; j++ ) {
				A[ j ] = Afact[ j ];
			}
			info = dorgtsqr( 'column-major', M, N, mb, nb, A, M, Tfact, nb, WORK );
			if ( isnan( info ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( isnan( info ) ) {
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
	var len;
	var min;
	var max;
	var f;
	var i;

	min = 1; // 10^min
	max = 3; // 10^max

	for ( i = min; i <= max; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:len=%d', pkg, len ), f );
	}
}

main();
