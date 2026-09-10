'use client';

import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
    href?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function Logo({ href = '/', size = 'md', className = '' }: LogoProps) {
    const heightMap = {
        sm: 60,
        md: 90,
        lg: 120,
    };

    const height = heightMap[size];

    const content = (
        <div
            style={{ height: `${height}px` }}
            className={`relative flex items-center ${className}`}
        >
            <Image
                src="/afixcrypto.png"
                alt="afixcrypto"
                width={height * 3}
                height={height}
                priority
                style={{ height: `${height}px`, width: 'auto' }}
                className="object-contain"
            />
        </div>
    );

    if (href) {
        return <Link href={href} className="inline-flex items-center">{content}</Link>;
    }
    return content;
}