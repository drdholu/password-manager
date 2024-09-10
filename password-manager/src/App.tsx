import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Box,
  Divider,
  Tooltip,
  Zoom,
  CssBaseline,
  useMediaQuery
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon, 
  Delete as DeleteIcon,
  Key as KeyIcon,
  Add as AddIcon,
  Lock as LockIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon
} from '@mui/icons-material';
import { styled } from '@mui/system';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

interface PasswordEntry {
  _id: string;
  site: string;
  username: string;
  password: string;
}

const API_URL = import.meta.env.VITE_API_URL;
const MASTER_PASSWORD = import.meta.env.VITE_MASTER_PASSWORD;

const App: React.FC = () => {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [site, setSite] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPasswordId, setSelectedPasswordId] = useState<string | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [darkMode, setDarkMode] = useState(false);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
        },
      }),
    [darkMode],
  );

  useEffect(() => {
    fetchPasswords();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const fetchPasswords = async () => {
    try {
      const response = await axios.get(`${API_URL}/passwords`);
      setPasswords(response.data);
    } catch (error) {
      console.error('Error fetching passwords:', error);
    }
  };

  const addPassword = async () => {
    if (site && username && password) {
      try {
        await axios.post(`${API_URL}/passwords`, { site, username, password });
        fetchPasswords();
        setSite('');
        setUsername('');
        setPassword('');
      } catch (error) {
        console.error('Error adding password:', error);
      }
    }
  };

  const deletePassword = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/passwords/${id}`);
      fetchPasswords();
    } catch (error) {
      console.error('Error deleting password:', error);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let newPassword = '';
    for (let i = 0; i < 12; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(newPassword);
  };

  const handleTogglePassword = (id: string) => {
    if (showPassword[id]) {
      // If password is currently shown, hide it without asking for master password
      setShowPassword(prev => ({ ...prev, [id]: false }));
    } else {
      // If password is currently hidden, prepare to show it by asking for master password
      setSelectedPasswordId(id);
      setShowPasswordDialog(true);
    }
  };

  const handleMasterPasswordSubmit = () => {
    if (masterPassword === MASTER_PASSWORD) {
      setShowPassword(prev => ({ ...prev, [selectedPasswordId!]: true }));
      setShowPasswordDialog(false);
      setMasterPassword('');
    } else {
      alert('Incorrect master password');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 3 }}>
          <Typography variant="h3" component="h1">
            <LockIcon sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1 }} />
            Password Manager
          </Typography>
          <Button
            variant="outlined"
            onClick={toggleDarkMode}
            startIcon={darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </Button>
        </Box>
        
        <StyledPaper elevation={3}>
          <Typography variant="h5" component="h2" gutterBottom>
            Add New Password
          </Typography>
          <TextField
            label="Site"
            value={site}
            onChange={(e) => setSite(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            type="password"
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="contained" 
              onClick={addPassword} 
              startIcon={<AddIcon />}
            >
              Add Password
            </Button>
            <Button 
              variant="outlined" 
              onClick={generatePassword}
              startIcon={<KeyIcon />}
            >
              Generate Password
            </Button>
          </Box>
        </StyledPaper>
        
        <StyledPaper elevation={3}>
          <Typography variant="h5" component="h2" gutterBottom>
            Saved Passwords
          </Typography>
          <List>
            {passwords.map((pw) => (
              <React.Fragment key={pw._id}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <Tooltip title="Toggle Visibility" TransitionComponent={Zoom}>
                        <IconButton 
                          edge="end" 
                          aria-label="toggle password visibility" 
                          onClick={() => handleTogglePassword(pw._id)} 
                          sx={{ mr: 1 }}
                        >
                          {showPassword[pw._id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete" TransitionComponent={Zoom}>
                        <IconButton 
                          edge="end" 
                          aria-label="delete" 
                          onClick={() => deletePassword(pw._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={pw.site}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          Username:
                        </Typography>
                        {' '}{pw.username}
                        <br />
                        <Typography component="span" variant="body2" color="text.primary">
                          Password:
                        </Typography>
                        {' '}{showPassword[pw._id] ? pw.password : '••••••••'}
                      </>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        </StyledPaper>
        
        <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)}>
          <DialogTitle>
            <LockIcon sx={{ fontSize: 30, verticalAlign: 'middle', mr: 1 }} />
            Enter Master Password
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Master Password"
              type="password"
              fullWidth
              variant="outlined"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
            <Button onClick={handleMasterPasswordSubmit} variant="contained">Submit</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
};

export default App;
