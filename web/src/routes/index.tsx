import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const SignupPage = lazy(() => import('@/pages/SignupPage'))
const ChatListPage = lazy(() => import('@/pages/ChatListPage'))
const ChatRoomPage = lazy(() => import('@/pages/ChatRoomPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'))
const FriendsPage = lazy(() => import('@/pages/FriendsPage'))
const GroupCreatePage = lazy(() => import('@/pages/GroupCreatePage'))
const ChatInfoPage = lazy(() => import('@/pages/ChatInfoPage'))

function Lazy({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      {children}
    </Suspense>
  )
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Lazy><LoginPage /></Lazy>,
  },
  {
    path: '/login',
    element: <Lazy><LoginPage /></Lazy>,
  },
  {
    path: '/signup',
    element: <Lazy><SignupPage /></Lazy>,
  },
  {
    path: '/chat',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Lazy><ChatListPage /></Lazy>,
      },
      {
        path: ':id',
        element: <Lazy><ChatRoomPage /></Lazy>,
      },
      {
        path: ':id/info',
        element: <Lazy><ChatInfoPage /></Lazy>,
      },
    ],
  },
  {
    path: '/friends',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Lazy><FriendsPage /></Lazy>,
      },
    ],
  },
  {
    path: '/groups/create',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Lazy><GroupCreatePage /></Lazy>,
      },
    ],
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Lazy><ProfilePage /></Lazy>,
      },
    ],
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Lazy><SettingsPage /></Lazy>,
      },
    ],
  },
  {
    path: '/notifications',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Lazy><NotificationsPage /></Lazy>,
      },
    ],
  },
]
