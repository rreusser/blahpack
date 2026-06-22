// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zsyrfs from './zsyrfs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zsyrfs, 'ndarray', ndarray );


// EXPORTS //

export default zsyrfs;
