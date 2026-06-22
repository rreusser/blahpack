
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dspgvx from './dspgvx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dspgvx, 'ndarray', ndarray );


// EXPORTS //

export default dspgvx;
