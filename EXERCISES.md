# Exercises

During the workshop we'll be gradually building the application. You will be starting with a preset set of tools to make it easier for us to focus on accessibility aspects and not do the rest. In here I'm outlining the flow and prioritization of different tasks we will do.

## 1. Improve accessibility of login

You can see there is a login form on the `/login` page, and it works, but it is very bare-bones. Our focus is on improving its accessibility and making it more robust.

In order to test - use these credentials to log in:

```
username: "test"
password: "accessibility"
```

This is a test account that comes in seeded in the database.

To simplify styling for fields, I've added a `field` class to the `src/globals.css` file. You can use it to style the fields. We also have a `caption` class for captions and `error` class for errors under the fields. There is also a `Banner` component that you can use to display messages to the user about the whole form.

Focus on the following:

- Form elements are focusable and have descriptive labels
- Communicate field-specific errors under the fields
- Communicate status of the whole form validation to the user upon submit (error is returned by the useRegister hook)
- Test it with the screen reader

<img src="https://clean.buffer.com/BF9ctgd5+" alt="Login form" width="500">

<details>
<summary>Tips</summary>

- Use `aria-describedby` to link the error message to the input field
- Use `aria-invalid` to indicate that the input field is invalid
- Use `aria-required` to indicate that the input field is required
- Use `id` and `htmlFor` to link the label to the input field
- Use `aria-live` to announce the error message when it appears

</details>

## 2. Add registration for new account

This is a similar exercise to previous one, but expanded with more fields, use cases and captions, where we can practice working with forms even deeper.

<img src="https://clean.buffer.com/B9LJK2s0+" alt="Registration form" width="400">

This form consists of the following fields:

- Username (required)
- Email (required)
- Password (required)
- Confirm password (required)
- Bio (optional)

After registration is complete, we should display a message to the user that account has been created and they can use these credentials to log in.

Features:

- Individual field errors are announced while user is filling the form
- Password requirements and username caption
- Success and submit errors are announced after registration
- (nice to have) Counter of remaining characters in bio field

<details>
<summary>Tips</summary>

- We can use role="alert" to announce the status of the form for success and submit errors
- For counter in the bio field we can use `aria-live="polite"` to announce the remaining characters (or `role="status"`)
- We can use `aria-describedby` can accept multiple ids, so we can link it to multiple captions and/or errors
- Neat tip: we can use `clsx` to conditionally join ids together

</details>

## 3. Improve top navigation

Top navigation is already implemented, but it is not very accessible. We can improve it by using better semantic structure and accessibility features.

<img src="https://clean.buffer.com/8wxfVqzY+" alt="Top navigation" width="700">

Focus on the following:

- Proper semantic structure to make it easier to navigate (nav, ul, li)
- Using links and identofying current selected page
- Look closely on what needs to be a link and what needs to be a button
- There are icon buttons in the top nav, they should be focusable and have proper accessible name

<details>
<summary>Tips</summary>

