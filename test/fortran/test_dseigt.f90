program test_dseigt
  use test_utils
  implicit none
  integer, parameter :: LDH = 8
  double precision :: h(LDH, 2), eig(8), bounds(8), workl(24)
  integer :: ierr, i, n
  double precision :: rnorm

  ! ------------------------------------------------------------------
  ! Case 1: [2, -1] tridiagonal, n=4, rnorm=0.5.
  ! H column 2 = main diagonal, column 1 (rows 2..n) = subdiagonal.
  n = 4
  rnorm = 0.5d0
  h = 0.0d0
  do i = 1, n
    h(i, 2) = 2.0d0
  end do
  do i = 2, n
    h(i, 1) = -1.0d0
  end do
  call dseigt(rnorm, n, h, LDH, eig, bounds, workl, ierr)
  call begin_test('tri2m1_n4_rn0p5')
  call print_array('eig', eig, n)
  call print_array('bounds', bounds, n)
  call print_int('ierr', ierr)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 2: graded diagonal, n=5, rnorm=1.25.
  n = 5
  rnorm = 1.25d0
  h = 0.0d0
  do i = 1, n
    h(i, 2) = dble(i)
  end do
  do i = 2, n
    h(i, 1) = 1.0d0
  end do
  call dseigt(rnorm, n, h, LDH, eig, bounds, workl, ierr)
  call begin_test('graded_n5_rn1p25')
  call print_array('eig', eig, n)
  call print_array('bounds', bounds, n)
  call print_int('ierr', ierr)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 3: mixed signs, n=6, rnorm=2.0.
  n = 6
  rnorm = 2.0d0
  h = 0.0d0
  h(1,2) = -2.0d0; h(2,2) = 3.0d0; h(3,2) = -1.0d0
  h(4,2) = 5.0d0; h(5,2) = 0.5d0; h(6,2) = -4.0d0
  h(2,1) = 1.5d0; h(3,1) = -0.5d0; h(4,1) = 2.0d0
  h(5,1) = 0.3d0; h(6,1) = -1.2d0
  call dseigt(rnorm, n, h, LDH, eig, bounds, workl, ierr)
  call begin_test('mixed_n6_rn2')
  call print_array('eig', eig, n)
  call print_array('bounds', bounds, n)
  call print_int('ierr', ierr)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 4: n=1, rnorm=3.0. eig=[diag], bounds=[rnorm*1].
  n = 1
  rnorm = 3.0d0
  h = 0.0d0
  h(1,2) = 7.0d0
  call dseigt(rnorm, n, h, LDH, eig, bounds, workl, ierr)
  call begin_test('single_n1_rn3')
  call print_array('eig', eig, n)
  call print_array('bounds', bounds, n)
  call print_int('ierr', ierr)
  call end_test()

end program test_dseigt
