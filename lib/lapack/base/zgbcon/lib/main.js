// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgbcon from './zgbcon.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgbcon, 'ndarray', ndarray );


// EXPORTS //

export default zgbcon;
