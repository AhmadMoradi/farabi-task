import { useAuth } from '@farabitech/auth';
import { AppShell } from '@farabitech/ui';

export default function Template() {
  const { user, logout } = useAuth();
  const nav = [
    {
      label: 'کاربران',
      to: '/users',
    },
  ];
  return (
    <AppShell
      title="پنل مدیریت کاربران"
      nav={nav}
      userName={user?.name}
      onLogout={() => logout()}
    />
  );
}
