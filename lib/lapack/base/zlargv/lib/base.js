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

/* eslint-disable max-depth, max-statements */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlapy2 from '../../dlapy2/lib/base.js';


// VARIABLES //

// DLAMCH('S') — smallest normalized double-precision number:
var SAFMIN = 2.2250738585072014e-308;

// SAFMN2 = BASE^INT(LOG(SAFMIN/EPS) / LOG(BASE) / 2):
var SAFMN2 = 1.4916681462400413e-154;

// SAFMX2 = 1 / SAFMN2:
var SAFMX2 = 1.0 / SAFMN2;


// MAIN //

/**
* Generates a vector of complex plane rotations with real cosines and.
* complex sines.
*
* For `i = 0, 1, ..., N-1`:
*
* ```text
*   (        c(i)   s(i) ) ( x(i) ) = ( r(i) )
*   ( -conj(s(i))   c(i) ) ( y(i) ) = (   0  )
* ```
*
* where `c(i)^2 + |s(i)|^2 = 1`.
*
* On exit, `x` is overwritten by `r`, `y` is overwritten by the complex
* sines, and `c` receives the real cosines of the plane rotations.
*
* @private
* @param {NonNegativeInteger} N - number of plane rotations to generate
* @param {Complex128Array} x - input/output complex vector x
* @param {integer} strideX - stride for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @param {Complex128Array} y - input/output complex vector y
* @param {integer} strideY - stride for `y` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `y` (in complex elements)
* @param {Float64Array} c - output vector for cosines
* @param {integer} strideC - stride for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @returns {void}
*/
function zlargv( N, x, strideX, offsetX, y, strideY, offsetY, c, strideC, offsetC ) { // eslint-disable-line max-len, max-params
	var f2srt;
	var count;
	var scale;
	var fsr;
	var fsi;
	var gsr;
	var gsi;
	var ffr;
	var ffi;
	var tsr;
	var tsi;
	var tdr;
	var tdi;
	var f2s;
	var g2s;
	var xv;
	var yv;
	var cs;
	var di;
	var dr;
	var f2;
	var g2;
	var sx;
	var sy;
	var ic;
	var ix;
	var iy;
	var fr;
	var fi;
	var gr;
	var gi;
	var rr;
	var ri;
	var sr;
	var si;
	var d;
	var i;
	var j;

	// Float64Array views of the complex arrays
	xv = reinterpret( x, 0 );
	yv = reinterpret( y, 0 );

	// Convert complex strides/offsets to Float64 strides/offsets
	sx = strideX * 2;
	sy = strideY * 2;
	ix = offsetX * 2;
	iy = offsetY * 2;
	ic = offsetC;

	for ( i = 0; i < N; i += 1 ) {
		fr = xv[ ix ];
		fi = xv[ ix + 1 ];
		gr = yv[ iy ];
		gi = yv[ iy + 1 ];

		// scale = max( ABS1(f), ABS1(g) )
		scale = Math.max( Math.max( Math.abs( fr ), Math.abs( fi ) ), Math.max( Math.abs( gr ), Math.abs( gi ) ) ); // eslint-disable-line max-len

		// Fs = f, gs = g (will be scaled copies)
		fsr = fr;
		fsi = fi;
		gsr = gr;
		gsi = gi;
		count = 0;

		if ( scale >= SAFMX2 ) {
			// Scale down to avoid overflow
			while ( scale >= SAFMX2 && count < 20 ) {
				count += 1;
				fsr *= SAFMN2;
				fsi *= SAFMN2;
				gsr *= SAFMN2;
				gsi *= SAFMN2;
				scale *= SAFMN2;
			}
		} else if ( scale <= SAFMN2 ) {
			if ( gr === 0.0 && gi === 0.0 ) {
				// G == CZERO: cs = 1, sn = 0, r = f
				c[ ic ] = 1.0;
				yv[ iy ] = 0.0;
				yv[ iy + 1 ] = 0.0;
				xv[ ix ] = fr;
				xv[ ix + 1 ] = fi;
				ic += strideC;
				iy += sy;
				ix += sx;
				continue;
			}

			// Scale up to avoid underflow
			while ( scale <= SAFMN2 ) {
				count -= 1;
				fsr *= SAFMX2;
				fsi *= SAFMX2;
				gsr *= SAFMX2;
				gsi *= SAFMX2;
				scale *= SAFMX2;
			}
		}

		// f2 = ABSSQ(fs) = re(fs)^2 + im(fs)^2
		f2 = ( fsr * fsr ) + ( fsi * fsi );

		// g2 = ABSSQ(gs) = re(gs)^2 + im(gs)^2
		g2 = ( gsr * gsr ) + ( gsi * gsi );

		if ( f2 <= Math.max( g2, 1.0 ) * SAFMIN ) {
			// F is very small
			if ( fr === 0.0 && fi === 0.0 ) {
				// F == CZERO
				cs = 0.0;

				// R = dlapy2(re(g), im(g))
				rr = dlapy2( gr, gi );
				ri = 0.0;

				// d = dlapy2(re(gs), im(gs))
				d = dlapy2( gsr, gsi );

				// Sn = conj(gs)/d = (re(gs)/d, -im(gs)/d)
				sr = gsr / d;
				si = -gsi / d;
			} else {
				// F is nonzero but very small relative to g
				f2s = dlapy2( fsr, fsi );
				g2s = Math.sqrt( g2 );
				cs = f2s / g2s;

				// Make sure abs(ff) = 1 by normalizing f
				if ( Math.max( Math.abs( fr ), Math.abs( fi ) ) > 1.0 ) {
					d = dlapy2( fr, fi );
					ffr = fr / d;
					ffi = fi / d;
				} else {
					dr = SAFMX2 * fr;
					di = SAFMX2 * fi;
					d = dlapy2( dr, di );
					ffr = dr / d;
					ffi = di / d;
				}

				// Sn = ff * conj(gs)/g2s
				// conj(gs)/g2s = (re(gs)/g2s, -im(gs)/g2s)
				tsr = gsr / g2s;
				tsi = -gsi / g2s;

				// Sn = ff * (tsr, tsi)
				sr = ( ffr * tsr ) - ( ffi * tsi );
				si = ( ffr * tsi ) + ( ffi * tsr );

				// R = cs*f + sn*g
				rr = ( cs * fr ) + ( sr * gr ) - ( si * gi );
				ri = ( cs * fi ) + ( sr * gi ) + ( si * gr );
			}
		} else {
			// Most common case: neither f2 nor f2/g2 < SAFMIN
			f2srt = Math.sqrt( 1.0 + ( g2 / f2 ) );

			// R = f2srt * fs (complex multiply by real)
			rr = f2srt * fsr;
			ri = f2srt * fsi;

			cs = 1.0 / f2srt;
			d = f2 + g2;

			// Sn = (r/d) * conj(gs)
			tdr = rr / d;
			tdi = ri / d;

			// Multiply by conj(gs) = (gsr, -gsi)
			sr = ( tdr * gsr ) + ( tdi * gsi );
			si = ( -tdr * gsi ) + ( tdi * gsr );

			// Undo the scaling of r
			if ( count !== 0 ) {
				if ( count > 0 ) {
					for ( j = 0; j < count; j += 1 ) {
						rr *= SAFMX2;
						ri *= SAFMX2;
					}
				} else {
					for ( j = 0; j < -count; j += 1 ) {
						rr *= SAFMN2;
						ri *= SAFMN2;
					}
				}
			}
		}

		c[ ic ] = cs;
		yv[ iy ] = sr;
		yv[ iy + 1 ] = si;
		xv[ ix ] = rr;
		xv[ ix + 1 ] = ri;

		ic += strideC;
		iy += sy;
		ix += sx;
	}
}


// EXPORTS //

export default zlargv;
