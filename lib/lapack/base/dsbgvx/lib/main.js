
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsbgvx from './dsbgvx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsbgvx, 'ndarray', ndarray );


// EXPORTS //

export default dsbgvx;
