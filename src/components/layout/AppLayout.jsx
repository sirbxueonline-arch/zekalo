import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

// Map path → i18n key
const pageTitleKeys = {
  '/dashboard': 'dashboard',
  '/zeka': 'zeka_ai',
  '/qiymetler': 'grades',
  '/davamiyyet': 'attendance',
  '/tapshiriqlar': 'assignments',
  '/mesajlar': 'messages',
  '/tedbirler': 'events',
  '/profil': 'profile',
  '/muellim/dashboard': 'dashboard',
  '/muellim/jurnal': 'gradebook',
  '/muellim/davamiyyet': 'attendance',
  '/muellim/zeka': 'zeka_ai',
  '/muellim/tapshiriqlar': 'assignments',
  '/muellim/mesajlar': 'messages',
  '/muellim/hesabatlar': 'reports',
  '/muellim/analitika': 'analytics',
  '/muellim/cedvel': 'timetable',
  '/muellim/tedbirler': 'events',
  '/muellim/profil': 'profile',
  '/valideyn/dashboard': 'dashboard',
  '/valideyn/qiymetler': 'grades',
  '/valideyn/davamiyyet': 'attendance',
  '/valideyn/tapshiriqlar': 'assignments',
  '/valideyn/mesajlar': 'messages',
  '/valideyn/bildirisler': 'notifications',
  '/valideyn/tedbirler': 'events',
  '/valideyn/profil': 'profile',
  '/admin/dashboard': 'dashboard',
  '/admin/shagirdler': 'students',
  '/admin/muelimler': 'teachers',
  '/admin/sinifler': 'classes',
  '/admin/jurnal': 'gradebook',
  '/admin/cedvel': 'timetable',
  '/admin/hesabatlar': 'reports',
  '/admin/analitika': 'analytics',
  '/admin/mesajlar': 'announcements',
  '/admin/tedbirler': 'events',
  '/admin/ib': 'ib_panel',
  '/admin/nazirlik': 'ministry',
  '/admin/fenler': 'subjects',
  '/admin/parametrler': 'settings',
  '/muellim/sinifler': 'classes',
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { t } = useAuth()
  const titleKey = pageTitleKeys[location.pathname]
  const title = titleKey ? t(titleKey) : 'Zirva'

  return (
    <div className="min-h-screen flex bg-[#F7F7FB]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Sidebar occupies 260 px on large screens */}
      <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto bg-[#F7F7FB] py-8 px-6 lg:px-10">
          <div className="max-w-[1400px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
