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
* Multiplies a general matrix by a unitary matrix.
*
* ## Notes
*
* -   The unitary matrix `Q` has block form `Q = [[Q11, Q12], [Q21, Q22]]` where `Q11` is `N1 x N2`, `Q12` is `N1 x N1` lower triangular, `Q21` is `N2 x N2` upper triangular, and `Q22` is `N2 x N1`. The routine computes one of `Q*C`, `Q**H*C`, `C*Q`, or `C*Q**H`, overwriting `C`.
*
* @module @rreusser/blahpack/lapack/base/zunm22
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zunm22 from '@rreusser/blahpack/lapack/base/zunm22';
*
* var Q = new Complex128Array( 25 );
* var C = new Complex128Array( 20 );
* var WORK = new Complex128Array( 20 );
*
* zunm22( 'column-major', 'left', 'no-transpose', 5, 4, 3, 2, Q, 5, C, 5, WORK, 1, 20 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zunm22 from './zunm22.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zunm22, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zunm22 & { ndarray: typeof ndarray }} */ ( zunm22 );
export { ndarray };
