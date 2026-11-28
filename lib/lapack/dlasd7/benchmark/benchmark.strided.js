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
import floor from '@stdlib/math/base/special/floor/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import dlasd7 from './../lib/strided.js';


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
	let j;

	// Merge two sorted blocks of orders `nl` and `nr` into a problem of order `N = nl + nr + 1` (SQRE = 0):
	const N = len;
	const nl = floor( ( N - 1 ) / 2 );
	const nr = N - 1 - nl;
	const d0 = new Float64Array( N );
	const IDXQ0 = new Int32Array( N );
	for ( j = 0; j < nl; j++ ) {
		d0[ j ] = j + 1.0;
		IDXQ0[ j ] = j + 1;
	}
	for ( j = 0; j < nr; j++ ) {
		d0[ nl + 1 + j ] = j + 1.5;
		IDXQ0[ nl + 1 + j ] = j + 1;
	}
	const VF0 = uniform( N, -1.0, 1.0, options );
	const VL0 = uniform( N, -1.0, 1.0, options );
	const d = new Float64Array( N );
	const IDXQ = new Int32Array( N );
	const VF = new Float64Array( N );
	const VL = new Float64Array( N );
	const z = new Float64Array( N );
	const ZW = new Float64Array( N );
	const VFW = new Float64Array( N );
	const VLW = new Float64Array( N );
	const DSIGMA = new Float64Array( N );
	const IDX = new Int32Array( N );
	const IDXP = new Int32Array( N );
	const PERM = new Int32Array( N );
	const GIVCOL = new Int32Array( 2 * N );
	const GIVNUM = new Float64Array( 2 * N );
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		const k = new Int32Array( 1 );
		const givptr = new Int32Array( 1 );
		const c = new Float64Array( 1 );
		const s = new Float64Array( 1 );
		let y, i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			d.set( d0 );
			IDXQ.set( IDXQ0 );
			VF.set( VF0 );
			VL.set( VL0 );
			y = {
				'info': dlasd7( 1, nl, nr, 0, k, d, 1, 0, z, 1, 0, ZW, 1, 0, VF, 1, 0, VFW, 1, 0, VL, 1, 0, VLW, 1, 0, 0.5, 0.3, DSIGMA, 1, 0, IDX, 1, 0, IDXP, 1, 0, IDXQ, 1, 0, PERM, 1, 0, givptr, GIVCOL, 1, N, 0, GIVNUM, 1, N, 0, c, s ),
				'K': k[ 0 ],
				'givptr': givptr[ 0 ],
				'c': c[ 0 ],
				's': s[ 0 ]
			};
			if ( isnan( y.info ) || isnan( d[ 0 ] ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( isnan( y.info ) || isnan( d[ 0 ] ) ) {
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
