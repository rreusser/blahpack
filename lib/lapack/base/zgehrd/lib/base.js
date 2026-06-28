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

/* eslint-disable max-len, max-params */
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zaxpy from '../../../../blas/base/zaxpy/lib/base.js';
import zgehd2 from '../../zgehd2/lib/base.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import zlahr2 from '../../zlahr2/lib/base.js';
import zlarfb from '../../zlarfb/lib/base.js';
import ztrmm from '../../../../blas/base/ztrmm/lib/base.js';
var NBMAX = 64;
var LDT = NBMAX + 1;
var ONE = new Complex128( 1.0, 0.0 );
var NEGONE = new Complex128( -1.0, 0.0 );
/**
* Reduces a complex general matrix to upper Hessenberg form using blocked algorithm.
*
* @private
* @param {integer} N - order of the matrix
* @param {integer} ilo - lower index of the balanced matrix
* @param {integer} ihi - upper index of the balanced matrix
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - first stride of A
* @param {integer} strideA2 - second stride of A
* @param {integer} offsetA - offset into A
* @param {Complex128Array} TAU - output array of scalar factors
* @param {integer} strideTAU - stride of TAU
* @param {integer} offsetTAU - offset into TAU
* @param {Complex128Array} WORK - workspace array
* @param {integer} strideWork - stride of WORK
* @param {integer} offsetWork - offset into WORK
* @returns {integer} info value
*/
function zgehrd( N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	var LDWORK;
	var tauv;
	var eiR;
	var eiI;
	var IWT;
	var sa1;
	var sa2;
	var av;
	var oA;
	var oE;
	var NB;
	var NX;
	var NH;
	var IB;
	var i;
	var j;
	NB = 32;
	av = reinterpret( A, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;
	tauv = reinterpret( TAU, 0 );
	for ( i = 0; i < ilo - 1; i++ ) {
		tauv[ (( offsetTAU + (i * strideTAU) ) * 2) ] = 0.0;
		tauv[ (( offsetTAU + (i * strideTAU) ) * 2) + 1 ] = 0.0;
	}
	for ( i = Math.max( 0, ihi - 1 ); i < N - 1; i++ ) {
		tauv[ (( offsetTAU + (i * strideTAU) ) * 2) ] = 0.0;
		tauv[ (( offsetTAU + (i * strideTAU) ) * 2) + 1 ] = 0.0;
	}
	NH = ihi - ilo + 1;
	if ( NH <= 1 ) {
		return 0;
	}
	NX = Math.max( NB, NB );
	LDWORK = N;
	if ( NB < 2 || NB >= NH ) {
		i = ilo;
	} else {
		IWT = N * NB;
		for ( i = ilo; i <= ihi - 1 - NX; i += NB ) {
			IB = Math.min( NB, ihi - i );
			zlahr2( ihi, i, IB, A, strideA1, strideA2, offsetA + (( i - 1 ) * strideA2), TAU, strideTAU, offsetTAU + (( i - 1 ) * strideTAU), WORK, 1, LDT, offsetWork + IWT, WORK, 1, LDWORK, offsetWork );
			oE = oA + (( i + IB - 1 ) * sa1) + (( i + IB - 2 ) * sa2);
			eiR = av[ oE ];
			eiI = av[ oE + 1 ];
			av[ oE ] = 1.0;
			av[ oE + 1 ] = 0.0;
			zgemm( 'no-transpose', 'conjugate-transpose', ihi, ihi - i - IB + 1, IB, NEGONE, WORK, 1, LDWORK, offsetWork, A, strideA1, strideA2, offsetA + (( i + IB - 1 ) * strideA1) + (( i - 1 ) * strideA2), ONE, A, strideA1, strideA2, offsetA + (( i + IB - 1 ) * strideA2) );
			av[ oE ] = eiR;
			av[ oE + 1 ] = eiI;
			ztrmm( 'right', 'lower', 'conjugate-transpose', 'unit', i, IB - 1, ONE, A, strideA1, strideA2, offsetA + (i * strideA1) + (( i - 1 ) * strideA2), WORK, 1, LDWORK, offsetWork );
			for ( j = 0; j < IB - 1; j++ ) {
				zaxpy( i, NEGONE, WORK, 1, offsetWork + (LDWORK * j), A, strideA1, offsetA + (( i + j ) * strideA2) );
			}
			zlarfb( 'left', 'conjugate-transpose', 'forward', 'columnwise', ihi - i, N - i - IB + 1, IB, A, strideA1, strideA2, offsetA + (i * strideA1) + (( i - 1 ) * strideA2), WORK, 1, LDT, offsetWork + IWT, A, strideA1, strideA2, offsetA + (i * strideA1) + (( i + IB - 1 ) * strideA2), WORK, 1, LDWORK, offsetWork );
		}
	}
	zgehd2( N, i, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
	return 0;
}
export default zgehrd;
