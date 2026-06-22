// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlasd7 from './dlasd7.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlasd7, 'ndarray', ndarray );


// EXPORTS //

export default dlasd7;
