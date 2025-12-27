import Logo from "@/components/logo";
import AuthForm from "@/components/login/auth-form";

const page = () => {
  return (
    <div className="h-screen w-screen flex">
      <div className="flex-1 bg-gray-100">
        <div className="flex flex-col items-center text-center justify-center h-full">
          <AuthForm />
        </div>
      </div>
      <div className="flex-1 bg-zinc-900 flex items-center justify-center">
        <div className="flex flex-col items-center text-center gap-4 max-w-xl px-6">
          <Logo iconSize={64} textSize="text-5xl" />
          <p className="text-zinc-300 text-lg leading-relaxed">
            No need to run SQL queries, just ask your database
            and get the answers instantly
          </p>
        </div>
      </div>
    </div>
  );
};

export default page;
