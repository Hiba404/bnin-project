// src/components/ui/UserMenu.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { User } from 'lucide-react';
import Link from 'next/link';

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Rest of the component...

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center bg-white rounded-full p-1 shadow-md border-2 border-amber-200"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {session?.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || 'User profile'}
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white font-medium">
            {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-700">{session?.user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
          </div>
          
          {/* Rest of the menu... */}
        </div>
      )}
    </div>
  );
}