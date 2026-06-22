
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsbgv from './dsbgv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsbgv, 'ndarray', ndarray );


// EXPORTS //

export default dsbgv;
