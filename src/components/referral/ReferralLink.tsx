'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';

export default function ReferralLink() {
    const { user } = useAuthStore();
    const [copied, setCopied] = useState(false);

    const referralLink = user?.referralCode
        ? `${window.location.origin}/auth/register?ref=${user.referralCode}`
        : '';

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Your Referral Link</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Referral Code</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={user?.referralCode || ''}
                            readOnly
                            className="flex-1 px-4 py-3 border rounded-lg bg-gray-50"
                        />
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(user?.referralCode || '');
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            }}
                            className="px-4 py-3 bg-blue-600 text-primary rounded-lg hover:bg-blue-700"
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Referral Link</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={referralLink}
                            readOnly
                            className="flex-1 px-4 py-3 border rounded-lg bg-gray-50 text-sm"
                        />
                        <button
                            onClick={copyToClipboard}
                            className="px-4 py-3 bg-blue-600 text-primary rounded-lg hover:bg-blue-700"
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                        <strong>How it works:</strong> Share your referral link with friends. When they sign up and make their first deposit, you'll earn a bonus!
                    </p>
                </div>
            </div>
        </div>
    );
}
