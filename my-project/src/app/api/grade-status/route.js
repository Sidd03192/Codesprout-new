// File: app/api/grade-status/route.js
// API endpoint for tracking grading job status (future async implementation)

import { createClient } from '../../../../utils/supabase/client';
import { NextResponse } from 'next/server';

const supabase = createClient();

// In-memory job tracking (for demonstration - replace with database in production)
const jobTracker = new Map();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ 
      error: 'Job ID is required' 
    }, { status: 400 });
  }

  // Check job status
  const jobStatus = jobTracker.get(jobId);
  
  if (!jobStatus) {
    return NextResponse.json({ 
      error: 'Job not found',
      jobId 
    }, { status: 404 });
  }

  return NextResponse.json({
    jobId,
    status: jobStatus.status,
    createdAt: jobStatus.createdAt,
    completedAt: jobStatus.completedAt,
    result: jobStatus.result,
    error: jobStatus.error
  });
}

export async function POST(request) {
  const { jobId, status, result, error } = await request.json();

  if (!jobId) {
    return NextResponse.json({ 
      error: 'Job ID is required' 
    }, { status: 400 });
  }

  const existingJob = jobTracker.get(jobId) || {
    createdAt: new Date().toISOString(),
    status: 'pending'
  };

  const updatedJob = {
    ...existingJob,
    status: status || existingJob.status,
    result: result || existingJob.result,
    error: error || existingJob.error,
    completedAt: (status === 'completed' || status === 'failed') 
      ? new Date().toISOString() 
      : existingJob.completedAt
  };

  jobTracker.set(jobId, updatedJob);

  return NextResponse.json({
    jobId,
    message: 'Job status updated',
    ...updatedJob
  });
}

// Helper function to create a new job entry
export function createJob(jobId) {
  const job = {
    status: 'pending',
    createdAt: new Date().toISOString(),
    completedAt: null,
    result: null,
    error: null
  };
  
  jobTracker.set(jobId, job);
  return job;
}

// Helper function to update job status
export function updateJobStatus(jobId, status, result = null, error = null) {
  const existingJob = jobTracker.get(jobId);
  if (!existingJob) {
    return null;
  }

  const updatedJob = {
    ...existingJob,
    status,
    result,
    error,
    completedAt: (status === 'completed' || status === 'failed') 
      ? new Date().toISOString() 
      : existingJob.completedAt
  };

  jobTracker.set(jobId, updatedJob);
  return updatedJob;
}

// Cleanup old jobs (call this periodically)
export function cleanupOldJobs(maxAgeHours = 24) {
  const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
  
  for (const [jobId, job] of jobTracker.entries()) {
    const jobTime = new Date(job.createdAt);
    if (jobTime < cutoffTime) {
      jobTracker.delete(jobId);
    }
  }
}