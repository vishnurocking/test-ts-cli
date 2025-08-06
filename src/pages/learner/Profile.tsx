// ts-client/src/pages/learner/Profile.tsx
// Fixed Profile component with corrected imports

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
import { useAppSelector } from "@/app/hooks"; // Now this import will work
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { useEffect, useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";

interface ProfileInfoProps {
  label: string;
  value: string | undefined;
}

const Profile = (): JSX.Element => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // Get auth state from Redux
  const authState = useAppSelector((state) => state.auth);
  const { isAuthenticated, user: reduxUser } = authState;

  // Load user profile from API
  const { data, isLoading, isError, error, refetch, isFetching } =
    useLoadUserQuery(undefined, {
      skip: !isAuthenticated, // Skip query if not authenticated
    });

  const [
    updateUser,
    {
      isLoading: updateUserIsLoading,
      isSuccess,
      error: updateError,
      data: updateData,
    },
  ] = useUpdateUserMutation();

  // Use API data first, fallback to Redux state
  const user = data?.user || reduxUser;

  // Debug logging
  useEffect(() => {
    console.log("Profile Debug Info:");
    console.log("- isAuthenticated:", isAuthenticated);
    console.log("- Redux user:", reduxUser);
    console.log("- API loading:", isLoading);
    console.log("- API error:", error);
    console.log("- API data:", data);
    console.log("- Final user:", user);
  }, [isAuthenticated, reduxUser, isLoading, error, data, user]);

  // Set nickname when user data is available
  useEffect(() => {
    if (user) {
      setNickname(user.nickname || user.name || "");
    }
  }, [user]);

  // Handle update success/error
  useEffect(() => {
    if (isSuccess) {
      toast.success(updateData?.message || "Profile updated successfully.");
      setIsDialogOpen(false);
    }
    if (updateError) {
      toast.error(
        (updateError as any)?.data?.message || "Failed to update profile."
      );
    }
  }, [isSuccess, updateError, updateData]);

  // Handle profile update
  const updateUserHandler = async (): Promise<void> => {
    if (nickname.trim().length < 3) {
      toast.error("Nickname must be at least 3 characters long.");
      return;
    }
    await updateUser({ nickname });
  };

  // Handle nickname change
  const handleNicknameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setNickname(e.target.value);
  };

  // Handle retry
  const handleRetry = (): void => {
    console.log("🔄 Retrying profile load...");
    refetch();
  };

  // Handle login redirect
  const handleLoginRedirect = (): void => {
    toast.info("Please log in to view your profile");
    navigate("/login");
  };

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return (
      <div className="text-center my-20">
        <AlertCircle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
        <h1 className="text-xl font-semibold text-orange-600 mb-2">
          Authentication Required
        </h1>
        <p className="text-gray-500 mb-4">
          Please log in to view your profile.
        </p>
        <Button onClick={handleLoginRedirect}>Go to Login</Button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Error state with retry option
  if (isError && !user) {
    return (
      <div className="text-center my-20">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-xl font-semibold text-red-600 mb-2">
          Could not load profile
        </h1>
        <p className="text-gray-500 mb-4">
          {(error as any)?.data?.message || "Failed to fetch profile data."}
        </p>
        <div className="space-x-2">
          <Button onClick={handleRetry} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button onClick={handleLoginRedirect}>Login Again</Button>
        </div>
      </div>
    );
  }

  // No user data available
  if (!user) {
    return (
      <div className="text-center my-20">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h1 className="text-xl font-semibold text-yellow-600 mb-2">
          Profile data unavailable
        </h1>
        <p className="text-gray-500 mb-4">
          Your profile information could not be loaded.
        </p>
        <div className="space-x-2">
          <Button onClick={handleRetry} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleLoginRedirect}>Login Again</Button>
        </div>
      </div>
    );
  }

  // Render profile content
  return (
    <div className="max-w-4xl mx-auto px-4 my-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-2xl text-center md:text-left">PROFILE</h1>
        {isFetching && (
          <div className="flex items-center text-sm text-gray-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Refreshing...
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 my-5">
        <Avatar className="h-24 w-24 md:h-32 md:w-32">
          <AvatarImage
            src={user.photoUrl || "/default-avatar.png"}
            alt={user.name}
          />
          <AvatarFallback className="text-lg">
            {user.name?.substring(0, 2).toUpperCase() || "UN"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-grow">
          <ProfileInfo label="Name" value={user.name} />
          <ProfileInfo label="Nickname" value={user.nickname} />
          <ProfileInfo label="Email" value={user.email} />
          <ProfileInfo label="Role" value={user.role?.toUpperCase()} />
          {user.points !== undefined && (
            <ProfileInfo label="Points" value={user.points.toString()} />
          )}
          {user.level !== undefined && (
            <ProfileInfo label="Level" value={user.level.toString()} />
          )}
          {user.streak !== undefined && (
            <ProfileInfo label="Streak" value={`${user.streak} days`} />
          )}

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
                    placeholder="Enter nickname (min 3 characters)"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={updateUserIsLoading}
                >
                  Cancel
                </Button>
                <Button
                  disabled={updateUserIsLoading || nickname.trim().length < 3}
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
        {value || "Not set"}
      </span>
    </p>
  </div>
);

export default Profile;
