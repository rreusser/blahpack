
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dorm22 from './dorm22.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dorm22, 'ndarray', ndarray );


// EXPORTS //

export default dorm22;
