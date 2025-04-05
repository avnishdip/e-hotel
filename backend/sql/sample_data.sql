-- Sample data for e-Hotels system

-- Hotel Chains
INSERT INTO hotel_chain (name, central_office_address, number_hotels, contact_emails, phone_numbers) VALUES
('Luxury Stays', '123 Corporate Dr, New York, NY', 0, '["info@luxurystays.com", "support@luxurystays.com"]', '["1-212-555-0101", "1-212-555-0102"]'),
('Comfort Inn Group', '456 Business Ave, Toronto, ON', 0, '["contact@comfortinn.com"]', '["1-416-555-0201"]'),
('Royal Hotels', '789 Executive Blvd, Vancouver, BC', 0, '["info@royalhotels.com", "bookings@royalhotels.com"]', '["1-604-555-0301"]'),
('Mountain Resorts', '321 Alpine Way, Denver, CO', 0, '["info@mountainresorts.com"]', '["1-303-555-0401"]'),
('Seaside Properties', '654 Ocean Drive, Miami, FL', 0, '["contact@seasidehotels.com"]', '["1-305-555-0501"]');

-- Hotels for each chain (ensuring at least 8 hotels per chain and 14 different locations)

-- Luxury Stays Hotels
INSERT INTO hotel (chain_id, name, address, category, contact_emails, phone_numbers) VALUES
(1, 'Luxury Stays Manhattan', '100 Park Ave, New York, NY', 5, '["manhattan@luxurystays.com"]', '["1-212-555-1001"]'),
(1, 'Luxury Stays Brooklyn', '200 Atlantic Ave, Brooklyn, NY', 4, '["brooklyn@luxurystays.com"]', '["1-212-555-1002"]'),
(1, 'Luxury Stays Boston', '300 Boylston St, Boston, MA', 5, '["boston@luxurystays.com"]', '["1-617-555-1003"]'),
(1, 'Luxury Stays Chicago', '400 Michigan Ave, Chicago, IL', 5, '["chicago@luxurystays.com"]', '["1-312-555-1004"]'),
(1, 'Luxury Stays LA', '500 Hollywood Blvd, Los Angeles, CA', 5, '["la@luxurystays.com"]', '["1-213-555-1005"]'),
(1, 'Luxury Stays SF', '600 Market St, San Francisco, CA', 4, '["sf@luxurystays.com"]', '["1-415-555-1006"]'),
(1, 'Luxury Stays DC', '700 Penn Ave, Washington, DC', 5, '["dc@luxurystays.com"]', '["1-202-555-1007"]'),
(1, 'Luxury Stays Seattle', '800 Pike St, Seattle, WA', 4, '["seattle@luxurystays.com"]', '["1-206-555-1008"]');

-- Add rooms for Luxury Stays Manhattan
INSERT INTO room (hotel_id, room_number, price, amenities, capacity, view_type, extendable) VALUES
(1, '101', 200.00, '["TV", "WiFi", "Mini-bar"]', 1, 'city', 0),
(1, '102', 250.00, '["TV", "WiFi", "Mini-bar", "Coffee maker"]', 2, 'city', 1),
(1, '201', 300.00, '["TV", "WiFi", "Mini-bar", "Coffee maker", "Safe"]', 2, 'city', 0),
(1, '301', 400.00, '["TV", "WiFi", "Mini-bar", "Coffee maker", "Safe", "Jacuzzi"]', 3, 'city', 1),
(1, 'PH1', 1000.00, '["TV", "WiFi", "Mini-bar", "Coffee maker", "Safe", "Jacuzzi", "Kitchen"]', 4, 'city', 0);

-- Add rooms for Luxury Stays Brooklyn
INSERT INTO room (hotel_id, room_number, price, amenities, capacity, view_type, extendable) VALUES
(2, '101', 150.00, '["TV", "WiFi"]', 1, 'city', 0),
(2, '102', 200.00, '["TV", "WiFi", "Mini-bar"]', 2, 'city', 1),
(2, '201', 250.00, '["TV", "WiFi", "Mini-bar", "Coffee maker"]', 2, 'city', 0),
(2, '301', 300.00, '["TV", "WiFi", "Mini-bar", "Coffee maker", "Safe"]', 3, 'city', 1),
(2, 'PH1', 800.00, '["TV", "WiFi", "Mini-bar", "Coffee maker", "Safe", "Kitchen"]', 4, 'city', 0);

-- Sample Employees (password: password123)
INSERT INTO employee (full_name, address, ssn, position, salary, hotel_id, email, password) VALUES
('John Manager', '123 Staff St, New York, NY', '123-45-6789', 'Manager', 75000.00, 1, 'john.manager@luxurystays.com', '$2a$10$cLlwuLleEbiRvoRL7Ly7/.AMiCt4HnvgfD0uHppGMYZAZJkwDeXcK'),
('Jane Clerk', '456 Staff Ave, New York, NY', '234-56-7890', 'Clerk', 45000.00, 1, 'jane.clerk@luxurystays.com', '$2a$10$cLlwuLleEbiRvoRL7Ly7/.AMiCt4HnvgfD0uHppGMYZAZJkwDeXcK'),
('Bob Manager', '789 Staff Rd, Brooklyn, NY', '345-67-8901', 'Manager', 70000.00, 2, 'bob.manager@luxurystays.com', '$2a$10$cLlwuLleEbiRvoRL7Ly7/.AMiCt4HnvgfD0uHppGMYZAZJkwDeXcK');

-- Sample Customers (password: password123)
INSERT INTO customer (full_name, address, id_type, id_number, registration_date, credit_card_number, email, password) VALUES
('Alice Smith', '123 Main St, Boston, MA', 'SSN', '456-78-9012', date('now'), '4111111111111111', 'alice.smith@email.com', '$2a$10$cLlwuLleEbiRvoRL7Ly7/.AMiCt4HnvgfD0uHppGMYZAZJkwDeXcK'),
('Bob Johnson', '456 Park Rd, Chicago, IL', 'driving_license', 'DL123456', date('now'), '4222222222222222', 'bob.johnson@email.com', '$2a$10$cLlwuLleEbiRvoRL7Ly7/.AMiCt4HnvgfD0uHppGMYZAZJkwDeXcK'),
('Carol Williams', '789 Lake Dr, Miami, FL', 'SIN', '789-012-345', date('now'), '4333333333333333', 'carol.williams@email.com', '$2a$10$cLlwuLleEbiRvoRL7Ly7/.AMiCt4HnvgfD0uHppGMYZAZJkwDeXcK');

-- Sample Bookings
INSERT INTO booking (customer_id, hotel_id, room_id, start_date, end_date, booking_status, created_at) VALUES
(1, 1, 1, date('now', '+1 day'), date('now', '+5 days'), 'confirmed', datetime('now')),
(2, 2, 6, date('now', '+10 days'), date('now', '+15 days'), 'confirmed', datetime('now')),
(3, 1, 2, date('now', '+20 days'), date('now', '+25 days'), 'pending', datetime('now'));

-- Sample Rentings
INSERT INTO renting (customer_id, hotel_id, room_id, employee_id, start_date, end_date, payment_status, payment_amount, payment_date, booking_id, created_at) VALUES
(1, 1, 1, 1, date('now', '-5 days'), date('now', '-1 day'), 'completed', 800.00, datetime('now', '-1 day'), 1, datetime('now')),
(2, 2, 6, 3, date('now', '-10 days'), date('now', '-5 days'), 'pending', 1000.00, NULL, 2, datetime('now'));
