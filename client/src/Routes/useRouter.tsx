/* eslint-disable react-refresh/only-export-components */
import { Suspense } from "react";
import { Navigate, Outlet, useLocation, useRoutes, useSearchParams } from "react-router-dom";
import PersonalIdentification from "../pages/PersonalIdentification/PersonalIdentification";
import { useAppStore } from "../store/store";
import Login from "../pages/Login/Login";
import MainLayout from "../layouts/MainLayout";
import DataList from "../pages/DataList/DataList";
import Dashboard from "../pages/Dashboard/Dashboard";
import AccountList from "../pages/Demo/Demo";

const ProjectRouter = () => {
  const isLogin = useAppStore((state) => state.isLogin);

  const { pathname } = useLocation();

  return isLogin ? <Outlet /> : <Navigate to={`/login?redirect_url=${encodeURIComponent(pathname)}`} />;
};

const RejectRouter = () => {
  const isLogin = useAppStore((state) => state.isLogin);
  const [searchParams] = useSearchParams();
  if (!isLogin) {
    return <Outlet />;
  }
  const navigate = searchParams.get("redirect_url") || "/";
  return <Navigate to={navigate} />;
};

export default function useRouter() {
  const routerElement = useRoutes([
    {
      path: "",
      element: <ProjectRouter />,
      children: [
        {
          path: "",
          element: <MainLayout />,
          children: [
            {
              index: true,
              element: (
                <Suspense>
                  <Dashboard />
                </Suspense>
              ),
            },
            {
              path: "/",
              element: (
                <Suspense>
                  <Dashboard />
                </Suspense>
              ),
            },
            {
              path: "/personal-identification",
              element: (
                <Suspense>
                  <PersonalIdentification />
                </Suspense>
              ),
            },
            {
              path: "/data",
              element: (
                <Suspense>
                  <DataList />
                </Suspense>
              ),
            },
            {
              path: "/demo",
              element: (
                <Suspense>
                  <AccountList />
                </Suspense>
              ),
            },
          ],
        },
      ],
    },
    {
      path: "/login",
      element: <RejectRouter />,
      children: [
        {
          index: true,
          element: (
            <Suspense>
              <Login />
            </Suspense>
          ),
        },
      ],
    },
  ]);
  return routerElement;
}

/**
 * Suspense là một công cụ quan trọng để cải thiện trải nghiệm khi sử dụng lazy loading trong React,
 * giúp quản lý giao diện chờ trong khi các thành phần lớn hoặc không thường xuyên được sử dụng đang tải.
 */
