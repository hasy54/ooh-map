'use client';

import { useState } from 'react';
import { Logo } from './Logo';
import { motion, AnimatePresence } from 'framer-motion';

export function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b-[3px] border-[#ebebeb] relative z-50">
      <nav className="px-6 max-md:px-4">
        <div className="flex items-center justify-between h-[49px]">
          {/* Logo */}
          <a
            href="#"
            className="px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Logo className="md:w-[29px] md:h-[21px] max-md:w-[58px] max-md:h-[42px]" />
          </a>

          {/* Desktop Navigation Tabs */}
          <div className="flex max-md:hidden">
            <button
              className="relative h-[46px] px-4 py-2 flex items-center justify-center font-medium text-[13px] leading-5 tracking-[-0.078px] text-[#171717] border-b-[3px] border-[#171717]"
            >
              <span className="flex items-center gap-2">
                <i className="ri-home-fill text-[13.5px]"></i>
                <span>Home</span>
              </span>
            </button>
            <button
              disabled
              className="relative h-[46px] px-4 py-2 flex items-center justify-center font-medium text-[13px] leading-5 tracking-[-0.078px] text-[#a3a3a3] cursor-not-allowed"
            >
              <span className="flex items-center gap-2">
                <i className="ri-file-list-2-fill text-[13.5px]"></i>
                <span>Services</span>
                <span className="ml-1 text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                  Coming Soon
                </span>
              </span>
            </button>
          </div>

          {/* Mobile Hamburger Menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="hidden max-md:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <i className={`text-2xl text-gray-900 ${menuOpen ? 'ri-close-line' : 'ri-menu-line'}`}></i>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="hidden max-md:block overflow-hidden bg-white border-b-[3px] border-[#ebebeb]"
          >
            <div className="px-4 py-3 space-y-2">
              <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 flex items-center gap-3">
                <i className="ri-home-fill text-lg text-[#171717]"></i>
                <span className="text-sm font-medium text-[#171717]">Home</span>
              </button>
              <button disabled className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 opacity-50 cursor-not-allowed">
                <i className="ri-file-list-2-fill text-lg text-[#a3a3a3]"></i>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm font-medium text-[#a3a3a3]">Services</span>
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                    Coming Soon
                  </span>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
