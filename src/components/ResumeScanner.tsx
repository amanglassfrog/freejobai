'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResumeScanner() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resume Scanner</CardTitle>
          <CardDescription>
            Resume parsing functionality has been removed from this application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Feature Unavailable
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              The resume scanning and analysis feature has been removed from this application.
            </p>
                  </div>
                </CardContent>
              </Card>
    </div>
  );
}
