// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dstev from './dstev.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dstev, 'ndarray', ndarray );


// EXPORTS //

export default dstev;
