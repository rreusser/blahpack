// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsyrfs from './dsyrfs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsyrfs, 'ndarray', ndarray );


// EXPORTS //

export default dsyrfs;
