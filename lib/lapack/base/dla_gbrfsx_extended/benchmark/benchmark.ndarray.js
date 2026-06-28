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

/* eslint-disable camelcase, max-len */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import bench from '@stdlib/bench/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import dgbtrf from './../../dgbtrf/lib/base.js';
import dgbtrs from './../../dgbtrs/lib/base.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import dla_gbrfsx_extended from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Builds a tridiagonal column-major banded system of order `N`.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Object} problem data
*/
function buildProblem( N ) {
	var BERR_OUT;
	var LDAFB;
	var IPIV;
	var LDAB;
	var AYB;
	var AFB;
	var EBN;
	var EBC;
	var RES;
	var AB;
	var YT;
	var DY;
	var B;
	var C;
	var Y;
	var i;
	LDAB = 3;
	LDAFB = 4;
	AB = new Float64Array( LDAB * N );
	AFB = new Float64Array( LDAFB * N );
	IPIV = new Int32Array( N );
	B = new Float64Array( N );
	Y = new Float64Array( N );
	for ( i = 0; i < N; i++ ) {
		if ( i > 0 ) {
			AB[ ( i * LDAB ) + 0 ] = 0.5;
		}
		AB[ ( i * LDAB ) + 1 ] = 4.0;
		if ( i < N - 1 ) {
			AB[ ( i * LDAB ) + 2 ] = -1.0;
		}
		B[ i ] = ( i + 1 ) * 0.5;
	}
	for ( i = 0; i < N; i++ ) {
		AFB[ ( i * LDAFB ) + 1 ] = AB[ ( i * LDAB ) + 0 ];
		AFB[ ( i * LDAFB ) + 2 ] = AB[ ( i * LDAB ) + 1 ];
		AFB[ ( i * LDAFB ) + 3 ] = AB[ ( i * LDAB ) + 2 ];
	}
	dgbtrf( N, N, 1, 1, AFB, 1, LDAFB, 0, IPIV, 1, 0 );
	for ( i = 0; i < N; i++ ) {
		Y[ i ] = B[ i ];
	}
	dgbtrs( 'no-transpose', N, 1, 1, 1, AFB, 1, LDAFB, 0, IPIV, 1, 0, Y, 1, N, 0 );

	C = new Float64Array( N );
	for ( i = 0; i < N; i++ ) {
		C[ i ] = 1.0;
	}
	BERR_OUT = new Float64Array( 1 );
	EBN = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	EBC = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	RES = new Float64Array( N );
	AYB = new Float64Array( N );
	DY = new Float64Array( N );
	YT = new Float64Array( N );
	return {
		'order': N,
		'AB': AB,
		'AFB': AFB,
		'IPIV': IPIV,
		'rhs': B,
		'soln': Y,
		'colScale': C,
		'BERR_OUT': BERR_OUT,
		'EBN': EBN,
		'EBC': EBC,
		'RES': RES,
		'AYB': AYB,
		'DY': DY,
		'YT': YT
	};
}

/**
* Creates a benchmark function for a given problem size.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var p = buildProblem( N );
	return benchmark;

	/**
	* Benchmark body.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var info;
		var i;
		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			info = dla_gbrfsx_extended( 2, 'no-transpose', N, 1, 1, 1, p.AB, 1, 3, 0, p.AFB, 1, 4, 0, p.IPIV, 1, 0, false, p.colScale, 1, 0, p.rhs, 1, N, 0, p.soln, 1, N, 0, p.BERR_OUT, 1, 0, 2, p.EBN, 1, 1, 0, p.EBC, 1, 1, 0, p.RES, 1, 0, p.AYB, 1, 0, p.DY, 1, 0, p.YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
			if ( info !== 0 ) {
				b.fail( 'unexpected info: ' + info );
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
	var N;
	var f;
	var i;
	for ( i = 1; i <= 3; i++ ) {
		N = pow( 10, i );
		f = createBenchmark( N );
		bench( format( '%s:ndarray:N=%d', pkg, N ), f );
	}
}

main();
