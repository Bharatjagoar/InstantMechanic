// Static reference data used to generate realistic seed records.

export const SERVICES = [
  { name: 'Oil Change', category: 'Maintenance', base_price: 799 },
  { name: 'General Service', category: 'Maintenance', base_price: 1499 },
  { name: 'AC Service', category: 'Maintenance', base_price: 1299 },
  { name: 'Brake Repair', category: 'Repair', base_price: 1899 },
  { name: 'Battery Replacement', category: 'Repair', base_price: 2499 },
  { name: 'Tyre Replacement', category: 'Repair', base_price: 3499 },
  { name: 'Accident Repair', category: 'Repair', base_price: 8999 },
  { name: 'Engine Diagnostics', category: 'Diagnostics', base_price: 999 },
  { name: 'Car Wash & Detailing', category: 'Cosmetic', base_price: 599 },
  { name: 'Roadside Assistance', category: 'Emergency', base_price: 1999 },
]

export const VEHICLE_MODELS = [
  { make: 'Maruti Suzuki', model: 'Swift' },
  { make: 'Maruti Suzuki', model: 'Baleno' },
  { make: 'Maruti Suzuki', model: 'WagonR' },
  { make: 'Hyundai', model: 'Creta' },
  { make: 'Hyundai', model: 'i20' },
  { make: 'Tata', model: 'Nexon' },
  { make: 'Tata', model: 'Punch' },
  { make: 'Honda', model: 'City' },
  { make: 'Honda', model: 'Amaze' },
  { make: 'Toyota', model: 'Innova Crysta' },
  { make: 'Mahindra', model: 'XUV700' },
  { make: 'Mahindra', model: 'Scorpio-N' },
  { make: 'Kia', model: 'Seltos' },
  { make: 'Volkswagen', model: 'Virtus' },
]

export const MECHANIC_SPECIALIZATIONS = [
  'Engine Repair',
  'Electrical Systems',
  'Brakes & Suspension',
  'AC & Cooling',
  'General Maintenance',
  'Bodywork & Paint',
]

export const BOOKING_STATUSES = ['pending', 'assigned', 'on_the_way', 'completed', 'cancelled']

// Weighted distribution so the dashboard shows a realistic operational mix,
// not an even split across statuses.
export const BOOKING_STATUS_WEIGHTS = {
  completed: 0.55,
  pending: 0.15,
  assigned: 0.1,
  on_the_way: 0.08,
  cancelled: 0.12,
}

export const MECHANIC_STATUS_WEIGHTS = {
  available: 0.5,
  busy: 0.35,
  offline: 0.15,
}
