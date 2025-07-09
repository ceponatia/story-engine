"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
export function JobManagement() {
    const [stats, setStats] = useState(null);
    const [worker, setWorker] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    useEffect(() => {
        const interval = setInterval(fetchStats, 5000);
        fetchStats();
        return () => clearInterval(interval);
    }, []);
    const fetchStats = async () => {
        try {
            const response = await fetch("/api/admin/jobs?action=stats");
            const data = await response.json();
            if (data.success) {
                setStats(data.stats);
                setWorker(data.worker);
                setError(null);
            }
            else {
                setError(data.error);
            }
        }
        catch (_a) {
            setError("Failed to fetch job statistics");
        }
    };
    const handleWorkerAction = async (action) => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const response = await fetch("/api/admin/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            const data = await response.json();
            if (data.success) {
                setMessage(data.message);
                await fetchStats();
            }
            else {
                setError(data.error);
            }
        }
        catch (_a) {
            setError(`Failed to ${action.replace("-", " ")}`);
        }
        finally {
            setLoading(false);
        }
    };
    const handleCleanupJobs = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const response = await fetch("/api/admin/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "cleanup-jobs", olderThanDays: 7 }),
            });
            const data = await response.json();
            if (data.success) {
                setMessage(data.message);
                await fetchStats();
            }
            else {
                setError(data.error);
            }
        }
        catch (_a) {
            setError("Failed to cleanup jobs");
        }
        finally {
            setLoading(false);
        }
    };
    const getStatusBadge = (status, count) => {
        const variants = {
            pending: "default",
            running: "secondary",
            completed: "outline",
            failed: "destructive",
            retrying: "secondary",
        };
        return (<Badge variant={variants[status] || "default"}>
        {status}: {count}
      </Badge>);
    };
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Embedding Job Management</h2>
        <Button onClick={fetchStats} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {error && (<Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>)}

      {message && (<Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>)}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <Card>
          <CardHeader>
            <CardTitle>Worker Status</CardTitle>
            <CardDescription>Background worker process for embedding generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span>Status:</span>
              <Badge variant={(worker === null || worker === void 0 ? void 0 : worker.isRunning) ? "secondary" : "outline"}>
                {(worker === null || worker === void 0 ? void 0 : worker.isRunning) ? "Running" : "Stopped"}
              </Badge>
            </div>

            {(worker === null || worker === void 0 ? void 0 : worker.startedAt) && (<div className="text-sm text-muted-foreground">
                Started: {new Date(worker.startedAt).toLocaleString()}
              </div>)}

            <div className="flex gap-2">
              <Button onClick={() => handleWorkerAction("start-worker")} disabled={loading || (worker === null || worker === void 0 ? void 0 : worker.isRunning)} size="sm">
                Start Worker
              </Button>
              <Button onClick={() => handleWorkerAction("stop-worker")} disabled={loading || !(worker === null || worker === void 0 ? void 0 : worker.isRunning)} variant="outline" size="sm">
                Stop Worker
              </Button>
            </div>
          </CardContent>
        </Card>

        
        <Card>
          <CardHeader>
            <CardTitle>Job Statistics (24h)</CardTitle>
            <CardDescription>Embedding job processing metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {stats ? (<div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats).map(([status, count]) => (<div key={status}>{getStatusBadge(status, count)}</div>))}
                </div>

                <div className="text-sm text-muted-foreground">
                  Total jobs: {Object.values(stats).reduce((a, b) => a + b, 0)}
                </div>
              </div>) : (<div className="text-muted-foreground">Loading statistics...</div>)}
          </CardContent>
        </Card>
      </div>

      
      <Card>
        <CardHeader>
          <CardTitle>Maintenance</CardTitle>
          <CardDescription>Cleanup and maintenance operations</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleCleanupJobs} disabled={loading} variant="outline">
            Cleanup Old Jobs (7+ days)
          </Button>
        </CardContent>
      </Card>

      
      <Card>
        <CardHeader>
          <CardTitle>Background Processing</CardTitle>
          <CardDescription>How embedding generation works</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Character trait changes are queued for background embedding generation</p>
          <p>• Worker processes jobs with retry logic and exponential backoff</p>
          <p>• Failed jobs are retried up to 3 times before being marked as failed</p>
          <p>• Embeddings enable semantic search and character consistency features</p>
        </CardContent>
      </Card>
    </div>);
}
