
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlatrz from './dlatrz.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlatrz, 'ndarray', ndarray );


// EXPORTS //

export default dlatrz;
