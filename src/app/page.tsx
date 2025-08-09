import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <CardHeader className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-gray-800 dark:bg-gray-200 rounded-full flex items-center justify-center shadow-md">
            <span className="text-3xl font-bold text-white dark:text-gray-800">CS</span>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              Coming Soon
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
              We&apos;re working hard to bring you something amazing. Stay tuned for updates.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <Badge variant="secondary" className="text-sm font-medium">
              Under Development
            </Badge>
          </div>
          
          <div className="space-y-4">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Be the first to know when we launch
            </div>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-1"
              />
              <Button className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-300">
                Notify Me
              </Button>
            </div>
          </div>
          
          <div className="text-center text-xs text-gray-400 dark:text-gray-500">
            © 2025. All rights reserved.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
