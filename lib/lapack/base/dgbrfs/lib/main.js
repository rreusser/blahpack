
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgbrfs from './dgbrfs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgbrfs, 'ndarray', ndarray );


// EXPORTS //

export default dgbrfs;
