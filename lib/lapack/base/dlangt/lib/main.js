// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlangt from './dlangt.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlangt, 'ndarray', ndarray );


// EXPORTS //

export default dlangt;
