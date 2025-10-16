'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      // Verificar se já foi verificado com sucesso antes (para evitar erro ao recarregar)
      const alreadyVerified = sessionStorage.getItem('emailVerified');
      if (alreadyVerified === 'true') {
        setStatus('success');
        setMessage('Email já foi verificado com sucesso!');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        return;
      }

      if (!token) {
        setStatus('error');
        setMessage('Token de verificação não encontrado');
        return;
      }

      try {
        const response = await authApi.verifyEmail(token);
        setStatus('success');
        setMessage(response.data.message);
        
        // Marcar como verificado no sessionStorage
        sessionStorage.setItem('emailVerified', 'true');
        
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          sessionStorage.removeItem('emailVerified'); // Limpar após redirecionar
          router.push('/login');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        const errorMessage = error.response?.data?.message || 'Erro ao verificar email';
        const isExpired = error.response?.data?.expired;
        
        if (isExpired) {
          setMessage(errorMessage + ' Faça login e clique em "Reenviar email de verificação".');
        } else {
          setMessage(errorMessage);
        }
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verificando seu email...</h2>
            <p className="text-gray-600">Por favor, aguarde.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-4">
              <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">✅ Email Verificado!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecionando para o login...</p>
            <Link 
              href="/login"
              className="inline-block mt-4 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Ir para Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-4">
              <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">❌ Erro na Verificação</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="space-y-2">
              <Link 
                href="/login"
                className="block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Ir para Login
              </Link>
              <Link 
                href="/register"
                className="block px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Criar Nova Conta
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

