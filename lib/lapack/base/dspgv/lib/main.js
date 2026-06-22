
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dspgv from './dspgv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dspgv, 'ndarray', ndarray );


// EXPORTS //

export default dspgv;
