program test_dlagts
  use test_utils
  implicit none

  double precision :: a(5), b(4), c(4), d(3), y(5)
  integer :: in(5), info
  double precision :: tol

  ! Set up a 5x5 tridiagonal, factorize first
  a(1) = 4.0d0; a(2) = 4.0d0; a(3) = 4.0d0; a(4) = 4.0d0; a(5) = 4.0d0
  b(1) = 1.0d0; b(2) = 1.0d0; b(3) = 1.0d0; b(4) = 1.0d0
  c(1) = 1.0d0; c(2) = 1.0d0; c(3) = 1.0d0; c(4) = 1.0d0

  tol = 0.0d0
  call DLAGTF(5, a, 1.0d0, b, c, tol, d, in, info)

  ! Test 1: Solve (T-lambda*I)x = y with perturbation (job=-1)
  y(1) = 1.0d0; y(2) = 2.0d0; y(3) = 3.0d0; y(4) = 4.0d0; y(5) = 5.0d0
  call DLAGTS(-1, 5, a, b, c, d, in, y, tol, info)
  call begin_test('solve_job_m1')
  call print_int('info', info)
  call print_array('y', y, 5)
  call print_scalar('tol', tol)
  call end_test()

  ! Test 2: Solve transpose with perturbation (job=-2)
  ! Re-factorize
  a(1) = 4.0d0; a(2) = 4.0d0; a(3) = 4.0d0; a(4) = 4.0d0; a(5) = 4.0d0
  b(1) = 1.0d0; b(2) = 1.0d0; b(3) = 1.0d0; b(4) = 1.0d0
  c(1) = 1.0d0; c(2) = 1.0d0; c(3) = 1.0d0; c(4) = 1.0d0
  tol = 0.0d0
  call DLAGTF(5, a, 1.0d0, b, c, tol, d, in, info)
  y(1) = 1.0d0; y(2) = 2.0d0; y(3) = 3.0d0; y(4) = 4.0d0; y(5) = 5.0d0
  call DLAGTS(-2, 5, a, b, c, d, in, y, tol, info)
  call begin_test('solve_job_m2')
  call print_int('info', info)
  call print_array('y', y, 5)
  call print_scalar('tol', tol)
  call end_test()

  ! Test 3: N=0
  call DLAGTS(-1, 0, a, b, c, d, in, y, tol, info)
  call begin_test('n_equals_0')
  call print_int('info', info)
  call end_test()

  ! Test 4: Solve without perturbation (job=1)
  a(1) = 4.0d0; a(2) = 4.0d0; a(3) = 4.0d0; a(4) = 4.0d0; a(5) = 4.0d0
  b(1) = 1.0d0; b(2) = 1.0d0; b(3) = 1.0d0; b(4) = 1.0d0
  c(1) = 1.0d0; c(2) = 1.0d0; c(3) = 1.0d0; c(4) = 1.0d0
  tol = 0.0d0
  call DLAGTF(5, a, 1.0d0, b, c, tol, d, in, info)
  y(1) = 1.0d0; y(2) = 2.0d0; y(3) = 3.0d0; y(4) = 4.0d0; y(5) = 5.0d0
  call DLAGTS(1, 5, a, b, c, d, in, y, tol, info)
  call begin_test('solve_job_1')
  call print_int('info', info)
  call print_array('y', y, 5)
  call end_test()

  ! Test 5: Solve transpose without perturbation (job=2)
  a(1) = 4.0d0; a(2) = 4.0d0; a(3) = 4.0d0; a(4) = 4.0d0; a(5) = 4.0d0
  b(1) = 1.0d0; b(2) = 1.0d0; b(3) = 1.0d0; b(4) = 1.0d0
  c(1) = 1.0d0; c(2) = 1.0d0; c(3) = 1.0d0; c(4) = 1.0d0
  tol = 0.0d0
  call DLAGTF(5, a, 1.0d0, b, c, tol, d, in, info)
  y(1) = 1.0d0; y(2) = 2.0d0; y(3) = 3.0d0; y(4) = 4.0d0; y(5) = 5.0d0
  call DLAGTS(2, 5, a, b, c, d, in, y, tol, info)
  call begin_test('solve_job_2')
  call print_int('info', info)
  call print_array('y', y, 5)
  call end_test()

  ! Test 6: N=1 case
  a(1) = 3.0d0
  tol = 0.0d0
  call DLAGTF(1, a, 0.5d0, b, c, tol, d, in, info)
  y(1) = 7.0d0
  call DLAGTS(-1, 1, a, b, c, d, in, y, tol, info)
  call begin_test('n_equals_1')
  call print_int('info', info)
  call print_array('y', y, 1)
  call end_test()

  ! Test 7: N=2 case (exercises the k=N-2 path in back substitution)
  a(1) = 5.0d0; a(2) = 3.0d0
  b(1) = 2.0d0
  c(1) = 0.5d0
  tol = 0.0d0
  call DLAGTF(2, a, 0.0d0, b, c, tol, d, in, info)
  y(1) = 1.0d0; y(2) = 2.0d0
  call DLAGTS(1, 2, a, b, c, d, in, y, tol, info)
  call begin_test('solve_job_1_n2')
  call print_int('info', info)
  call print_array('y', y, 2)
  call end_test()

  ! Test 8: job=2 with N=2
  a(1) = 5.0d0; a(2) = 3.0d0
  b(1) = 2.0d0
  c(1) = 0.5d0
  tol = 0.0d0
  call DLAGTF(2, a, 0.0d0, b, c, tol, d, in, info)
  y(1) = 1.0d0; y(2) = 2.0d0
  call DLAGTS(2, 2, a, b, c, d, in, y, tol, info)
  call begin_test('solve_job_2_n2')
  call print_int('info', info)
  call print_array('y', y, 2)
  call end_test()

  ! Test 9: job=-2 with N=2
  a(1) = 5.0d0; a(2) = 3.0d0
  b(1) = 2.0d0
  c(1) = 0.5d0
  tol = 0.0d0
  call DLAGTF(2, a, 0.0d0, b, c, tol, d, in, info)
  y(1) = 1.0d0; y(2) = 2.0d0
  call DLAGTS(-2, 2, a, b, c, d, in, y, tol, info)
  call begin_test('solve_job_m2_n2')
  call print_int('info', info)
  call print_array('y', y, 2)
  call end_test()

  ! Test 10: job=-1 with explicit tol
  a(1) = 4.0d0; a(2) = 4.0d0; a(3) = 4.0d0; a(4) = 4.0d0; a(5) = 4.0d0
  b(1) = 1.0d0; b(2) = 1.0d0; b(3) = 1.0d0; b(4) = 1.0d0
  c(1) = 1.0d0; c(2) = 1.0d0; c(3) = 1.0d0; c(4) = 1.0d0
  tol = 1.0d-8
  call DLAGTF(5, a, 1.0d0, b, c, tol, d, in, info)
  y(1) = 1.0d0; y(2) = 2.0d0; y(3) = 3.0d0; y(4) = 4.0d0; y(5) = 5.0d0
  call DLAGTS(-1, 5, a, b, c, d, in, y, tol, info)
  call begin_test('solve_job_m1_explicit_tol')
  call print_int('info', info)
  call print_array('y', y, 5)
  call end_test()

end program
