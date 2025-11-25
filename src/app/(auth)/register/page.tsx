'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  toast,
} from '@/components/primitives'
import { MessageSquare, Mail, Lock, User, Building, AlertCircle, Check, Sparkles } from 'lucide-react'

const registerSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다'),
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
  confirmPassword: z.string(),
  companyName: z.string().min(1, '회사/조직명을 입력해주세요'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const benefits = [
  '월 1,000 크레딧 제공',
  'SMS, LMS, MMS 발송',
  '카카오 알림톡 연동',
  '실시간 분석 대시보드',
]

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          companyName: data.companyName,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || '회원가입 중 오류가 발생했습니다.')
        return
      }

      toast.success('회원가입이 완료되었습니다!')

      // 자동 로그인
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (signInResult?.error) {
        router.push('/login')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('회원가입 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-pingly-50 via-white to-violet-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pingly-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-200/30 rounded-full blur-3xl" />
      </div>

      {/* Left side - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20 relative">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md"
        >
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pingly-500 to-violet-500 shadow-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">Pingly</span>
          </Link>

          <h1 className="text-4xl font-bold tracking-tight mb-4">
            메시지 마케팅의<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pingly-500 to-violet-500">
              새로운 시작
            </span>
          </h1>

          <p className="text-lg text-muted-foreground mb-8">
            14일 무료 체험으로 Pingly의 모든 기능을 경험해보세요.
            신용카드 없이 바로 시작할 수 있습니다.
          </p>

          <div className="space-y-4">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-mint-100">
                  <Check className="h-3.5 w-3.5 text-mint-600" />
                </div>
                <span className="text-muted-foreground">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
          className="relative w-full max-w-md"
        >
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4 pb-2">
              <motion.div variants={fadeInUp} className="lg:hidden">
                <Link href="/" className="mx-auto flex items-center justify-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pingly-500 to-violet-500 shadow-lg">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                </Link>
              </motion.div>
              <motion.div variants={fadeInUp} className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
                  <Badge variant="gradient" className="shadow-sm">
                    <Sparkles className="h-3 w-3 mr-1" />
                    14일 무료
                  </Badge>
                </div>
                <p className="text-muted-foreground">무료 체험을 시작하세요</p>
              </motion.div>
            </CardHeader>

            <CardContent className="pt-4">
              <motion.form
                variants={fadeInUp}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </motion.div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="홍길동"
                      leftIcon={<User className="h-4 w-4" />}
                      {...register('name')}
                      error={errors.name?.message}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">회사/조직명</Label>
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="회사명"
                      leftIcon={<Building className="h-4 w-4" />}
                      {...register('companyName')}
                      error={errors.companyName?.message}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    leftIcon={<Mail className="h-4 w-4" />}
                    {...register('email')}
                    error={errors.email?.message}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="8자 이상 입력하세요"
                    leftIcon={<Lock className="h-4 w-4" />}
                    {...register('password')}
                    error={errors.password?.message}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="비밀번호를 다시 입력하세요"
                    leftIcon={<Lock className="h-4 w-4" />}
                    {...register('confirmPassword')}
                    error={errors.confirmPassword?.message}
                  />
                </div>

                <Button type="submit" className="w-full" isLoading={isLoading}>
                  무료로 시작하기
                </Button>
              </motion.form>

              <motion.div variants={fadeInUp} className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">또는</span>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignup}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google로 가입
                </Button>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-4 space-y-3">
                <p className="text-center text-xs text-muted-foreground">
                  가입함으로써{' '}
                  <Link href="/terms" className="text-pingly-600 hover:underline">
                    이용약관
                  </Link>
                  {' '}및{' '}
                  <Link href="/privacy" className="text-pingly-600 hover:underline">
                    개인정보처리방침
                  </Link>
                  에 동의합니다.
                </p>

                <p className="text-center text-sm text-muted-foreground">
                  이미 계정이 있으신가요?{' '}
                  <Link href="/login" className="text-pingly-600 font-medium hover:text-pingly-700 hover:underline">
                    로그인
                  </Link>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
