const { interpret, stringify, convert_to_De_Brujin_function, parse_tree } = require('javascripts/lambda_calculus_interpreter.js');

const reduction_tests = [
	["(\\x\.xy)(\\u\.vuu)", "vyy"],
	["(\\xy\.yx)uv", "vu"],
	["(\\x\.x(x(yz))x)(\\u\.uv)", "yzvv(λu\.uv)"],
	["(\\x\.xxy)(\\y\.yz)", "zzy"],
	["(\\xy\.xyy)(\\u\.uyx)", "λz\.zyxz"],
	["(\\xyz\.xz(yz))((\\xy\.yx)u)((\\xy\.yx)v)w", "wuwv"],
	["((\\x\.(xy))(\\z\.z))", "y"],
	["((\\x\.((\\y\.(xy))x))(\\z\.w))", "w"],
	["((((\\f\.(\\g\.(\\x\.((fx)(g x)))))(\\m\.(\\n\.(nm))))(\\n\.z)))p", "zp"],
	["((\\f\.((\\g\.((ff)g))(\\h\.(kh))))(\\x\.(\\y\.y)))", "(λh\.kh)"],
	["(\\z\.z)(\\y\.yy)(\\x\.xa)", "aa"],
	["(\\z\.z)(\\z\.zz)(\\z\.zy)", "yy"],
	["(\\x\.\\y\.xyy)(\\a\.a)b", "bb"],
	["(\\x\.\\y\.xyy)(\\y\.y)y", "yy"],
	["(\\x\.xx)(\\y\.yx)z", "xxz"],
	["(\\x\.(\\y\.(xy))y)z", "zy"],
	["((\\x\.xx)(\\y\.y))(\\y\.y)", "(λy\.y)"],
	["(((\\x\.\\y\.(xy))(\\y\.y))w)", "w"],
	["(\\x\.x)y", "y"],
	["(\\z\.x)y", "x"],
	["(\\z\.azbz)y ", "ayby"],
	["(\\x\.(\\z\.z)x)y ", "y"],
	["(\\x\.(\\z\.zx)(\\x\.bx))y ", "by"],
	["(\\x\.xx)y", "yy"],
	["(\\x\.axxa)y", "ayya"],
	["(\\x\.(\\z\.zx)q)y", "qy"],
	["(\\x\.x((\\z\.zx)(\\x\.bx)))y", "yby"],
	["(\\a\.a)(\\b\.b)(\\c\.cc)(\\d\.d)", "(λd\.d)"],
	["(\\x\.\\y\.x)yz", "y"],
	["(\\y\.y)((\\x\.x)b)", "b"],
	["(\\x\.fx)((\\y\.gy)z)", "fgz"],	
	["w(λx\.xz)y", "w(λx\.xz)y"],
	["(\\x\.xx)y", "yy"],
	["(λw\.w)(λx\.z)(((λx\.x)y)(λx\.xz)yw)", "z"],
	["v(λx\.z)", "v(λx\.z)"],
	["(λvw\.v)xy", "x"],
	["(λ a \. λ b \. a b (λ x \. λ y \. y)) (λ x \. λ y \. x) (λ x \. λ y \. x)", "(λx.(λy.x))"],
	["(λ x \. y) ((λ z \. z z) (λ w \. w))", "y"],
	["(λ a \. λ b \. a b (\\xy\.y)) (\\xy\.x) (\\xy\.y)", "(λx\.(λy\.y))"],
	["(λ a \. λ b \. a b (\\xy\.y)) (\\xy\.y) (\\xy\.x)", "(λx\.(λy\.y))"],
	["(λ a \. λ b \. a b (\\xy\.y)) (\\xy\.y) (\\xy\.y)", "(λx\.(λy\.y))"],
	["(λx\.(λy\.xy))y", "(λx\.yx)"],
	["(\\x\.(\\y\. x)z)", "(λx\.x)"],
	["(\\f\.\\g\.\\h\.fg(hh))(\\x\.\\y\.x)h(\\x\.xx)", "h"],
	["(\\xy\.xy)(\\x\.xy)(\\ab\.ab)", "(λb\.yb)"], 
	["(\\xyz\.zyx)abc", "cba"],
	["(\\x\.\\y\.yx)(\\z\.u)", "(λy\.y(λz\.u))"],
	["(\\x\.xx)((\\x\.y)z)", "yy"],
	["(\\y\.yyy)((\\ab\.a)I(SS))", "(λx\.x)"],
	["(\\x\.x(\\y\.y))(j)(\\x\.x)(\\y\.y)", "j(λy\.y)(λx\.x)(λy\.y)"],
	["((\\x\.x)y)((\\u\.u)v)", "yv"],
	["(λxyz\.xyz)(λx\.xx)(λx\.x)x", "x"],
	["(λx\.xy)z","zy"],
	["(\\n\.\\m\.\\f\.\\x\.n(mf)x)(\\f\.\\x\.f(fx))(\\f\.\\x\.fx)","(λy\.(λz\.yyz))"],
	["KI","(λy.(λx.x))"],
	["CK","(λy.(λz.z))"],
	["C(KI)","(λx\.λy\.x)"],
	["SKK","(λx\.x)"],
	["KIxy","y"],
	["KIIM","(λf\.ff)"],
	["(\\y\.x(yz))(ab)","xabz"],
	["(λabc\.b(abc))(λsz\.z)","(λb\.(λc\.bc))"],
	["(λabc\.a(bc))(λsz\.s(s(z)))(λxy\.x(x(x(y))))","(λc.(λz.ccccccz))"],
	["(λp\.pab)(λxy\.x)", "a"],
	["(λf\.λx\.f(fx))(λf\.λx.f(fx))", "(λx\.λy\.x(x(x(xy))))"],
	["Smnl", "mlnl"],
	["Kmn", "m"],
	["SKKx", "x"],
	["S(KS)Kxyz", "xyz"],
	["S(BBS)(KK)xyz", "xzy"],	
	["(S(K(SI))(S(KK)I)xy) ", "yx"],
	["S(S(K(S(KS)K))S)(KK)", "(λxyz\.xzy)"],
	["B(B(BW)C)(BB)", "(λx\.λy\.λz\.xz(yz))"],
	["SS(SK)", "(λx.λy.xyy)"],
	["WK", "(λy\.y)"],
	["SIIa", "aa"],
	["SKI(KIS)", "(λx\.x)"],
	["KS(I(SKSI))", "(λx.(λy.(λz.xzyz)))"],
	["SKIK", "(λx\.(λy\.x))"],
	["SS(SK)xy", "xyy"],
	["SK", "(λy\.(λz\.z))"],
	["C((\\pq\.pKq)(K)(KI))", "(λy\.(λx\.x))"],
	["(\\pq\.pKq)(K)(KI)", "(λx.(λy\.x))"],
	["(\\pq\.pKq)(KI)(K)", "(λx.(λy\.x))"],
	["C((\\pq\.pKq)KK)", "(λy\.(λx\.x))"],
	["C((\\pq\.pq(KI))((\\pq\.pq(KI))K(KI))(C(KI)))", "(λx\.(λy\.x))"],	
	["(\\pq\.pq(KI))(C(KI))(C(C(K)))", "(λy\.(λz\.y))"],
]

