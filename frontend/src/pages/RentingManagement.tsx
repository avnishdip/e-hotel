import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Tab,
  Tabs,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

interface Booking {
  booking_id: number;
  customer_name: string;
  room_number: string;
  start_date: string;
  end_date: string;
  booking_status: string;
}

interface Renting {
  renting_id: number;
  customer_name: string;
  room_number: string;
  start_date: string;
  end_date: string;
  payment_status: string;
  payment_amount: number;
  booking_id?: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const RentingManagement: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rentings, setRentings] = useState<Renting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [bookingsRes, rentingsRes] = await Promise.all([
        axios.get(`/api/bookings/hotel/${user?.hotel_id}`),
        axios.get(`/api/rentings/hotel/${user?.hotel_id}`)
      ]);
      setBookings(bookingsRes.data.data);
      setRentings(rentingsRes.data.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.hotel_id]);

  const handleConvertToRenting = (booking: Booking) => {
    setSelectedBooking(booking);
    setDialogOpen(true);
  };

  const handleConfirmRenting = async () => {
    try {
      await axios.post(`/api/bookings/${selectedBooking?.booking_id}/convert-to-renting`, {
        payment_amount: parseFloat(paymentAmount)
      });
      setDialogOpen(false);
      setSelectedBooking(null);
      setPaymentAmount('');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error converting booking to renting');
    }
  };

  const handleProcessPayment = async (rentingId: number) => {
    try {
      await axios.put(`/api/rentings/${rentingId}/payment`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error processing payment');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      <Typography variant="h4" gutterBottom>
        Rental Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Active Bookings" />
          <Tab label="Rentings" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Check-in</TableCell>
                <TableCell>Check-out</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.booking_id}>
                  <TableCell>{booking.customer_name}</TableCell>
                  <TableCell>{booking.room_number}</TableCell>
                  <TableCell>{formatDate(booking.start_date)}</TableCell>
                  <TableCell>{formatDate(booking.end_date)}</TableCell>
                  <TableCell>
                    <Chip
                      label={booking.booking_status}
                      color={booking.booking_status === 'confirmed' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {booking.booking_status === 'confirmed' && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleConvertToRenting(booking)}
                      >
                        Check-in
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Check-in</TableCell>
                <TableCell>Check-out</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rentings.map((renting) => (
                <TableRow key={renting.renting_id}>
                  <TableCell>{renting.customer_name}</TableCell>
                  <TableCell>{renting.room_number}</TableCell>
                  <TableCell>{formatDate(renting.start_date)}</TableCell>
                  <TableCell>{formatDate(renting.end_date)}</TableCell>
                  <TableCell>${renting.payment_amount}</TableCell>
                  <TableCell>
                    <Chip
                      label={renting.payment_status}
                      color={renting.payment_status === 'completed' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {renting.payment_status === 'pending' && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleProcessPayment(renting.renting_id)}
                      >
                        Process Payment
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Convert Booking to Renting</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Payment Amount"
            type="number"
            fullWidth
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmRenting} variant="contained">
            Confirm Check-in
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RentingManagement;
