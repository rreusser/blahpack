// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlarrc from './dlarrc.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlarrc, 'ndarray', ndarray );


// EXPORTS //

export default dlarrc;
