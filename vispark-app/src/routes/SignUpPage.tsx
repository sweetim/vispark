import {
  Alert,
  Button,
  Card,
  Divider,
  Form,
  Input,
  message,
  Spin,
  Typography,
} from "antd"
import { type FC, useState } from "react"
import { type Location, Navigate, useLocation, useNavigate } from "react-router"
import { useAuth } from "@/modules/auth/AuthProvider.tsx"
import CenterDiv from "@/modules/common/CenterDiv.tsx"

type SignUpFormValues = {
  email: string
  password: string
  confirmPassword: string
}

const { Title, Text } = Typography

const SignUpPage: FC = () => {
  const {
    user,
    loading: authLoading,
    signUpWithPassword,
    signInWithGoogle,
  } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form] = Form.useForm<SignUpFormValues>()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const redirectPath =
    (location.state as { from?: Location } | undefined)?.from?.pathname
    ?? "/app"

  if (authLoading) {
    return (
      <CenterDiv className="bg-primary">
        <Spin size="large" />
      </CenterDiv>
    )
  }

  if (user) {
    return (
      <Navigate
        to={redirectPath}
        replace
      />
    )
  }

  const handleFinish = async (values: SignUpFormValues) => {
    setSubmitting(true)
    setErrorMessage(null)

    const { email, password } = values
    const error = await signUpWithPassword({ email, password })

    if (error) {
      setErrorMessage(error.message)
    } else {
      message.success(
        "Account created. Check your email to confirm before signing in.",
      )
      form.resetFields()
      navigate("/login", {
        replace: true,
        state: { from: location.state?.from ?? { pathname: "/app" } },
      })
    }

    setSubmitting(false)
  }

  const handleGoogle = async () => {
    setSubmitting(true)
    setErrorMessage(null)
    const error = await signInWithGoogle()
    // On success, Supabase will redirect to Google then back to our app.
    if (error) {
      setErrorMessage(error.message)
      setSubmitting(false)
    }
  }

  return (
    <CenterDiv className="bg-primary">
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <Title
          level={3}
          className="!text-center"
        >
          Create your Vispark account
        </Title>
        <Text className="block text-center mb-6 text-muted-foreground">
          Start exploring AI-powered video insights today
        </Text>

        {errorMessage ? (
          <Alert
            message="Sign up error"
            description={errorMessage}
            type="error"
            showIcon
            className="mb-4"
          />
        ) : null}

        <Form<SignUpFormValues>
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          requiredMark={false}
        >
          <Form.Item<SignUpFormValues>
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

          <Form.Item<SignUpFormValues>
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please enter a password",
              },
              {
                min: 8,
                message: "Password must be at least 8 characters",
              },
            ]}
          >
            <Input.Password
              placeholder="••••••••"
              size="large"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item<SignUpFormValues>
            label="Confirm password"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              {
                required: true,
                message: "Please confirm your password",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(
                    new Error("Passwords do not match. Please try again."),
                  )
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="••••••••"
              size="large"
              autoComplete="new-password"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={submitting}
          >
            Create account
          </Button>
        </Form>

        <Divider plain>or</Divider>

        <Button
          size="large"
          block
          onClick={handleGoogle}
          loading={submitting}
        >
          Continue with Google
        </Button>

        <Text className="block text-center mt-4 text-muted-foreground">
          Already have an account?{" "}
          <Button
            type="link"
            onClick={() =>
              navigate("/login", {
                state: { from: location.state?.from ?? { pathname: "/app" } },
              })
            }
          >
            Log in
          </Button>
        </Text>
      </Card>
    </CenterDiv>
  )
}

export default SignUpPage
