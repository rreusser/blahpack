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

/* eslint-disable max-len, max-params, max-lines-per-function, max-statements */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlassq from '../../zlassq/lib/base.js';
import cmplx from '../../../../cmplx.js';


// FUNCTIONS //

/**
* Computes the max-norm of a complex triangular matrix in packed storage.
*
* @private
* @param {Float64Array} Av - Float64 view of packed matrix
* @param {integer} sap - stride in Float64 elements
* @param {integer} oA - offset in Float64 elements
* @param {boolean} udiag - whether the matrix has unit diagonal
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix
* @returns {number} max-norm value
*/
function maxNorm( Av, sap, oA, udiag, uplo, N ) {
	var value;
	var temp;
	var k;
	var i;
	var j;

	k = oA;
	value = ( udiag ) ? 1.0 : 0.0;
	if ( uplo === 'upper' ) {
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < j; i++ ) {
				temp = cmplx.absAt( Av, k );
				if ( value < temp || temp !== temp ) {
					value = temp;
				}
				k += sap;
			}
			if ( udiag ) {
				k += sap; // skip diagonal
			} else {
				temp = cmplx.absAt( Av, k );
				if ( value < temp || temp !== temp ) {
					value = temp;
				}
				k += sap;
			}
		}
	} else {
		for ( j = 0; j < N; j++ ) {
			if ( udiag ) {
				k += sap; // skip diagonal
			} else {
				temp = cmplx.absAt( Av, k );
				if ( value < temp || temp !== temp ) {
					value = temp;
				}
				k += sap;
			}
			for ( i = j + 1; i < N; i++ ) {
				temp = cmplx.absAt( Av, k );
				if ( value < temp || temp !== temp ) {
					value = temp;
				}
				k += sap;
			}
		}
	}
	return value;
}

/**
* Computes the one-norm of a complex triangular matrix in packed storage.
*
* @private
* @param {Float64Array} Av - Float64 view of packed matrix
* @param {integer} sap - stride in Float64 elements
* @param {integer} oA - offset in Float64 elements
* @param {boolean} udiag - whether the matrix has unit diagonal
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix
* @returns {number} one-norm value
*/
function oneNorm( Av, sap, oA, udiag, uplo, N ) {
	var value;
	var sum;
	var k;
	var i;
	var j;

	value = 0.0;
	k = oA;
	if ( uplo === 'upper' ) {
		for ( j = 0; j < N; j++ ) {
			sum = ( udiag ) ? 1.0 : 0.0;
			for ( i = 0; i < j; i++ ) {
				sum += cmplx.absAt( Av, k );
				k += sap;
			}
			if ( udiag ) {
				k += sap; // skip diagonal
			} else {
				sum += cmplx.absAt( Av, k );
				k += sap;
			}
			if ( value < sum || sum !== sum ) {
				value = sum;
			}
		}
	} else {
		for ( j = 0; j < N; j++ ) {
			sum = ( udiag ) ? 1.0 : 0.0;
			if ( udiag ) {
				k += sap; // skip diagonal
			} else {
				sum += cmplx.absAt( Av, k );
				k += sap;
			}
			for ( i = j + 1; i < N; i++ ) {
				sum += cmplx.absAt( Av, k );
				k += sap;
			}
			if ( value < sum || sum !== sum ) {
				value = sum;
			}
		}
	}
	return value;
}

/**
* Computes the infinity-norm of a complex triangular matrix in packed storage.
*
* @private
* @param {Float64Array} Av - Float64 view of packed matrix
* @param {integer} sap - stride in Float64 elements
* @param {integer} oA - offset in Float64 elements
* @param {boolean} udiag - whether the matrix has unit diagonal
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} WORK - workspace array
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @returns {number} infinity-norm value
*/
function infNorm( Av, sap, oA, udiag, uplo, N, WORK, strideWORK, offsetWORK ) {
	var value;
	var temp;
	var wi;
	var k;
	var i;
	var j;

	for ( i = 0; i < N; i++ ) {
		WORK[ offsetWORK + ( i * strideWORK ) ] = ( udiag ) ? 1.0 : 0.0;
	}
	k = oA;
	if ( uplo === 'upper' ) {
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < j; i++ ) {
				wi = offsetWORK + ( i * strideWORK );
				WORK[ wi ] += cmplx.absAt( Av, k );
				k += sap;
			}
			if ( udiag ) {
				k += sap; // skip diagonal
			} else {
				wi = offsetWORK + ( j * strideWORK );
				WORK[ wi ] += cmplx.absAt( Av, k );
				k += sap;
			}
		}
	} else {
		for ( j = 0; j < N; j++ ) {
			if ( udiag ) {
				k += sap; // skip diagonal
			} else {
				wi = offsetWORK + ( j * strideWORK );
				WORK[ wi ] += cmplx.absAt( Av, k );
				k += sap;
			}
			for ( i = j + 1; i < N; i++ ) {
				wi = offsetWORK + ( i * strideWORK );
				WORK[ wi ] += cmplx.absAt( Av, k );
				k += sap;
			}
		}
	}
	value = 0.0;
	for ( i = 0; i < N; i++ ) {
		temp = WORK[ offsetWORK + ( i * strideWORK ) ];
		if ( value < temp || temp !== temp ) {
			value = temp;
		}
	}
	return value;
}

