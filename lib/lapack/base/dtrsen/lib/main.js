// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtrsen from './dtrsen.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtrsen, 'ndarray', ndarray );


// EXPORTS //

export default dtrsen;
