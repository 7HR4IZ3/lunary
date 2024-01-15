import { Anchor, Button, Flex, Group } from "@mantine/core"

import {
  IconAlertTriangle,
  IconAlertTriangleFilled,
  IconCheck,
} from "@tabler/icons-react"

import { useOrg, useUser } from "@/utils/dataHooks"
import { notifications } from "@mantine/notifications"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import errorHandler from "../../utils/errorHandler"
import { openUpgrade } from "./UpgradeModal"

export default function Navbar() {
  const router = useRouter()

  const { user, mutate } = useUser()
  const { org } = useOrg()

  const [emailSent, setEmailSent] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)

  // const user = useUser()

  // check if has ?verified=true in url
  useEffect(() => {
    const verified = router.query.verified === "true"

    if (verified) {
      mutate() // force update user
      notifications.show({
        id: "verified",
        icon: <IconCheck size={18} />,
        color: "teal",
        title: "Email verified",
        message: "You now have access to all features.",
      })

      // remove query param
      router.replace(router.pathname, undefined, { shallow: true })
    }
  }, [router.query])

  const sendVerification = async () => {
    if (sendingEmail) return
    setSendingEmail(true)

    const ok = await errorHandler(
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/send-verification`, {
        method: "POST",
        body: JSON.stringify({
          email: user?.email,
          name: user?.name,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    )

    if (ok) {
      notifications.show({
        icon: <IconCheck size={18} />,
        color: "teal",
        title: "Email sent 💌",
        message: "Check your emails to verify your email.",
      })

      setEmailSent(true)
    }

    setSendingEmail(false)
  }

  return (
    <Flex
      align="center"
      justify="space-between"
      pos="absolute"
      top={8}
      right={8}
    >
      <Group />

      <Group>
        {org?.canceled ? (
          <Button
            size="compact-xs"
            color="red"
            onClick={() => openUpgrade()}
            leftSection={<IconAlertTriangleFilled size="16" />}
          >
            Subscription will cancel soon. Click here to restore and prevent
            data deletion.
          </Button>
        ) : org?.limited ? (
          <Button
            color="orange"
            size="compact-xs"
            onClick={() => openUpgrade("events")}
            leftSection={<IconAlertTriangle size="16" />}
          >
            Events limit reached. Click here to upgrade & restore access.
          </Button>
        ) : (
          <>
            {!user?.verified && (
              <Group
                bg="orange.9"
                h={24}
                c="white"
                gap={8}
                px="8"
                display="flex"
                style={{
                  borderRadius: 8,
                  fontSize: 14,
                  color: "white",
                  zIndex: 3,
                }}
              >
                {`Verify your email to keep your account`}

                {!emailSent && (
                  <>
                    <span style={{ marginRight: 0 }}>-</span>
                    <Anchor
                      href="#"
                      onClick={sendVerification}
                      c="white"
                      style={{ fontSize: 14 }}
                    >
                      {sendingEmail ? "Sending..." : "Resend email"}
                    </Anchor>
                  </>
                )}
              </Group>
            )}
          </>
        )}
      </Group>
    </Flex>
  )
}
