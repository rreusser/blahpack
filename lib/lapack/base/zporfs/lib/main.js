// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zporfs from './zporfs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zporfs, 'ndarray', ndarray );


// EXPORTS //

export default zporfs;
