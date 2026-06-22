// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlapmr from './dlapmr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlapmr, 'ndarray', ndarray );


// EXPORTS //

export default dlapmr;
