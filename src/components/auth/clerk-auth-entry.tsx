import { AuthView } from '@clerk/expo/native';

export function ClerkAuthEntry() {
  return <AuthView mode="signInOrUp" isDismissable={false} />;
}
