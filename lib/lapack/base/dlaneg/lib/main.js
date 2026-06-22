
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaneg from './dlaneg.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaneg, 'ndarray', ndarray );


// EXPORTS //

export default dlaneg;
