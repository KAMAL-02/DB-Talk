import { redirect } from "next/navigation"

const page = () => {
  return (
    redirect("/dashboard")
  )
}

export default page
