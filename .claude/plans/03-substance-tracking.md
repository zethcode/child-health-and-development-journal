# PLAN 03: Substance Tracking

## Existing Implementation (Reference)

**Files created:**
- `app/pages/medicines/index.vue` - List with tabs
- `app/pages/medicines/new.vue` - Add form
- `app/pages/medicines/[id].vue` - Edit form
- `app/pages/medicines/log.vue` - Manual log entry
- `app/components/substance/SubstanceCard.vue` - Card component
- `app/composables/useSubstances.ts` - CRUD composable

---

## Task 3.1: Test Substance CRUD

**Step 1: Add medicine**
- Go to `/medicines`
- Click "Add"
- Fill: Name="Paracetamol", Type="Medicine", Dosage="5", Unit="ml"
- Submit
- Verify: Appears in list

**Step 2: Edit medicine**
- Click on medicine name
- Change dosage to "10"
- Save
- Verify: List shows updated dosage

**Step 3: Toggle active**
- Click menu (⋮) > "Mark Inactive"
- Verify: Shows "Inactive" badge, grayed out

**Step 4: Delete**
- Click menu (⋮) > "Delete"
- Confirm
- Verify: Removed from list
