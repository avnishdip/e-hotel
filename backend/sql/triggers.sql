-- Triggers for e-Hotels system

-- Trigger to update number_hotels in hotel_chain after insert
CREATE TRIGGER IF NOT EXISTS after_hotel_insert
AFTER INSERT ON hotel
BEGIN
    UPDATE hotel_chain 
    SET number_hotels = number_hotels + 1 
    WHERE chain_id = NEW.chain_id;
END;

-- Trigger to update number_hotels in hotel_chain after delete
CREATE TRIGGER IF NOT EXISTS after_hotel_delete
AFTER DELETE ON hotel
BEGIN
    UPDATE hotel_chain 
    SET number_hotels = number_hotels - 1 
    WHERE chain_id = OLD.chain_id;
END;

-- Trigger to update booking status when renting is created
CREATE TRIGGER IF NOT EXISTS after_renting_insert
AFTER INSERT ON renting
WHEN NEW.booking_id IS NOT NULL
BEGIN
    UPDATE booking 
    SET booking_status = 'completed' 
    WHERE booking_id = NEW.booking_id;
END;

-- Trigger to prevent overlapping bookings for the same room
CREATE TRIGGER IF NOT EXISTS before_booking_insert
BEFORE INSERT ON booking
BEGIN
    SELECT CASE
        WHEN EXISTS (
            SELECT 1 FROM booking 
            WHERE room_id = NEW.room_id 
            AND booking_status != 'cancelled'
            AND (
                (NEW.start_date BETWEEN start_date AND end_date)
                OR (NEW.end_date BETWEEN start_date AND end_date)
                OR (start_date BETWEEN NEW.start_date AND NEW.end_date)
            )
        )
        THEN RAISE(ABORT, 'Room is already booked for these dates')
    END;
END;

-- Trigger to prevent overlapping rentings for the same room
CREATE TRIGGER IF NOT EXISTS before_renting_insert
BEFORE INSERT ON renting
BEGIN
    SELECT CASE
        WHEN EXISTS (
            SELECT 1 FROM renting 
            WHERE room_id = NEW.room_id 
            AND (
                (NEW.start_date BETWEEN start_date AND end_date)
                OR (NEW.end_date BETWEEN start_date AND end_date)
                OR (start_date BETWEEN NEW.start_date AND NEW.end_date)
            )
        )
        THEN RAISE(ABORT, 'Room is already rented for these dates')
    END;
END;
