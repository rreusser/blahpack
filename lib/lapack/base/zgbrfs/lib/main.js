
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgbrfs from './zgbrfs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgbrfs, 'ndarray', ndarray );


// EXPORTS //

export default zgbrfs;
