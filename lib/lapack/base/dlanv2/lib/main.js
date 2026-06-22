// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlanv2 from './dlanv2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlanv2, 'ndarray', ndarray );


// EXPORTS //

export default dlanv2;
