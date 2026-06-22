
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgtrfs from './zgtrfs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgtrfs, 'ndarray', ndarray );


// EXPORTS //

export default zgtrfs;
