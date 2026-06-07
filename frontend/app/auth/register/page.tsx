'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Check, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';

import { AuthHeroIllustration } from '@/components/auth/AuthHeroIllustration';
import { SiteBrandLogo } from '@/components/layout/SiteBrandLogo';
import { sitePageLeadClass, sitePageTitleClass } from '@/lib/site-typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isMockAuthMode } from '@/lib/mock-auth';
import { registerSchema, type RegisterForm } from '@/lib/validation/auth-schemas';
import { registerUser } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import registerImage from '@/public/imageregister.png';

const registerBenefits = [
  'Free account — no credit card required',
  'Browse verified listings nationwide',
  'Save properties and track requests',
  'Blockchain-backed ownership records',
];

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'USER', agreeToTerms: false },
  });

  const onSubmit = async (data: RegisterForm) => {
    const result = await dispatch(
      registerUser({
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
      }),
    );

    if (registerUser.fulfilled.match(result)) {
      if (isMockAuthMode()) {
        dispatch(
          addToast({
            type: 'success',
            title: 'Account created!',
            message: 'You are signed in (demo mode).',
          }),
        );
        router.push('/dashboard');
      } else {
        dispatch(
          addToast({
            type: 'success',
            title: 'Account created!',
            message: 'Please check your email to verify your account.',
          }),
        );
        router.push('/auth/login');
      }
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden flex-col justify-between overflow-hidden p-12 gradient-hero lg:flex lg:w-1/2">
        <AuthHeroIllustration src={registerImage} priority />

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-20 right-10 size-64 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute bottom-20 left-10 size-64 rounded-full bg-white/10 blur-3xl" />
        </div>

        <SiteBrandLogo
          className="relative z-10 gap-2.5"
          imageClassName="size-10 rounded-full object-cover"
          showText
          textClassName="text-2xl text-white"
          accentClassName="text-accent"
          priority
        />

        <div className="relative z-10">
          <motion.ul
            className="space-y-3"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            {registerBenefits.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/20">
                  <Check className="size-3 text-accent" />
                </span>
                <span className="text-sm text-white/70">{item}</span>
              </li>
            ))}
          </motion.ul>
        </div>

        <div className="relative z-10">
          <div className="glass rounded-2xl border border-white/10 p-5">
            <p className="text-sm italic text-white/70">
              &ldquo;The most sophisticated real estate platform I&apos;ve used. Verification and
              insights made every decision clearer.&rdquo;
            </p>
            <p className="mt-3 text-xs text-white/50">Sarah Chen · Portfolio Investor</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-y-auto bg-background p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <SiteBrandLogo
            className="mb-8 gap-2 lg:hidden"
            imageClassName="size-9 rounded-full object-cover"
            showText
            textClassName="text-xl text-primary"
            accentClassName="text-accent"
            priority
          />

          <div className="mb-8">
            <h1 className={sitePageTitleClass}>Create your account</h1>
            <p className={sitePageLeadClass}>Join Edenet to buy, rent, or list property</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First name"
                placeholder="John"
                leftIcon={<User className="size-4" />}
                error={errors.first_name?.message}
                {...register('first_name')}
              />
              <Input
                label="Last name"
                placeholder="Doe"
                error={errors.last_name?.message}
                {...register('last_name')}
              />
            </div>

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="size-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              leftIcon={<Lock className="size-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="transition-colors hover:text-primary"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              }
              hint="Min 8 characters, one uppercase, one number"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Repeat your password"
              leftIcon={<Lock className="size-4" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-0.5 rounded border-border text-accent"
                {...register('agreeToTerms')}
              />
              <span className="text-sm text-muted">
                I agree to the{' '}
                <Link href="/terms" className="text-accent hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-accent hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>
            {errors.agreeToTerms && (
              <p className="text-xs text-destructive">{errors.agreeToTerms.message}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="size-5" />}
            >
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
