
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlaein from './zlaein.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlaein, 'ndarray', ndarray );


// EXPORTS //

export default zlaein;
