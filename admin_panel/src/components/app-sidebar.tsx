import * as React from "react"
import { Link } from "react-router-dom"
import {
  IconChartBar,
  IconDashboard,
  IconInnerShadowTop,
  IconReport,
  IconSettings,
  IconUsers,
  IconPackage,
  IconShoppingCart,
  IconMessageCircle,
  IconActivity,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "OneTee Admin",
    email: "info@onetee.in",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Products",
      url: "/admin/products",
      icon: IconPackage,
    },
    {
      title: "Orders",
      url: "/admin/orders",
      icon: IconShoppingCart,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: IconUsers,
    },
    {
      title: "Community",
      url: "/admin/community",
      icon: IconMessageCircle,
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: IconChartBar,
    },
  ],
  navClouds: [
    {
      title: "Product Management",
      icon: IconPackage,
      isActive: true,
      url: "/admin/products",
      items: [
        {
          title: "All Products",
          url: "/admin/products",
        },
        {
          title: "Add Product",
          url: "/admin/products/new",
        },
      ],
    },
    {
      title: "Order Management",
      icon: IconShoppingCart,
      url: "/admin/orders",
      items: [
        {
          title: "All Orders",
          url: "/admin/orders",
        },
        {
          title: "Pending Orders",
          url: "/admin/orders?status=pending",
        },
      ],
    },
    {
      title: "Community",
      icon: IconMessageCircle,
      url: "/admin/community",
      items: [
        {
          title: "All Threads",
          url: "/admin/community",
        },
        {
          title: "Community Stats",
          url: "/admin/community",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: IconSettings,
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: IconReport,
    },
    {
      title: "Activity",
      url: "/admin/analytics",
      icon: IconActivity,
    },
  ],
  documents: [
    {
      name: "Analytics",
      url: "/admin/analytics",
      icon: IconChartBar,
    },
    {
      name: "Reports",
      url: "/admin/reports",
      icon: IconReport,
    },
    {
      name: "User Management",
      url: "/admin/users",
      icon: IconUsers,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/admin/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">OneTee Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

