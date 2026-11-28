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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import dlaed2 from './../lib/strided.js';


// VARIABLES //

const pkg = pkgJson.name;
/** @type {{ dtype: 'float64' }} */
const options = {
	'dtype': 'float64'
};


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} len - array length
* @returns {Function} benchmark function
*/
function createBenchmark( len ) {
	const N = len;
	const n1 = Math.max( 1, Math.floor( N / 2 ) );
	const d0 = new Float64Array( N );
	const Q0 = new Float64Array( N * N );
	const INDXQ0 = new Int32Array( N );
	const z0 = uniform( N, 0.1, 1.0, options );
	const d = new Float64Array( N );
	const Q = new Float64Array( N * N );
	const INDXQ = new Int32Array( N );
	const z = new Float64Array( N );
	const DLAMBDA = new Float64Array( N );
	const w = new Float64Array( N );
	const Q2 = new Float64Array( N * N );
	const INDX = new Int32Array( N );
	const INDXC = new Int32Array( N );
	const INDXP = new Int32Array( N );
	const COLTYP = new Int32Array( Math.max( N, 4 ) );
	let j;

	// Two sorted sub-problems with identity eigenvectors (INDXQ is 1-based within each sub-problem):
	for ( j = 0; j < N; j++ ) {
		d0[ j ] = ( j < n1 ) ? j : ( j - n1 ) + 0.5;
		INDXQ0[ j ] = ( j < n1 ) ? j + 1 : ( j - n1 ) + 1;
		Q0[ ( j * N ) + j ] = 1.0;
	}
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		const k = new Int32Array( 1 );
		const rho = new Float64Array( 1 );
		let y, i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			// Reset the inputs, which `dlaed2` overwrites:
			d.set( d0 );
			Q.set( Q0 );
			INDXQ.set( INDXQ0 );
			z.set( z0 );
			rho[ 0 ] = 1.0;
			y = dlaed2( k, N, n1, d, 1, 0, Q, 1, N, 0, INDXQ, 1, 0, rho, z, 1, 0, DLAMBDA, 1, 0, w, 1, 0, Q2, 1, 0, INDX, 1, 0, INDXC, 1, 0, INDXP, 1, 0, COLTYP, 1, 0 );
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
	let len, f, i;

	const min = 1; // 10^min
	const max = 3; // 10^max

	for ( i = min; i <= max; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:strided:len=%d', pkg, len ), f );
	}
}

main();
