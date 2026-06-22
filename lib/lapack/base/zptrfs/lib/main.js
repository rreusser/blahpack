// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zptrfs from './zptrfs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zptrfs, 'ndarray', ndarray );


// EXPORTS //

export default zptrfs;
