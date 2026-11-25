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
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import dlasq4 from './../lib/dlasq4.js';


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
	let k;

	// Positive qd array (ping-pong layout, pp = 0) of a problem of order `len`:
	const N = len;
	const q = uniform( N, 1.0, 2.0, options );
	const e = uniform( N, 0.01, 0.1, options );
	const z = new Float64Array( 4 * N );
	for ( k = 0; k < N; k++ ) {
		z[ 4 * k ] = q[ k ] + ( N - k );
		z[ ( 4 * k ) + 1 ] = z[ 4 * k ];
		z[ ( 4 * k ) + 2 ] = ( k < N - 1 ) ? e[ k ] : 0.0;
		z[ ( 4 * k ) + 3 ] = z[ ( 4 * k ) + 2 ];
	}
	const dn = z[ 4 * ( N - 1 ) ];
	const dn1 = z[ 4 * ( N - 2 ) ];
	const dn2 = z[ 4 * ( N - 3 ) ];
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		const tau = new Float64Array( 1 );
		const ttype = new Int32Array( 1 );
		const g = new Float64Array( 1 );
		let y, i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			tau[ 0 ] = 0.0;
			ttype[ 0 ] = 0;
			g[ 0 ] = 0.0;
			dlasq4( 1, N, z, 1, 0, N, dn, dn1, dn2, dn, dn1, dn2, tau, ttype, g );
			y = {
				'tau': tau[ 0 ],
				'ttype': ttype[ 0 ],
				'g': g[ 0 ]
			};
			if ( isnan( y.tau ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( isnan( y.tau ) ) {
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
	const max = 6; // 10^max

	for ( i = min; i <= max; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:len=%d', pkg, len ), f );
	}
}

main();
