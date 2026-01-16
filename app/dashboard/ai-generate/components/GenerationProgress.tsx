'use client'

import { useEffect, useState } from 'react'

export interface ProgressStep {
    label: string
    progress: number
    status: 'pending' | 'active' | 'completed' | 'error'
}

interface GenerationProgressProps {
    isOpen: boolean
    currentStep: number
    totalSteps: number
    steps: ProgressStep[]
    estimatedTime?: number // in seconds
}

export default function GenerationProgress({
    isOpen,
    currentStep,
    totalSteps,
    steps,
    estimatedTime = 180, // Default 3 minutes
}: GenerationProgressProps) {
    const [elapsedTime, setElapsedTime] = useState(0)

    useEffect(() => {
        if (isOpen) {
            // Reset elapsed time when modal opens
            setElapsedTime(0)
            
            // Start timer
            const interval = setInterval(() => {
                setElapsedTime((prev) => prev + 1)
            }, 1000)
            
            return () => clearInterval(interval)
        }
    }, [isOpen])

    // Calculate remaining time - show elapsed if it exceeds estimate
    const remainingTime = estimatedTime > elapsedTime 
        ? estimatedTime - elapsedTime 
        : 0

    if (!isOpen) return null

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        if (mins > 0) {
            return `${mins}m ${secs}s`
        }
        return `${secs}s`
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="p-8">
                    <div className="flex flex-col items-center justify-center">
                        {/* Loading Spinner */}
                        <div className="mb-6">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                            Generating Content
                        </h3>

                        {/* Message */}
                        <p className="text-sm text-gray-600 text-center mb-6">
                            Please wait while we generate your content. This may take a few moments...
                        </p>

                        {/* Estimated Time */}
                        <div className="w-full">
                            {remainingTime > 0 ? (
                                <p className="text-sm text-gray-600 text-center">
                                    Estimated time remaining: <span className="font-semibold text-primary">{formatTime(remainingTime)}</span>
                                </p>
                            ) : (
                                <p className="text-sm text-gray-600 text-center">
                                    Still processing... Please wait
                                </p>
                            )}
                            <p className="text-xs text-gray-400 text-center mt-2">
                                Elapsed: {formatTime(elapsedTime)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

