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
* Compute the reciprocal condition numbers for the eigenvectors of a real symmetric or complex Hermitian matrix.
*
* ## Notes
*
* -   See LAPACK reference documentation for full algorithmic details.
*
* @module @rreusser/blahpack/lapack/ddisna
*
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import ddisna from '@rreusser/blahpack/lapack/ddisna';
*
* var d = new Float64Array( [ 1.0, 2.0, 4.0, 8.0 ] );
* var SEP = new Float64Array( 4 );
*
* ddisna( 'eigenvalues', 4, 4, d, 1, SEP, 1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ddisna from './ddisna.js';
import strided from './strided.js';


// MAIN //

setReadOnly( ddisna, 'strided', strided );


// EXPORTS //

export default /** @type {typeof ddisna & { strided: typeof strided }} */ ( ddisna );
export { strided };
