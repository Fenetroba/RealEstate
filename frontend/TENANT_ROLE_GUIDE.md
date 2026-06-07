# TENANT Role - Complete Implementation Guide

## Overview
The TENANT role is designed for renters who want to manage their current rental property, track payments, submit maintenance requests, and search for new rental properties.

---

## Dashboard Overview (`/dashboard`)

### Stats Cards
1. **Current Rent** - Monthly rent amount with due date countdown
2. **Lease Duration** - Total lease period with remaining time
3. **Maintenance Requests** - Active requests count with pending status
4. **Saved Properties** - Number of saved rental properties

### Features
- Personalized greeting: "Hello, [Name] 🏠"
- Portfolio performance chart (rental payment history)
- Recent activity notifications
- DAO proposals (if applicable)
- Recommended rental properties

---

## My Rental Page (`/dashboard/my-rental`)

### Overview
Comprehensive view of the tenant's current rental property with all lease details, documents, and landlord information.

### Features

#### 1. **Property Information Tab**
- Property title and full address
- Property details:
  - Bedrooms count
  - Bathrooms count
  - Square footage
- Amenities list (parking, pool, gym, security, elevator, garden, balcony, AC, heating, internet, furnished, pet-friendly)
- Property images gallery
- Lease documents with download functionality:
  - Lease Agreement (PDF)
  - Move-in Checklist (PDF)
  - Property Rules (PDF)

#### 2. **Lease Information Tab**
- **Lease Terms:**
  - Lease start date
  - Lease end date
  - Monthly rent amount
  - Rent due date (e.g., "1st of each month")
  - Security deposit amount
- **Payment History:**
  - Date of payment
  - Amount paid
  - Payment status (PAID, PENDING, OVERDUE)
  - Payment method (Bank Transfer, Credit Card)
  - Payment reference number

#### 3. **Landlord Contact Tab**
- Landlord profile with avatar
- Contact information:
  - Full name
  - Email address
  - Phone number
- Quick actions:
  - Send message button
  - Call button

### Sidebar Features
- **Quick Actions:**
  - Pay Rent button
  - Submit Maintenance Request button
  - Renew Lease button
- **Lease Timeline:**
  - Lease started (with date)
  - Current period (months remaining)
  - Lease ends (with date)

### Payment Alert
- Displays when rent is due within 7 days
- Shows amount due and due date
- Quick "Pay Now" button

---

## Payments Page (`/dashboard/payments`)

### Overview
Complete payment management system for tracking rent payments, managing payment methods, and viewing payment history.

### Stats Cards
1. **Total Paid** - Sum of all completed payments with count
2. **Next Payment** - Upcoming payment amount with days until due
3. **Payment Methods** - Number of saved payment methods

### Features

#### 1. **Upcoming Payment Alert**
- Displays when payment is due within 7 days
- Shows:
  - Days until due
  - Amount due
  - Due date
  - "Pay Now" button

#### 2. **Payment History**
- **Filters:**
  - Search by description or reference number
  - Filter by status (All, Paid, Pending, Overdue, Scheduled)
- **Payment Details:**
  - Description (e.g., "Monthly Rent - May 2026")
  - Date
  - Amount
  - Status badge
  - Payment method
  - Reference number
  - Download receipt button

#### 3. **Payment Methods Sidebar**
- List of saved payment methods:
  - Bank Account (with last 4 digits)
  - Credit Card (with last 4 digits)
  - Default method indicator
- Add new payment method button

#### 4. **Auto-Pay Configuration**
- Enable/disable auto-pay
- Shows auto-pay status
- Automatic payment date
- Manage auto-pay settings

#### 5. **Quick Actions**
- Schedule Payment
- Download Receipt
- View Lease

### Export Functionality
- Export payment history to CSV/PDF

---

## Maintenance Page (`/dashboard/maintenance`)

### Overview
Comprehensive maintenance request management system for submitting, tracking, and managing property maintenance issues.

### Stats Cards
1. **Total Requests** - All maintenance requests count
2. **Pending** - Requests awaiting action
3. **In Progress** - Requests being worked on
4. **Completed** - Finished requests

### Features