const convert_tests = [
	["(λx\.x)", "λ0"],
	["(λz\.z)", "λ0"],
	["(λx\.x)", "λ0"],
	["(λx\.λy\.x)", "λλ1"],
	["λx\.λy\.λs\.λz\.xs(ysz)", "λλλλ31210"],
	["(λx\.xx)(λx\.xx)", "(λ00)(λ00)"],
	["(λx\.λx\.x)(λy\.y)", "(λλ0)(λ0)"],
	["(λx\.x)(λy\.y)(λx\.λy\.x)", "(λ0)(λ0)(λλ1)"]
]

test.each(reduction_tests)('%s should beta reduce to %s', (input, expected) => {
  expect(convert_to_De_Brujin_function(interpret(input, true))).toEqual(convert_to_De_Brujin_function(interpret(expected, true)))
})

test.each(convert_tests)('%s should convert to %s', (input, expected) => {
  expect(convert_to_De_Brujin_function(parse_tree(input, true))).toEqual(expected)
})

// ------------------ 

// minor adjustments had to be made in testing, clone function()

// Lambda Calculus and Combinators (Exercise 1.28)

// (\x.xy)(\u.vuu)
// vyy

// (\xy.yx)uv
// vu

// (\x.x(x(yz))x)(\u.uv)
// yzvv(\u.uv)

