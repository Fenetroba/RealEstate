# Role-Based Dashboard System

## Overview
The application now has a comprehensive role-based dashboard system where each user role (BUYER, OWNER, AGENT, ADMIN, TENANT) has unique features, pages, and capabilities tailored to their needs.

## User Roles & Their Capabilities

### 1. BUYER Role
**Purpose:** Individual investors looking to purchase or invest in properties

**Dashboard Features:**
- Portfolio value tracking
- Investment performance charts
- Monthly income from properties
- Saved properties management
- DAO governance participation

**Unique Pages:**
- `/dashboard` - Overview with portfolio stats
- `/dashboard/investments` - Investment portfolio management
- `/dashboard/saved` - Saved/favorited properties
- `/dashboard/transactions` - Transaction history
- `/dao` - DAO governance and voting

**Key Actions:**
- Browse and save properties
- Make investment offers
- Track portfolio performance
- Participate in DAO voting
- View transaction history

---

### 2. OWNER Role
**Purpose:** Property owners listing and selling properties

**Dashboard Features:**
- Active listings management
- Property performance analytics (views, saves, offers)
- Revenue tracking
- Offer management

**Unique Pages:**
- `/dashboard` - Overview with listing stats
- `/dashboard/listings` - Manage all property listings
- `/dashboard/listings/create` - **Comprehensive 6-step property creation form**
- `/dashboard/offers` - Manage incoming offers
- `/dashboard/analytics` - Property performance analytics

**Key Actions:**
- **Create detailed property listings** with:
  - Basic info (title, description, type, investment options)
  - Location details (address, city, state, coordinates)
  - Property details (price, bedrooms, bathrooms, area)
  - Amenities selection (12+ amenities)
  - Media uploads (images, virtual tours, floor plans)
  - Document uploads (legal docs, certificates)
  - Fractional ownership configuration
  - Blockchain verification
- Edit and delete listings
- Review and respond to offers
- Track property performance
- View revenue analytics

**Property Creation Form Steps:**
1. **Basic Info** - Title, description, property type, listing type, investment types, fractional options
2. **Location** - Full address, city, state, country, zip code, neighborhood
3. **Details** - Price, bedrooms, bathrooms, area, year built, floors, parking
4. **Amenities** - 12 amenities (parking, pool, gym, security, elevator, garden, balcony, AC, heating, internet, furnished, pet-friendly)
5. **Media** - Property images, virtual tour URL, floor plan URL
6. **Documents** - Legal documents, certificates with blockchain verification

---

### 3. AGENT Role
**Purpose:** Real estate agents managing clients and facilitating transactions

**Dashboard Features:**
- Client relationship management
- Active deals tracking
- Commission earnings
- Performance metrics

**Unique Pages:**
- `/dashboard` - Overview with client and deal stats
- `/dashboard/clients` - **Client management system**
- `/dashboard/listings` - Listings managed for clients
- `/dashboard/analytics` - Performance and commission tracking

**Key Actions:**
- Add and manage clients (buyers and OWNERs)
- Track client properties and deals
- Monitor commission earnings
- Schedule client meetings
- Send messages to clients
- View client transaction history
- Track success rate and performance

**Client Management Features:**
- Client profiles with contact info
- Client type (BUYER/OWNER) tracking
- Property count and total value per client
- Last contact tracking
- Client status (ACTIVE/INACTIVE/PENDING)
- Quick actions (message, schedule, view properties)

---

### 4. ADMIN Role
**Purpose:** Platform administrators managing users, verifications, and system operations

**Dashboard Features:**
- Platform-wide analytics
- User management
- Verification system
- System health monitoring

**Unique Pages:**
- `/dashboard` - Platform overview with system stats
- `/dashboard/users` - **User management system**
- `/dashboard/verifications` - **Verification center**
- `/dashboard/analytics` - Platform-wide analytics

**Key Actions:**

**User Management:**
- View all platform users
- Filter by role (BUYER/OWNER/AGENT/ADMIN)
- Filter by status (VERIFIED/UNVERIFIED/SUSPENDED)
- Search users by name or email
- Edit user details
- Suspend/unsuspend users
- Send emails to users
- View user reputation scores
- Track user activity

**Verification Center:**
- Review verification requests (USER/PROPERTY/DOCUMENT)
- Priority-based queue (URGENT/HIGH/MEDIUM/LOW)
- Approve or reject verifications
- View submitted documents
- Track verification status
- Filter by type and status
- Urgent verification alerts

**Platform Analytics:**
- Total users and growth
- Active listings count
- Platform revenue tracking
- Transaction volume
- User distribution by role
- Verification queue status

---

### 5. TENANT Role
**Purpose:** Renters managing their current rental property and looking for new rentals

**Dashboard Features:**
- Current rental overview
- Rent payment tracking
- Maintenance request management
- Lease information display
- Saved properties for future rentals

**Unique Pages:**
- `/dashboard` - Overview with rental stats (rent due, lease duration, maintenance requests, saved properties)
- `/dashboard/my-rental` - **Comprehensive rental property details**
  - Property information (bedrooms, bathrooms, area, amenities)
  - Lease terms (start date, end date, monthly rent, security deposit)
  - Payment history
  - Lease documents (download lease agreement, move-in checklist, property rules)
  - Landlord contact information
  - Quick actions (pay rent, submit maintenance, renew lease)
