// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaebz from './dlaebz.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaebz, 'ndarray', ndarray );


// EXPORTS //

export default dlaebz;
