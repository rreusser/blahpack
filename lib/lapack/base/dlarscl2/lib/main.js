// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlarscl2 from './dlarscl2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlarscl2, 'ndarray', ndarray );


// EXPORTS //

export default dlarscl2;
