program test_dsapps
  use test_utils
  implicit none
  integer, parameter :: LDV = 8, LDH = 8, LDQ = 8
  double precision :: v(LDV, 8), h(LDH, 2), resid(8), q(LDQ, 8), workd(16)
  double precision :: shift(8)
  integer :: n, kev, np, kplusp, i, j

  ! ------------------------------------------------------------------
  ! Case 1: basic bulge chase, no deflation. n=6, kev=3, np=2.
  n = 6; kev = 3; np = 2; kplusp = kev + np
  call fill_inputs(n, kplusp, v, h, resid, q)
  h(1,2) = 2.0d0; h(2,2) = 1.0d0; h(3,2) = 3.0d0; h(4,2) = 0.5d0; h(5,2) = 2.5d0
  h(2,1) = 1.0d0; h(3,1) = 0.5d0; h(4,1) = 1.5d0; h(5,1) = 0.75d0
  shift(1) = 1.5d0; shift(2) = 4.0d0
  call dsapps(n, kev, np, shift, v, LDV, h, LDH, resid, q, LDQ, workd)
  call begin_test('basic_n6_k3_p2')
  call print_int('n', n); call print_int('kev', kev); call print_int('np', np)
  call print_matrix('v', v, LDV, n, kplusp)
  call print_matrix('h', h, LDH, kplusp, 2)
  call print_array('resid', resid, n)
  call print_matrix('q', q, LDQ, kplusp, kplusp)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 2: deflation via a zero interior subdiagonal. n=6, kev=3, np=2.
  n = 6; kev = 3; np = 2; kplusp = kev + np
  call fill_inputs(n, kplusp, v, h, resid, q)
  h(1,2) = 2.0d0; h(2,2) = 1.0d0; h(3,2) = 3.0d0; h(4,2) = 0.5d0; h(5,2) = 2.5d0
  h(2,1) = 1.0d0; h(3,1) = 0.0d0; h(4,1) = 1.5d0; h(5,1) = 0.75d0
  shift(1) = 1.5d0; shift(2) = 4.0d0
  call dsapps(n, kev, np, shift, v, LDV, h, LDH, resid, q, LDQ, workd)
  call begin_test('deflate_n6_k3_p2')
  call print_int('n', n); call print_int('kev', kev); call print_int('np', np)
  call print_matrix('v', v, LDV, n, kplusp)
  call print_matrix('h', h, LDH, kplusp, 2)
  call print_array('resid', resid, n)
  call print_matrix('q', q, LDQ, kplusp, kplusp)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 3: more shifts than wanted. n=7, kev=2, np=3.
  n = 7; kev = 2; np = 3; kplusp = kev + np
  call fill_inputs(n, kplusp, v, h, resid, q)
  h(1,2) = 1.5d0; h(2,2) = 2.0d0; h(3,2) = 0.5d0; h(4,2) = 3.0d0; h(5,2) = 1.0d0
  h(2,1) = 0.5d0; h(3,1) = 1.25d0; h(4,1) = 0.75d0; h(5,1) = 2.0d0
  shift(1) = 0.5d0; shift(2) = 2.5d0; shift(3) = -1.0d0
  call dsapps(n, kev, np, shift, v, LDV, h, LDH, resid, q, LDQ, workd)
  call begin_test('wide_n7_k2_p3')
  call print_int('n', n); call print_int('kev', kev); call print_int('np', np)
  call print_matrix('v', v, LDV, n, kplusp)
  call print_matrix('h', h, LDH, kplusp, 2)
  call print_array('resid', resid, n)
  call print_matrix('q', q, LDQ, kplusp, kplusp)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 4: single shift, small factorization. n=5, kev=2, np=1.
  n = 5; kev = 2; np = 1; kplusp = kev + np
  call fill_inputs(n, kplusp, v, h, resid, q)
  h(1,2) = 3.0d0; h(2,2) = 1.0d0; h(3,2) = 2.0d0
  h(2,1) = 1.0d0; h(3,1) = 0.5d0
  shift(1) = 1.75d0
  call dsapps(n, kev, np, shift, v, LDV, h, LDH, resid, q, LDQ, workd)
  call begin_test('single_n5_k2_p1')
  call print_int('n', n); call print_int('kev', kev); call print_int('np', np)
  call print_matrix('v', v, LDV, n, kplusp)
  call print_matrix('h', h, LDH, kplusp, 2)
  call print_array('resid', resid, n)
  call print_matrix('q', q, LDQ, kplusp, kplusp)
  call end_test()

contains

  subroutine fill_inputs(n, kplusp, v, h, resid, q)
    integer, intent(in) :: n, kplusp
    double precision, intent(out) :: v(LDV, 8), h(LDH, 2), resid(8), q(LDQ, 8)
    integer :: i, j
    v = 0.0d0; h = 0.0d0; resid = 0.0d0; q = 0.0d0
    do j = 1, kplusp
      do i = 1, n
        v(i, j) = 0.25d0*dble(i) - 0.125d0*dble(j) + 0.5d0
      end do
    end do
    do i = 1, n
      resid(i) = 0.5d0*dble(i) - 1.25d0
    end do
  end subroutine

end program test_dsapps
