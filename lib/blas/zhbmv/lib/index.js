/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhbmv from './zhbmv.js';
import strided from './strided.js';


// MAIN //

setReadOnly( zhbmv, 'strided', strided );


// EXPORTS //

export default /** @type {typeof zhbmv & { strided: typeof strided }} */ ( zhbmv );
export { strided };
