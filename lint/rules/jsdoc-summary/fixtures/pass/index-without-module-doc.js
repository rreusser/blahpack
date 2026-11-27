// target: lib/blas/base/dgemm/lib/index.js
/**
* @license MIT
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgemm from './dgemm.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgemm, 'ndarray', ndarray );


// EXPORTS //

// The inline type cast below is not a module JSDoc (ticket 0124).
export default /** @type {typeof dgemm & { ndarray: typeof ndarray }} */ ( dgemm );
export { ndarray };
