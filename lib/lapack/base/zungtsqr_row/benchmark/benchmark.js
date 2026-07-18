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

/* eslint-disable camelcase */

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlatsqr from './../../zlatsqr/lib/zlatsqr.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zungtsqr_row from './../lib/zungtsqr_row.js';


// VARIABLES //

const options = {
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
	let Aorig, Tcopy, lwork, nblk, mb, nb, N, j;
	N = 8;
	mb = 32;
	nb = 4;
	if ( M < N ) {
		N = M;
	}
	if ( mb <= N ) {
		mb = N + 1;
	}
	nblk = ( mb > N && mb < M ) ? Math.ceil( ( M - N ) / ( mb - N ) ) : 1;
	const nbloc = ( nb < N ) ? nb : N;
	lwork = Math.max( 1, nbloc * Math.max( nbloc, N - nbloc ) );

	Aorig = uniform( 2 * M * N, -1.0, 1.0, options );
	Tcopy = new Complex128Array( nb * N * nblk );

	// Pre-build V/T once via zlatsqr; then snapshot to copy back per iteration.
	const WORK = new Complex128Array( nb * N );
	const Atmp = new Complex128Array( M * N );
	const Av = reinterpret( Atmp, 0 );
	for ( j = 0; j < Av.length; j++ ) {
		Av[ j ] = Aorig[ j ];
	}
	zlatsqr( 'column-major', M, N, mb, nb, Atmp, M, Tcopy, nb, WORK );

	// Save A (now V) back into Aorig so each iteration reuses the same V/T input.
	for ( j = 0; j < Av.length; j++ ) {
		Aorig[ j ] = Av[ j ];
	}
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		let info, i, j;

		const A = new Complex128Array( M * N );
		const T = new Complex128Array( nb * N * nblk );
		const WORK = new Complex128Array( lwork );
		const Av = reinterpret( A, 0 );
		const Tv = reinterpret( T, 0 );
		const Tcv = reinterpret( Tcopy, 0 );

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			// Reset A and T to fresh V/T input each iteration.
			for ( j = 0; j < Av.length; j++ ) {
				Av[ j ] = Aorig[ j ];
			}
			for ( j = 0; j < Tv.length; j++ ) {
				Tv[ j ] = Tcv[ j ];
			}
			info = zungtsqr_row( 'column-major', M, N, mb, nb, A, M, T, nb, WORK );
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
	let len, f, i;

	const min = 1; // 10^min
	const max = 3; // 10^max

	for ( i = min; i <= max; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:M=%d', pkg, len ), f );
	}
}

main();
