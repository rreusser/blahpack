
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlansp from './dlansp.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlansp, 'ndarray', ndarray );


// EXPORTS //

export default dlansp;
