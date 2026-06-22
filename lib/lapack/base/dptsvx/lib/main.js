
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dptsvx from './dptsvx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dptsvx, 'ndarray', ndarray );


// EXPORTS //

export default dptsvx;
