"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { 
  ChevronDown, 
  Settings, 
  LogOut, 
  UserCircle 
} from "lucide-react";
import { logoutAction } from "@/actions/auth";

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    role: string;
    avatar: string;
  };
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 pl-1 hover:bg-[var(--color-brand-50)] p-1 rounded-lg transition-colors cursor-pointer group"
      >
        <div className="hidden md:block text-right">
          <div className="text-sm font-semibold text-[var(--color-brand-900)] leading-none mb-0.5 group-hover:text-[var(--color-brand-600)]">
            {user.name}
          </div>
          <div className="text-[10px] font-medium text-[var(--color-brand-600)] uppercase tracking-wider">
            {user.role}
          </div>
        </div>
        <div className="w-9 h-9 rounded-full border-2 border-[var(--color-brand-200)] p-0.5 overflow-hidden bg-[var(--color-brand-100)] group-hover:border-[var(--color-brand-400)] transition-colors relative">
          <Image 
            src={user.avatar} 
            alt="Avatar" 
            width={36}
            height={36}
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <ChevronDown className={`w-4 h-4 text-[var(--color-text-light)] hidden md:block transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-modal border border-[var(--color-border)] py-2 z-50 animate-fade-in">
          <div className="px-4 py-2 border-b border-[var(--color-border)] mb-1">
            <p className="text-xs text-[var(--color-text-muted)]">Logado como</p>
            <p className="text-sm font-medium text-[var(--color-brand-900)] truncate">{user.email}</p>
          </div>
          
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-brand-50)] hover:text-[var(--color-brand-700)] transition-colors">
            <UserCircle className="w-4 h-4" />
            Meu Perfil
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-brand-50)] hover:text-[var(--color-brand-700)] transition-colors">
            <Settings className="w-4 h-4" />
            Configurações
          </button>
          
          <div className="h-px bg-[var(--color-border)] my-1"></div>
          
          <form action={logoutAction}>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" />
              Sair do Sistema
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
