let clerkAuthRef: any = null;

export function setClerkAuth(auth: any) {
  clerkAuthRef = auth;
}

export function getAuthToken(): Promise<string | null> {
  if (!clerkAuthRef) return Promise.resolve(null);
  return clerkAuthRef.getToken();
}