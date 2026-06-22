
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgeqrt2 from './dgeqrt2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgeqrt2, 'ndarray', ndarray );


// EXPORTS //

export default dgeqrt2;
