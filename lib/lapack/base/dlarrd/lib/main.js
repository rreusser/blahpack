

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlarrd from './dlarrd.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlarrd, 'ndarray', ndarray );


// EXPORTS //

export default dlarrd;
