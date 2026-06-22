
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dhsein from './dhsein.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dhsein, 'ndarray', ndarray );


// EXPORTS //

export default dhsein;
