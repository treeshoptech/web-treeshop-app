// Clerk JWT issuer format - trying multiple variations to match the token
// The domain MUST exactly match the "iss" field in the JWT token
// Common formats:
// 1. https://clerk.treeshopterminal.com (with https://)
// 2. clerk.treeshopterminal.com (without https://)
// 3. https://clerk.treeshopterminal.com/ (with trailing slash)

const authConfig = {
  providers: [
    // Try format WITHOUT https:// prefix (most common for Clerk production)
    {
      domain: "clerk.treeshopterminal.com",
      applicationID: "convex",
    },
    // Fallback to WITH https:// prefix
    {
      domain: "https://clerk.treeshopterminal.com",
      applicationID: "convex",
    },
  ]
};

export default authConfig;
