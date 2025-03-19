import { v4 as uuidv4 } from "uuid";
import { Til, InternalUser } from "./db.js";

// Seed initial data into database
export const seedUsers: InternalUser[] = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    username: "test",
    password: "accessibility",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2025-03-04T00:00:00.000Z",
    avatarUrl: "https://avatars.jakerunzer.com/test",
    displayName: "Danny",
    githubProfileUrl: "https://github.com/danny",
    company: "Self-employed",
    bio: "Software engineer ",
    location: "Paris",
    blog: "https://danny.com",
    publicReposCount: 13,
    publicGistsCount: 3,
    followersCount: 14,
    followingCount: 3,
    githubProfileCreatedAt: "2020-01-03T00:00:00.000Z",
  },
  {
    id: "c7d4bf30-c68f-4c44-9e34-8c5f9c9c3f6a",
    username: "krambertech",
    password: "admin-admin",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2025-03-04T00:00:00.000Z",
    avatarUrl: "https://github.com/krambertech.png",
    displayName: "Kateryna",
    githubProfileUrl: "https://github.com/krambertech",
    company: "Buffer",
    bio: "Ukraininan engineer living in Estonia, working at Buffer",
    location: "Tallinn",
    publicReposCount: 55,
    publicGistsCount: 7,
    followersCount: 1028,
    followingCount: 15,
    githubProfileCreatedAt: "2015-01-10T10:52:58Z",
  },
];

export const seedTils: Til[] = [
  {
    id: uuidv4(),
    userId: "c7d4bf30-c68f-4c44-9e34-8c5f9c9c3f6a",
    title: "ARIA live regions",
    content:
      "Use aria-live='polite' for non-urgent updates and aria-live='assertive' for important announcements. Helps screen readers announce dynamic content changes.",
    createdAt: "2025-01-02T10:00:00.000Z",
    updatedAt: "2025-02-03T10:00:00.000Z",
  },
  {
    id: uuidv4(),
    userId: "c7d4bf30-c68f-4c44-9e34-8c5f9c9c3f6a",
    title: "Button vs Link",
    content:
      "Use buttons for actions that change page content, links for navigation to new pages. Never use divs with onClick - they lack keyboard accessibility.",
    createdAt: "2025-02-04T10:00:00.000Z",
    updatedAt: "2025-02-05T10:00:00.000Z",
  },
  {
    id: uuidv4(),
    userId: "c7d4bf30-c68f-4c44-9e34-8c5f9c9c3f6a",
    title: "Form validation tips",
    content:
      "Connect error messages to form fields with aria-describedby. Add aria-invalid when field has errors. Screen readers will announce errors properly.",
    createdAt: "2025-02-06T10:00:00.000Z",
    updatedAt: "2025-02-06T10:00:00.000Z",
  },
  {
    id: uuidv4(),
    userId: "c7d4bf30-c68f-4c44-9e34-8c5f9c9c3f6a",
    title: "Skip links!",
    content:
      "Add skip link at page start: Skip to main content. Make it visible on focus only. Helps keyboard users bypass repetitive navigation.",
    createdAt: "2025-02-20T10:00:00.000Z",
    updatedAt: "2025-02-20T10:00:00.000Z",
  },
  {
    id: uuidv4(),
    userId: "c7d4bf30-c68f-4c44-9e34-8c5f9c9c3f6a",
    title: "Loading state accessibility",
    content:
      "Use role='status' with aria-busy='true' for loading states. Screen readers will announce both loading and when content is ready.",
    createdAt: "2025-03-06T10:00:00.000Z",
    updatedAt: "2025-03-08T10:00:00.000Z",
  },
  {
    id: uuidv4(),
    userId: "c7d4bf30-c68f-4c44-9e34-8c5f9c9c3f6a",
    title: "Better focus styles",
    content:
      "Use :focus-visible instead of :focus for focus rings. Shows focus indicator only during keyboard navigation while keeping mouse experience clean.",
    createdAt: "2025-03-08T10:00:00.000Z",
    updatedAt: "2025-03-11T10:00:00.000Z",
  },
  {
    id: uuidv4(),
    userId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    title: "Press control to stop screen reader speech",
    content:
      "You can press control to stop screen reader speech. This is useful when you are reading a long text and you want to stop the speech.",
    createdAt: "2025-03-13T10:00:00.000Z",
    updatedAt: "2025-03-15T10:00:00.000Z",
  },
];
