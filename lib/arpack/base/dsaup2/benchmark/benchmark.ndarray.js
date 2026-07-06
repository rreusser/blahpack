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

'use strict';

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import pkg from './../package.json' with { type: 'json' };
import dsaup2 from './../lib/index.js';


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - order of the problem
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var nev0 = 2;
	var np0 = 3;
	var ncv = nev0 + np0;
	var A = new Float64Array( N * N );
	var resid0 = new Float64Array( N );
	var i;
	for ( i = 0; i < N; i++ ) {
		A[ i + ( i * N ) ] = 2.0;
		if ( i < N - 1 ) {
			A[ i + ( ( i + 1 ) * N ) ] = -1.0;
			A[ ( i + 1 ) + ( i * N ) ] = -1.0;
		}
		resid0[ i ] = 1.0 + ( 0.1 * ( i + 1 ) );
	}
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var bounds;
		var resid;
		var mxiter;
		var state;
		var workl;
		var workd;
		var ipntr;
		var info;
		var ritz;
		var ido;
		var nev;
		var np;
		var acc;
		var V;
		var H;
		var Q;
		var p;
		var q;
		var r;
		var c;
		var j;

		b.tic();
		for ( j = 0; j < b.iterations; j++ ) {
			resid = new Float64Array( resid0 );
			V = new Float64Array( N * ncv );
			H = new Float64Array( ncv * 2 );
			Q = new Float64Array( ncv * ncv );
			ritz = new Float64Array( ncv );
			bounds = new Float64Array( ncv );
			workl = new Float64Array( 3 * ncv );
			workd = new Float64Array( 3 * N );
			ipntr = new Int32Array( 3 );
			ido = new Int32Array( 1 );
			nev = new Int32Array( [ nev0 ] );
			np = new Int32Array( [ np0 ] );
			mxiter = new Int32Array( [ 100 ] );
			state = {};
			info = 1;
			do {
				info = dsaup2.ndarray( state, ido, 'standard', N, 'LM', nev, np, 0.0, resid, 1, 0, 1, 1, 1, mxiter, V, 1, N, 0, H, 1, ncv, 0, ritz, 1, 0, bounds, 1, 0, Q, 1, ncv, 0, workl, 1, 0, ipntr, 1, 0, workd, 1, 0, info );
				if ( ido[ 0 ] === -1 || ido[ 0 ] === 1 ) {
					p = ipntr[ 0 ];
					q = ipntr[ 1 ];
					for ( r = 0; r < N; r++ ) {
						acc = 0.0;
						for ( c = 0; c < N; c++ ) {
							acc += A[ r + ( c * N ) ] * workd[ p + c ];
						}
						workd[ q + r ] = acc;
					}
				}
			} while ( ido[ 0 ] !== 99 );
			if ( isnan( ritz[ 0 ] ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( isnan( ritz[ 0 ] ) ) {
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
	var i;
	var N;
	for ( i = 3; i <= 7; i++ ) {
		N = pow( 2, i );
		bench( pkg.name + ':size=' + N, createBenchmark( N ) );
	}
}

main();