#### 1. **Submit New Request**
Modal form with:
- **Title** (required) - Brief description of issue
- **Description** (required) - Detailed explanation
- **Category** (required):
  - Plumbing
  - Electrical
  - HVAC
  - Appliance
  - Structural
  - Other
- **Priority** (required):
  - Low - Minor issues, no urgency
  - Medium - Needs attention soon
  - High - Important, affects daily living
  - Urgent - Emergency, immediate attention needed
- **Photo Upload** (optional) - Up to 5 images

#### 2. **Request List**
- **Filters:**
  - Search by title, description, or category
  - Filter by status (All, Pending, In Progress, Completed, Cancelled)
- **Request Cards Display:**
  - Status icon (color-coded)
  - Title
  - Status badge
  - Priority badge
  - Description preview
  - Category
  - Created date
  - Scheduled date (if applicable)
  - Attached images thumbnail

#### 3. **Request Details Modal**
Clicking a request shows:
- Full title and description
- Status badge
- Category and priority
- Created date
- Scheduled date (if applicable)
- Completion date (if completed)
- Full-size images
- Landlord notes (if any)
- Actions:
  - Close button
  - Cancel request button (if not completed)

### Request Statuses
- **PENDING** - Submitted, awaiting review
- **IN_PROGRESS** - Being worked on, may have scheduled date
- **COMPLETED** - Fixed, includes completion notes
- **CANCELLED** - Request cancelled by tenant or landlord

### Priority Levels
- **URGENT** - Red badge, emergency issues
- **HIGH** - Orange badge, important issues
- **MEDIUM** - Yellow badge, standard issues
- **LOW** - Green badge, minor issues

---

## Saved Properties Page (`/dashboard/saved`)

### Features
- Grid view of saved rental properties
- Property cards with:
  - Property images
  - Title and location
  - Monthly rent
  - Bedrooms/bathrooms
  - Square footage
  - Save/unsave toggle
  - View details button
- Filter and sort options
- Remove from saved list

---

## Notifications Page (`/dashboard/notifications`)

### Notification Types for Tenants
1. **RENTAL_DUE** - Rent payment reminders
2. **MAINTENANCE_UPDATE** - Maintenance request status changes
3. **LEASE_EXPIRING** - Lease renewal reminders
4. **PROPERTY_VERIFIED** - New verified rental properties
5. **PRICE_CHANGE** - Price changes on saved properties
6. **NEW_MESSAGE** - Messages from landlord
7. **SYSTEM** - Platform updates

---

## Navigation Sidebar

### Tenant Menu Items
1. **Overview** - Dashboard home
2. **My Rental** - Current rental details
3. **Payments** - Payment management
4. **Maintenance** - Maintenance requests (with badge for pending)
5. **Saved Properties** - Saved rentals
6. **Notifications** - Alerts and updates (with badge for unread)

### Bottom Menu
- Profile
- Settings
- Sign Out

---

## Key User Flows

### 1. Pay Rent Flow
1. Navigate to Payments page
2. See upcoming payment alert
3. Click "Pay Now"
4. Select payment method
5. Confirm payment
6. Receive confirmation
7. Payment appears in history

### 2. Submit Maintenance Request Flow
1. Navigate to Maintenance page
2. Click "New Request"
3. Fill in form:
   - Title
   - Description
   - Category
   - Priority
   - Upload photos (optional)
4. Submit request
5. Receive confirmation
6. Track status in request list
7. Receive notifications on updates

### 3. View Lease Documents Flow
1. Navigate to My Rental page
2. Click "Lease Information" tab
3. Scroll to "Lease Documents" section
4. Click download button on desired document
5. Document downloads as PDF

### 4. Contact Landlord Flow
1. Navigate to My Rental page
2. Click "Landlord Contact" tab
3. View contact information
4. Click "Send Message" or "Call"
5. Communication initiated

---

## Technical Implementation

### Type Definitions
```typescript
export type UserRole = 'BUYER' | 'OWNER' | 'AGENT' | 'ADMIN' | 'TENANT';
```

### Dashboard Stats (Tenant)
```typescript
const tenantStats = [
  { label: 'Current Rent', value: '$2,400', icon: DollarSign },
  { label: 'Lease Duration', value: '8 months', icon: Calendar },
  { label: 'Maintenance Requests', value: '2', icon: FileText },
  { label: 'Saved Properties', value: '12', icon: Heart },
];
```

