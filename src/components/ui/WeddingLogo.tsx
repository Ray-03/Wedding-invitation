/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { WEDDING_CONFIG } from '../../config';

type WeddingLogoProps = {
  variant?: 'wedding' | 'livestream';
  className?: string;
};

export default function WeddingLogo({
  variant = 'wedding',
  className = 'w-[120px] xs:w-[150px] sm:w-[200px] h-[120px] xs:h-[150px] sm:h-[200px]',
}: WeddingLogoProps) {
  const groomInitial = WEDDING_CONFIG.groomInitial || 'J';
  const brideInitial = WEDDING_CONFIG.brideInitial || 'J';
  const subtitle = variant === 'livestream' ? 'LIVE' : 'WEDDING';

  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label={`${WEDDING_CONFIG.groomName} & ${WEDDING_CONFIG.brideName} monogram`}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse
        cx="100"
        cy="100"
        rx="78"
        ry="92"
        stroke="#03307B"
        strokeWidth="1.5"
      />
      <ellipse
        cx="100"
        cy="100"
        rx="72"
        ry="86"
        stroke="#03307B"
        strokeWidth="1"
      />

      <path
        d="M100 18 L101.8 24.2 L108.4 24.2 L103.3 28.1 L105.1 34.3 L100 30.4 L94.9 34.3 L96.7 28.1 L91.6 24.2 L98.2 24.2 Z"
        fill="#03307B"
      />
      <path
        d="M100 166 L101.8 172.2 L108.4 172.2 L103.3 176.1 L105.1 182.3 L100 178.4 L94.9 182.3 L96.7 176.1 L91.6 172.2 L98.2 172.2 Z"
        fill="#03307B"
      />

      <text
        x="100"
        y="78"
        textAnchor="middle"
        fill="#03307B"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="52"
        fontWeight="400"
      >
        {groomInitial}
      </text>
      <text
        x="100"
        y="102"
        textAnchor="middle"
        fill="#03307B"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="22"
        fontWeight="400"
      >
        &amp;
      </text>
      <text
        x="100"
        y="132"
        textAnchor="middle"
        fill="#03307B"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="52"
        fontWeight="400"
      >
        {brideInitial}
      </text>
      <text
        x="100"
        y="152"
        textAnchor="middle"
        fill="#03307B"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="9"
        letterSpacing="4"
        fontWeight="400"
      >
        {subtitle}
      </text>
    </svg>
  );
}
