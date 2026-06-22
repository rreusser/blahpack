// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaruv from './dlaruv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaruv, 'ndarray', ndarray );


// EXPORTS //

export default dlaruv;
