// target: lib/blas/dgemm/lib/index.js
/**
* @license MIT
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgemm from './dgemm.js';
import strided from './strided.js';


// MAIN //

setReadOnly( dgemm, 'strided', strided );


// EXPORTS //

// The inline type cast below is not a module JSDoc (ticket 0124).
export default /** @type {typeof dgemm & { strided: typeof strided }} */ ( dgemm );
export { strided };
