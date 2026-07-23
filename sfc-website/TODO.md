# Admin Events Delete Fix - TODO

## Completed Steps
- [x] Analyzed root cause of delete not working
- [x] Got user approval on plan

## Remaining Steps
- [x] Step 1: Fix `EventEditor`'s `onSubmit` handler
- [x] Step 2: Add try/catch error handling to `handleDelete` with `error` state
- [x] Step 3: Add try/catch error handling to `handleSave` with `error` state
- [x] Step 4: Add error state management and UI feedback
- [x] Step 5: Strip stored `id` field from document data in onSnapshot (critical fix for delete not working)
- [x] Step 6: Filter out `next-event` from Events Manager list

## New Task: Link upcoming events to football fixtures and F1 races
- [x] Step 1: Modify `useUpcomingEvents.ts` to also fetch `footballFixtures` and `formulaOneRaces`
- [x] Step 2: Merge, sort by date, and map to unified `UpcomingEvent` interface

## New Task: User Management in Admin Panel
- [x] Added Users tab with live list from Firestore `users` collection
- [x] Each user shows UID and display name with a Remove button
- [x] Remove deletes the user's profile document from Firestore

