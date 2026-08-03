// expect: mainNoNdarray
// FAIL — main.js exports the default but never attaches the ndarray variant.
import ddot from './ddot.js';
export default ddot;
