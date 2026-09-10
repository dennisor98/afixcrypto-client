'use client';

interface Props {
    password: string;
}

function checkStrength(password: string) {
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    };
    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score };
}

export default function PasswordStrengthMeter({ password }: Props) {
    if (!password) return null;
    const { checks, score } = checkStrength(password);

    const strengthLabel = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][Math.max(0, score - 1)];
    const strengthColor = ['#f6465d', '#f6465d', '#f0b90b', '#0ecb81', '#0ecb81'][Math.max(0, score - 1)];

    return (
        <div className="mt-3 p-3 bg-primary border border-primary rounded-lg">
            {/* Strength bar */}
            <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-colors"
                        style={{
                            backgroundColor: i <= score ? strengthColor : '#1e2329',
                        }}
                    />
                ))}
            </div>
            <p className="text-xs font-medium mb-2" style={{ color: strengthColor }}>
                {strengthLabel}
            </p>

            {/* Requirements checklist */}
            <ul className="space-y-1 text-xs">
                {[
                    { key: 'length', label: 'At least 8 characters' },
                    { key: 'uppercase', label: 'Uppercase letter (A-Z)' },
                    { key: 'lowercase', label: 'Lowercase letter (a-z)' },
                    { key: 'number', label: 'Number (0-9)' },
                    { key: 'special', label: 'Special character (!@#$...)' },
                ].map(({ key, label }) => (
                    <li key={key} className="flex items-center gap-2">
            <span className={checks[key as keyof typeof checks] ? 'text-green-400' : 'text-secondary'}>
              {checks[key as keyof typeof checks] ? '✓' : '○'}
            </span>
                        <span className={checks[key as keyof typeof checks] ? 'text-primary' : 'text-secondary'}>
              {label}
            </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}