// (\x.xxy)(\y.yz)
// zzy

// (\xy.xyy)(\u.uyx)
// \z.zyxz

// (\xyz.xz(yz))((\xy.yx)u)((\xy.yx)v)w
// wu(wv) 

// ------------------

// New Mexico State University [https://www.cs.nmsu.edu/~rth/cs/cs571/LC%20Practice%20Answers.pdf]

// ((\x.(xy))(λz.z)
// y

// ((\x.((\y.(xy))x))(\z.w))
// w

// ((((\f.(\g.(\x.((fx)(g x)))))(\m.(\n.(nm))))(\n.z))p
// (zp)

// ((\f.((\g.((ff)g))(\h.(kh))))(\x.(\y.y)))
// (\h.kh)

// ------------------

// University of Maryland [https://www.cs.umd.edu/class/fall2017/cmsc330/tests/prac8-soln-fall13.pdf]

// (\z.z)(\y.yy)(\x.xa) 
// aa

// (\z.z)(\z.zz)(\z.zy)
// yy

// (\x.\y.xyy)(\a.a)b
// bb

// (\x.\y.xyy)(\y.y)y
// yy

// (\x.xx)(\y.yx)z
// xxz

// (\x.(\y.(xy))y)z
// zy

// ((\x.xx)(\y.y))(\y.y)
// \y.y

// (((\x.\y.(xy))(\y.y))w)
// w

// ------------------

// University of Illinois [https://pages.github-dev.cs.illinois.edu/cs421-sp21/web/handouts/lambda-calculus.pdf]

// (\x.x)y
// y

// (\z.x)y
// x

// (\z.azbz)y 
// ayby

// (\x.(\z.z)x)y 
// y

// (\x.(\z.zx)(\x.bx))y 
// by

// (\x.xx)y
// yy

// (λx.axxa)y
// ayya

// (λx.(λz.zx)q)y
// qy

// (λx.x((λz.zx)(λx.bx)))y
// y(by)

// (λa.a)(λb.b)(λc.cc)(λd.d)
// (\d.d)

// ------------------

// University of Waterloo [https://student.cs.uwaterloo.ca/~cs442/W21/notes/webnotes/Module-2/]

// (\x.\y.x)yz
// y

// (\y.y)((\x.x)b)
// b

// (\x.fx)((\y.gy)z)
// fgz

// ------------------

// University of Helsinki [https://www.cs.helsinki.fi/u/jllang/Introduction_to_Lambda_Calculus.pdf]

// w(λx.xz)y
// w(λx.xz)y

// (\x.xx)y
// yy

// (λw.w)(λx.z)(((λx.x)y)(λx.xz)yw)
// z

// v(λx.z)
// v(λx.z)

// (λvw.v)xy
// x

// ------------------

// Arizona State University [https://adamdoupe.com/teaching/classes/cse340-principles-of-programming-languages-f15/]

// (λ a . λ b . a b (λ x . λ y . y)) (λ x . λ y . x) (λ x . λ y . x)
// (\x.\y.x)

// (λ x . y) ((λ z . z z) (λ w . w))
// y

// (λ a . λ b . a b (\xy.y)) (\xy.x) (\xy.y)
// (\xy.y)

// (λ a . λ b . a b (\xy.y)) (\xy.y) (\xy.x)
// (\xy.y)

// (λ a . λ b . a b (\xy.y)) (\xy.y) (\xy.y)
// (\xy.y)

// ------------------

// MISCELLANEOUS

// (λx.(λy.xy))y
// λy.yy 

// (\x.(\y. x)z)
// (\x.x)
 
// (\f.\g.\h.fg(hh))(\x.\y.x)h(\x.xx)
// h

// (\xy.xy)(\x.xy)(\ab.ab)
// y

// (\xyz.zyx)abc
// cba

// (\x.\y.yx)(\z.u)
// \y.y(\z.u)

// (\x.xx)((\x.y)z)
// yy

// (\xyz.xz(yz)) 

// (\y.yyy)((\ab.a)I(SS))
// (\x.x)

// (\yz.zy)((\x.xxx)(\x.xxx))(\w.I)
// (\x.x)

// SSSSSSS
// (λx19.(λx22.((x19 x22)(x19 x22))))

