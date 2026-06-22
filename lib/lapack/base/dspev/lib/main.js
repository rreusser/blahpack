
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dspev from './dspev.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dspev, 'ndarray', ndarray );


// EXPORTS //

export default dspev;
