// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dstevx from './dstevx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dstevx, 'ndarray', ndarray );


// EXPORTS //

export default dstevx;
