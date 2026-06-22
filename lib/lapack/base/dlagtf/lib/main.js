// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlagtf from './dlagtf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlagtf, 'ndarray', ndarray );


// EXPORTS //

export default dlagtf;
