/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from ARPACK (arpack-ng 3.9.1), Copyright (c) 1996-2008 Rice
* University. Developed by D.C. Sorensen, R.B. Lehoucq, C. Yang, and
* K. Maschhoff, under the BSD-3-Clause license. See LICENSE.txt in the
* repository root for the full license text and upstream attribution.
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsortr from './dsortr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsortr, 'ndarray', ndarray );


// EXPORTS //

export default dsortr;
