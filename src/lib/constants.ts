export interface PricingItem {
  title: string;
  description: string;
  price: string;
  duration: string;
  highlight: string;
  features: string[];
  /** Product ID from Stripe */
  priceId: string;
}

export const PRICING: PricingItem[] = [
  {
    title: "Starter",
    description: "Perfect for trying out Flowza",
    price: "Free",
    duration: "",
    highlight: "Key features",
    features: ["3 Sub accounts", "2 Team members", "Unlimited pipelines"],
    priceId: "",
  },
  {
    title: "Unlimited Saas",
    description: "The ultimate agency kit",
    price: "$199",
    duration: "month",
    highlight: "Key features",
    features: ["Everything in Starter and Basic", "Rebilling", "24/7 Support team"],
    priceId: "price_1OpACCFdfEv15JJw0k6lm8HC",
  },
  {
    title: "Basic",
    description: "For serious agency owners",
    price: "$49",
    duration: "month",
    highlight: "Everything in Starter",
    features: ["Everything in Starter", "Unlimited Sub accounts", "Unlimited Team members"],
    priceId: "price_1OpACCFdfEv15JJwACWCyqW2",
  },
];

import {
  BarChart,
  Calendar,
  FlowzaCategory,
  CheckCircled,
  Chip,
  Clipboard,
  Compass,
  Database,
  Flag,
  Funnel,
  Headphone,
  Home,
  Info,
  Link,
  Lock,
  Messages,
  Notification,
  Payment,
  Person,
  Pipelines,
  Power,
  Receipt,
  Send,
  Settings,
  Shield,
  Star,
  Tune,
  VideoRecorder,
  Wallet,
  Warning,
} from '@/components/icons';

export const icons = [
  {
    value: "chart",
    label: "Chart",
    path: BarChart,
  },
  {
    value: "headphone",
    label: "Headphone",
    path: Headphone,
  },
  {
    value: "send",
    label: "Send",
    path: Send,
  },
  {
    value: "pipelines",
    label: "Pipelines",
    path: Pipelines,
  },
  {
    value: "calendar",
    label: "Calendar",
    path: Calendar,
  },
  {
    value: "settings",
    label: "Settings",
    path: Settings,
  },
  {
    value: "check",
    label: "Check",
    path: CheckCircled,
  },
  {
    value: "chip",
    label: "Chip",
    path: Chip,
  },
  {
    value: "compass",
    label: "Compass",
    path: Compass,
  },
  {
    value: "database",
    label: "Database",
    path: Database,
  },
  {
    value: "flag",
    label: "Flag",
    path: Flag,
  },
  {
    value: "home",
    label: "Home",
    path: Home,
  },
  {
    value: "info",
    label: "Info",
    path: Info,
  },
  {
    value: "link",
    label: "Link",
    path: Link,
  },
  {
    value: "lock",
    label: "Lock",
    path: Lock,
  },
  {
    value: "messages",
    label: "Messages",
    path: Messages,
  },
  {
    value: "notification",
    label: "Notification",
    path: Notification,
  },
  {
    value: "payment",
    label: "Payment",
    path: Payment,
  },
  {
    value: "power",
    label: "Power",
    path: Power,
  },
  {
    value: "receipt",
    label: "Receipt",
    path: Receipt,
  },
  {
    value: "shield",
    label: "Shield",
    path: Shield,
  },
  {
    value: "star",
    label: "Star",
    path: Star,
  },
  {
    value: "tune",
    label: "Tune",
    path: Tune,
  },
  {
    value: "videorecorder",
    label: "Video Recorder",
    path: VideoRecorder,
  },
  {
    value: "wallet",
    label: "Wallet",
    path: Wallet,
  },
  {
    value: "warning",
    label: "Warning",
    path: Warning,
  },
  {
    value: "person",
    label: "Person",
    path: Person,
  },
  {
    value: "category",
    label: "Category",
    path: FlowzaCategory,
  },
  {
    value: "clipboardIcon",
    label: "Clipboard Icon",
    path: Clipboard,
  },
];