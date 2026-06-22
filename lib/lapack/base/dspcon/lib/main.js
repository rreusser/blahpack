// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dspcon from './dspcon.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dspcon, 'ndarray', ndarray );


// EXPORTS //

export default dspcon;
