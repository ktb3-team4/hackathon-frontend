export default function GroupIcon() {
  return (
    <svg 
      width="40" 
      height="40" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="w-10 h-10" 
    >
      <defs>
        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF9A9E" />
          <stop offset="100%" stopColor="#A18CD1" />
        </linearGradient>
      </defs>
      
      {/* 뒤쪽 사람들 */}
      <circle cx="5" cy="9" r="3" fill="url(#iconGradient)" opacity="0.8"/>
      <path d="M2 18C2 15.5 4 13.5 6.5 13.5H7C8.5 13.5 9.5 14.5 9.5 16V19H2V18Z" fill="url(#iconGradient)" opacity="0.8"/>
      <circle cx="19" cy="9" r="3" fill="url(#iconGradient)" opacity="0.8"/>
      <path d="M22 18C22 15.5 20 13.5 17.5 13.5H17C15.5 13.5 14.5 14.5 14.5 16V19H22V18Z" fill="url(#iconGradient)" opacity="0.8"/>

      {/* 앞쪽 중앙 사람 */}
      <circle cx="12" cy="8" r="4" fill="url(#iconGradient)" stroke="white" strokeWidth="1.5"/>
      <path d="M6 19C6 15.6863 8.68629 13 12 13C15.3137 13 18 15.6863 18 19V21H6V19Z" fill="url(#iconGradient)" stroke="white" strokeWidth="1.5"/>
    </svg>
  );
}