import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  FileText, 
  TrendingUp, 
  Package, 
  Users,
  BarChart3,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  roles: UserRole[];
}

const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['DirectRepresentative', 'DirectShowroomManager', 'DirectShowroomStaff', 'Distributor', 'DistributorRepresentative', 'HeadOfOperations', 'MainDirector', 'Admin']
  },
  {
    name: 'Product Requests',
    href: '/requests',
    icon: ShoppingCart,
    roles: ['DirectRepresentative', 'Distributor', 'DistributorRepresentative']
  },
  {
    name: 'Product Requests',
    href: '/direct-showroom/requests',
    icon: ShoppingCart,
    roles: ['DirectShowroomManager']
  },
  {
    name: 'Invoices',
    href: '/invoices',
    icon: FileText,
    roles: ['DirectRepresentative', 'DirectShowroomManager', 'DirectShowroomStaff', 'Distributor', 'DistributorRepresentative']
  },
  {
    name: 'Sales Tracking',
    href: '/sales',
    icon: TrendingUp,
    roles: ['DirectRepresentative', 'DirectShowroomManager', 'Distributor', 'DistributorRepresentative', 'HeadOfOperations', 'MainDirector', 'Admin']
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: Package,
    roles: ['DirectShowroomManager', 'DirectShowroomStaff', 'Distributor', 'HeadOfOperations', 'MainDirector', 'Admin']
  },
  {
    name: 'Customers',
    href: '/customers',
    icon: Users,
    roles: ['DirectRepresentative', 'DirectShowroomManager', 'DirectShowroomStaff', 'Distributor']
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['HeadOfOperations', 'MainDirector', 'Admin']
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['DirectRepresentative', 'DirectShowroomManager', 'DirectShowroomStaff', 'Distributor', 'DistributorRepresentative', 'HeadOfOperations', 'MainDirector', 'Admin']
  }
];

export function Navigation() {
  const { userData } = useAuth();

  if (!userData) return null;

  const allowedItems = navigationItems.filter(item => 
    item.roles.includes(userData.role)
  );

  return (
    <nav className="bg-white shadow-sm border-r border-gray-200 w-64 min-h-screen">
      <div className="p-4">
        <ul className="space-y-2">
          {allowedItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}