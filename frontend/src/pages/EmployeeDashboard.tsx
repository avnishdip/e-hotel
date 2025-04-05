import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckInIcon,
  Payment as PaymentIcon,
  Hotel as HotelIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

interface DashboardSummary {
  todayCheckIns: Array<{
    booking_id: number;
    customer_name: string;
    room_number: string;
    start_date: string;
  }>;
  pendingPayments: Array<{
    renting_id: number;
    customer_name: string;
    room_number: string;
    payment_amount: number;
  }>;
  hotelStats: {
    total_rooms: number;
    occupied_rooms: number;
    available_rooms: number;
    total_bookings: number;
  };
}

const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch today's check-ins
        const checkInsResponse = await axios.get(`/api/bookings/hotel/${user?.hotel_id}`, {
          params: {
            start_date: new Date().toISOString().split('T')[0],
            status: 'confirmed'
          }
        });

        // Fetch pending payments
        const paymentsResponse = await axios.get(`/api/rentings/hotel/${user?.hotel_id}`, {
          params: {
            payment_status: 'pending'
          }
        });

        // Fetch hotel statistics
        const statsResponse = await axios.get(`/api/hotels/${user?.hotel_id}/stats`);

        setSummary({
          todayCheckIns: checkInsResponse.data.data,
          pendingPayments: paymentsResponse.data.data,
          hotelStats: statsResponse.data.data,
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.hotel_id]);

  const handleCheckIn = async (bookingId: number) => {
    try {
      await axios.post(`/api/bookings/${bookingId}/convert-to-renting`);
      navigate('/rentings');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error processing check-in');
    }
  };

  const handleProcessPayment = async (rentingId: number) => {
    try {
      await axios.put(`/api/rentings/${rentingId}/payment`);
      navigate('/rentings');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error processing payment');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Employee Dashboard
        </Typography>
        <Typography color="textSecondary">
          Manage check-ins, payments, and view hotel statistics
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Statistics */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">
              {summary?.hotelStats.total_rooms}
            </Typography>
            <Typography variant="subtitle1">
              Total Rooms
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="success.main">
              {summary?.hotelStats.available_rooms}
            </Typography>
            <Typography variant="subtitle1">
              Available Rooms
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="error.main">
              {summary?.hotelStats.occupied_rooms}
            </Typography>
            <Typography variant="subtitle1">
              Occupied Rooms
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="info.main">
              {summary?.hotelStats.total_bookings}
            </Typography>
            <Typography variant="subtitle1">
              Total Bookings
            </Typography>
          </Paper>
        </Grid>

        {/* Today's Check-ins */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Check-ins
              </Typography>
              <List>
                {summary?.todayCheckIns.map((booking) => (
                  <React.Fragment key={booking.booking_id}>
                    <ListItem>
                      <ListItemText
                        primary={booking.customer_name}
                        secondary={`Room ${booking.room_number}`}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CheckInIcon />}
                        onClick={() => handleCheckIn(booking.booking_id)}
                      >
                        Check-in
                      </Button>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
                {summary?.todayCheckIns.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No check-ins scheduled for today" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Payments */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Payments
              </Typography>
              <List>
                {summary?.pendingPayments.map((renting) => (
                  <React.Fragment key={renting.renting_id}>
                    <ListItem>
                      <ListItemText
                        primary={renting.customer_name}
                        secondary={`Room ${renting.room_number} - $${renting.payment_amount}`}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PaymentIcon />}
                        onClick={() => handleProcessPayment(renting.renting_id)}
                      >
                        Process Payment
                      </Button>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
                {summary?.pendingPayments.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No pending payments" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<CheckInIcon />}
                  onClick={() => navigate('/rentings')}
                >
                  Manage Rentings
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PaymentIcon />}
                  onClick={() => navigate('/rentings')}
                >
                  View All Payments
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<HotelIcon />}
                  onClick={() => navigate('/rooms')}
                >
                  Manage Rooms
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EmployeeDashboard;
