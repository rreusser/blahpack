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
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import SAFMIN from '@stdlib/constants/float64/smallest-normal/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import dlag2 from './../lib/ndarray.js';


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
	const A = uniform( N * N, -10.0, 10.0, options );
	const B = uniform( N * N, -10.0, 10.0, options );
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		const scale1 = new Float64Array( 1 );
		const scale2 = new Float64Array( 1 );
		const wr1 = new Float64Array( 1 );
		const wr2 = new Float64Array( 1 );
		const wi = new Float64Array( 1 );
		let y, i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			dlag2( A, N, 1, 0, B, N, 1, 0, SAFMIN, scale1, scale2, wr1, wr2, wi );
			y = {
				'scale1': scale1[ 0 ],
				'scale2': scale2[ 0 ],
				'wr1': wr1[ 0 ],
				'wr2': wr2[ 0 ],
				'wi': wi[ 0 ]
			};
			if ( isnan( y.wr1 ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( isnan( y.wr1 ) ) {
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
		bench( format( '%s:ndarray:len=%d', pkg, len ), f );
	}
}

main();
