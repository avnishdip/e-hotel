import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../hooks/useAuth';

interface Room {
  room_id: number;
  room_number: string;
  price: number;
  capacity: number;
  view_type: string;
  hotel_name: string;
  hotel_address: string;
  amenities?: string[];
  hotel_id: number;
}

const HotelSearch: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useState({
    start_date: '',
    end_date: '',
    capacity: '',
    area: '',
    chain_id: '',
    hotel_category: '',
    min_price: '',
    max_price: '',
    view_type: ''
  });
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [hotelChains, setHotelChains] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load hotel chains for the dropdown
    const fetchHotelChains = async () => {
      try {
        const response = await axios.get('/api/hotels/chains');
        setHotelChains(response.data.data);
      } catch (err) {
        console.error('Error fetching hotel chains:', err);
      }
    };

    fetchHotelChains();

    // Set default dates to today and tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    setSearchParams(prev => ({
      ...prev,
      start_date: today.toISOString().split('T')[0],
      end_date: tomorrow.toISOString().split('T')[0]
    }));

    // Search available rooms immediately with default dates
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get('/api/rooms/search', {
        params: searchParams
      });
      setAvailableRooms(response.data.data);
    } catch (err) {
      console.error('Error searching rooms:', err);
      setError('Failed to fetch available rooms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (roomId: number) => {
    try {
      const response = await axios.post('/api/bookings', {
        room_id: roomId,
        start_date: searchParams.start_date,
        end_date: searchParams.end_date,
        hotel_id: availableRooms.find(room => room.room_id === roomId)?.hotel_id
      });

      if (response.data.success) {
        navigate('/bookings');
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Search Available Rooms</h1>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Check-in Date</label>
            <input
              type="date"
              value={searchParams.start_date}
              onChange={e => setSearchParams({ ...searchParams, start_date: e.target.value })}
              className="w-full p-2 border rounded"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Check-out Date</label>
            <input
              type="date"
              value={searchParams.end_date}
              onChange={e => setSearchParams({ ...searchParams, end_date: e.target.value })}
              className="w-full p-2 border rounded"
              min={searchParams.start_date}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Number of Guests</label>
            <input
              type="number"
              value={searchParams.capacity}
              onChange={e => setSearchParams({ ...searchParams, capacity: e.target.value })}
              className="w-full p-2 border rounded"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={searchParams.area}
              onChange={e => setSearchParams({ ...searchParams, area: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Enter city or area"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hotel Chain</label>
            <select
              value={searchParams.chain_id}
              onChange={e => setSearchParams({ ...searchParams, chain_id: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="">All Chains</option>
              {hotelChains.map(chain => (
                <option key={chain.chain_id} value={chain.chain_id}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hotel Category</label>
            <select
              value={searchParams.hotel_category}
              onChange={e => setSearchParams({ ...searchParams, hotel_category: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="">Any Category</option>
              {[1, 2, 3, 4, 5].map(category => (
                <option key={category} value={category}>
                  {category} Star
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search Rooms'}
          </button>
        </div>
      </div>

      {/* Available Rooms */}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableRooms.map(room => (
          <div key={room.room_id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-2">{room.hotel_name}</h3>
            <p className="text-gray-600 mb-2">{room.hotel_address}</p>
            <p className="mb-2">Room {room.room_number}</p>
            <p className="mb-2">Capacity: {room.capacity} guests</p>
            <p className="mb-2">View: {room.view_type}</p>
            <p className="text-lg font-bold mb-4">${room.price} per night</p>
            {room.amenities && Array.isArray(room.amenities) && room.amenities.length > 0 && (
              <div className="space-y-2">
                {room.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            )}
            <button
              onClick={() => handleBooking(room.room_id)}
              className="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Book Now
            </button>
          </div>
        ))}
      </div>

      {availableRooms.length === 0 && !loading && (
        <div className="text-center text-gray-500 mt-8">
          No rooms available for the selected criteria.
        </div>
      )}
    </div>
  );
};

export default HotelSearch;
