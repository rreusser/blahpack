// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlasdt from './dlasdt.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlasdt, 'ndarray', ndarray );


// EXPORTS //

export default dlasdt;
