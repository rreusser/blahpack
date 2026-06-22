// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlartv from './dlartv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlartv, 'ndarray', ndarray );


// EXPORTS //

export default dlartv;
