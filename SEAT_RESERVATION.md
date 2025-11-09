# Seat Reservation System

## Overview

A complete, responsive seat reservation system for event ticketing with dynamic venue layouts, interactive seat selection, and checkout functionality.

## Features

### 🎯 Dynamic Venue Layouts

- **3 Venue Sizes**: Small, Medium, Large
- **Flexible Sections**: Support for 2-4 sections based on venue size
- **Configurable Seating**: Each section has customizable rows and seats per row
- **Auto-generated Seats**: Seats are automatically generated with random reservations

### 🎫 Ticket Management

- **3 Pricing Tiers**: VIP ($399), Standard ($299), Economic ($199)
- **Real-time Selection**: Interactive seat selection with visual feedback
- **Status Tracking**: Available, Reserved, Selected states
- **Remove Capability**: Easy ticket removal from selection

### 📱 Fully Responsive Design

- **Mobile-first**: Optimized for small screens (320px+)
- **Tablet**: Enhanced layout for medium screens (640px+)
- **Desktop**: Full-featured experience (1024px+)
- **Touch-friendly**: Large touch targets for mobile devices

### ✨ Animations

- **Framer Motion**: Smooth animations throughout
- **Seat Hover**: Scale effects on available seats
- **Entry Animations**: Staggered appearance of sections
- **Ticket Removal**: Smooth exit animations

## File Structure

```
app/
├── types/
│   └── seat.ts                    # TypeScript interfaces
├── data/
│   ├── seats.ts                   # Venue layouts & seat generation
│   └── events.ts                  # Event data with venue sizes
├── components/
│   └── seats/
│       ├── SeatGrid.tsx           # Individual section seat grid
│       ├── SeatMap.tsx            # Complete venue seat map
│       ├── TicketPricing.tsx      # Ticket tier selection
│       ├── SelectedTickets.tsx    # Selected tickets list
│       └── CheckoutSummary.tsx    # Checkout summary & button
└── event/
    └── [id]/
        └── seats/
            └── page.tsx           # Main seat selection page
```

## Data Structure

### Venue Layouts

```typescript
{
  size: "small" | "medium" | "large",
  sections: [
    {
      id: "section-1",
      name: "Section 1",
      rows: 12,
      seatsPerRow: [8, 9, 10, 10, 11, ...],
      position: "center-top" | "center-bottom" | "left" | "right"
    }
  ]
}
```

### Seat Object

```typescript
{
  id: "section-1-row5-seat10",
  row: 5,
  number: 10,
  status: "available" | "reserved" | "selected",
  section: "section-1"
}
```

### Selected Ticket

```typescript
{
  seat: Seat,
  tier: TicketTier,
  eventTitle: string,
  eventImage: string,
  eventDate: string,
  eventTime: string
}
```

## Usage Flow

1. **Select Ticket Tier**: Choose VIP, Standard, or Economic pricing
2. **Select Seats**: Click available seats (blue) on the venue map
3. **Review Selection**: View selected tickets in the sidebar
4. **Checkout**: Click checkout button to proceed to payment

## Responsive Breakpoints

- **Mobile**: < 640px
  - Stacked layout
  - Smaller seat buttons (16px)
  - Single column sections
- **Tablet**: 640px - 1024px
  - Medium seat buttons (20px)
  - Side-by-side sections
  - Enhanced spacing
- **Desktop**: > 1024px
  - Large seat buttons (24px)
  - Sidebar layout
  - Sticky checkout summary

## Color System

- **Available Seats**: Light blue (#DBEAFE)
- **Reserved Seats**: Dark blue (#2563EB)
- **Selected Seats**: Red (#EF4444)
- **Primary Button**: Purple (#5522CC)
- **Accent**: Pink (#ED4690)

## State Management

- Seats state managed at page level
- Selected tickets tracked in array
- Session storage for checkout data
- Real-time updates on selection/removal

## Navigation

- `/event/[id]` → Time selection page
- `/event/[id]/seats` → Seat selection page
- `/event/[id]/checkout` → Checkout page (to be implemented)

## Performance Optimizations

- Lazy rendering of seat grids
- Memoized seat calculations
- Optimized re-renders with proper state updates
- Efficient AnimatePresence for list animations

## Future Enhancements

- [ ] Zoom/pan for large venue maps
- [ ] Seat preview on hover
- [ ] Price per seat (different zones)
- [ ] Accessibility keyboard navigation
- [ ] Multi-language support
