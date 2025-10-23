import {
  EyeInvisibleOutlined,
  EyeOutlined,
  GoogleOutlined,
} from "@ant-design/icons"
import { Alert, Button, Card, Checkbox, Divider, Form, Input, Spin } from "antd"
import { type FC, useState } from "react"
import { type Location, Navigate, useLocation, useNavigate } from "react-router"
import { useAuth } from "@/modules/auth/useAuth.ts"

type LoginFormValues = {
  email: string
  password: string
  remember: boolean
}

const LoginPage: FC = () => {
  const {
    user,
    loading: authLoading,
    signInWithPassword,
    signInWithGoogle,
  } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form] = Form.useForm<LoginFormValues>()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const scrollY = 0

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
            <div className="flex items-center justify-center gap-4">
              <img
                src="/logo.png"
                alt="VISPARK Logo"
                className="w-16 h-16 object-contain bg-white rounded-full"
              />
              <span className="text-2xl font-bold tracking-tight bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
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

  const handleFinish = async (values: LoginFormValues) => {
    setSubmitting(true)
    setErrorMessage(null)

    const error = await signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      setErrorMessage(error.message)
    } else {
      form.resetFields()
      navigate(redirectPath, { replace: true })
    }

    setSubmitting(false)
  }

  const handleGoogleSignIn = async () => {
    setSubmitting(true)
    setErrorMessage(null)

    const error = await signInWithGoogle()

    if (error) {
      setErrorMessage(error.message)
      setSubmitting(false)
    }
    // Note: Google OAuth will redirect, so we don't need to navigate here
  }

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

      <div className="flex items-center justify-center min-h-screen  p-4">
        <div className="w-full max-w-md mx-auto">
          {/* Logo and Welcome Section */}
          <div className="text-center space-y-4 mb-6">
            <div className="flex items-center justify-center gap-4">
              <img
                src="/logo.png"
                alt="VISPARK Logo"
                className="w-16 h-16 object-contain bg-white rounded-full"
              />
              <span className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                VISPARK
              </span>
            </div>
          </div>

          {/* Glassmorphic Card */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-2xl overflow-hidden">
            <div className="p-2 space-y-6">
              {/* Google Sign-In Button */}
              <Button
                icon={<GoogleOutlined />}
                size="large"
                block
                className="bg-white hover:bg-white/90 text-zinc-900 font-medium h-12 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={handleGoogleSignIn}
                loading={submitting}
              >
                Continue with Google
              </Button>

              <Divider className="!border-zinc-700">
                <span className="text-zinc-500 text-xs">OR</span>
              </Divider>

              {errorMessage ? (
                <Alert
                  message="Authentication error"
                  description={errorMessage}
                  type="error"
                  showIcon
                  className="mb-4 bg-red-500/10 border-red-500/20 text-red-300"
                />
              ) : null}

              <Form<LoginFormValues>
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                requiredMark={false}
                initialValues={{ remember: true }}
              >
                <Form.Item<LoginFormValues>
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

                <Form.Item<LoginFormValues>
                  label={<span className="text-zinc-300">Password</span>}
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
                    iconRender={(visible) =>
                      visible ? (
                        <EyeOutlined className="text-zinc-400" />
                      ) : (
                        <EyeInvisibleOutlined className="text-zinc-400" />
                      )
                    }
                    className="bg-white/5 border-white/20 text-white placeholder:text-zinc-500 hover:border-white/40 focus:border-blue-400 transition-colors"
                  />
                </Form.Item>

                <div className="flex items-center justify-between">
                  <Form.Item
                    name="remember"
                    valuePropName="checked"
                    className="!mb-0"
                  >
                    <Checkbox className="text-zinc-300">Remember me</Checkbox>
                  </Form.Item>
                  <Button
                    type="link"
                    className="!text-blue-400 !p-0 !h-auto hover:!text-blue-300"
                  >
                    Forgot password?
                  </Button>
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={submitting}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 border-0 h-12 font-medium shadow-lg hover:shadow-xl transition-all duration-200 mt-6"
                >
                  Sign In
                </Button>
              </Form>

              <div className="text-center pt-4">
                <span className="text-zinc-400">
                  New to VISPARK?{" "}
                  <Button
                    type="link"
                    className="!text-blue-400 !p-0 !h-auto hover:!text-blue-300"
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
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