// (\x.x(\y.y))(j)(\x.x)(\y.y)

// ((\x.x)y)((\u.u)v)
// yv 

// ----------------------------------------------

// https://stackoverflow.com/questions/34140819/lambda-calculus-reduction-steps

// (λxyz.xyz)(λx.xx)(λx.x)x
// x

// (λx.xy)z
// zy

// https://cs.stackexchange.com/questions/97008/reducing-lambda-expression-to-normal-form

// (\n.\m.\f.\x.n(mf)x)(\f.\x.f(fx))(\f.\x.fx)
// (\y.\z.y(yz))

// https://www.youtube.com/watch?v=3VQ382QG-y4

// KI
// (\a.(\b.b))

// CK
// (\a.(\b.b))

// CK
// (\x.\y.x)(\x.x)

// C(KI)
// (\x.\y.x)

// SKK
// (\x.x)

// KIxy
// y

// KIIM
// (\f.ff)

// http://bach.ai/lambda-calculus-for-absolute-dummies/

// (\y.x(yz))(ab)
// x(abz)

// (λabc.b(abc))(λsz.z)
// (λbc.b(c))

// (λabc.a(bc))(λsz.s(s(z)))(λxy.x(x(x(y))))
// (λcz.c(c(c(c(c(c(z)))))))

// (λp.pab)(λxy.x)
// a

// https://stackoverflow.com/questions/47563925/church-naturals-exponentiation-function-and-type-checking

// (λf.λx. f(f x))(λf.λx.f(f x))
// (\x.\y.x(x(x(xy))))

// http://www.cse.chalmers.se/research/group/logic/TypesSS05/Extra/geuvers.pdf

// Smnl
// mlnl

// Kmn
// m

// SKKx
// x

// -----------

// Lambda Calculus and Combinators (Exercise 2.11)

// S(KS)Kxyz
// x(yz)

// S(BBS)(KK)xyz
// xzy

// https://en.wikipedia.org/wiki/Combinatory_logic#Examples_of_combinators

// (S(K(SI))(S(KK)I)xy) 
// yx

// S(S(K(S(KS)K))S)(KK)
// (\xyz.xzy)

// B(B(BW)C)(BB)
// λx.λy.λz.x z(yz)

// SS(SK)
// λx.λy.xyy

// WK
// (\x.x)

// https://en.wikipedia.org/wiki/SKI_combinator_calculus

// SIIa
// aa

// SKI(KIS)
// (\x.x)

// KS(I(SKSI))
// λx.λy.λz.xz(yz)

// SKIK
// (\x.(\y.x))

// ------------

// https://math.stackexchange.com/questions/4169862/beta-reducing-sssk-using-ski-calculus

// SS(SK)xy
// xyy

// SK
// (\y.(\z.z))

// https://math.stackexchange.com/questions/4330664/is-sk-s-i-iss-k-ssk-kik-s-i-i-really-a-fixed-point-combinato

// S(K(SII))(S(S(KS)(S(KK)I)))(K(SII))
// (\x.(\y.xxyy))

// Boolean logic is defined as the following: 

// K = TRUE
// KI = FALSE
// C = NOT (OR ALTERNATIVELY (KI)(K) AS A POSTFIX)

// (\pq.pq(KI)) = AND (OR ALTERNATIVELY SK AS A POSTFIX)
// (\pq.pKq) = OR

// NOT (OR TRUE FALSE)
// C((\pq.pKq)(K)(KI))
// (\y.(\x.x))

//  OR TRUE FALSE
// (\pq.pKq)(K)(KI)
// (\x.(\y.x)) 

// OR FALSE TRUE
// (\pq.pKq)(KI)(K)
// (\x.(\y.x)) 

// NOT (OR TRUE TRUE)
// C((\pq.pKq)KK)
// (\y.(\x.x))

// NOT (AND (AND TRUE FALSE) (NOT FALSE))
// C ((\pq.pq(KI)) ((\pq.pq(KI)) K (KI)) (C (KI)))
// (\x.(\y.x))

// AND ((NOT (FALSE)) (NOT NOT (TRUE)) 
// (\pq.pq(KI))(C(KI))(C(C(K)))
// true
// (|y.(|z.y))

// S(SI(KF))(KT) 
// C