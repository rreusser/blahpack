// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlasd2 from './dlasd2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlasd2, 'ndarray', ndarray );


// EXPORTS //

export default dlasd2;
