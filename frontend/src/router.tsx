import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import App from './App'
import { MainPage } from './pages/MainPage'
import { AdminPage } from './pages/AdminPage'
import { ModeratorPage } from './pages/ModeratorPage'
import { ensureAccessToken, getTokenPermissions } from './authStorage'

const rootRoute = createRootRoute({
  component: Outlet,
})

const authGuard = async () => {
  const token = await ensureAccessToken()
  if (!token) {
    throw redirect({ to: '/' })
  }
}

const permissionGuard = async (required: string) => {
  await authGuard()
  const perms = getTokenPermissions()
  if (!perms.includes(required)) {
    throw redirect({ to: '/main' })
  }
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
})

const mainRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/main',
  beforeLoad: authGuard,
  component: MainPage,
})

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  beforeLoad: () => permissionGuard('ADMIN_ACCESS'),
  component: AdminPage,
})

const moderatorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/moderator',
  beforeLoad: () => permissionGuard('MODERATOR_ACCESS'),
  component: ModeratorPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  mainRoute,
  adminRoute,
  moderatorRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

