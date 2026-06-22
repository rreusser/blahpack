// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dptrfs from './dptrfs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dptrfs, 'ndarray', ndarray );


// EXPORTS //

export default dptrfs;
