// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dstebz from './dstebz.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dstebz, 'ndarray', ndarray );


// EXPORTS //

export default dstebz;
