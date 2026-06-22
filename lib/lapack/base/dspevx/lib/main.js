
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dspevx from './dspevx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dspevx, 'ndarray', ndarray );


// EXPORTS //

export default dspevx;
