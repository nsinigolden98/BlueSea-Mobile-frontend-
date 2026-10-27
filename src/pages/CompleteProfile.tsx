import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader, Toast } from '@/components/ui-custom';
import { patchRequest, ENDPOINTS } from '@/types';
import { UserRound, ArrowRight } from 'lucide-react';

/**
 * Post-signup name confirmation — shown to every new Google signup
 * (`profileCompleted === false` on the profile). The fields are prefilled
 * from whatever Google returned; nothing reaches the app until the user
 * confirms here, which is what sets `profile_completed` on the backend.
 */
export function CompleteProfile() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { ToastComponent, showToast } = Toast();
  const { showLoader, hideLoader, LoaderComponent } = Loader();

  const [otherNames, setOtherNames] = useState(user?.firstName ?? '');
  const [surname, setSurname] = useState(user?.surname ?? '');
  const [error, setError] = useState<string | null>(null);

  const nextRoute = user?.pin_is_set ? '/dashboard' : '/pin';

  // Already confirmed (e.g. after refresh) — move along. Also guards the
  // race where the guard redirects back here before state settles.
  useEffect(() => {
    if (user?.profileCompleted !== false) {
      navigate(nextRoute, { replace: true });
    }
  }, [user?.profileCompleted, nextRoute, navigate]);

  const nameOk = (v: string) => /^[\p{L} .'-]+$/u.test(v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const o = otherNames.trim();
    const s = surname.trim();

    if (!o) return setError('Other names is required.');
    if (!s) return setError('Surname is required.');
    if (o.length > 100 || s.length > 100 || !nameOk(o) || !nameOk(s)) {
      return setError('Use letters only (spaces, hyphens and apostrophes are allowed).');
    }

    setError(null);
    showLoader();
    try {
      const res = await patchRequest(ENDPOINTS.user, { other_names: o, surname: s });
      if (!res || res.state === false) {
        setError(res?.message || 'Could not save your details. Please try again.');
        return;
      }
      await refreshUser();
      navigate(nextRoute, { replace: true });
    } catch (err: any) {
      showToast(err?.message || 'Could not save your details. Please try again.');
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 sm:p-8">
        <div className="text-center space-y-2 mb-6">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
            <UserRound className="w-7 h-7 text-sky-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">
            Complete your profile
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            We got these details from your Google account. Confirm them or edit
            before continuing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="other-names"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5"
            >
              Other names
            </label>
            <Input
              id="other-names"
              value={otherNames}
              onChange={(e) => {
                setOtherNames(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Adaeze Chioma"
              autoComplete="given-name"
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="surname"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5"
            >
              Surname
            </label>
            <Input
              id="surname"
              value={surname}
              onChange={(e) => {
                setSurname(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Obi"
              autoComplete="family-name"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-medium rounded-2xl bg-sky-500 hover:bg-sky-600 text-white transition-all"
          >
            Save and continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          You can update these later from your profile.
        </p>
      </div>

      <ToastComponent />
      <LoaderComponent />
    </div>
  );
}
