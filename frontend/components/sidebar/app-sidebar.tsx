"use client"

import * as React from "react"
import { FaPlus } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { LuLogOut } from "react-icons/lu";
import Logo from "../logo";
import Link from "next/link";
import { logout } from "@/lib/utils";
import { AddDatabaseModal } from "@/components/sidebar/add-database-modal";
import { DeleteDatabaseModal } from "@/components/sidebar/delete-database-modal";

import { NavMain } from "@/components/sidebar/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { url } from "inspector";
import { set } from "zod";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Add Database",
      url: "#",
      icon: FaPlus,
      action: "add-database"
    },
    {
      title: "Delete Database",
      url: "#",
      icon: FaRegTrashCan,
      action: "delete-database"
    },
  ],
  navFooter: [
    {
      title: "Logout",
      url: "#",
      icon: LuLogOut
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [deleteDatabaseOpen, setDeleteDatabaseOpen] = React.useState(false)
  const [addDatabaseOpen, setAddDatabaseOpen] = React.useState(false)

  const handleNavClick = (action?: string) => {
    if (action === "add-database") {
      setAddDatabaseOpen(true)
    } else if (action === "delete-database") {
      setDeleteDatabaseOpen(true)
    } else {
      setAddDatabaseOpen(false)
      setDeleteDatabaseOpen(false)
    }
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5! mb-1 mx-2 hover:bg-zinc-900"
            >
              <Link href="/">
                <Logo textSize="text-xl" iconSize={32} />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} onItemClick={handleNavClick} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {data.navFooter.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                onClick={logout}
                className="mb-1 mx-2 hover:bg-zinc-900 text-md cursor-pointer"
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
      <DeleteDatabaseModal open={deleteDatabaseOpen} onOpenChange={setDeleteDatabaseOpen} />
        </SidebarMenu>
      </SidebarFooter>
      <AddDatabaseModal open={addDatabaseOpen} onOpenChange={setAddDatabaseOpen} />
    </Sidebar>
  )
}
