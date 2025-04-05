import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

interface RoomCapacity {
  hotel_name: string;
  chain_name: string;
  star_rating: number;
  total_rooms: number;
  total_capacity: number;
  avg_room_price: number;
}

interface EmployeePerformance {
  employee_id: number;
  full_name: string;
  position: string;
  hotel_name: string;
  total_rentings: number;
  completed_payments: number;
  total_processed_amount: number;
}

interface HotelStatistics {
  hotel_name: string;
  total_rooms: number;
  active_bookings: number;
  pending_payments: number;
  total_revenue: number;
}

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [roomCapacity, setRoomCapacity] = useState<RoomCapacity[]>([]);
  const [employeePerformance, setEmployeePerformance] = useState<EmployeePerformance[]>([]);
  const [hotelStats, setHotelStats] = useState<HotelStatistics[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [capacityRes, performanceRes, statsRes] = await Promise.all([
          axios.get('/api/reports/room-capacity'),
          axios.get('/api/reports/employee-performance'),
          axios.get('/api/reports/hotel-statistics')
        ]);

        setRoomCapacity(capacityRes.data.data);
        setEmployeePerformance(performanceRes.data.data);
        setHotelStats(statsRes.data.data);
        setError('');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error fetching reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

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
        Reports & Analytics
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Hotel Statistics" />
          <Tab label="Room Capacity" />
          <Tab label="Employee Performance" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {hotelStats.map((stat) => (
            <Grid item xs={12} md={6} key={stat.hotel_name}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {stat.hotel_name}
                  </Typography>
                  <Typography color="textSecondary">
                    Total Rooms: {stat.total_rooms}
                  </Typography>
                  <Typography color="textSecondary">
                    Active Bookings: {stat.active_bookings}
                  </Typography>
                  <Typography color="textSecondary">
                    Pending Payments: {stat.pending_payments}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    Total Revenue: ${stat.total_revenue.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Hotel</TableCell>
                <TableCell>Chain</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Total Rooms</TableCell>
                <TableCell>Total Capacity</TableCell>
                <TableCell>Avg. Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roomCapacity.map((room) => (
                <TableRow key={room.hotel_name}>
                  <TableCell>{room.hotel_name}</TableCell>
                  <TableCell>{room.chain_name}</TableCell>
                  <TableCell>{room.star_rating} Stars</TableCell>
                  <TableCell>{room.total_rooms}</TableCell>
                  <TableCell>{room.total_capacity}</TableCell>
                  <TableCell>${room.avg_room_price.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Hotel</TableCell>
                <TableCell>Total Rentings</TableCell>
                <TableCell>Completed Payments</TableCell>
                <TableCell>Total Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employeePerformance.map((emp) => (
                <TableRow key={emp.employee_id}>
                  <TableCell>{emp.full_name}</TableCell>
                  <TableCell>{emp.position}</TableCell>
                  <TableCell>{emp.hotel_name}</TableCell>
                  <TableCell>{emp.total_rentings}</TableCell>
                  <TableCell>{emp.completed_payments}</TableCell>
                  <TableCell>${emp.total_processed_amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
    </Container>
  );
};

export default Reports;
