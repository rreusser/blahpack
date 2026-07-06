program test_dstqrb
  use test_utils
  implicit none
  double precision :: d(8), e(8), z(8), work(20)
  integer :: info, i

  ! ------------------------------------------------------------------
  ! Case 1: classic [2, -1] tridiagonal, n=4. Eigenvalues 2-2cos(k*pi/5).
  d(1:4) = [ 2.0d0, 2.0d0, 2.0d0, 2.0d0 ]
  e(1:3) = [ -1.0d0, -1.0d0, -1.0d0 ]
  call dstqrb(4, d, e, z, work, info)
  call begin_test('tri2m1_n4')
  call print_array('d', d, 4)
  call print_array('z', z, 4)
  call print_int('info', info)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 2: graded diagonal, n=5.
  d(1:5) = [ 1.0d0, 2.0d0, 3.0d0, 4.0d0, 5.0d0 ]
  e(1:4) = [ 1.0d0, 1.0d0, 1.0d0, 1.0d0 ]
  call dstqrb(5, d, e, z, work, info)
  call begin_test('graded_n5')
  call print_array('d', d, 5)
  call print_array('z', z, 5)
  call print_int('info', info)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 3: n=1 quick return; z should be [1].
  d(1) = 3.0d0
  call dstqrb(1, d, e, z, work, info)
  call begin_test('single_n1')
  call print_array('d', d, 1)
  call print_array('z', z, 1)
  call print_int('info', info)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 4: split matrix (a zero subdiagonal), n=4.
  d(1:4) = [ 4.0d0, 1.0d0, 3.0d0, 2.0d0 ]
  e(1:3) = [ 0.7d0, 0.0d0, -0.9d0 ]
  call dstqrb(4, d, e, z, work, info)
  call begin_test('split_n4')
  call print_array('d', d, 4)
  call print_array('z', z, 4)
  call print_int('info', info)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 5: larger, n=6, mixed signs.
  d(1:6) = [ -2.0d0, 3.0d0, -1.0d0, 5.0d0, 0.5d0, -4.0d0 ]
  e(1:5) = [ 1.5d0, -0.5d0, 2.0d0, 0.3d0, -1.2d0 ]
  call dstqrb(6, d, e, z, work, info)
  call begin_test('mixed_n6')
  call print_array('d', d, 6)
  call print_array('z', z, 6)
  call print_int('info', info)
  call end_test()

  ! Silence unused-variable warnings for i (kept for potential debugging).
  i = 0
end program test_dstqrb