- `/dashboard/payments` - **Payment management system**
  - Upcoming payment alerts
  - Payment history with filters
  - Multiple payment methods
  - Auto-pay configuration
  - Download receipts
  - Schedule payments
- `/dashboard/maintenance` - **Maintenance request center**
  - Submit new maintenance requests
  - Track request status (pending, in progress, completed)
  - Priority levels (low, medium, high, urgent)
  - Upload photos of issues
  - View request history
  - Communication with landlord
- `/dashboard/saved` - Saved rental properties
- `/dashboard/notifications` - Notifications (rent reminders, maintenance updates)

**Key Actions:**

**Rental Management:**
- View current rental property details
- Access lease documents
- Track lease timeline
- Contact landlord directly
- Renew lease

**Payment Features:**
- Pay monthly rent
- View payment history
- Manage payment methods (bank account, credit card)
- Set up auto-pay
- Download payment receipts
- Schedule future payments
- Track payment due dates

**Maintenance Requests:**
- Submit maintenance requests with:
  - Title and detailed description
  - Category (plumbing, electrical, HVAC, appliance, structural, other)
  - Priority level (low, medium, high, urgent)
  - Photo uploads
- Track request status
- View scheduled repair dates
- Receive completion notifications
- View maintenance history

**Property Search:**
- Browse available rental properties
- Save favorite properties
- Filter by location, price, bedrooms
- View property details

---

## Shared Features Across All Roles

### Common Dashboard Elements:
- Personalized greeting based on role
- Role-specific stats cards
- Portfolio/performance charts
- Recent activity/notifications
- DAO proposals (for property owners)
- Recommended properties

### Navigation Sidebar:
- Role-specific menu items
- User profile section with avatar
- Role badge display
- Notification badges
- Settings and profile links
- Sign out functionality

### Analytics Page:
- Role-specific metrics
- Revenue/income tracking
- Performance charts (line, bar, pie)
- Top performers list
- Time-based filtering
- Custom date ranges

---

## Technical Implementation

### Role Detection:
```typescript
const { user } = useAppSelector((s) => s.auth);
const role = user?.role || 'BUYER';
```

### Role-Based Rendering:
```typescript
const stats = 
  role === 'OWNER' ? OWNERStats :
  role === 'AGENT' ? agentStats :
  role === 'ADMIN' ? adminStats :
  buyerStats;
```

### Protected Routes:
Each role-specific page should check user role and redirect if unauthorized.

### Sidebar Navigation:
```typescript
const navLinks =
  role === 'OWNER' ? OWNERLinks :
  role === 'AGENT' ? agentLinks :
  role === 'ADMIN' ? adminLinks :
  buyerLinks;
```

---

## File Structure

```
client/app/dashboard/
├── page.tsx                    # Main dashboard (all roles)
├── investments/page.tsx        # BUYER only
├── saved/page.tsx             # BUYER, TENANT
├── transactions/page.tsx      # BUYER only
├── notifications/page.tsx     # All roles
├── listings/
│   ├── page.tsx              # OWNER/AGENT
│   └── create/page.tsx       # OWNER - Full property creation
├── offers/page.tsx            # OWNER only
├── clients/page.tsx           # AGENT only
├── users/page.tsx             # ADMIN only
├── verifications/page.tsx     # ADMIN only
├── analytics/page.tsx         # All roles (different data)
├── my-rental/page.tsx         # TENANT only - Current rental details
├── payments/page.tsx          # TENANT only - Payment management
└── maintenance/page.tsx       # TENANT only - Maintenance requests

client/components/dashboard/
└── DashboardSidebar.tsx       # Role-based navigation
```

---

## Next Steps for Implementation

1. **API Integration:**
   - Connect property creation form to backend API
   - Implement file upload for images and documents
   - Add blockchain verification integration
   - Connect user management to backend

2. **Authentication & Authorization:**
   - Add route guards for role-specific pages
   - Implement permission checks
   - Add role-based access control middleware

3. **Real-time Features:**
   - Live notifications for new offers
   - Real-time verification status updates
   - Live analytics updates
   - WebSocket integration for instant updates

4. **Enhanced Features:**
   - Property editing functionality
   - Bulk operations for admin
   - Advanced filtering and search
   - Export functionality for analytics
   - Email notifications
   - Calendar integration for agents

5. **Testing:**
   - Test each role's dashboard
   - Verify role-based access control
   - Test property creation flow
   - Test verification workflow

---

## Key Features Summary

✅ **BUYER:** Portfolio tracking, investments, saved properties, DAO voting
✅ **OWNER:** Full property listing creation (6-step form), offer management, analytics
✅ **AGENT:** Client management, deal tracking, commission monitoring
✅ **ADMIN:** User management, verification center, platform analytics
✅ **TENANT:** Rental management, payment tracking, maintenance requests, lease documents

Each role has a completely customized experience with relevant features and data!
