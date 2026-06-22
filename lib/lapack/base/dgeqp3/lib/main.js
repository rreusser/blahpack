// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgeqp3 from './dgeqp3.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgeqp3, 'ndarray', ndarray );


// EXPORTS //

export default dgeqp3;
