# Styling & UI Standards

## Design Tokens
- **Theme**: Light mode primary (Clinic Clean).
- **Colors**: Use `primary` for action buttons, `destructive` for delete/lock actions, and `muted` for secondary text.
- **Spacing**: Use standard Tailwind scales (e.g., `gap-4`, `p-6`).

## Component Usage
- **Forms**: Use ShadCN `Form`, `FormControl`, and `FormMessage`. 
- **Modals**: Use `Dialog` for CRUD operations (Create/Edit Employee).
- **Tables**: Use `DataTable` pattern for the consolidated admin view.
- **Feedback**: Use `Sonner` (toast) for success/error messages on Server Action completion.

## Layout
- **Mobile First**: All views must be responsive (essential for staff checking hours on phones).
- **Sidebar**: Collapsible on desktop, drawer/hamburger on mobile.