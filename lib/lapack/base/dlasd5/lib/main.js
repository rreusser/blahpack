// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlasd5 from './dlasd5.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlasd5, 'ndarray', ndarray );


// EXPORTS //

export default dlasd5;
