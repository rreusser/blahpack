
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgeevx from './dgeevx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgeevx, 'ndarray', ndarray );


// EXPORTS //

export default dgeevx;