/**
* Computes the Frobenius norm of a complex triangular matrix in packed storage.
*
* @private
* @param {Complex128Array} AP - packed triangular matrix
* @param {integer} strideAP - stride for AP (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for AP (in complex elements)
* @param {boolean} udiag - whether the matrix has unit diagonal
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix
* @returns {number} Frobenius norm value
*/
function frobNorm( AP, strideAP, offsetAP, udiag, uplo, N ) {
	var scale;
	var out;
	var sum;
	var k;
	var j;

	if ( uplo === 'upper' ) {
		if ( udiag ) {
			scale = 1.0;
			sum = N;
			k = offsetAP + 1; // skip first diagonal
			for ( j = 1; j < N; j++ ) {
				out = zlassq( j, AP, strideAP, k, scale, sum );
				scale = out.scl;
				sum = out.sumsq;
				k += j + 1;
			}
		} else {
			scale = 0.0;
			sum = 1.0;
			k = offsetAP;
			for ( j = 0; j < N; j++ ) {
				out = zlassq( j + 1, AP, strideAP, k, scale, sum );
				scale = out.scl;
				sum = out.sumsq;
				k += j + 1;
			}
		}
	} else if ( udiag ) {
		scale = 1.0;
		sum = N;
		k = offsetAP + 1; // skip first diagonal
		for ( j = 0; j < N - 1; j++ ) {
			out = zlassq( N - j - 1, AP, strideAP, k, scale, sum );
			scale = out.scl;
			sum = out.sumsq;
			k += N - j;
		}
	} else {
		scale = 0.0;
		sum = 1.0;
		k = offsetAP;
		for ( j = 0; j < N; j++ ) {
			out = zlassq( N - j, AP, strideAP, k, scale, sum );
			scale = out.scl;
			sum = out.sumsq;
			k += N - j;
		}
	}
	return scale * Math.sqrt( sum );
}


// MAIN //

/**
* Returns the value of the one-norm, Frobenius norm, infinity-norm, or the element of largest absolute value of a complex triangular matrix supplied in packed form.
*
* @private
* @param {string} norm - norm type: `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} AP - packed triangular matrix
* @param {integer} strideAP - stride for AP (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for AP (in complex elements)
* @param {Float64Array} WORK - workspace array (length >= N when norm is `'inf-norm'`)
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @returns {number} norm value
*/
function zlantp( norm, uplo, diag, N, AP, strideAP, offsetAP, WORK, strideWORK, offsetWORK ) { // eslint-disable-line max-len
	var udiag;
	var sap;
	var Av;
	var oA;

	if ( N === 0 ) {
		return 0.0;
	}

	Av = reinterpret( AP, 0 );
	sap = strideAP * 2;
	oA = offsetAP * 2;
	udiag = ( diag === 'unit' );

	if ( norm === 'max' ) {
		return maxNorm( Av, sap, oA, udiag, uplo, N );
	}
	if ( norm === 'one-norm' ) {
		return oneNorm( Av, sap, oA, udiag, uplo, N );
	}
	if ( norm === 'inf-norm' ) {
		return infNorm( Av, sap, oA, udiag, uplo, N, WORK, strideWORK, offsetWORK );
	}
	if ( norm === 'frobenius' ) {
		return frobNorm( AP, strideAP, offsetAP, udiag, uplo, N );
	}
	return 0.0;
}


// EXPORTS //

export default zlantp;
