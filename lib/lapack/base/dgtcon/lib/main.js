// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgtcon from './dgtcon.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgtcon, 'ndarray', ndarray );


// EXPORTS //

export default dgtcon;
