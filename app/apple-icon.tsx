import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Apple touch icon — той самий мотив «C-приціл» у бренд-кольорах (без прозорості; iOS додає маску).
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#c2511f',
        }}
      >
        <svg width="120" height="120" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="18.5" fill="#f3ece0" />
          <circle cx="32" cy="32" r="9.5" fill="#c2511f" />
          <rect x="39" y="26.5" width="17" height="11" fill="#c2511f" />
          <circle cx="32" cy="32" r="4.6" fill="#f3ece0" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
