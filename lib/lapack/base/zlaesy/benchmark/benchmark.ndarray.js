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
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import zlaesy from './../lib/ndarray.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// VARIABLES //

const pkg = pkgJson.name;


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - problem size
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {

	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		const rt1 = new Complex128Array( 1 );
		const rt1v = reinterpret( rt1, 0 );
		const rt2 = new Complex128Array( 1 );
		const rt2v = reinterpret( rt2, 0 );
		const evscal = new Complex128Array( 1 );
		const evscalv = reinterpret( evscal, 0 );
		const cs1 = new Complex128Array( 1 );
		const cs1v = reinterpret( cs1, 0 );
		const sn1 = new Complex128Array( 1 );
		const sn1v = reinterpret( sn1, 0 );
		let i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			zlaesy( new Complex128( 1.0, 0.0 ), new Complex128( 1.0, 0.0 ), new Complex128( 1.0, 0.0 ), rt1, 0, rt2, 0, evscal, 0, cs1, 0, sn1, 0 );
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
	let N, f, i;

	const min = 1; // 10^min
	const max = 2; // 10^max

	for ( i = min; i <= max; i++ ) {
		N = pow( 10, i );
		f = createBenchmark( N );
		bench( format( '%s:ndarray:N=%d', pkg, N ), f );
	}
}

main();
