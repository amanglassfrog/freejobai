'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to signin if not authenticated
      router.push('/signin');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    // Redirect is handled by the auth context
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 dark:border-gray-200 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Redirecting to signin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Welcome, {user?.name || 'User'}
              </span>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-gray-700 dark:text-gray-300"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-800 dark:bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white dark:text-gray-800">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span>Profile Information</span>
              </CardTitle>
              <CardDescription>
                Your account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <p className="text-gray-900 dark:text-gray-100">{user?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <p className="text-gray-900 dark:text-gray-100">{user?.email || 'N/A'}</p>
              </div>
              {user?.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">{user.phone}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Member Since
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/resume-scanner">
                <Button className="w-full justify-start mb-2" variant="outline">
                  📄 Resume Scanner
                </Button>
              </Link>
              <Button className="w-full justify-start mb-2" variant="outline">
                Edit Profile
              </Button>
              <Button className="w-full justify-start mb-2" variant="outline">
                Change Password
              </Button>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>
                Your account information and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Account Status
                </span>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Verified
                </span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Verified
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Login
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
