// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtrexc from './dtrexc.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtrexc, 'ndarray', ndarray );


// EXPORTS //

export default dtrexc;
