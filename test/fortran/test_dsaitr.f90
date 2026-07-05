program test_dsaitr
  use test_utils
  implicit none
  integer, parameter :: LDV = 8, LDH = 8
  double precision :: v(LDV, 8), h(LDH, 2), resid(8), workd(24), a(LDV, 8)
  integer :: ipntr(3), ido, info, n, k, np, mode

  ! All cases use asymmetric matrices/starts so the Krylov space is full rank
  ! (no invariant-subspace restart, hence deterministic and reproducible).

  ! ------------------------------------------------------------------
  ! Case 1: dense symmetric, standard problem, k=0, np=4.
  n = 5
  k = 0
  np = 4
  mode = 1
  call build_a1(a, LDV, n)
  resid(1:5) = [ 1.0d0, 0.3d0, -0.7d0, 0.5d0, -0.2d0 ]
  call run(n, k, np, mode, 'I', a, LDV, v, LDV, h, LDH, resid, ipntr, workd, ido, info)
  call begin_test('std_np4_n5')
  call print_matrix('v', v, LDV, n, np)
  call print_array('hdiag', h(1, 2), np)
  call print_array('hsub', h(2, 1), np-1)
  call print_array('resid', resid, n)
  call print_int('info', info)
  call print_int('ido', ido)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 2: different dense symmetric, standard problem, k=0, np=3.
  n = 5
  k = 0
  np = 3
  mode = 1
  call build_a2(a, LDV, n)
  resid(1:5) = [ 0.8d0, -1.2d0, 0.4d0, 1.5d0, -0.6d0 ]
  call run(n, k, np, mode, 'I', a, LDV, v, LDV, h, LDH, resid, ipntr, workd, ido, info)
  call begin_test('std_np3_n5')
  call print_matrix('v', v, LDV, n, np)
  call print_array('hdiag', h(1, 2), np)
  call print_array('hsub', h(2, 1), np-1)
  call print_array('resid', resid, n)
  call print_int('info', info)
  call print_int('ido', ido)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 3: generalized problem (bmat='G', B=I), k=0, np=3.
  ! Exercises the ido=2 (B*x) reverse-communication returns.
  n = 5
  k = 0
  np = 3
  mode = 1
  call build_a1(a, LDV, n)
  resid(1:5) = [ 1.0d0, 0.3d0, -0.7d0, 0.5d0, -0.2d0 ]
  call run(n, k, np, mode, 'G', a, LDV, v, LDV, h, LDH, resid, ipntr, workd, ido, info)
  call begin_test('gen_np3_n5')
  call print_matrix('v', v, LDV, n, np)
  call print_array('hdiag', h(1, 2), np)
  call print_array('hsub', h(2, 1), np-1)
  call print_array('resid', resid, n)
  call print_int('info', info)
  call print_int('ido', ido)
  call end_test()

contains

  subroutine build_a1(a, lda, n)
    integer, intent(in) :: lda, n
    double precision, intent(out) :: a(lda, *)
    integer :: i
    a(1:n, 1:n) = 0.0d0
    do i = 1, n
      a(i, i) = 2.0d0 + 0.5d0 * dble(i)
    end do
    a(1,2)=0.3d0; a(2,1)=0.3d0; a(2,3)=-0.4d0; a(3,2)=-0.4d0
    a(3,4)=0.2d0; a(4,3)=0.2d0; a(4,5)=-0.6d0; a(5,4)=-0.6d0
    a(1,3)=0.1d0; a(3,1)=0.1d0; a(2,4)=0.15d0; a(4,2)=0.15d0
  end subroutine build_a1

  subroutine build_a2(a, lda, n)
    integer, intent(in) :: lda, n
    double precision, intent(out) :: a(lda, *)
    integer :: i, j
    a(1:n, 1:n) = 0.0d0
    do i = 1, n
      a(i, i) = 3.0d0 + dble(i)
      do j = i+1, n
        a(i, j) = 0.2d0 * dble(i) - 0.1d0 * dble(j)
        a(j, i) = a(i, j)
      end do
    end do
  end subroutine build_a2

  ! Drive the dsaitr reverse-communication loop (OP = A, B = I).
  subroutine run(n, k, np, mode, bmat, a, lda, v, ldv, h, ldh, resid, ipntr, workd, ido, info)
    integer, intent(in) :: n, k, np, mode, lda, ldv, ldh
    character, intent(in) :: bmat
    double precision, intent(in) :: a(lda, *)
    double precision, intent(inout) :: v(ldv, *), h(ldh, *), resid(*), workd(*)
    integer, intent(inout) :: ipntr(3), ido, info
    double precision :: rnorm, dnrm2
    external :: dnrm2
    integer :: p, q, r, c

    rnorm = dnrm2(n, resid, 1)
    do r = 1, n
      workd(r) = resid(r)
    end do
    ido = 0
    info = 0
    do
      call dsaitr(ido, bmat, n, k, np, mode, resid, rnorm, v, ldv, h, ldh, ipntr, workd, info)
      if (ido == 99) exit
      p = ipntr(1)
      q = ipntr(2)
      if (ido == -1 .or. ido == 1) then
        do r = 1, n
          workd(q + r - 1) = 0.0d0
          do c = 1, n
            workd(q + r - 1) = workd(q + r - 1) + a(r, c) * workd(p + c - 1)
          end do
        end do
      else if (ido == 2) then
        do r = 1, n
          workd(q + r - 1) = workd(p + r - 1)
        end do
      else
        exit
      end if
    end do
  end subroutine run

end program test_dsaitr
