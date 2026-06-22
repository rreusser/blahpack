// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgesvx from './dgesvx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgesvx, 'ndarray', ndarray );


// EXPORTS //

export default dgesvx;
