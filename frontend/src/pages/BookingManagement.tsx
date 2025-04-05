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
  Chip,
} from '@mui/material';
import axios from 'axios';

interface Booking {
  booking_id: number;
  hotel_name: string;
  room_number: string;
  start_date: string;
  end_date: string;
  booking_status: string;
  price: number;
  created_at: string;
}

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/bookings/customer');
      setBookings(response.data.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId: number) => {
    try {
      await axios.put(`/api/bookings/${bookingId}/cancel`);
      // Refresh bookings list
      fetchBookings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error cancelling booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
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
        My Bookings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {bookings.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No bookings found
          </Typography>
          <Button
            variant="contained"
            color="primary"
            href="/search"
            sx={{ mt: 2 }}
          >
            Search Rooms
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Hotel</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Check-in</TableCell>
                <TableCell>Check-out</TableCell>
                <TableCell>Price/Night</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Booked On</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.booking_id}>
                  <TableCell>{booking.hotel_name}</TableCell>
                  <TableCell>{booking.room_number}</TableCell>
                  <TableCell>{formatDate(booking.start_date)}</TableCell>
                  <TableCell>{formatDate(booking.end_date)}</TableCell>
                  <TableCell>${booking.price}</TableCell>
                  <TableCell>
                    <Chip
                      label={booking.booking_status}
                      color={getStatusColor(booking.booking_status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(booking.created_at)}</TableCell>
                  <TableCell>
                    {booking.booking_status === 'confirmed' && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleCancelBooking(booking.booking_id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default BookingManagement;
