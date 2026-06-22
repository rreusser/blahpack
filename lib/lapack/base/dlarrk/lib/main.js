
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlarrk from './dlarrk.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlarrk, 'ndarray', ndarray );


// EXPORTS //

export default dlarrk;
