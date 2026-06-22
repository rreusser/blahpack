// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaexc from './dlaexc.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaexc, 'ndarray', ndarray );


// EXPORTS //

export default dlaexc;
