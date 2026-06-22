
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtzrzf from './dtzrzf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtzrzf, 'ndarray', ndarray );


// EXPORTS //

export default dtzrzf;
