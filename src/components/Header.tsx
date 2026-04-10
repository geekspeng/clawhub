import { useAuthActions } from "@convex-dev/auth/react";
import { Link } from "@tanstack/react-router";
import { Menu, Monitor, Moon, Sun } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getUserFacingConvexError } from "../lib/convexError";
import { gravatarUrl } from "../lib/gravatar";
import { isModerator } from "../lib/roles";
import { getClawHubSiteUrl, getSiteMode, getSiteName } from "../lib/site";
import { applyTheme, useThemeMode } from "../lib/theme";
import { startThemeTransition } from "../lib/theme-transition";
import { setAuthError, useAuthError } from "../lib/useAuthError";
import { useAuthStatus } from "../lib/useAuthStatus";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

export default function Header() {
  const { isAuthenticated, isLoading, me } = useAuthStatus();
  const { signIn, signOut } = useAuthActions();
  const { mode, setMode } = useThemeMode();
  const toggleRef = useRef<HTMLDivElement | null>(null);
  const siteMode = getSiteMode();
  const siteName = useMemo(() => getSiteName(siteMode), [siteMode]);
  const isSoulMode = siteMode === "souls";
  const clawHubUrl = getClawHubSiteUrl();

  // 密码登录状态
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [passwordCredentials, setPasswordCredentials] = useState({ email: "", password: "" });

  const avatar = me?.image ?? (me?.email ? gravatarUrl(me.email) : undefined);
  const handle = me?.handle ?? me?.displayName ?? "user";
  const initial = (me?.displayName ?? me?.name ?? handle).charAt(0).toUpperCase();
  const isStaff = isModerator(me);
  const { error: authError, clear: clearAuthError } = useAuthError();
  const signInRedirectTo = getCurrentRelativeUrl();

  const setTheme = (next: "system" | "light" | "dark") => {
    startThemeTransition({
      nextTheme: next,
      currentTheme: mode,
      setTheme: (value) => {
        const nextMode = value as "system" | "light" | "dark";
        applyTheme(nextMode);
        setMode(nextMode);
      },
      context: { element: toggleRef.current },
    });
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link
          to="/"
          search={{ q: undefined, highlighted: undefined, search: undefined }}
          className="brand"
        >
          <span className="brand-mark">
            <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden="true" fill="white">
              <circle cx="8" cy="8" r="8" fill="#2563EB" />
              <path
                d="M8 4C6.343 4 5 5.343 5 7C5 8.657 6.343 10 8 10C9.657 10 11 8.657 11 7C11 5.343 9.657 4 8 4ZM4 7C4 4.791 5.791 3 8 3C10.209 3 12 4.791 12 7C12 9.209 10.209 11 8 11C5.791 11 4 9.209 4 7ZM3 13H13C13 11.343 10.761 10 8 10C5.239 10 3 11.343 3 13Z"
                fill="white"
              />
            </svg>
          </span>
          <span className="brand-name">{siteName}</span>
        </Link>
        <nav className="nav-links">
          {isSoulMode ? <a href={clawHubUrl}>ClawHub</a> : null}
          {isSoulMode ? (
            <Link
              to="/souls"
              search={{
                q: undefined,
                sort: undefined,
                dir: undefined,
                view: undefined,
                focus: undefined,
              }}
            >
              Souls
            </Link>
          ) : (
            <Link
              to="/skills"
              search={{
                q: undefined,
                sort: undefined,
                dir: undefined,
                highlighted: undefined,
                nonSuspicious: undefined,
                view: undefined,
                focus: undefined,
              }}
            >
              Skills
            </Link>
          )}
          {isSoulMode ? null : <Link to="/plugins">Plugins</Link>}
          <Link
            to={isSoulMode ? "/souls" : "/skills"}
            search={
              isSoulMode
                ? {
                    q: undefined,
                    sort: undefined,
                    dir: undefined,
                    view: undefined,
                    focus: "search",
                  }
                : {
                    q: undefined,
                    sort: undefined,
                    dir: undefined,
                    highlighted: undefined,
                    nonSuspicious: undefined,
                    view: undefined,
                    focus: "search",
                  }
            }
          >
            Search
          </Link>
          {isSoulMode ? null : <Link to="/about">About</Link>}
          {me ? <Link to="/stars">Stars</Link> : null}
          {isStaff ? (
            <Link to="/management" search={{ skill: undefined }}>
              Management
            </Link>
          ) : null}
        </nav>
        <div className="nav-actions">
          <div className="nav-mobile">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="nav-mobile-trigger" type="button" aria-label="Open menu">
                  <Menu className="h-4 w-4" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isSoulMode ? (
                  <DropdownMenuItem asChild>
                    <a href={clawHubUrl}>ClawHub</a>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem asChild>
                  {isSoulMode ? (
                    <Link
                      to="/souls"
                      search={{
                        q: undefined,
                        sort: undefined,
                        dir: undefined,
                        view: undefined,
                        focus: undefined,
                      }}
                    >
                      Souls
                    </Link>
                  ) : (
                    <Link
                      to="/skills"
                      search={{
                        q: undefined,
                        sort: undefined,
                        dir: undefined,
                        highlighted: undefined,
                        nonSuspicious: undefined,
                        view: undefined,
                        focus: undefined,
                      }}
                    >
                      Skills
                    </Link>
                  )}
                </DropdownMenuItem>
                {isSoulMode ? null : (
                  <DropdownMenuItem asChild>
                    <Link to="/plugins">Plugins</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link
                    to={isSoulMode ? "/souls" : "/skills"}
                    search={
                      isSoulMode
                        ? {
                            q: undefined,
                            sort: undefined,
                            dir: undefined,
                            view: undefined,
                            focus: "search",
                          }
                        : {
                            q: undefined,
                            sort: undefined,
                            dir: undefined,
                            highlighted: undefined,
                            nonSuspicious: undefined,
                            view: undefined,
                            focus: "search",
                          }
                    }
                  >
                    Search
                  </Link>
                </DropdownMenuItem>
                {isSoulMode ? null : (
                  <DropdownMenuItem asChild>
                    <Link to="/about">About</Link>
                  </DropdownMenuItem>
                )}
                {me ? (
                  <DropdownMenuItem asChild>
                    <Link to="/stars">Stars</Link>
                  </DropdownMenuItem>
                ) : null}
                {isStaff ? (
                  <DropdownMenuItem asChild>
                    <Link to="/management" search={{ skill: undefined }}>
                      Management
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="h-4 w-4" aria-hidden="true" />
                  System
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="h-4 w-4" aria-hidden="true" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="h-4 w-4" aria-hidden="true" />
                  Dark
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="theme-toggle" ref={toggleRef}>
            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={(value) => {
                if (!value) return;
                setTheme(value as "system" | "light" | "dark");
              }}
              aria-label="Theme mode"
            >
              <ToggleGroupItem value="system" aria-label="System theme">
                <Monitor className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">System</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="light" aria-label="Light theme">
                <Sun className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Light</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="dark" aria-label="Dark theme">
                <Moon className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Dark</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          {isAuthenticated && me ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="user-trigger" type="button">
                  {avatar ? (
                    <img src={avatar} alt={me.displayName ?? me.name ?? "User avatar"} />
                  ) : (
                    <span className="user-menu-fallback">{initial}</span>
                  )}
                  <span className="mono">@{handle}</span>
                  <span className="user-menu-chevron">▾</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void signOut().then(() => {
                      window.location.href = "/";
                    })}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              {authError ? (
                <div className="error" role="alert" style={{ fontSize: "0.85rem", marginRight: 8 }}>
                  {authError}{" "}
                  <button
                    type="button"
                    onClick={clearAuthError}
                    aria-label="Dismiss"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "inherit",
                      padding: "0 2px",
                    }}
                  >
                    &times;
                  </button>
                </div>
              ) : null}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {!showPasswordForm ? (
                  <>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        setShowPasswordForm(true);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
                        <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 1 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
                      </svg>
                      <span>Sign In / Register</span>
                    </button>
                  </>
                ) : (
                  createPortal(
                    <>
                      {/* 遮罩层 */}
                      <div
                        style={{
                          position: "fixed",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: "rgba(0, 0, 0, 0.5)",
                          zIndex: 99999,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "16px",
                          animation: "fadeIn 0.2s ease-out",
                        }}
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordCredentials({ email: "", password: "" });
                          setIsSignUp(false);
                        }}
                      >
                      <style>{`
                        @keyframes fadeIn {
                          from { opacity: 0; }
                          to { opacity: 1; }
                        }
                        @keyframes slideUp {
                          from {
                            opacity: 0;
                            transform: translateY(20px) scale(0.95);
                          }
                          to {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                          }
                        }
                        .auth-modal {
                          animation: slideUp 0.3s ease-out;
                        }
                        .auth-input:-webkit-autofill,
                        .auth-input:-webkit-autofill:hover,
                        .auth-input:-webkit-autofill:focus {
                          -webkit-text-fill-color: var(--ink);
                          transition: background-color 5000s ease-in-out 0s;
                        }
                      `}</style>
                      {/* 表单弹窗 */}
                      <div
                        className="auth-modal"
                        style={{
                          position: "relative",
                          background: "var(--surface)",
                          borderRadius: "16px",
                          padding: "32px",
                          width: "100%",
                          maxWidth: "440px",
                          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                          maxHeight: "90vh",
                          overflowY: "auto",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* 关闭按钮 */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordCredentials({ email: "", password: "" });
                            setIsSignUp(false);
                          }}
                          style={{
                            position: "absolute",
                            top: "16px",
                            right: "16px",
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            background: "var(--surface-muted)",
                            border: "1px solid var(--border-ui)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--ink-soft)",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--border-ui)";
                            e.currentTarget.style.borderColor = "var(--border-ui-hover)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "var(--surface-muted)";
                            e.currentTarget.style.borderColor = "var(--border-ui)";
                          }}
                          aria-label="关闭"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>

                        {/* 标题 */}
                        <div style={{ marginBottom: "28px", textAlign: "center", paddingRight: "32px" }}>
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "64px",
                              height: "64px",
                              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)",
                              borderRadius: "16px",
                              marginBottom: "20px",
                              boxShadow: "0 4px 14px 0 rgba(37, 99, 235, 0.39)",
                            }}
                          >
                            <svg
                              width="32"
                              height="32"
                              viewBox="0 0 16 16"
                              fill="white"
                              style={{ display: "block" }}
                            >
                              <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 1 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
                            </svg>
                          </div>
                          <h2
                            style={{
                              margin: 0,
                              fontSize: "26px",
                              fontWeight: 700,
                              color: "var(--ink)",
                              marginBottom: "8px",
                              fontFamily: "var(--font-display)",
                            }}
                          >
                            {isSignUp ? "创建账户" : "欢迎回来"}
                          </h2>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "15px",
                              color: "var(--ink-soft)",
                              fontFamily: "var(--font-body)",
                            }}
                          >
                            {isSignUp ? "输入邮箱和密码创建新账户" : "使用邮箱和密码登录您的账户"}
                          </p>
                        </div>

                        {/* 表单 */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            clearAuthError();
                            void signIn("password", {
                              email: passwordCredentials.email,
                              password: passwordCredentials.password,
                              flow: isSignUp ? "signUp" : "signIn",
                              redirectTo: signInRedirectTo,
                            })
                              .then(() => {
                                // 登录成功后关闭弹窗并清除凭据
                                setShowPasswordForm(false);
                                setPasswordCredentials({ email: "", password: "" });
                                setIsSignUp(false);
                              })
                              .catch((error) => {
                                setAuthError(
                                  getUserFacingConvexError(
                                    error,
                                    isSignUp ? "注册失败，请稍后再试。" : "登录失败，请检查邮箱和密码。",
                                  ),
                                );
                              });
                          }}
                          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
                        >
                          {/* 邮箱输入框 */}
                          <div>
                            <label
                              htmlFor="email"
                              style={{
                                display: "block",
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "var(--ink)",
                                marginBottom: "8px",
                                fontFamily: "var(--font-body)",
                              }}
                            >
                              邮箱地址
                            </label>
                            <div style={{ position: "relative" }}>
                              <div
                                style={{
                                  position: "absolute",
                                  left: "14px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: "var(--ink-soft)",
                                  pointerEvents: "none",
                                  zIndex: 1,
                                }}
                              >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                  <polyline points="22,6 12,13 2,6" />
                                </svg>
                              </div>
                              <input
                                id="email"
                                className="auth-input"
                                type="email"
                                autoComplete="email"
                                placeholder="your@email.com"
                                value={passwordCredentials.email}
                                onChange={(e) =>
                                  setPasswordCredentials((prev) => ({ ...prev, email: e.target.value }))
                                }
                                required
                                style={{
                                  width: "100%",
                                  padding: "12px 14px 12px 44px",
                                  border: "1.5px solid var(--border-ui)",
                                  borderRadius: "10px",
                                  fontSize: "15px",
                                  outline: "none",
                                  transition: "all 0.2s",
                                  fontFamily: "var(--font-body)",
                                  background: "var(--surface)",
                                  color: "var(--ink)",
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = "var(--border-ui-active)";
                                  e.target.style.boxShadow = "0 0 0 4px rgba(37, 99, 235, 0.1)";
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = "var(--border-ui)";
                                  e.target.style.boxShadow = "none";
                                }}
                              />
                            </div>
                          </div>

                          {/* 密码输入框 */}
                          <div>
                            <label
                              htmlFor="password"
                              style={{
                                display: "block",
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "var(--ink)",
                                marginBottom: "8px",
                                fontFamily: "var(--font-body)",
                              }}
                            >
                              密码
                            </label>
                            <div style={{ position: "relative" }}>
                              <div
                                style={{
                                  position: "absolute",
                                  left: "14px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: "var(--ink-soft)",
                                  pointerEvents: "none",
                                  zIndex: 1,
                                }}
                              >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                              </div>
                              <input
                                id="password"
                                className="auth-input"
                                type="password"
                                autoComplete={isSignUp ? "new-password" : "current-password"}
                                placeholder={isSignUp ? "至少8个字符" : "输入密码"}
                                value={passwordCredentials.password}
                                onChange={(e) =>
                                  setPasswordCredentials((prev) => ({ ...prev, password: e.target.value }))
                                }
                                required
                                minLength={8}
                                style={{
                                  width: "100%",
                                  padding: "12px 14px 12px 44px",
                                  border: "1.5px solid var(--border-ui)",
                                  borderRadius: "10px",
                                  fontSize: "15px",
                                  outline: "none",
                                  transition: "all 0.2s",
                                  fontFamily: "var(--font-body)",
                                  background: "var(--surface)",
                                  color: "var(--ink)",
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = "var(--border-ui-active)";
                                  e.target.style.boxShadow = "0 0 0 4px rgba(37, 99, 235, 0.1)";
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = "var(--border-ui)";
                                  e.target.style.boxShadow = "none";
                                }}
                              />
                              {/* 密码强度指示器 */}
                              {isSignUp && passwordCredentials.password.length > 0 && (
                                <div
                                  style={{
                                    position: "absolute",
                                    right: "14px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    fontSize: "12px",
                                    fontWeight: 500,
                                    color:
                                      passwordCredentials.password.length < 8
                                        ? "var(--accent)"
                                        : passwordCredentials.password.length < 12
                                        ? "#f59e0b"
                                        : "#10b981",
                                  }}
                                >
                                  {passwordCredentials.password.length < 8
                                    ? "太短"
                                    : passwordCredentials.password.length < 12
                                    ? "中等"
                                    : "强"}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 提交按钮 */}
                          <button
                            className="btn btn-primary"
                            type="submit"
                            disabled={isLoading || !passwordCredentials.email || !passwordCredentials.password}
                            style={{
                              width: "100%",
                              padding: "14px",
                              background:
                                isLoading || !passwordCredentials.email || !passwordCredentials.password
                                  ? "var(--ink-soft)"
                                  : "linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)",
                              border: "none",
                              borderRadius: "10px",
                              fontSize: "16px",
                              fontWeight: 600,
                              color: "white",
                              cursor:
                                isLoading || !passwordCredentials.email || !passwordCredentials.password
                                  ? "not-allowed"
                                  : "pointer",
                              marginTop: "8px",
                              transition: "all 0.2s",
                              fontFamily: "var(--font-body)",
                              boxShadow: "0 4px 14px 0 rgba(37, 99, 235, 0.39)",
                            }}
                            onMouseEnter={(e) => {
                              if (!isLoading && passwordCredentials.email && passwordCredentials.password) {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 6px 20px 0 rgba(37, 99, 235, 0.5)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "0 4px 14px 0 rgba(37, 99, 235, 0.39)";
                            }}
                          >
                            {isLoading ? (
                              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  style={{ animation: "spin 1s linear infinite" }}
                                >
                                  <style>{`
                                    @keyframes spin {
                                      from { transform: rotate(0deg); }
                                      to { transform: rotate(360deg); }
                                    }
                                  `}</style>
                                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                                处理中...
                              </span>
                            ) : isSignUp ? (
                              "创建账户"
                            ) : (
                              "登录"
                            )}
                          </button>

                          {/* 切换注册/登录 */}
                          <div
                            style={{
                              textAlign: "center",
                              fontSize: "15px",
                              color: "var(--ink-soft)",
                              paddingTop: "4px",
                              fontFamily: "var(--font-body)",
                            }}
                          >
                            {isSignUp ? "已有账户？ " : "没有账户？ "}
                            <button
                              type="button"
                              onClick={() => setIsSignUp(!isSignUp)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "var(--accent)",
                                fontSize: "15px",
                                fontWeight: 600,
                                cursor: "pointer",
                                textDecoration: "none",
                                padding: "0 4px",
                                fontFamily: "var(--font-body)",
                                transition: "color 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = "var(--accent-deep)";
                                e.currentTarget.style.textDecoration = "underline";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = "var(--accent)";
                                e.currentTarget.style.textDecoration = "none";
                              }}
                            >
                              {isSignUp ? "去登录" : "去注册"}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                    </>,
                    document.body,
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function getCurrentRelativeUrl() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}
