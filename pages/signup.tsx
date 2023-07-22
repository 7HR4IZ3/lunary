import { useEffect, useState } from "react"
import Router from "next/router"

import {
  Anchor,
  Button,
  Container,
  Highlight,
  Mark,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core"

import { useForm } from "@mantine/form"
import { notifications } from "@mantine/notifications"
import { useSessionContext, useUser } from "@supabase/auth-helpers-react"
import { IconAt, IconCheck, IconUser } from "@tabler/icons-react"

import errorHandler from "@/utils/errorHandler"

function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const { supabaseClient } = useSessionContext()

  const form = useForm({
    initialValues: {
      email: "",
      name: "",
      password: "",
      companyName: "",
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
      name: (val) => (val.length <= 2 ? "Your name that short :) ?" : null),
      password: (val) =>
        val.length < 6 ? "Password must be at least 6 characters" : null,
    },
  })

  const user = useUser()

  useEffect(() => {
    if (user) Router.push("/events/")
  }, [user])

  const handleSignup = async ({
    email,
    name,
  }: {
    email: string
    name: string
  }) => {
    setLoading(true)

    const ok = await errorHandler(
      supabaseClient.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name,
          },
          shouldCreateUser: true,
        },
      })
    )
    if (ok) {
      notifications.show({
        icon: <IconCheck size={18} />,
        color: "teal",
        title: "Email sent 💌",
        message:
          "Check your emails to verify your email. Please check your spam folder as we currently have deliverability issues.",
      })

      setStep(2)
    }

    setLoading(false)
  }

  return (
    <Container py={100} size={400}>
      <Paper radius="md" p="xl" withBorder>
        {step === 1 ? (
          <>
            <Text size="lg" mb="xl" weight={500}>
              Welcome 👋
            </Text>

            <form onSubmit={form.onSubmit(handleSignup)}>
              <Stack>
                <TextInput
                  label="Name"
                  description="Only used to address you properly."
                  icon={<IconUser size={16} />}
                  placeholder="Your full name"
                  error={form.errors.name && "This field is required"}
                  {...form.getInputProps("name")}
                />

                <TextInput
                  icon={<IconAt size={16} />}
                  label="Email"
                  error={form.errors.email && "Invalid email"}
                  placeholder="Your email"
                  {...form.getInputProps("email")}
                />

                <PasswordInput
                  label="Password"
                  error={form.errors.password && "Invalid password"}
                  placeholder="Your password"
                  {...form.getInputProps("password")}
                />

                <Button
                  size="md"
                  mt="md"
                  type="submit"
                  fullWidth
                  loading={loading}
                >
                  {`Sign Up →`}
                </Button>
              </Stack>
            </form>
          </>
        ) : (
          <>
            <Text size="lg" mt="xs" mb="xl" weight={500}>
              {`You're all set! 🎉`}
              <br />
              Check your emails to finish signing up.
            </Text>

            <p>
              <Mark>
                Please check your spam folder as we currently have
                deliverability issues.
              </Mark>
            </p>

            <p>We are actively working on this product.</p>
            <p>Have any feature request or issue?</p>
            <p>Email vince@llmonitor.com</p>
          </>
        )}
      </Paper>
    </Container>
  )
}

export default SignupPage
