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
* Multiplies a general matrix by the unitary matrix Q from an RZ factorization.
*
* ## Notes
*
* -   `A` contains the meaningful trailing `l`-vectors of the Householder reflectors as returned by `ztzrzf`. When `trans === 'conjugate-transpose'`, the scalar factor `tau(i)` is replaced by its complex conjugate before the reflector is applied.
*
* @module @rreusser/blahpack/lapack/base/zunmr3
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zunmr3 from '@rreusser/blahpack/lapack/base/zunmr3';
*
* var A = new Complex128Array( 6 );
* var TAU = new Complex128Array( 2 );
* var C = new Complex128Array( 9 );
* var WORK = new Complex128Array( 3 );
*
* zunmr3( 'column-major', 'left', 'no-transpose', 3, 3, 2, 0, A, 2, TAU, 1, C, 3, WORK, 1 );
* // C unchanged when all reflectors are trivial
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zunmr3 from './zunmr3.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zunmr3, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zunmr3 & { ndarray: typeof ndarray }} */ ( zunmr3 );
export { ndarray };
