# Responsive Dashboard Sidebar Guide

## Overview
The dashboard sidebar is fully responsive and works seamlessly across all device sizes (mobile, tablet, desktop).

## Where the Sidebar Appears

### ✅ Dashboard Pages (WITH Sidebar)
The sidebar appears on ALL dashboard pages:
- `/dashboard` - Overview
- `/dashboard/listings` - My Listings
- `/dashboard/saved` - Saved Properties
- `/dashboard/transactions` - Transactions
- `/dashboard/notifications` - Notifications
- `/dashboard/settings` - Settings
- `/dashboard/property-approvals` - Property Approvals (Admin only)
- `/dashboard/users` - Users (Admin only)
- `/dashboard/verifications` - Verifications (Admin only)
- `/dashboard/analytics` - Analytics
- `/dashboard/clients` - Clients (Agent only)
- `/dashboard/my-rental` - My Rental (Tenant only)
- `/dashboard/payments` - Payments (Tenant only)
- `/dashboard/maintenance` - Maintenance (Tenant only)
- `/profile` - Profile page

### ❌ Public Pages (WITHOUT Sidebar)
These pages use Navbar + Footer layout (no sidebar):
- `/` - Home page
- `/buy` - Buy properties
- `/rent` - Rent properties
- `/properties` - Property listings
- `/properties/[id]` - Property detail page
- `/market` - Market page
- `/invest` - Investment page
- `/auth/login` - Login page
- `/auth/register` - Register page

## Responsive Behavior

### Desktop (≥1024px)
- Sidebar is **always visible** on the left side
- Sidebar is **sticky** and scrolls with the page
- Width: 256px (16rem)
- Position: Sticky, left side

### Mobile & Tablet (<1024px)
- Sidebar is **hidden by default** (slides off-screen to the left)
- **Floating menu button** appears in bottom-right corner
- Click the menu button to open/close the sidebar
- **Dark overlay** appears when sidebar is open
- Click overlay or any link to close the sidebar
- Sidebar slides in from the left with smooth animation

## Implementation Details

### Mobile Menu Button
```tsx
<button className="lg:hidden fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-[#0E2347] text-white">
  {mobileMenuOpen ? <X /> : <Menu />}
</button>
```
- Fixed position: bottom-right corner
- Only visible on mobile/tablet (`lg:hidden`)
- Toggles between Menu and X icon
- Z-index: 50 (above overlay)

### Mobile Overlay
```tsx
{mobileMenuOpen && (
  <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={closeMenu} />
)}
```
- Full-screen dark overlay (50% opacity)
- Only visible when menu is open
- Clicking it closes the sidebar
- Z-index: 40 (below button, above sidebar)

### Sidebar Animation
```tsx
<aside className={`
  fixed lg:sticky 
  top-16 lg:top-20 
  h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)]
  transition-transform duration-300
  ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
`}>
```
- **Mobile**: Fixed position, slides in/out with transform
- **Desktop**: Sticky position, always visible
- Smooth 300ms transition
- Adjusts height based on navbar height (64px mobile, 80px desktop)

## User Experience

### Opening the Sidebar (Mobile)
1. User clicks the floating menu button (bottom-right)
2. Dark overlay fades in
3. Sidebar slides in from the left
4. Menu button icon changes to X

### Closing the Sidebar (Mobile)
The sidebar closes when:
- User clicks the X button
- User clicks the dark overlay
- User clicks any navigation link
- User navigates to a different page

### Desktop Experience
- Sidebar is always visible
- No menu button needed
- Sidebar scrolls with the page content
- Smooth hover effects on navigation items

## Styling

### Active Link
- Background: Navy blue (`#0E2347`)
- Text: White
- Icon: Gold (`#D4A64A`)
- Right arrow indicator

### Inactive Link
- Text: Gray
- Hover: Light gray background
- Hover icon: Gold

### User Info Section
- Avatar with gradient gold background
- User name and role badge
- Border at bottom

### Bottom Links
- Profile and Settings
- Sign Out button (red on hover)

## Accessibility

- Proper ARIA labels on buttons
- Keyboard navigation support
- Focus states on all interactive elements
- Smooth animations (respects prefers-reduced-motion)

## Technical Notes

### Z-Index Layers
1. **50** - Mobile menu button (highest)
2. **40** - Mobile overlay and sidebar
3. **30** - Navbar (from layout)

### Responsive Breakpoint
- Uses Tailwind's `lg:` breakpoint (1024px)
- Below 1024px: Mobile behavior
- 1024px and above: Desktop behavior

### State Management
- Uses React `useState` for menu open/close state
- Uses Next.js `usePathname` for active link detection
- Uses Redux for user data and logout action

## Troubleshooting

### Sidebar not appearing on dashboard pages
- Check that you're on a `/dashboard/*` route
- Verify the dashboard layout is being used
- Check browser console for errors

### Sidebar appearing on property detail page
- This is incorrect - property detail pages should NOT have a sidebar
- Property detail pages use Navbar + Footer layout
- Only dashboard pages have the sidebar

### Mobile menu button not working
- Check that JavaScript is enabled
- Verify the `mobileMenuOpen` state is toggling
- Check for z-index conflicts with other elements

### Sidebar not closing on mobile
- Verify `onClick={() => setMobileMenuOpen(false)}` is on all links
- Check that overlay click handler is working
- Ensure no event propagation issues

## Future Enhancements

Potential improvements:
- Add swipe gesture to open/close on mobile
- Add keyboard shortcut to toggle sidebar
- Add animation for badge notifications
- Add collapse/expand animation for nested menu items
- Add user preference to remember sidebar state
