import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Link,
  useTheme,
  SelectChangeEvent,
  Grid,
} from '@mui/material';
import { Hotel as HotelIcon } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

interface RegistrationData {
  full_name: string;
  email: string;
  password: string;
  address: string;
  id_type: string;
  id_number: string;
  credit_card_number: string;
  ssn?: string;
  position?: string;
  salary?: string;
  hotel_id?: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const theme = useTheme();
  const [role, setRole] = useState<'customer' | 'employee'>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<RegistrationData>({
    full_name: '',
    email: '',
    password: '',
    address: '',
    id_type: 'SSN',
    id_number: '',
    credit_card_number: '',
    ssn: '',
    position: '',
    salary: '',
    hotel_id: '',
  });

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setRole(event.target.value as 'customer' | 'employee');
    // Reset form data when switching roles
    setFormData({
      full_name: '',
      email: '',
      password: '',
      address: '',
      id_type: 'SSN',
      id_number: '',
      credit_card_number: '',
      ssn: '',
      position: '',
      salary: '',
      hotel_id: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        salary: role === 'employee' && formData.salary ? parseFloat(formData.salary) : undefined,
        hotel_id: role === 'employee' && formData.hotel_id ? parseInt(formData.hotel_id) : undefined,
      };
      await register(submitData, role);
      navigate(role === 'customer' ? '/dashboard' : '/employee-dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            width: '100%',
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center' }}>
            <HotelIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 1 }} />
            <Typography component="h1" variant="h4" sx={{ fontWeight: 600 }}>
              e-Hotels
            </Typography>
          </Box>

          <Typography component="h2" variant="h5" align="center" gutterBottom>
            Create Account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role"
                    value={role}
                    label="Role"
                    onChange={handleRoleChange}
                  >
                    <MenuItem value="customer">Customer</MenuItem>
                    <MenuItem value="employee">Employee</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleTextInputChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleTextInputChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleTextInputChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleTextInputChange}
                />
              </Grid>

              {role === 'customer' ? (
                <>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="id-type-label">ID Type</InputLabel>
                      <Select
                        labelId="id-type-label"
                        name="id_type"
                        value={formData.id_type}
                        label="ID Type"
                        onChange={handleSelectChange}
                      >
                        <MenuItem value="SSN">SSN</MenuItem>
                        <MenuItem value="driving_license">Driving License</MenuItem>
                        <MenuItem value="passport">Passport</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="ID Number"
                      name="id_number"
                      value={formData.id_number}
                      onChange={handleTextInputChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Credit Card Number"
                      name="credit_card_number"
                      value={formData.credit_card_number}
                      onChange={handleTextInputChange}
                    />
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="SSN"
                      name="ssn"
                      value={formData.ssn}
                      onChange={handleTextInputChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Position"
                      name="position"
                      value={formData.position}
                      onChange={handleTextInputChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Salary"
                      name="salary"
                      type="number"
                      value={formData.salary}
                      onChange={handleTextInputChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Hotel ID"
                      name="hotel_id"
                      type="number"
                      value={formData.hotel_id}
                      onChange={handleTextInputChange}
                    />
                  </Grid>
                </>
              )}
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 1,
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link 
                component={RouterLink} 
                to="/login" 
                variant="body2"
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Already have an account? Sign in
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