- React router exports [`NavLink` component](https://v5.reactrouter.com/web/api/NavLink) that can be used to identify current page
- As you can see, we often need to use links as buttons and vice versa. We can use polymorphism pattern to help us give flexibility about semantic structure ([see Radix's Slot component](https://www.radix-ui.com/primitives/docs/utilities/slot)).
- Note how there are icon buttons, and also user avatar acts like a button too. Make some changes to the `Button` component to support this use-case.
- Use visually hidden trick to make content accessible to screen readers, but hidden from the users.
- Use `aria-hidden` to hide content from screen readers.

</details>

<details>
<summary>Skip link CSS</summary>

```css
.skip-link {
  position: fixed;
  top: var(--space-md);
  left: var(--space-md);
  clip: rect(0 0 0 0);
  height: 1px;
  width: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;

  background-color: var(--background);
  padding: var(--space-sm);
  font-size: var(--font-size-sm);
  line-height: 1.5rem;
  font-weight: 600;

  &:focus {
    height: auto;
    width: auto;
    overflow: hidden;
    border-radius: var(--radius);
    z-index: 1;
    clip: auto;
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
}
```

</details>

### 3.1. Add theme toggle (bonus)

There is a hook `useTheme` in the `src/helpers/useTheme.ts` file that you can use to toggle the theme. Implement a `ThemeSwitch` component that will be used to toggle the theme and displayed in the top nav.

## 4. Implement home page

Now let's focus on displaying a list of TILs (Today I Learned) with proper loading and error states. If you open `src/pages/Home.tsx` file, you will see that it already has a list of TILs fetched. Our job is to render them in the UI and handle loading and error states while doing so.

Focus on the following:

- Display loading state when fetching the list
- Display error state when fetching the list fails
- Display a state when there are no TILs
- Display the list of TILs with simple markup (you can use existing component `TilCard` for this, we will be extending it later)

<details>
<summary>Tips</summary>

- Use `role="status"` for loading indicators
- For errors, use `role="alert"` to announce them immediately
- Use semantic list elements (`ul`, `li`) for the TIL items as they are displayed in a list

</details>

### 4.1. Accessible TIL card component

Now our focus is on creating an accessible TIL card component that we will be able to reuse across the app. It should have these features:

- Display title, description, author, date, and a button to save/unsave the TIL
- Implement save/unsave functionality via the toggle button
- Display button to delete the TIL, only when user is an author of the TIL. Button should be displayed [on hover](https://clean.buffer.com/GHWtb3fR)

<img src="https://clean.buffer.com/Kc6W6qfW+" alt="TIL card" width="700">

<details>
<summary>Tips</summary>

- We can use `article` element to wrap the TIL card content
- Use `aria-pressed` to indicate the toggled state for the save button
- For displaying time, we can use `time` element with `datetime` attribute. We have date-fns installed, so you can use it to format the date.
- Hover behavior for actions while very common is tricky to implement:
  - We can use CSS to show buttons when focused
  - And handle when hover action is not available (e.g. when user is using keyboard only) via `@media (hover: hover) { ... }` media query

</details>

## 5. Create TIL dialog

While we have been implementing some of our own components, often for more complex patterns, we can also use many existing libraries. In this case, we can use `@radix-ui` component for a dialog.

<img src="https://clean.buffer.com/mNFN6pY9+" alt="Create TIL dialog" width="400">

There is already a styled version of it available in the `@/components/ui/Dialog` file and we will use it to create a dialog for creating new TILs.

Even when using an accessible library like Radix, we need to pay attention to how we use it in our application.

For dialogues specifically, focus management is important. And Radix dialog implements focus management out of the box. But for it to work, we need to make sure that we are using triggers properly.

Extract this into separate component `TilDialog` in `components/TilDialog` folder.

<details>
<summary>Useful snippets</summary>

Schema for validation:

```tsx
const tilSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(8, "Content must be at least 8 characters"),
});
```

Use this hook to access the mutation:

```tsx
const createTil = useCreateTil();
```

We can extract dialog into sepaarte component by passing children as trigger.

```tsx
<TilDialog>
  <Button />
</TilDialog>

// inside dialog
<Dialog.Trigger>{children}</Dialog.Trigger>
```

</details>

### 5.1. Delete TIL with alert dialog

Now that we've learned to create new tiles, it would be great to be able to delete them as well. Implement an alert dialog pattern for confirming TIL deletion with better accessibility.

`AlertDialog` component is already available in the `@/components/ui/Dialog` file.

<img src="https://clean.buffer.com/M9dHhm1P+" alt="Delete TIL dialog" width="700">

<details>
<summary>Tips</summary>

- Use `AlertDialog` component from `@/components/ui/Dialog` file. Note that while it looks like a dialog, it is an alert dialog which follows a different pattern
- Use `AlertDialog.Trigger` to create a trigger for the dialog
- Refer to Radix documentation for more details: https://www.radix-ui.com/primitives/docs/components/alert-dialog

</details>

### 5.2 Edit TIL (optional)

As an optional follow up, we can also implement a dialog for editing existing TILs by using the same component and extending it to support editing too via props.

```tsx
<TilDialog til={til}>
```

Depending if TIL is there or not, we can use different mutation and modes in the dialog.

## 6. Toast notifications

We are performing a lot of actions, but often it can be hard to notify users who might not be able to see the changes visually on the screen.

Common pattern is the usage of toast notifications.

<img src="https://clean.buffer.com/jHclx6SX+" alt="Toast notification" width="300">

We already have the start for this with some styling and some logic to enable them in the application. Our focus will be on the markup and accessibility. Open `src/components/ui/Toast.tsx` file to see the implementation.

Use toasts for:

- Successful TIL creation
- Successful TIL deletion
- Failed TIL deletion
- Save and unsave TIL
- TIL editing (if implemented)

---

## 7. Writing tests

Let's write some tests for our application. We will be using `@testing-library/react` and `@testing-library/user-event` for this. Testing library uses accessibility tree to test the application, so this can be a good way to verify that our application is accessible.

Let's add tests for the following:

- Registration Form (focusing on validation and accessibility)
- Home page (focusing on loading states and displaying lists)

There are already some test cases with todo added and some useful imports added to the top of both files.

<details>
<summary>Useful snippets</summary>

Use msw to mock the API responses.

```tsx
server.use(
  http.post("/api/auth/register", async () => {
    return HttpResponse.json(mockUser({ username: "username" }));
  }),
);
```

Use utility render function to render the user:

```tsx
const { user } = render(<Register />);
```

We can even test keyboard navigation with `user.keyboard` method.

```tsx
await user.keyboard("{tab}");
```

</details>

References:

- https://testing-library.com/docs/user-event/intro/
- https://testing-library.com/docs/queries/about
- https://testing-library.com/docs/dom-testing-library/api-accessibility
- https://testing-library.com/docs/dom-testing-library/api-within

### 7.1. Add tests for the `TilCard` component

To practice testing further, let's add tests for the `TilCard` component, testing successful save and unsave, and delete.

## 8. Add /users page

Users page will be a list of users fetched from the API, linking to their profile pages ([see demo](https://clean.buffer.com/QFmQ6jjM)).

The user cards need to be clickabe linking to user profiles, and display additional actions when hovering over them to open github profile and copy profile link.

<img src="https://clean.buffer.com/1xkF1G09+" alt="Users page" width="400">

While pattern of having clickable element display additional actions is not ideal, it is fairly common. We can employ some CSS tricks to make this accessible

## 9. Add /users/:id page

This page will display a single user profile, with the TILs they have authored.

<img src="https://clean.buffer.com/b1qH7JHB+" alt="Users page" width="400">

## 10. Add search and filter to home page

To experiment with different patterns, let's add search and filter to the home page. Search should filter in place and filter button should filter by all, my and saved TILs.

<img src="https://clean.buffer.com/cDBpCm9d+" alt="Filters" width="600">