### Sidebar Navigation (Tenant)
```typescript
const tenantLinks: NavLink[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/my-rental', label: 'My Rental', icon: Building2 },
  { href: '/dashboard/payments', label: 'Payments', icon: FileText },
  { href: '/dashboard/maintenance', label: 'Maintenance', icon: Settings, badge: 2 },
  { href: '/dashboard/saved', label: 'Saved Properties', icon: Heart },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, badge: 3 },
];
```

---

## API Endpoints (To Be Implemented)

### Rental Management
- `GET /api/tenant/rental` - Get current rental details
- `GET /api/tenant/rental/documents` - Get lease documents
- `GET /api/tenant/rental/landlord` - Get landlord contact info

### Payments
- `GET /api/tenant/payments` - Get payment history
- `POST /api/tenant/payments` - Make a payment
- `GET /api/tenant/payments/methods` - Get payment methods
- `POST /api/tenant/payments/methods` - Add payment method
- `PUT /api/tenant/payments/autopay` - Configure auto-pay

### Maintenance
- `GET /api/tenant/maintenance` - Get all maintenance requests
- `POST /api/tenant/maintenance` - Submit new request
- `GET /api/tenant/maintenance/:id` - Get request details
- `PUT /api/tenant/maintenance/:id` - Update request
- `DELETE /api/tenant/maintenance/:id` - Cancel request
- `POST /api/tenant/maintenance/:id/images` - Upload images

---

## Design Patterns

### Color Coding
- **Rent/Payments:** Gold (#D4A64A)
- **Maintenance Pending:** Gray
- **Maintenance In Progress:** Yellow
- **Maintenance Completed:** Green
- **Urgent Priority:** Red
- **High Priority:** Orange
- **Medium Priority:** Yellow
- **Low Priority:** Green

### Icons
- **Rent:** DollarSign
- **Lease:** Calendar
- **Maintenance:** Wrench, Settings
- **Documents:** FileText
- **Contact:** Mail, Phone
- **Property:** Building2, Home

---

## Future Enhancements

1. **In-App Messaging**
   - Direct chat with landlord
   - Message history
   - File attachments

2. **Lease Renewal**
   - Online lease renewal process
   - Digital signature
   - Automatic document generation

3. **Roommate Management**
   - Add roommates to account
   - Split rent payments
   - Shared maintenance requests

4. **Move-Out Process**
   - Move-out checklist
   - Schedule final inspection
   - Security deposit tracking

5. **Rent Payment Reminders**
   - Email reminders
   - SMS notifications
   - Push notifications

6. **Maintenance Scheduling**
   - Tenant can suggest preferred times
   - Calendar integration
   - Appointment confirmations

7. **Property Reviews**
   - Rate property after lease ends
   - Review landlord
   - Help future tenants

---

## Testing Checklist

### My Rental Page
- [ ] Property details display correctly
- [ ] Images load properly
- [ ] Lease dates are accurate
- [ ] Payment history shows all transactions
- [ ] Documents download successfully
- [ ] Landlord contact info is correct
- [ ] Quick actions work
- [ ] Lease timeline displays correctly

### Payments Page
- [ ] Payment alert shows when due within 7 days
- [ ] Stats calculate correctly
- [ ] Payment history filters work
- [ ] Search functionality works
- [ ] Payment methods display
- [ ] Auto-pay status shows correctly
- [ ] Export functionality works

### Maintenance Page
- [ ] Stats calculate correctly
- [ ] New request modal opens
- [ ] Form validation works
- [ ] Image upload works
- [ ] Request list displays correctly
- [ ] Filters work properly
- [ ] Request details modal shows all info
- [ ] Status updates reflect correctly

---

## Summary

The TENANT role provides a complete rental management experience with:
- ✅ Current rental property overview
- ✅ Comprehensive lease information
- ✅ Payment tracking and management
- ✅ Maintenance request system
- ✅ Landlord contact information
- ✅ Document management
- ✅ Property search and save functionality

All features are fully implemented and ready for backend integration!
