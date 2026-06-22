

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhsein from './zhsein.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhsein, 'ndarray', ndarray );


// EXPORTS //

export default zhsein;
