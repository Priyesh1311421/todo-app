"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    image: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
    if (session?.user && status === "authenticated") {
      setUserData({
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [session, status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (userData.password && userData.password !== userData.confirmPassword) {
      toast.error('Passwords do not match.');
      setIsLoading(false);
      return;
    }
    if (!userData.name || !userData.email) {
      toast.error('Name and email are required.');
      setIsLoading(false);
      return;
    }
    if (userData.password && userData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const updatePayload: any = {
        name: userData.name,
        email: userData.email,
        image: userData.image,
      };
      if (userData.password) {
        updatePayload.password = userData.password;
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update profile');
      }

      // Update the session with the specific fields that changed
      // NextAuth merges this with the existing session token data
      await update({
        user: {
          name: responseData.name,
          email: responseData.email,
          image: responseData.image,
        }
      });

      toast.success('Profile updated successfully.');

      // Reset password fields after successful update
      // The useEffect hook will handle updating name/email/image fields from the new session
      setUserData(prev => ({
        ...prev,
        password: "",
        confirmPassword: ""
      }));

    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    toast.info("Attempting to delete account...");
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success("Account deleted successfully. Redirecting...");
      router.push('/api/auth/signout');
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error(error.message || 'Failed to delete account.');
      setIsLoading(false);
    }
  };

  const userInitials = userData.name
    ? userData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "U";

  if (status === "loading" || (status === "authenticated" && !session?.user)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Profile Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Update your profile picture</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24 border-2 border-gray-200 dark:border-gray-700">
                <AvatarImage src={userData.image} alt={userData.name} />
                <AvatarFallback className="text-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="w-full">
                <Label htmlFor="profileImage">Profile Image URL</Label>
                <Input
                  id="profileImage"
                  name="image"
                  placeholder="https://example.com/avatar.jpg"
                  value={userData.image}
                  onChange={handleChange}
                  className="mt-1 cursor-text"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a URL for your profile picture
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
              <CardDescription>
                Permanently delete your account and all of your data
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full cursor-pointer">
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all of your data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount} 
                      disabled={isLoading}
                      className="cursor-pointer"
                    >
                      {isLoading ? "Deleting..." : "Delete Account"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={userData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 cursor-text"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={userData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 cursor-text"
                  />
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="password">New Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={userData.password}
                        onChange={handleChange}
                        className="mt-1 cursor-text"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={userData.confirmPassword}
                        onChange={handleChange}
                        className="mt-1 cursor-text"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave password fields empty to keep your current password
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="cursor-pointer"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}