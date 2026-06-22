
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaein from './dlaein.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaein, 'ndarray', ndarray );


// EXPORTS //

export default dlaein;
