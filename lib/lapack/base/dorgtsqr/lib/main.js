
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dorgtsqr from './dorgtsqr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dorgtsqr, 'ndarray', ndarray );


// EXPORTS //

export default dorgtsqr;
