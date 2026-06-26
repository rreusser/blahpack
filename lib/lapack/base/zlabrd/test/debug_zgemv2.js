
// Inline zgemv with debug logging
var NEGONE = new Float64Array( [ -1.0, 0.0 ] );
var ONE = new Float64Array( [ 1.0, 0.0 ] );

var Y = new Float64Array([
	0, 0,
	0.2703758010851802, 1.215561809938843,
	1.8293498572043647, -0.20000000000000007
]);

var A = new Float64Array([
	1, -0,
	-0.18739371113967984, 0.151881138897275,
	0.05389074200880654, -0.0560977128927152,
	0.5, 0.4,
	1, 0.3,
	-0.7, 0.6,
	0.8, -0.2,
	-0.3, -0.1,
	1.5, -0.5
]);

// Call: zgemv('No transpose', 2, 1, NEGONE, Y, 1, 3, 2, A, 3, 0, ONE, A, 3, 6)
var trans = 'No transpose';
var M = 2;
var N = 1;
var alpha = NEGONE;
var Amat = Y; // matrix is Y
var strideA1 = 1;
var strideA2 = 3;
var offsetA = 2;
var x = A;
var strideX = 3;
var offsetX = 0;
var beta = ONE;
var y = A;
var strideY = 3;
var offsetY = 6;

var alphaR = alpha[0]; // -1
var alphaI = alpha[1]; // 0
var betaR = beta[0]; // 1
var betaI = beta[1]; // 0

var noTrans = true;
var lenx = N; // 1
var leny = M; // 2

var sa1 = strideA1 * 2; // 2
var sa2 = strideA2 * 2; // 6
var sx = strideX * 2; // 6
var sy = strideY * 2; // 6

console.log('sa1:', sa1, 'sa2:', sa2, 'sx:', sx, 'sy:', sy);
console.log('lenx:', lenx, 'leny:', leny);
console.log('alphaR:', alphaR, 'alphaI:', alphaI);
console.log('betaR:', betaR, 'betaI:', betaI);

// Beta = 1, skip beta scaling

// Alpha != 0, proceed

var jx = offsetX; // 0
console.log('\njx =', jx);

for (var j = 0; j < N; j++) {
	var tempR = alphaR * x[jx] - alphaI * x[jx+1];
	var tempI = alphaR * x[jx+1] + alphaI * x[jx];
	console.log('j=' + j + ': x[' + jx + ']=' + x[jx] + ', x[' + (jx+1) + ']=' + x[jx+1]);
	console.log('  temp = (' + tempR + ', ' + tempI + ')');

	var iy = offsetY; // 6
	var ai = offsetA + j * sa2; // 2 + 0 = 2
	console.log('  iy=' + iy + ', ai=' + ai);

	for (var i = 0; i < M; i++) {
		var aijR = Amat[ai];
		var aijI = Amat[ai+1];
		console.log('  i=' + i + ': Amat[' + ai + ']=' + aijR + ', Amat[' + (ai+1) + ']=' + aijI);
		console.log('    y[' + iy + '] before: ' + y[iy] + ', y[' + (iy+1) + '] before: ' + y[iy+1]);

		y[iy] += tempR * aijR - tempI * aijI;
		y[iy+1] += tempR * aijI + tempI * aijR;

		console.log('    y[' + iy + '] after: ' + y[iy] + ', y[' + (iy+1) + '] after: ' + y[iy+1]);

		iy += sy;
		ai += sa1;
	}
	jx += sx;
}

console.log('\nFinal A:', Array.from(A));
