// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dptcon from './dptcon.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dptcon, 'ndarray', ndarray );


// EXPORTS //

export default dptcon;
