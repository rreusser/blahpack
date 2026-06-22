
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlarrr from './dlarrr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlarrr, 'ndarray', ndarray );


// EXPORTS //

export default dlarrr;
