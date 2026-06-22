
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dspsvx from './dspsvx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dspsvx, 'ndarray', ndarray );


// EXPORTS //

export default dspsvx;
