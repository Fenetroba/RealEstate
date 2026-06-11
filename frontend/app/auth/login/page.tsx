'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { AuthHeroIllustration } from '@/components/auth/AuthHeroIllustration';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SiteBrandLogo } from '@/components/layout/SiteBrandLogo';
import { sitePageLeadClass, sitePageTitleClass } from '@/lib/site-typography';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { isMockAuthMode, mockAuthDemoHint } from '@/lib/mock-auth';
import { loginSchema, type LoginForm } from '@/lib/validation/auth-schemas';
import { loginUser } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import loginImage from '@/public/image3.png';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      dispatch(addToast({ type: 'success', title: 'Welcome back!', message: 'Successfully signed in.' }));
      router.push('/dashboard');
    }
  };



  return (
    <div className="min-h-screen flex">
      
    
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden flex-col justify-between p-12">
        <AuthHeroIllustration src={loginImage} priority />
        <div className="absolute inset-0 pointer-events-none">
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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >



           
          </motion.div>
        </div>

        <div className="relative z-10">
          <div className="glass rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40"
                alt="User"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-white font-semibold text-sm">Alex Morgan</p>
                <p className="text-white/50 text-xs">Verified Investor</p>
              </div>
            </div>
            <p className="text-white/70 text-sm italic">
              &ldquo;Edenet transformed how I invest in real estate. The blockchain verification 
              gives me complete confidence in every transaction.&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <SiteBrandLogo
            className="lg:hidden mb-8 gap-2"
            imageClassName="size-9 rounded-full object-cover"
            showText
            textClassName="text-xl text-primary"
            accentClassName="text-accent"
            priority
          />

          <div className="mb-8">
            <h1 className={sitePageTitleClass}>Welcome back</h1>
            <p className={sitePageLeadClass}>Sign in to your Edenet account</p>
            {isMockAuthMode() && (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                {mockAuthDemoHint()}
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-[#0E2347] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-[#D4A64A]" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-[#D4A64A] hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Sign In
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-400">or</span>
            </div>
          </div>

          <GoogleAuthButton label="Continue with Google" />

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-[#D4A64A] font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
