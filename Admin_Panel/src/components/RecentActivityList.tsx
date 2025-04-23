
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface Activity {
  id: string;
  action: string;
  guideName: string;
  timestamp: string;
  status: "approved" | "rejected" | "registered";
}

interface RecentActivityListProps {
  activities: Activity[];
}

const RecentActivityList = ({ activities }: RecentActivityListProps) => {
  const statusClasses = {
    approved: "text-green-500",
    rejected: "text-red-500",
    registered: "text-blue-500",
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No recent activity</p>
          ) : (
            activities.map((activity) => (
              <div className="flex items-center" key={activity.id}>
                <div className={`mr-4 rounded-full p-2 ${activity.status === 'approved' ? 'bg-green-100 dark:bg-green-900' : activity.status === 'rejected' ? 'bg-red-100 dark:bg-red-900' : 'bg-blue-100 dark:bg-blue-900'}`}>
                  {activity.status === 'approved' ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className={`h-4 w-4 ${statusClasses[activity.status]}`}
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : activity.status === 'rejected' ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className={`h-4 w-4 ${statusClasses[activity.status]}`}
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className={`h-4 w-4 ${statusClasses[activity.status]}`}
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.guideName} <span className="text-muted-foreground">was {activity.action}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivityList;
