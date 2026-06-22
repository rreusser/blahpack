// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlarrj from './dlarrj.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlarrj, 'ndarray', ndarray );


// EXPORTS //

export default dlarrj;
