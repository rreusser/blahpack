// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgees from './zgees.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgees, 'ndarray', ndarray );


// EXPORTS //

export default zgees;
