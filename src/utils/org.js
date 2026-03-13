export function getOrgId(currentUser, fallback = 'demo-org') {
  if (currentUser?.email) {
    return currentUser.email.split('@')[0];
  }
  if (currentUser?.uid) {
    return currentUser.uid;
  }
  return fallback;
}
