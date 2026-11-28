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
import dlasq3 from './../lib/ndarray.js';


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

	// Positive qd array (ping-pong layout, pp = 0) of a well-conditioned problem of order `len`:
	const N = len;
	const q = uniform( N, 1.0, 2.0, options );
	const e = uniform( N, 0.01, 0.1, options );
	const z0 = new Float64Array( 4 * N );
	for ( k = 0; k < N; k++ ) {
		z0[ 4 * k ] = q[ k ] + ( N - k );
		z0[ ( 4 * k ) + 1 ] = z0[ 4 * k ];
		z0[ ( 4 * k ) + 2 ] = ( k < N - 1 ) ? e[ k ] : 0.0;
		z0[ ( 4 * k ) + 3 ] = z0[ ( 4 * k ) + 2 ];
	}
	const z = new Float64Array( 4 * N );
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		const n0 = new Int32Array( 1 );
		const pp = new Int32Array( 1 );
		const dmin = new Float64Array( 1 );
		const sigma = new Float64Array( 1 );
		const desig = new Float64Array( 1 );
		const qmax = new Float64Array( 1 );
		const nfail = new Int32Array( 1 );
		const iter = new Int32Array( 1 );
		const ndiv = new Int32Array( 1 );
		const ttype = new Int32Array( 1 );
		const dmin1 = new Float64Array( 1 );
		const dmin2 = new Float64Array( 1 );
		const dn = new Float64Array( 1 );
		const dn1 = new Float64Array( 1 );
		const dn2 = new Float64Array( 1 );
		const g = new Float64Array( 1 );
		const tau = new Float64Array( 1 );
		let y, i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			z.set( z0 );
			n0[ 0 ] = N;
			pp[ 0 ] = 0;
			dmin[ 0 ] = z0[ 4 * ( N - 1 ) ];
			sigma[ 0 ] = 0.0;
			desig[ 0 ] = 0.0;
			qmax[ 0 ] = z0[ 0 ];
			nfail[ 0 ] = 0;
			iter[ 0 ] = 0;
			ndiv[ 0 ] = 0;
			ttype[ 0 ] = 0;
			dmin1[ 0 ] = dmin[ 0 ];
			dmin2[ 0 ] = dmin[ 0 ];
			dn[ 0 ] = dmin[ 0 ];
			dn1[ 0 ] = dmin[ 0 ];
			dn2[ 0 ] = dmin[ 0 ];
			g[ 0 ] = 0.0;
			tau[ 0 ] = 0.0;
			dlasq3( 1, n0, z, 1, 0, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, true, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau );
			y = {
				'n0': n0[ 0 ],
				'pp': pp[ 0 ],
				'dmin': dmin[ 0 ],
				'sigma': sigma[ 0 ],
				'desig': desig[ 0 ],
				'qmax': qmax[ 0 ],
				'nfail': nfail[ 0 ],
				'iter': iter[ 0 ],
				'ndiv': ndiv[ 0 ],
				'ttype': ttype[ 0 ],
				'dmin1': dmin1[ 0 ],
				'dmin2': dmin2[ 0 ],
				'dn': dn[ 0 ],
				'dn1': dn1[ 0 ],
				'dn2': dn2[ 0 ],
				'g': g[ 0 ],
				'tau': tau[ 0 ]
			};
			if ( isnan( y.dmin ) || isnan( z[ 0 ] ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( isnan( y.dmin ) || isnan( z[ 0 ] ) ) {
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
		bench( format( '%s:ndarray:len=%d', pkg, len ), f );
	}
}

main();
