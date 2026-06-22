// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgerfs from './zgerfs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgerfs, 'ndarray', ndarray );


// EXPORTS //

export default zgerfs;
