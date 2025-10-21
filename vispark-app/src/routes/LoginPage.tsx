import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Spin,
  Typography,
} from "antd"
import { type FC, useState } from "react"
import {
  Navigate,
  useLocation,
  useNavigate,
  type Location,
} from "react-router"

import CenterDiv from "@/modules/common/CenterDiv.tsx"
import { useAuth } from "@/modules/auth/AuthProvider.tsx"

type LoginFormValues = {
  email: string
  password: string
}

const { Title, Text } = Typography

const LoginPage: FC = () => {
  const { user, loading: authLoading, signInWithPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form] = Form.useForm<LoginFormValues>()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const redirectPath =
    (location.state as { from?: Location } | undefined)?.from?.pathname ??
    "/app"

  if (authLoading) {
    return (
      <CenterDiv className="bg-primary">
        <Spin size="large" />
      </CenterDiv>
    )
  }

  if (user) {
    return <Navigate to={redirectPath} replace />
  }

  const handleFinish = async (values: LoginFormValues) => {
    setSubmitting(true)
    setErrorMessage(null)

    const error = await signInWithPassword(values)

    if (error) {
      setErrorMessage(error.message)
    } else {
      form.resetFields()
      navigate(redirectPath, { replace: true })
    }

    setSubmitting(false)
  }

  return (
    <CenterDiv className="bg-primary">
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <Title level={3} className="!text-center">
          Sign in to Vispark
        </Title>
        <Text className="block text-center mb-6 text-muted-foreground">
          Enter your credentials to continue
        </Text>

        {errorMessage ? (
          <Alert
            message="Authentication error"
            description={errorMessage}
            type="error"
            showIcon
            className="mb-4"
          />
        ) : null}

        <Form<LoginFormValues>
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          requiredMark={false}
        >
          <Form.Item<LoginFormValues>
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Please enter your email address",
              },
              {
                type: "email",
                message: "Please enter a valid email address",
              },
            ]}
          >
            <Input
              placeholder="you@example.com"
              size="large"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item<LoginFormValues>
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please enter your password",
              },
            ]}
          >
            <Input.Password
              placeholder="••••••••"
              size="large"
              autoComplete="current-password"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={submitting}
          >
            Sign in
          </Button>
        </Form>

        <Text className="block text-center mt-4 text-muted-foreground">
          New to VISPARK?{" "}
          <Button
            type="link"
            onClick={() =>
              navigate("/signup", {
                state: {
                  from: location.state?.from ?? { pathname: "/app" },
                },
              })
            }
          >
            Create an account
          </Button>
        </Text>
      </Card>
    </CenterDiv>
  )
}

export default LoginPage
