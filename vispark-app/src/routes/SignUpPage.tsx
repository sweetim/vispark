import { GoogleOutlined, StarOutlined } from "@ant-design/icons"
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
import { type FC, useEffect, useState } from "react"
import { type Location, Navigate, useLocation, useNavigate } from "react-router"
import { useAuth } from "@/modules/auth/useAuth.ts"

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
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const redirectPath =
    (location.state as { from?: Location } | undefined)?.from?.pathname
    ?? "/app"

  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white overflow-hidden relative">
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
            style={{
              top: `${10 + scrollY * 0.05}%`,
              left: `${10 - scrollY * 0.02}%`,
            }}
          />
          <div
            className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            style={{
              bottom: `${20 - scrollY * 0.03}%`,
              right: `${15 + scrollY * 0.01}%`,
            }}
          />
        </div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight">
              <StarOutlined className="text-blue-400" />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                VISPARK
              </span>
            </div>
            <Spin size="large" />
          </div>
        </div>
      </div>
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
    <div className="min-h-screen w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white overflow-hidden relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          style={{
            top: `${10 + scrollY * 0.05}%`,
            left: `${10 - scrollY * 0.02}%`,
          }}
        />
        <div
          className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          style={{
            bottom: `${20 - scrollY * 0.03}%`,
            right: `${15 + scrollY * 0.01}%`,
          }}
        />
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md mx-auto">
          {/* Logo and Welcome Section */}
          <div className="text-center space-y-4 mb-6">
            <div className="inline-flex items-center gap-2 text-3xl font-bold tracking-tight">
              <StarOutlined className="text-blue-400" />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                VISPARK
              </span>
            </div>
          </div>

          {/* Glassmorphic Card */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-2xl overflow-hidden">
            <div className="p-2 space-y-6">
              <div className="text-center space-y-2">
                <Title
                  level={3}
                  className="!text-white !mb-0"
                >
                  Create your VISPARK account
                </Title>
                <Text className="text-zinc-400 text-sm">
                  Start exploring AI-powered video insights today
                </Text>
              </div>

              {errorMessage ? (
                <Alert
                  message="Sign up error"
                  description={errorMessage}
                  type="error"
                  showIcon
                  className="bg-red-500/10 border-red-500/20 text-red-300"
                />
              ) : null}

              <Form<SignUpFormValues>
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                requiredMark={false}
              >
                <Form.Item<SignUpFormValues>
                  label={<span className="text-zinc-300">Email</span>}
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
                    className="bg-white/5 border-white/20 text-white placeholder:text-zinc-500 hover:border-white/40 focus:border-blue-400 transition-colors"
                  />
                </Form.Item>

                <Form.Item<SignUpFormValues>
                  label={<span className="text-zinc-300">Password</span>}
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
                    className="bg-white/5 border-white/20 text-white placeholder:text-zinc-500 hover:border-white/40 focus:border-blue-400 transition-colors"
                  />
                </Form.Item>

                <Form.Item<SignUpFormValues>
                  label={
                    <span className="text-zinc-300">Confirm password</span>
                  }
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
                          new Error(
                            "Passwords do not match. Please try again.",
                          ),
                        )
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    placeholder="••••••••"
                    size="large"
                    autoComplete="new-password"
                    className="bg-white/5 border-white/20 text-white placeholder:text-zinc-500 hover:border-white/40 focus:border-blue-400 transition-colors"
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={submitting}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 border-0 h-12 font-medium shadow-lg hover:shadow-xl transition-all duration-200 mt-6"
                >
                  Create account
                </Button>
              </Form>

              <Divider className="!border-zinc-700">
                <span className="text-zinc-500 text-xs">OR</span>
              </Divider>

              <Button
                icon={<GoogleOutlined />}
                size="large"
                block
                onClick={handleGoogle}
                loading={submitting}
                className="bg-white hover:bg-white/90 text-zinc-900 font-medium h-12 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Continue with Google
              </Button>

              <div className="text-center pt-4">
                <span className="text-zinc-400">
                  Already have an account?{" "}
                  <Button
                    type="link"
                    className="!text-blue-400 !p-0 !h-auto hover:!text-blue-300"
                    onClick={() =>
                      navigate("/login", {
                        state: {
                          from: location.state?.from ?? { pathname: "/app" },
                        },
                      })
                    }
                  >
                    Log in
                  </Button>
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
