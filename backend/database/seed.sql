-- Sample seed data for Rental Platform

insert into users (name, email, role)
values
  ('Platform Admin', 'admin@rentalplatform.local', 'admin'),
  ('Arun Owner', 'owner1@rentalplatform.local', 'owner'),
  ('Meera Owner', 'owner2@rentalplatform.local', 'owner'),
  ('Rahul Tenant', 'tenant1@rentalplatform.local', 'tenant'),
  ('Nisha Tenant', 'tenant2@rentalplatform.local', 'tenant')
on conflict (email) do nothing;

insert into owners (user_id, phone, address, city, owner_type)
select user_id, '9000000001', '12 Lake View Road', 'Bengaluru', 'Individual'
from users where email = 'owner1@rentalplatform.local'
on conflict (user_id) do nothing;

insert into owners (user_id, phone, address, city, owner_type)
select user_id, '9000000002', '88 MG Road', 'Hyderabad', 'Agency'
from users where email = 'owner2@rentalplatform.local'
on conflict (user_id) do nothing;

insert into tenants (user_id, phone, aadhaar_no, occupation, permanent_address, city)
select user_id, '9111111111', '111122223333', 'Software Engineer', 'Jayanagar', 'Bengaluru'
from users where email = 'tenant1@rentalplatform.local'
on conflict (user_id) do nothing;

insert into tenants (user_id, phone, aadhaar_no, occupation, permanent_address, city)
select user_id, '9222222222', '444455556666', 'Designer', 'Kondapur', 'Hyderabad'
from users where email = 'tenant2@rentalplatform.local'
on conflict (user_id) do nothing;

with owner_a as (
  select owner_id from owners o join users u on u.user_id = o.user_id where u.email = 'owner1@rentalplatform.local'
), owner_b as (
  select owner_id from owners o join users u on u.user_id = o.user_id where u.email = 'owner2@rentalplatform.local'
)
insert into properties (owner_id, title, property_type, address, city, area_sqft, bedrooms, bathrooms, office_rooms, shop_units, rent_amount, allowed_usage, status)
values
  ((select owner_id from owner_a), 'Modern 2BHK Near Metro', 'House', 'Green Park Street', 'Bengaluru', 1100, 2, 2, 0, 0, 28000, 'Family', 'Available'),
  ((select owner_id from owner_b), 'Compact Studio Apartment', 'House', 'Cyber Heights', 'Hyderabad', 500, 1, 1, 0, 0, 16000, 'Single', 'Available')
on conflict do nothing;
