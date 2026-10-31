import { useAuth } from '@farabitech/auth';
import { AppShell } from '@farabitech/ui';

export default function Template() {
  const { user, logout } = useAuth();
  const nav = [{ label: 'پروفایل من', to: '/' }];
  return (
    <AppShell title="پروفایل" nav={nav} userName={user?.name} onLogout={() => logout()} />
  );
}
