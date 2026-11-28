/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/**
* Computes a component-wise relative backward error.
*
* ## Notes
*
* -   Computes `max(i) ( |R(i)| / ( |op(A_s)|*|Y| + |B_s| )(i) )` for each right-hand side.
* -   Uses `CABS1(z) = |Re(z)| + |Im(z)|`, the LAPACK fast 1-norm modulus for error bounds (not the true complex modulus).
* -   A guard term `(nz+1)*safmin` is added to the numerator to avoid spuriously zero residuals; entries where `ayb(i,j) == 0` are skipped.
*
* @module @rreusser/blahpack/lapack/zla_lin_berr
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zlaLinBerr from '@rreusser/blahpack/lapack/zla_lin_berr';
*
* var res = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
* var ayb = new Float64Array( [ 1.0, 2.0 ] );
* var berr = new Float64Array( 1 );
*
* // berr[ 0 ] = max( (|1|+|2|)/1, (|3|+|4|)/2 ):
* zlaLinBerr( 'column-major', 2, 2, 1, res, 2, ayb, 2, berr, 1 );
* // berr => <Float64Array>[ 3.5 ]
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlaLinBerr from './zla_lin_berr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlaLinBerr, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zlaLinBerr & { ndarray: typeof ndarray }} */ ( zlaLinBerr );
export { ndarray };
