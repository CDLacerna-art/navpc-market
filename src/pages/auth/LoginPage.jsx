import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ALLOWED_EMAIL_DOMAIN } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, Info } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/marketplace';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState(location.state?.message || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your school email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-brand-blue border border-blue-200 flex items-center justify-center shadow-xs">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-heading tracking-tight">
            Sign In to NavPC Market
          </h1>
          <p className="text-xs sm:text-sm text-content-muted">
            Access your campus marketplace account, orders, and listings.
          </p>
        </div>

        {/* Informative alerts */}
        {infoMessage && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-brand-dark animate-in fade-in">
            <Info className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-status-danger animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-status-danger shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Card */}
        <Card padding={true} className="shadow-card border-surface-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1 text-xs">
              <label className="font-semibold text-content-heading">School Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`student@${ALLOWED_EMAIL_DOMAIN}`}
                  required
                  className="form-input pl-9"
                  autoComplete="email"
                />
                <Mail className="w-4 h-4 text-content-muted absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-content-heading">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="form-input pl-9"
                  autoComplete="current-password"
                />
                <Lock className="w-4 h-4 text-content-muted absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-full font-semibold"
              leftIcon={LogIn}
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-surface-border text-center text-xs text-content-muted">
            Don't have a student account yet?{' '}
            <Link to="/register" className="font-semibold text-brand-blue hover:underline">
              Create an account
            </Link>
          </div>
        </Card>

        {/* Academic Disclosure */}
        <div className="text-center text-[11px] text-content-muted leading-relaxed">
          <p>
            NavPC Market is an independent academic project for Technopreneurship.
            Not affiliated with or officially operated by Navotas Polytechnic College.
          </p>
        </div>
      </div>
    </div>
  );
}
