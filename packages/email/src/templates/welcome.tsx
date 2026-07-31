import { Body, Container, Head, Heading, Html, Text } from "@react-email/components";
import { z } from "zod";

export const welcomeEmailPropsSchema = z.object({
  name: z.string(),
});

export type WelcomeEmailProps = z.infer<typeof welcomeEmailPropsSchema>;

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Heading>Welcome to Padelski</Heading>
          <Text>Hello {name}, your account is ready.</Text>
        </Container>
      </Body>
    </Html>
  );
}
