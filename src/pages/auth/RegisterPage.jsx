import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ALLOWED_EMAIL_DOMAIN } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle2, ShieldCheck, Info } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side validations
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full student name.');
      return;
    }

    const emailTrimmed = email.trim().toLowerCase();
    const parts = emailTrimmed.split('@');
    if (parts.length !== 2 || parts[1] !== ALLOWED_EMAIL_DOMAIN) {
      setErrorMessage(`Registration is restricted strictly to official school email addresses ending in @${ALLOWED_EMAIL_DOMAIN}`);
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await register({
        fullName: fullName.trim(),
        email: emailTrimmed,
        password,
      });

      setSuccessInfo({
        email: emailTrimmed,
        user: data.user,
      });
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successInfo) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6">
          <Card padding={true} className="text-center space-y-5 shadow-card border-surface-border">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-status-success border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-content-heading">
                Registration Submitted!
              </h2>
              <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
                A verification link has been dispatched to:
              </p>
              <div className="p-2.5 bg-surface-bg rounded-lg font-mono text-xs text-brand-dark font-semibold break-all">
                {successInfo.email}
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-left text-xs text-brand-dark space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <Info className="w-4 h-4 text-brand-blue shrink-0" />
                Action Required:
              </p>
              <p className="text-[11px] leading-relaxed">
                Please open your school email account and click the confirmation link to activate your NavPC Market student profile. All new student profiles are provisioned as <strong>Student Buyers</strong>.
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/login', { state: { message: 'Email confirmation sent. Once confirmed, sign in with your credentials.' } })}
                className="w-full"
              >
                Proceed to Sign In
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-brand-blue border border-blue-200 flex items-center justify-center shadow-xs">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-heading tracking-tight">
            Create Student Account
          </h1>
          <p className="text-xs sm:text-sm text-content-muted">
            Join fellow Navotas Polytechnic College students on campus.
          </p>
        </div>

        {/* Required Academic Disclosure Banner */}
        <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-900 leading-relaxed">
          <p className="font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            Academic Platform Notice:
          </p>
          <p className="text-[11px] text-amber-800">
            NavPC Market is an independent student academic project developed for Technopreneurship.
            Sign-up is strictly limited to active school email addresses (<strong>@{ALLOWED_EMAIL_DOMAIN}</strong>).
            This platform is not officially run or endorsed by Navotas Polytechnic College.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-status-danger animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-status-danger shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Register Card */}
        <Card padding={true} className="shadow-card border-surface-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1 text-xs">
              <label className="font-semibold text-content-heading">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Juan Dela Cruz"
                  required
                  className="form-input pl-9"
                  autoComplete="name"
                />
                <User className="w-4 h-4 text-content-muted absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* School Email */}
            <div className="space-y-1 text-xs">
              <label className="font-semibold text-content-heading">School Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`username@${ALLOWED_EMAIL_DOMAIN}`}
                  required
                  className="form-input pl-9 font-mono text-xs"
                  autoComplete="email"
                />
                <Mail className="w-4 h-4 text-content-muted absolute left-3 top-2.5 pointer-events-none" />
              </div>
              <p className="text-[10px] text-content-muted">
                Must match exact school domain (@{ALLOWED_EMAIL_DOMAIN})
              </p>
            </div>

            {/* Password */}
            <div className="space-y-1 text-xs">
              <label className="font-semibold text-content-heading">Password *</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="form-input pl-9"
                  autoComplete="new-password"
                />
                <Lock className="w-4 h-4 text-content-muted absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1 text-xs">
              <label className="font-semibold text-content-heading">Confirm Password *</label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  minLength={6}
                  className="form-input pl-9"
                  autoComplete="new-password"
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
              leftIcon={UserPlus}
            >
              {isSubmitting ? 'Registering Account...' : 'Create Buyer Account'}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-surface-border text-center text-xs text-content-muted">
            Already have a registered account?{' '}
            <Link to="/login" className="font-semibold text-brand-blue hover:underline">
              Sign in here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
