// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dstevr from './dstevr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dstevr, 'ndarray', ndarray );


// EXPORTS //

export default dstevr;
