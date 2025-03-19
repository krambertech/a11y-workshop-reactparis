import { z } from "zod";

export const GithubProfileSchema = z.object({
  avatar_url: z.string(),
  name: z.string().nullable(),
  html_url: z.string(),
  company: z.string().nullable(),
  bio: z.string().nullable(),
  location: z.string().nullable(),
  blog: z.string().nullable(),
  public_repos: z.number(),
  public_gists: z.number(),
  followers: z.number(),
  following: z.number(),
  created_at: z.string(),
});

export type GithubProfile = z.infer<typeof GithubProfileSchema>;

export async function fetchGitHubProfile(
  username: string,
): Promise<GithubProfile | null> {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Validate the data against our schema
    const result = GithubProfileSchema.safeParse(data);

    if (!result.success) {
      console.error("GitHub API returned invalid data:", result.error);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error("Error fetching GitHub profile:", error);
    return null;
  }
}
