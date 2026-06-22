// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgtrfs from './dgtrfs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgtrfs, 'ndarray', ndarray );


// EXPORTS //

export default dgtrfs;
