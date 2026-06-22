// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaln2 from './dlaln2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaln2, 'ndarray', ndarray );


// EXPORTS //

export default dlaln2;
