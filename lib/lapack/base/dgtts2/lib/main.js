// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgtts2 from './dgtts2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgtts2, 'ndarray', ndarray );


// EXPORTS //

export default dgtts2;
