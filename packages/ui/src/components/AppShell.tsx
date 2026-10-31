import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { NavLink, Outlet } from 'react-router';

export interface NavItem {
  label: string;
  to: string;
}

export interface AppShellProps {
  title: string;
  nav: NavItem[];
  userName?: string;
  onLogout: () => void;
}

export default function AppShell({ title, nav, userName, onLogout }: AppShellProps) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static">
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" sx={{ mr: 3 }}>
            {title}
          </Typography>
          {nav.map((item) => (
            <Button
              key={item.to}
              color="inherit"
              component={NavLink}
              to={item.to}
              sx={{ '&.active': { bgcolor: 'rgba(255,255,255,0.18)' } }}
            >
              {item.label}
            </Button>
          ))}
          <Box sx={{ flexGrow: 1 }} />
          {userName && <Typography variant="body2">{userName}</Typography>}
          <Button color="inherit" onClick={onLogout}>
            خروج
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
