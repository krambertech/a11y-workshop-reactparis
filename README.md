# Web Accessibility in React Workshop

Welcome to the Web Accessibility in React workshop! I'm excited to share this hands-on guide with you, where we'll dive into building accessible React applications using modern tools.

## [🏃‍♀️‍➡️ Open exercises](EXERCISES.md)

## Prerequisites

Some prerequisites:

- Intermediate knowledge of React
- Basic understanding of HTML and CSS
- Node.js 18+ installed (ideally 20+)
- Git installed
- Your favorite code editor

## Setup instructions

To get started, follow these steps:

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Start the API server:

```bash
npm run api
```

4. Start the development server:

```bash
npm run dev
```

## Code

### Available scripts

Here are the available scripts you can use:

- `npm run dev` - Start the development server
- `npm run api` - Start the mock API server
- `npm run build` - Build the production version
- `npm run test` - Run the tests for the frontend
- `npm run test:api` - Run the tests for the backend

### Available routes

We have the following routes set up:

- `/login` - Login page
- `/register` - Register page
- `/home` - Tils page (home page)
- `/users` - Users page
- `/users/:id` - User details page

Keep in mind that routes `/home`, `/users`, and `/users/:id` are protected, so you'll need to be logged in to access them.

### Frontend Folder Structure

Our frontend folder structure looks like this:

```
src/
├── components/  # Reusable UI components
│   └── ui/      # Core UI primitives
├── pages/       # Application page components for each route
├── helpers/     # Utility functions, hooks, and API client
├── test/        # Testing utilities and mock data
├── globals.css  # Global styles and utility classes
├── App.tsx      # Main application component
└── main.tsx     # Application entry point
```

### Styles

Check out the `src/globals.css` file to see our theme setup. I've created a bunch of CSS variables and utility classes to make styling easier. There are also some global styles.

#### CSS Variables

I've set up CSS variables for pretty much everything you'll need:

- **Colors** for backgrounds, text, borders, and different state indicators, like `var(--background)`, `var(--text)`, `var(--border)`, `var(--success-1)`, etc. Colors are based off [Radix Colors](https://www.radix-ui.com/colors).
- **Spacing** values for spaces between elements, like `var(--space-sm)`, `var(--space-md)`, `var(--space-lg)`, etc.
- **Font sizes** for different text elements, like `var(--font-size-sm)`, `var(--font-size-md)`, `var(--font-size-lg)`, etc.
- **Other stuff** like border radius and shadows, like `var(--radius)`, `var(--shadow-sm)`, `var(--shadow-md)`, `var(--shadow-lg)`, etc.

#### Utility Classes

I've also added some global utility classes inspired by Tailwind to speed up common styling tasks, so that we wouldn't need to write a lot of CSS and can ficus on accessibility:

- **Layout helpers** like `.container`, `.stack`, and `.sr-only` for accessibility
- **Flex utilities** for quick layouts (`.flex`, `.flex-col`, etc.)
- **Alignment helpers** to position content (`.justify-center`, `.align-start`, etc.)
- **Text formatting** for quick text styling
- **Form styles** for consistent form elements - `field`, `caption`, `error`

You can see all the utility classes in the `src/globals.css` file.

### Available components

All reusable UI components are located in the `src/components/ui` folder. We have:

- `Button` - for buttons, it styles the `button` tag inside and also allows you to use the `icon` prop to add an icon
- `LoadingState` - for loading states, it styles the `span` tag inside with a loading animation
- `EmptyState` - for empty states, it styles the `div` tag inside with an optional icon and message
- `IconButton` - for icon buttons, it styles the `button` tag inside and also allows you to use the `icon` prop to add an icon
- `Input` - for input fields, it styles the `input` tag inside and also supports passing an icon
- `TextArea` - for text area fields, it styles the `textarea` tag inside
- `Banner` - for banners, it styles the `div` tag inside with an optional icon and message
- `Dialog` - for dialogs, uses the Radix UI Dialog component under the hood, and also exports `AlertDialog`
- `VisuallyHidden` for visually hidden content for screen readers
- `Avatar` for user images

### API requests

All API requests are located in the `src/helpers/queries` folder. Each request has a `use` function that returns a hook for the request. Under the hood, it uses `react-query` to fetch and mutate data.

### Forms

During the workshop, we will focus on forms accessibility, so we have `react-hook-form` and `zod` to handle the logic and validation.

Use it like so:

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// define the schema
const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
});

const {
  // register the fields with the form, it passes name and necessary callbacks
  register,
  handleSubmit,
  // errors returns an object with errors, each error message can be accessed by `errors.[name].message`
  formState: { errors },
} = useForm({
  // pass the schema to the resolver
  resolver: zodResolver(schema),
});

// then use it in the form like so:
<form onSubmit={handleSubmit(submitHandler)}>
  <Input {...register("name")} /*...other props */ />
  <Input {...register("email")} /*...other props */ />
  <Button type="submit">Submit</Button>
</form>;
```

### Testing

For testing, I've set up a suite of tools for us to practice writing tests:

- **Vitest** - Test runner that works great with Vite
- **Testing Library** - For testing React components in a user-centric way
- **MSW** - For mocking API requests during tests

There is `test/utils` where there are utilities for testing, including re-export of the `render` function from `@testing-library/react` with additional features and wrappers.

Testing commands:

- `npm test` - Run all frontend tests
- `npm test -- ComponentName` - Run tests for a specific component
- `npm run test:api` - Run API-specific tests (separate configuration)

For more information, check out:

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/docs/)

## Resources

- [WCAG Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [WAI-ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Radix UI Documentation](https://www.radix-ui.com/)

## License

MIT
