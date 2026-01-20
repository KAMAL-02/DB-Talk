import { redirect } from "next/navigation"

const page = () => {
  console.log("Redirecting to /dashboard");
  return (
    redirect("/dashboard")
  )
}

export default page
