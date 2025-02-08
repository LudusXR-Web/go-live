import { notFound } from "next/navigation";
import { UserPenIcon } from "lucide-react";

import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import PersonalDetailsForm from "~/components/forms/PersonalDetailsForm";

const ProfilePage = async () => {
  const session = await auth();

  if (!session) {
    return notFound();
  }

  const personalDetails = await api.users.getPersonalDetailsById(
    session.user.id,
  );

  return (
    <main className="flex h-full w-full divide-x-2 divide-accent/55 overflow-y-hidden px-14!">
      <div className="flex-1 pl-20 pr-6">
        <div className="relative flex cursor-default select-none items-center gap-4 rounded-sm border-b bg-slate-200/50 px-2 py-1.5 text-sm outline-hidden data-disabled:pointer-events-none data-disabled:opacity-50">
          <UserPenIcon className="opacity-50" size={20} />
          <span>Personal Details</span>
        </div>
      </div>
      <div className="relative flex-3 pb-16 pl-6 pr-20">
        <PersonalDetailsForm
          serverSession={session}
          userDetails={personalDetails}
        />
      </div>
    </main>
  );
};

export default ProfilePage;
