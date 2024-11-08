import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ResponsiveAppBar() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [userName, setUserName] = React.useState('');
  const [userInitial, setUserInitial] = React.useState('');
  const [isLoggedIn, setIsLoggedIn] = React.useState(!!localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isLoggedIn) {
      const fetchUserData = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            setIsLoggedIn(false);
            return;
          }

          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const { Name: name, isAdmin } = response.data;
          setUserName(name);
          setUserInitial(name.charAt(0).toUpperCase());
          setIsAdmin(isAdmin === 1 || isAdmin === true);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setIsLoggedIn(false);
        }
      };
      fetchUserData();
    }
  }, [isLoggedIn]);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const navigateToOrders = () => {
    handleCloseMenu();
    navigate('/order');
  };

  const navigateToAdminPanel = () => {
    handleCloseMenu();
    navigate('/admin');
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setUserName('');
    setUserInitial('');
    setIsLoggedIn(false);
    handleCloseMenu();
    navigate('/');
  };

  const handleSignIn = () => {
    navigate('/form');
  };

  const navigateHome = () => {
    navigate('/');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#000000" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Avatar
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              width: 200,
            }}
            src={require('./mascom_white.png')}
            variant="square"
          />
          <Avatar
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              width: 150,
            }}
            src={require('./mascom_white.png')}
            variant="square"
          />
          <Box sx={{ flexGrow: 1 }} />

          {/* Home icon button */}
          <IconButton onClick={navigateHome} color="inherit" sx={{ mr: 1 }}>
            <HomeIcon />
          </IconButton>

          {/* Profile icon and menu */}
          <Box sx={{ flexGrow: 0 }}>
            <IconButton onClick={handleOpenMenu} sx={{ p: 0 }}>
              {isLoggedIn && userInitial ? (
                <Avatar alt="Profile Icon">{userInitial}</Avatar>
              ) : (
                <Avatar>
                  <PersonIcon />
                </Avatar>
              )}
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              sx={{ mt: '45px' }}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {isLoggedIn ? (
                [
                  userName && (
                    <MenuItem key="userName" disabled>
                      <Typography textAlign="center">{userName}</Typography>
                    </MenuItem>
                  ),
                  <MenuItem key="orders" onClick={navigateToOrders}>
                    <Typography textAlign="center">Orders</Typography>
                  </MenuItem>,
                  isAdmin && (
                    <MenuItem key="adminPanel" onClick={navigateToAdminPanel}>
                      <Typography textAlign="center">Admin Panel</Typography>
                    </MenuItem>
                  ),
                  <MenuItem key="signout" onClick={handleSignOut}>
                    <Typography textAlign="center">Sign Out</Typography>
                  </MenuItem>
                ]
              ) : (
                <MenuItem onClick={handleSignIn}>
                  <Typography textAlign="center">Sign In</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;