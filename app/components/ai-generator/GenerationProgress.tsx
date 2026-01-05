'use client'

import { useEffect, useState } from 'react'

export interface ProgressStep {
    label: string
    progress: number
    status: 'pending' | 'active' | 'completed' | 'error'
}

interface GenerationProgressProps {
    currentStep: number
    totalSteps: number
    steps: ProgressStep[]
    estimatedTime?: number // in seconds
}

export default function GenerationProgress({
    currentStep,
    totalSteps,
    steps,
    estimatedTime,
}: GenerationProgressProps) {
    const [elapsedTime, setElapsedTime] = useState(0)

    useEffect(() => {
        if (currentStep < totalSteps) {
            const interval = setInterval(() => {
                setElapsedTime((prev) => prev + 1)
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [currentStep, totalSteps])

    const overallProgress = (currentStep / totalSteps) * 100
    const remainingTime = estimatedTime ? Math.max(0, estimatedTime - elapsedTime) : null

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Generating Content</h3>
                    <span className="text-sm font-medium text-gray-600">{Math.round(overallProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${overallProgress}%` }}
                    ></div>
                </div>
            </div>

            <div className="space-y-3">
                {steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            {step.status === 'completed' ? (
                                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            ) : step.status === 'active' ? (
                                <div className="w-6 h-6">
                                    <span className="loading loading-spinner loading-sm text-blue-600"></span>
                                </div>
                            ) : step.status === 'error' ? (
                                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                            )}
                        </div>
                        <div className="flex-1">
                            <p
                                className={`text-sm ${
                                    step.status === 'active'
                                        ? 'font-semibold text-blue-600'
                                        : step.status === 'completed'
                                        ? 'text-gray-600'
                                        : step.status === 'error'
                                        ? 'text-red-600'
                                        : 'text-gray-400'
                                }`}
                            >
                                {step.label}
                            </p>
                        </div>
                        {step.status === 'active' && (
                            <div className="text-xs text-gray-500">
                                {step.progress}%
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {remainingTime !== null && remainingTime > 0 && (
                <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600 text-center">
                        Estimated time remaining: {Math.floor(remainingTime / 60)}m {remainingTime % 60}s
                    </p>
                </div>
            )}
        </div>
    )
}

