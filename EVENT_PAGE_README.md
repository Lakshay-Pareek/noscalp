# Event Page Implementation

## Overview

A fully responsive, dynamic event booking page with progress tracking, event details, and time slot selection.

## Features Implemented

### 1. Progress Stepper Component

- **Location**: `app/components/event/ProgressStepper.tsx`
- 4-step progress indicator (Choose Time → Choose Seat → Checkout → Get Ticket)
- Animated transitions between steps
- Responsive design (stacks better on mobile)
- Visual feedback for current, completed, and upcoming steps

### 2. Event Header Component

- **Location**: `app/components/event/EventHeader.tsx`
- Large event image with responsive sizing
- Event details with icons (date, time, location)
- "Get Directions" CTA button
- Flexbox layout (side-by-side on desktop, stacked on mobile)
- Hover animations on interactive elements

### 3. Date & Time Selector Component

- **Location**: `app/components/event/DateTimeSelector.tsx`
- Grid of available time slots
- Each slot shows:
  - Date badge (purple background)
  - Event name and tour
  - Venue and time
  - Price per person
  - Tickets available count
  - Book Now button
- Responsive grid (1 column mobile, 2 columns desktop)
- Selection state tracking
- Hover effects and animations
- Flexbox layout for card internals

### 4. Event Data Structure

- **Location**: `app/data/events.ts`
- TypeScript interfaces for type safety
- Sample event data (Taylor Swift, K-pop Show)
- Helper functions:
  - `getEventById(id)` - Fetch event by ID
  - `getAllEventIds()` - Get all event IDs
- Easy to extend with more events

### 5. Dynamic Route

- **Location**: `app/event/[id]/page.tsx`
- Dynamic routing with event ID
- Integration of all components
- Error handling for invalid event IDs
- Responsive navbar for event pages

## Usage

### Viewing an Event

Navigate to `/event/[event-id]`, for example:

- `/event/taylor-swift-eras-tour`
- `/event/kpop-show-ticket`

### Adding New Events

Edit `app/data/events.ts` and add a new event object:

```typescript
{
  id: "unique-event-id",
  title: "Event Name",
  description: "Event description",
  image: "/path/to/image.jpg",
  category: "Concert",
  venue: "Venue Name, City",
  timeSlots: [
    {
      date: "10",
      day: "July",
      dayOfWeek: "WED",
      time: "08:00 PM",
      venue: "Venue Name",
      price: "100$",
      ticketsAvailable: 50,
    },
    // Add more time slots...
  ],
}
```

## Responsive Breakpoints

### Mobile (< 640px)

- Single column layout
- Stacked date/time cards
- Horizontal date badge in cards
- Simplified spacing

### Tablet (640px - 1024px)

- 2-column time slot grid
- Side-by-side layouts begin to appear

### Desktop (> 1024px)

- Full 2-column time slot grid
- Event image and details side-by-side
- Optimal spacing and sizing

## Animations

All components use Framer Motion for:

- **Fade in**: Initial page load
- **Slide in**: Staggered card entrance
- **Hover effects**: Scale and lift on cards/buttons
- **Progress animation**: Stepper line fills
- **Selection feedback**: Border color changes

## Flexbox Usage

Extensive use of flexbox throughout:

- **Event Header**: `flex` for image/details layout
- **Date Cards**: `flex` for date badge and content
- **Time Slots**: `flex-col` for vertical stacking
- **Progress Stepper**: `flex` for step alignment
- All responsive with `flex-col` → `flex-row` transitions

## Components Structure

```
app/
├── components/
│   └── event/
│       ├── ProgressStepper.tsx    # 4-step progress indicator
│       ├── EventHeader.tsx        # Event image & details
│       └── DateTimeSelector.tsx   # Time slot grid
├── data/
│   └── events.ts                  # Event data & helpers
└── event/
    └── [id]/
        └── page.tsx               # Dynamic event page
```

## Next Steps

To extend functionality:

1. Add seat selection component (Step 2)
2. Implement checkout flow (Step 3)
3. Add ticket generation (Step 4)
4. Connect to backend API
5. Add payment integration
6. Implement user authentication

## Image Requirements

Place event images in `/public/events/`:

- `taylor-swift.jpg`
- `kpop-group.png`
- Add more as needed

Use recommended dimensions: 800x600px for best results.
