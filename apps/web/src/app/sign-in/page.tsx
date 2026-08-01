"use client";

import { Alert, Divider, PasswordInput, Tabs } from "@mantine/core";
import { Button, Container, Stack, Text, TextInput, Title } from "@padelski/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { authClient } from "../../lib/auth-client";

type AuthFeatures = {
  githubOAuth: boolean;
  emailPassword: boolean;
};

export default function SignInPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const [features, setFeatures] = useState<AuthFeatures | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [fullName, setFullName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .getConfig()
      .then((config) => setFeatures(config.features))
      .catch((err: Error) => setConfigError(err.message));
  }, []);

  useEffect(() => {
    if (!sessionPending && session) {
      router.replace("/app/play-sessions");
    }
  }, [session, sessionPending, router]);

  async function handleGitHubSignIn() {
    setAuthError(null);
    setLoading(true);
    try {
      const { error } = await authClient.signIn.social({
        provider: "github",
        callbackURL: "/app/play-sessions",
      });
      if (error) {
        setAuthError(error.message ?? "GitHub sign-in failed");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSignIn() {
    setAuthError(null);
    setLoading(true);
    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/app/play-sessions",
      });
      if (error) {
        setAuthError(error.message ?? "Sign-in failed");
        return;
      }
      router.push("/app/play-sessions");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSignUp() {
    setAuthError(null);

    if (!nickname.trim()) {
      setAuthError("Nickname is required");
      return;
    }
    if (!fullName.trim()) {
      setAuthError("Full name is required");
      return;
    }

    setLoading(true);
    try {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name: fullName.trim(),
        nickname: nickname.trim(),
        callbackURL: "/app/play-sessions",
      });
      if (error) {
        setAuthError(error.message ?? "Sign-up failed");
        return;
      }
      router.push("/app/play-sessions");
    } finally {
      setLoading(false);
    }
  }

  const showGitHub = features?.githubOAuth ?? false;
  const showEmail = features?.emailPassword ?? false;
  const noMethods = features !== null && !showGitHub && !showEmail;

  return (
    <Container size="xs" py="xl">
      <Stack gap="lg">
        <Stack gap={4}>
          <Title order={1}>Sign in to Padelski</Title>
          <Text c="dimmed" size="sm">
            Recreational padel — friend groups and live scoring.
          </Text>
        </Stack>

        {configError && (
          <Alert color="red" title="Could not load sign-in options">
            {configError}
          </Alert>
        )}

        {features === null && !configError && <Text c="dimmed">Loading sign-in options…</Text>}

        {authError && (
          <Alert color="red" title="Authentication error">
            {authError}
          </Alert>
        )}

        {noMethods && (
          <Alert color="yellow" title="Sign-in unavailable">
            No authentication methods are enabled for this environment.
          </Alert>
        )}

        {showGitHub && (
          <Stack gap="sm">
            <Button
              variant="default"
              fullWidth
              loading={loading}
              onClick={() => void handleGitHubSignIn()}
            >
              Continue with GitHub
            </Button>
            {showEmail && <Divider label="or" labelPosition="center" />}
          </Stack>
        )}

        {showEmail && (
          <Tabs defaultValue="sign-in">
            <Tabs.List grow>
              <Tabs.Tab value="sign-in">Sign in</Tabs.Tab>
              <Tabs.Tab value="sign-up">Sign up</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="sign-in" pt="md">
              <Stack gap="sm">
                <TextInput
                  label="Email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                />
                <PasswordInput
                  label="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                />
                <Button
                  fullWidth
                  loading={loading}
                  disabled={!email || !password}
                  onClick={() => void handleEmailSignIn()}
                >
                  Sign in
                </Button>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="sign-up" pt="md">
              <Stack gap="sm">
                <TextInput
                  label="Nickname"
                  description="Public game identity — shown on slots and leaderboards"
                  placeholder="e.g. padel_king"
                  autoComplete="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.currentTarget.value)}
                  required
                />
                <TextInput
                  label="Full name"
                  description="Private — not shown to other players"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.currentTarget.value)}
                  required
                />
                <TextInput
                  label="Email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                />
                <PasswordInput
                  label="Password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                />
                <Text size="xs" c="dimmed">
                  By signing up you agree that your nickname is public and your full name stays
                  private per our privacy notice.
                </Text>
                <Button
                  fullWidth
                  loading={loading}
                  disabled={!email || !password || !nickname.trim() || !fullName.trim()}
                  onClick={() => void handleEmailSignUp()}
                >
                  Create account
                </Button>
              </Stack>
            </Tabs.Panel>
          </Tabs>
        )}

        <Text size="sm" c="dimmed" ta="center">
          <Link href="/">Back to home</Link>
        </Text>
      </Stack>
    </Container>
  );
}
