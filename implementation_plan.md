# Move Forms to Modals

## Goal Description
The user wants to improve the UI by moving the entity creation and editing forms (which are currently rendered directly on the page inside `Card` components) into dialog modals. This will be applied across all section manager components, ensuring users do not immediately see the form when entering a section.

## Target Sections
- Users ([UsersManager.tsx](file:///d:/Dev/JS/Next%20Js/umja-space/app/%28protected%29/users/UsersManager.tsx))
- Auteurs ([AuthorsManager.tsx](file:///d:/Dev/JS/Next%20Js/umja-space/app/%28protected%29/auteurs/AuthorsManager.tsx))
- Designers ([DesignersManager.tsx](file:///d:/Dev/JS/Next%20Js/umja-space/app/%28protected%29/designers/DesignersManager.tsx))
- Clubs ([ClubsManager.tsx](file:///d:/Dev/JS/Next%20Js/umja-space/app/%28protected%29/clubs/ClubsManager.tsx))
- Ambassadeurs ([AmbassadorsManager.tsx](file:///d:/Dev/JS/Next%20Js/umja-space/app/%28protected%29/ambassadeurs/AmbassadorsManager.tsx))
- Membres de Clubs ([ClubMembersManager.tsx](file:///d:/Dev/JS/Next%20Js/umja-space/app/%28protected%29/membres-clubs/ClubMembersManager.tsx))
- Livres ([BooksManager.tsx](file:///d:/Dev/JS/Next%20Js/umja-space/app/%28protected%29/livres/BooksManager.tsx))

## Proposed Changes

1. **Import Dialog Components**: In each manager file, import the necessary [Dialog](file:///d:/Dev/JS/Next%20Js/umja-space/components/ui/dialog.tsx#10-15) components from `@/components/ui/dialog`:
   ```tsx
   import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogHeader,
     DialogTitle,
   } from "@/components/ui/dialog";
   ```

2. **State Management**:
   - Add a piece of state to control the modal visibility:
     ```tsx
     const [isModalOpen, setIsModalOpen] = useState(false);
     ```

3. **Trigger Modal via "Add" Button**:
   - Remove the existing `Card` wrapping the form.
   - Add a "Créer" button next to the search/filters or at the top of the list card, which sets `isModalOpen` to `true` and clears any `editing` state.
   - Update the "Modifier" button in the table to also set `isModalOpen` to `true` after setting the `editing` state.

4. **Refactor Form Submission**:
   - Update the [handleSubmit](file:///d:/Dev/JS/Next%20Js/umja-space/app/%28protected%29/membres-clubs/ClubMembersManager.tsx#94-136) function. Inside the `startTransition` or after a successful response, add `setIsModalOpen(false)` to automatically close the modal.
   - Update [handleCancelEdit](file:///d:/Dev/JS/Next%20Js/umja-space/app/%28protected%29/users/UsersManager.tsx#113-117) to close the modal: `setIsModalOpen(false)`.

5. **Modal Structure**:
   - Wrap the `<form>` inside the [Dialog](file:///d:/Dev/JS/Next%20Js/umja-space/components/ui/dialog.tsx#10-15) structure:
     ```tsx
     <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
       <DialogContent className="max-w-3xl">
         <DialogHeader>
           <DialogTitle>{editingUser ? "Modifier" : "Créer"}</DialogTitle>
           <DialogDescription>...</DialogDescription>
         </DialogHeader>
         <form ...>
           {/* form content */}
         </form>
       </DialogContent>
     </Dialog>
     ```

## Verification Plan
### Automated Tests
- Run `npm run lint` and `npm run build` after modifications to ensure there are no build errors.

### Manual Verification
- Start the dev server.
- Visit each section and ensure the original form section is gone.
- Click "Créer" or "Modifier" and verify the modal appears.
- Ensure the form submission succeeds and closes the modal on success.
- Ensure "Annuler" or clicking outside closes the modal.
