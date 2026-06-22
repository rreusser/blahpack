
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlarrf from './dlarrf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlarrf, 'ndarray', ndarray );


// EXPORTS //

export default dlarrf;
