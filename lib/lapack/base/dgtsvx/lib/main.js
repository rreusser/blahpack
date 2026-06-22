// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgtsvx from './dgtsvx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgtsvx, 'ndarray', ndarray );


// EXPORTS //

export default dgtsvx;
