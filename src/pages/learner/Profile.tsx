// ts-client/src/pages/learner/Profile.tsx

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useLoadUserQuery,
  useUpdateUserMutation,
} from "@/features/api/authApi";
import { Loader2 } from "lucide-react";
import { useEffect, useState, ChangeEvent } from "react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";

interface ProfileInfoProps {
  label: string;
  value: string | undefined;
}

const Profile = (): JSX.Element => {
  const { data, isLoading, isError } = useLoadUserQuery();
  const [nickname, setNickname] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const [
    updateUser,
    {
      isLoading: updateUserIsLoading,
      isSuccess,
      error: updateError,
      data: updateData,
    },
  ] = useUpdateUserMutation();

  const user = data?.user;

  useEffect(() => {
    if (user) {
      setNickname(user.nickname || user.name || "");
    }
  }, [user]);

  const updateUserHandler = async (): Promise<void> => {
    if (nickname.trim().length < 3) {
      toast.error("Nickname must be at least 3 characters long.");
      return;
    }
    await updateUser({ nickname });
  };

  const handleNicknameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setNickname(e.target.value);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(updateData?.message || "Profile updated successfully.");
      setIsDialogOpen(false);
    }
    if (updateError) {
      toast.error((updateError as any)?.data?.message || "Failed to update profile.");
    }
  }, [isSuccess, updateError, updateData]);

  // Handle loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Handle the case where loading is done, but there's an error or no user data
  if (isError || !user) {
    return (
      <div className="text-center my-20">
        <h1 className="text-xl font-semibold text-red-500">
          Could not load profile.
        </h1>
        <p className="text-gray-500">Please try logging in again.</p>
      </div>
    );
  }

  // The rest of the component will only render if isLoading is false AND we have a valid user object.
  return (
    <div className="max-w-4xl mx-auto px-4 my-10">
      <h1 className="font-bold text-2xl text-center md:text-left">PROFILE</h1>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 my-5">
        <Avatar className="h-24 w-24 md:h-32 md:w-32">
          <AvatarImage
            src={user.photoUrl || "/default-avatar.png"}
            alt={user.name}
          />
          <AvatarFallback>{user.name?.substring(0, 2)}</AvatarFallback>
        </Avatar>

        <div className="flex-grow">
          <ProfileInfo label="Name" value={user.name} />
          <ProfileInfo label="Nickname" value={user.nickname} />
          <ProfileInfo label="Email" value={user.email} />
          <ProfileInfo label="Role" value={user.role?.toUpperCase()} />

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="mt-4">
                Edit Nickname
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Nickname</DialogTitle>
                <DialogDescription>
                  This is your public display name. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nickname" className="text-right">
                    Nickname
                  </Label>
                  <Input
                    id="nickname"
                    value={nickname}
                    onChange={handleNicknameChange}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  disabled={updateUserIsLoading}
                  onClick={updateUserHandler}
                >
                  {updateUserIsLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

const ProfileInfo = ({ label, value }: ProfileInfoProps): JSX.Element => (
  <div className="mb-2">
    <p className="font-semibold text-gray-900 dark:text-gray-100">
      {label}:
      <span className="font-normal text-gray-700 dark:text-gray-300 ml-2">
        {value}
      </span>
    </p>
  </div>
);

export default Profile;